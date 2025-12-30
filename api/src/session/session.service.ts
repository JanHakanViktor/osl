import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session } from './session.schema';
import { CreateSessionDto } from 'src/session/session.dto';
import CircuitLibrary from 'src/data/circuit';
import { SessionOverviewDto } from 'src/session/session-summary.dto';
@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<Session>,
  ) {}

  async create(userId: string, dto: CreateSessionDto): Promise<Session> {
    const circuit = CircuitLibrary.find(
      (c) => Number(c.trackId) === dto.circuitId,
    );

    if (!circuit) {
      throw new NotFoundException('No circuit Found');
    }

    return this.sessionModel.create({
      userId: new Types.ObjectId(userId),
      sessionName: dto.sessionName,
      circuitId: dto.circuitId,
      circuitName: circuit.circuit,
      limitType: dto.limitType,
      timeLimitSeconds: dto.timeLimitSeconds,
      lapLimit: dto.lapLimit,
      status: 'CREATED',
      telemetry: {
        fastestLapMs: 0,
        topSpeedKmh: 0,
        cleanLapStreak: 0,
        bestCleanLapStreak: 0,
        totalCleanLaps: 0,
      },
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
      throw new BadRequestException('Session is not active');
    }

    session.status = 'FINISHED';
    session.finishedAt = new Date();

    await session.save();
    return session;
  }

  async getOverview(
    sessionId: string,
    userId: string,
  ): Promise<SessionOverviewDto> {
    const session = await this.sessionModel.findOne({
      _id: sessionId,
      userId: new Types.ObjectId(userId),
      status: 'FINISHED',
    });

    if (!session) {
      throw new NotFoundException('Finished session not found');
    }

    return {
      sessionName: session.sessionName,
      circuitName: session.circuitName,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      telemetry: session.telemetry,
    };
  }
}
