import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './session.schema';
import { CreateSessionDto } from 'src/session/session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<Session>,
  ) {}

  async create(userId: string, dto: CreateSessionDto) {
    return this.sessionModel.create({
      ...dto,
      userId,
    });
  }

  async start(sessionId: string, userId: string) {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      userId,
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.status = 'ACTIVE';
    await session.save();

    return session;
  }
}
