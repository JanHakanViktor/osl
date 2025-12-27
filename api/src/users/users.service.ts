import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.userModel.create({
      username,
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
      throw new UnauthorizedException('Invalid username or password');
    }

    return user;
  }
}
