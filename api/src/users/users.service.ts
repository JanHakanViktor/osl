import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
}
