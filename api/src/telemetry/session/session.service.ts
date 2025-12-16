import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './session.schema';

@Injectable()
export class SessionService implements OnModuleInit {
  constructor(
    @InjectModel('Session')
    private readonly sessionModel: Model<Session>,
  ) {}

  async onModuleInit() {
    const docs = await this.sessionModel.find().limit(1).lean();
    console.log('Mongo session docs:', docs);
  }

  async findAll(): Promise<Session[]> {
    return this.sessionModel.find().lean();
  }
}
