import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/user.schema';

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
}
