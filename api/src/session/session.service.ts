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

type SessionWithUser = Session & {
  userId?: {
    _id?: Types.ObjectId;
    username?: string;
    drivername?: string;
  };
};

function getDriverName(user?: { username?: string; drivername?: string }) {
  return user?.drivername || user?.username || 'Unknown driver';
}

export function getValidSectorBreakdown(sectors?: number[]) {
  return sectors?.length === 3 ? sectors : [];
}

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
        fastestLapSectorsMs: [],
        topSpeedKmh: 0,
        cleanLapStreak: 0,
        bestCleanLapStreak: 0,
        totalCleanLaps: 0,
        lastProcessedLapNum: 0,
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

  async getLiveSession(sessionId: string, userId: string) {
    const session = await this.sessionModel
      .findOne({
        _id: sessionId,
        userId: new Types.ObjectId(userId),
        status: 'ACTIVE',
      })
      .lean();

    if (!session) {
      throw new NotFoundException('Active session not found');
    }

    return {
      id: session._id.toString(),
      sessionName: session.sessionName,
      circuitName: session.circuitName,
      limitType: session.limitType,
      lapLimit: session.lapLimit,
      timeLimitSeconds: session.timeLimitSeconds,
      startedAt: session.startedAt,
    };
  }
  async getSessionHistory(userId: string) {
    const sessions = await this.sessionModel
      .find({
        userId: new Types.ObjectId(userId),
        status: 'FINISHED',
      })
      .sort({ finishedAt: -1 })
      .lean();

    return sessions.map((s) => ({
      id: s._id.toString(),
      sessionName: s.sessionName,
      circuitName: s.circuitName,
      fastestLapMs: s.telemetry?.fastestLapMs ?? 0,
      finishedAt: s.finishedAt,
    }));
  }

  async getLandingSummary() {
    const [activeSession, latestFinished, finishedSessions] = await Promise.all(
      [
        this.sessionModel
          .findOne({
            status: 'ACTIVE',
          })
          .sort({ startedAt: 1, _id: 1 })
          .lean(),
        this.sessionModel
          .findOne({
            status: 'FINISHED',
          })
          .sort({ finishedAt: -1, _id: -1 })
          .populate<{ userId: { username: string; drivername?: string } }>(
            'userId',
            'username drivername',
          )
          .lean<SessionWithUser>(),
        this.sessionModel
          .find({
            status: 'FINISHED',
          })
          .sort({ finishedAt: 1, _id: 1 })
          .populate<{ userId: { username: string; drivername?: string } }>(
            'userId',
            'username drivername',
          )
          .lean<SessionWithUser[]>(),
      ],
    );

    const sessionsWithFastestLaps = finishedSessions.filter(
      (session) => (session.telemetry?.fastestLapMs ?? 0) > 0,
    );

    const fastestOverall =
      sessionsWithFastestLaps.reduce<SessionWithUser | null>(
        (best, session) => {
          if (!best) return session;
          return session.telemetry.fastestLapMs < best.telemetry.fastestLapMs
            ? session
            : best;
        },
        null,
      );

    const fastestLapByCircuit = CircuitLibrary.map((circuit) => {
      const circuitFastest = sessionsWithFastestLaps
        .filter((session) => session.circuitId === Number(circuit.trackId))
        .reduce<SessionWithUser | null>((best, session) => {
          if (!best) return session;
          return session.telemetry.fastestLapMs < best.telemetry.fastestLapMs
            ? session
            : best;
        }, null);

      return {
        circuitId: Number(circuit.trackId),
        grandPrix: circuit.grandPrix,
        circuitName: circuit.circuit,
        image: circuit.image,
        fastestLapMs: circuitFastest?.telemetry?.fastestLapMs ?? null,
        fastestLapSectorsMs: getValidSectorBreakdown(
          circuitFastest?.telemetry?.fastestLapSectorsMs,
        ),
        driverName: circuitFastest ? getDriverName(circuitFastest.userId) : null,
      };
    });

    const trendSessions = fastestOverall
      ? finishedSessions.filter(
          (session) =>
            session.circuitId === fastestOverall.circuitId &&
            session.userId?._id?.toString() ===
              fastestOverall.userId?._id?.toString() &&
            (session.telemetry?.fastestLapMs ?? 0) > 0,
        )
      : [];
    const latestSessionCircuit = latestFinished
      ? CircuitLibrary.find(
          (circuit) => Number(circuit.trackId) === latestFinished.circuitId,
        )
      : null;

    return {
      activeSession: activeSession
        ? {
            id: activeSession._id.toString(),
            sessionName: activeSession.sessionName,
            circuitName: activeSession.circuitName,
            startedAt: activeSession.startedAt,
          }
        : null,
      latestSession: latestFinished
        ? {
            id: latestFinished._id.toString(),
            sessionName: latestFinished.sessionName,
            circuitName: latestFinished.circuitName,
            circuitId: latestFinished.circuitId,
            image: latestSessionCircuit?.image ?? null,
            driverName: getDriverName(latestFinished.userId),
            fastestLapMs: latestFinished.telemetry?.fastestLapMs ?? 0,
            topSpeedKmh: latestFinished.telemetry?.topSpeedKmh ?? 0,
            totalCleanLaps: latestFinished.telemetry?.totalCleanLaps ?? 0,
            bestCleanLapStreak:
              latestFinished.telemetry?.bestCleanLapStreak ?? 0,
            finishedAt: latestFinished.finishedAt,
          }
        : null,
      fastestLapByCircuit,
      improvementTrend: fastestOverall
        ? {
            driverName: getDriverName(fastestOverall.userId),
            circuitId: fastestOverall.circuitId,
            circuitName: fastestOverall.circuitName,
            sessions: trendSessions.map((session, index) => ({
              id: session._id.toString(),
              label: `S${index + 1}`,
              sessionName: session.sessionName,
              fastestLapMs: session.telemetry.fastestLapMs,
            })),
          }
        : null,
    };
  }
}
