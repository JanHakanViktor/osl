import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session } from '../session/session.schema';
import { SimCoachAnalysisEngine } from './analysis/sim-coach-analysis.engine';
import type { AnalysisLap } from './analysis/sim-coach-analysis.types';
import { CompletedLapDto } from './dto/completed-lap.dto';
import { mapF1TrackIdToOslCircuitId } from './mappers/f1-track-id.mapper';
import { DefaultReferenceLapRepository } from './references/default-reference-lap.repository';
import { SimCoachLap } from './schemas/sim-coach-lap.schema';

const SESSION_ASSOCIATION_TOLERANCE_MS = 120_000;

@Injectable()
export class SimCoachService {
  constructor(
    @InjectModel(SimCoachLap.name)
    private readonly lapModel: Model<SimCoachLap>,
    @InjectModel(Session.name)
    private readonly sessionModel: Model<Session>,
    private readonly analysisEngine: SimCoachAnalysisEngine,
    private readonly defaultReferences: DefaultReferenceLapRepository,
  ) {}

  async ingest(dto: CompletedLapDto) {
    const circuitId = mapF1TrackIdToOslCircuitId(dto.circuitId);
    if (circuitId == null) {
      throw new BadRequestException(`Unsupported F1 track id ${dto.circuitId}`);
    }

    const capturedAt = new Date(dto.capturedAt);
    const associationStart = new Date(
      capturedAt.getTime() - SESSION_ASSOCIATION_TOLERANCE_MS,
    );
    const associationEnd = new Date(
      capturedAt.getTime() + SESSION_ASSOCIATION_TOLERANCE_MS,
    );
    const session = await this.sessionModel
      .findOne({
        circuitId,
        startedAt: { $lte: associationEnd },
        $or: [
          { status: 'ACTIVE' },
          {
            status: 'FINISHED',
            finishedAt: { $gte: associationStart },
          },
        ],
      })
      .sort({ startedAt: -1, _id: -1 });

    if (!session) {
      throw new BadRequestException(
        'No OSL session matches the completed lap track and capture time',
      );
    }

    const lap = await this.lapModel.findOneAndUpdate(
      { sourceLapId: dto.sourceLapId },
      {
        $setOnInsert: {
          userId: session.userId,
          sessionId: session._id,
          sourceLapId: dto.sourceLapId,
          sourceSessionUid: dto.sourceSessionUid,
          circuitId,
          sourceTrackId: dto.circuitId,
          sessionType: dto.sessionType,
          trackLengthM: dto.trackLengthM,
          playerCarIndex: dto.playerCarIndex,
          lapNumber: dto.lapNumber,
          lapTimeMs: dto.lapTimeMs,
          valid: dto.valid,
          capturedAt,
          samples: dto.samples,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return { id: lap._id.toString(), accepted: true };
  }

  async getSessionLaps(sessionId: string, userId: string) {
    await this.requireOwnedSession(sessionId, userId);

    const laps = await this.lapModel
      .find({
        sessionId: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
      })
      .sort({ lapNumber: 1, capturedAt: 1 })
      .lean();

    return laps.map((lap) => ({
      id: lap._id.toString(),
      lapNumber: lap.lapNumber,
      lapTimeMs: lap.lapTimeMs,
      valid: lap.valid,
      capturedAt: lap.capturedAt,
      referenceLapId: lap.referenceLapId?.toString() ?? null,
    }));
  }

  async selectReference(
    targetLapId: string,
    referenceLapId: string,
    userId: string,
  ) {
    if (targetLapId === referenceLapId) {
      throw new BadRequestException('A lap cannot reference itself');
    }

    const [target, reference] = await Promise.all([
      this.findOwnedLap(targetLapId, userId),
      this.findOwnedLap(referenceLapId, userId),
    ]);

    if (target.circuitId !== reference.circuitId) {
      throw new BadRequestException(
        'The reference must be a lap from the same circuit',
      );
    }

    target.referenceLapId = reference._id;
    await target.save();

    return { targetLapId, referenceLapId };
  }

  async clearReference(targetLapId: string, userId: string) {
    const target = await this.findOwnedLap(targetLapId, userId);
    target.referenceLapId = undefined;
    await target.save();

    return { targetLapId, referenceLapId: null };
  }

  async analyze(targetLapId: string, userId: string) {
    const target = await this.findOwnedLap(targetLapId, userId);
    const explicitReference = target.referenceLapId
      ? await this.lapModel.findOne({
          _id: target.referenceLapId,
          userId: new Types.ObjectId(userId),
        })
      : null;
    const defaultReference = target.referenceLapId
      ? null
      : this.defaultReferences.findByCircuitId(target.circuitId);
    const userReference =
      explicitReference || defaultReference
        ? null
        : await this.lapModel
            .findOne({
              _id: { $ne: target._id },
              userId: new Types.ObjectId(userId),
              circuitId: target.circuitId,
            })
            .sort({ valid: -1, lapTimeMs: 1, capturedAt: 1 });
    const reference = explicitReference ?? defaultReference ?? userReference;

    if (!reference) {
      throw new NotFoundException(
        'No reference lap is available for this circuit yet',
      );
    }

    const analysisReference = defaultReference
      ? defaultReference
      : this.toAnalysisLap(reference as SimCoachLap);

    return this.analysisEngine.analyze(
      this.toAnalysisLap(target),
      analysisReference,
    );
  }

  private async requireOwnedSession(sessionId: string, userId: string) {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new NotFoundException('Session not found');
    }

    const session = await this.sessionModel.exists({
      _id: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
    });
    if (!session) throw new NotFoundException('Session not found');
  }

  private async findOwnedLap(lapId: string, userId: string) {
    if (!Types.ObjectId.isValid(lapId)) {
      throw new NotFoundException('Coaching lap not found');
    }

    const lap = await this.lapModel.findOne({
      _id: new Types.ObjectId(lapId),
      userId: new Types.ObjectId(userId),
    });
    if (!lap) throw new NotFoundException('Coaching lap not found');
    return lap;
  }

  private toAnalysisLap(lap: SimCoachLap): AnalysisLap {
    return {
      id: lap._id.toString(),
      source: 'session',
      lapNumber: lap.lapNumber,
      lapTimeMs: lap.lapTimeMs,
      valid: lap.valid,
      trackLengthM: lap.trackLengthM,
      samples: lap.samples.map((sample) => ({
        distanceM: sample.distanceM,
        elapsedMs: sample.elapsedMs,
        speedKmh: sample.speedKmh,
        throttle: sample.throttle,
        brake: sample.brake,
        steer: sample.steer,
        gear: sample.gear,
        engineRpm: sample.engineRpm,
        ...(sample.position
          ? {
              position: {
                x: sample.position.x,
                y: sample.position.y,
                z: sample.position.z,
              },
            }
          : {}),
        ...(sample.yawRad != null ? { yawRad: sample.yawRad } : {}),
      })),
    };
  }
}
