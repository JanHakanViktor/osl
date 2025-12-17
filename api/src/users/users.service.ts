import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/user.schema';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(username: string, password: string) {
    const userExists = await this.userModel.findOne({ username });

    if (userExists) {
      throw new ConflictException('User Already Exists');
    }

    return this.userModel.create({ username, password, isAdmin: false });
  }

  async checkUser(username: string, password: string) {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new ConflictException('Login failed');
    }

    const match = await bcrypt.compare(password, user.password);

    return match ? user : null; // förbättra senare med login här kanske if match -> login?
  }
}
