import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/user.schema';
import bcrypt from 'bcrypt';

export type RegisteredDriver = {
  id: string;
  driverName: string;
};

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(username: string, password: string, drivername?: string) {
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
    return this.userModel.findById(userId).select('username drivername isAdmin');
  }

  async findDrivers(): Promise<RegisteredDriver[]> {
    const users = await this.userModel
      .find()
      .select('username drivername')
      .sort({ drivername: 1, username: 1 })
      .lean();

    return users.map((user) => ({
      id: user._id.toString(),
      driverName: user.drivername || user.username,
    }));
  }

  async findDriversByIds(ids: string[]): Promise<RegisteredDriver[]> {
    const users = await this.userModel
      .find({ _id: { $in: ids } })
      .select('username drivername')
      .lean();

    return users.map((user) => ({
      id: user._id.toString(),
      driverName: user.drivername || user.username,
    }));
  }
}
