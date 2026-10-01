import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from 'src/users/user.schema';
import type { TeamId } from 'src/data/team';
import bcrypt from 'bcrypt';

export type NewUser = {
  username: string;
  password: string;
  drivername?: string;
  country?: string;
  teamId?: TeamId;
};

export type RegisteredDriver = {
  id: string;
  driverName: string;
  /** ISO 3166-1 alpha-2 code, or null when the driver has not chosen one. */
  country: string | null;
  /** Team id from src/data/team.ts, or null when the driver has not chosen one. */
  teamId: string | null;
};

const REGISTERED_DRIVER_FIELDS = 'username drivername country teamId';

function toRegisteredDriver(
  user: Pick<User, 'username' | 'drivername' | 'country' | 'teamId'> & {
    _id: Types.ObjectId;
  },
): RegisteredDriver {
  return {
    id: user._id.toString(),
    driverName: user.drivername || user.username,
    country: user.country ?? null,
    teamId: user.teamId ?? null,
  };
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser({
    username,
    password,
    drivername,
    country,
    teamId,
  }: NewUser) {
    const userExists = await this.userModel.findOne({ username });

    if (userExists) {
      throw new ConflictException('User Already Exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.userModel.create({
      username,
      drivername: drivername?.trim() || username,
      password: hashedPassword,
      isAdmin: false,
      country,
      teamId,
    });
  }

  async checkUser(username: string, password: string) {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UnauthorizedException('No user found');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async findSessionUser(userId: string) {
    return this.userModel
      .findById(userId)
      .select('username drivername isAdmin country teamId');
  }

  async findDrivers(): Promise<RegisteredDriver[]> {
    const users = await this.userModel
      .find()
      .select(REGISTERED_DRIVER_FIELDS)
      .sort({ drivername: 1, username: 1 })
      .lean();

    return users.map(toRegisteredDriver);
  }

  async findDriversByIds(ids: string[]): Promise<RegisteredDriver[]> {
    const users = await this.userModel
      .find({ _id: { $in: ids } })
      .select(REGISTERED_DRIVER_FIELDS)
      .lean();

    return users.map(toRegisteredDriver);
  }
}
