import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { Types } from 'mongoose';
import { SimCoachAnalysisEngine } from './analysis/sim-coach-analysis.engine';
import type { CompletedLapDto } from './dto/completed-lap.dto';
import { SimCoachService } from './sim-coach.service';

function completedLap(
  overrides: Partial<CompletedLapDto> = {},
): CompletedLapDto {
  return {
    schemaVersion: 1,
    sourceLapId: 'session:0:2',
    sourceSessionUid: 'session',
    circuitId: 17,
    sessionType: 18,
    trackLengthM: 4318,
    playerCarIndex: 0,
    lapNumber: 2,
    lapTimeMs: 78_000,
    valid: true,
    capturedAt: '2026-08-16T10:44:54.108Z',
    samples: [
      {
        distanceM: 0,
        elapsedMs: 0,
        speedKmh: 200,
        throttle: 1,
        brake: 0,
        steer: 0,
        gear: 6,
        engineRpm: 11_000,
      },
      {
        distanceM: 100,
        elapsedMs: 1_000,
        speedKmh: 180,
        throttle: 0.5,
        brake: 0.4,
        steer: 0.1,
        gear: 5,
        engineRpm: 10_000,
      },
    ],
    ...overrides,
  };
}

describe('SimCoachService ingest', () => {
  it('matches an official UDP track id to a recently finished OSL session', async () => {
    const sessionId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const session = { _id: sessionId, userId };
    const sort = jest.fn().mockResolvedValue(session);
    const sessionModel = {
      findOne: jest.fn().mockReturnValue({ sort }),
    };
    const storedLap = { _id: new Types.ObjectId() };
    const lapModel = {
      findOneAndUpdate: jest.fn().mockResolvedValue(storedLap),
    };
    const service = new SimCoachService(
      lapModel as never,
      sessionModel as never,
      new SimCoachAnalysisEngine(),
      { findByCircuitId: jest.fn() } as never,
    );

    await expect(service.ingest(completedLap())).resolves.toEqual({
      id: storedLap._id.toString(),
      accepted: true,
    });

    expect(sessionModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        circuitId: 8,
        $or: expect.arrayContaining([
          { status: 'ACTIVE' },
          expect.objectContaining({ status: 'FINISHED' }),
        ]),
      }),
    );
    expect(lapModel.findOneAndUpdate).toHaveBeenCalledWith(
      { sourceLapId: 'session:0:2' },
      expect.objectContaining({
        $setOnInsert: expect.objectContaining({
          sessionId,
          userId,
          circuitId: 8,
          sourceTrackId: 17,
        }),
      }),
      expect.objectContaining({ upsert: true }),
    );
  });

  it('rejects an unsupported F1 track id before querying sessions', async () => {
    const sessionModel = { findOne: jest.fn() };
    const service = new SimCoachService(
      {} as never,
      sessionModel as never,
      new SimCoachAnalysisEngine(),
      { findByCircuitId: jest.fn() } as never,
    );

    await expect(
      service.ingest(completedLap({ circuitId: 40 })),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(sessionModel.findOne).not.toHaveBeenCalled();
  });
});

describe('SimCoachService default reference selection', () => {
  it('prefers the circuit professional reference over another user lap', async () => {
    const userId = new Types.ObjectId();
    const targetId = new Types.ObjectId();
    const target = {
      _id: targetId,
      userId,
      circuitId: 0,
      lapNumber: 2,
      lapTimeMs: 80_000,
      valid: true,
      trackLengthM: 5_200,
      samples: completedLap().samples,
    };
    const lapModel = {
      findOne: jest.fn().mockResolvedValue(target),
    };
    const professionalReference = {
      id: 'racenet:f1-25:00:1016414074977',
      source: 'racenet' as const,
      driverName: 'Otis Lawrence',
      leaderboardRank: 4,
      lapNumber: 0,
      lapTimeMs: 74_833,
      valid: true,
      trackLengthM: 5_215,
      samples: completedLap().samples,
    };
    const defaultReferences = {
      findByCircuitId: jest.fn().mockReturnValue(professionalReference),
    };
    const engine = {
      analyze: jest.fn().mockReturnValue({ selected: true }),
    };
    const service = new SimCoachService(
      lapModel as never,
      {} as never,
      engine as never,
      defaultReferences as never,
    );

    await expect(
      service.analyze(targetId.toString(), userId.toString()),
    ).resolves.toEqual({
      selected: true,
    });

    expect(defaultReferences.findByCircuitId).toHaveBeenCalledWith(0);
    expect(engine.analyze).toHaveBeenCalledWith(
      expect.objectContaining({ id: targetId.toString() }),
      professionalReference,
    );
    expect(lapModel.findOne).toHaveBeenCalledTimes(1);
  });

  it('clears an explicit reference so the professional default is restored', async () => {
    const userId = new Types.ObjectId();
    const targetId = new Types.ObjectId();
    const save = jest.fn().mockResolvedValue(undefined);
    const target = {
      _id: targetId,
      userId,
      referenceLapId: new Types.ObjectId(),
      save,
    };
    const lapModel = {
      findOne: jest.fn().mockResolvedValue(target),
    };
    const service = new SimCoachService(
      lapModel as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.clearReference(targetId.toString(), userId.toString()),
    ).resolves.toEqual({
      targetLapId: targetId.toString(),
      referenceLapId: null,
    });

    expect(target.referenceLapId).toBeUndefined();
    expect(save).toHaveBeenCalledTimes(1);
  });
});
