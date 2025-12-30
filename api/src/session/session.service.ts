import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session } from './session.schema';
import { CreateSessionDto } from 'src/session/session.dto';
@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<Session>,
  ) {}

  async create(userId: string, dto: CreateSessionDto): Promise<Session> {
    return this.sessionModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      status: 'CREATED',
      fastestLapMs: 0,
      topSpeedKmh: 0,
    });
  }

  async start(sessionId: string, userId: string): Promise<Session> {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      userId: new Types.ObjectId(userId),
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.status = 'ACTIVE';
    session.startedAt = new Date();
    await session.save();

    return session;
  }

  async finish(sessionId: string, userId: string): Promise<Session> {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      userId: new Types.ObjectId(userId),
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== 'ACTIVE') {
      throw new NotFoundException('Session is not active');
    }

    session.status = 'FINISHED';
    session.finishedAt = new Date();

    await session.save();
    return session;
  }
}
