import { Types } from 'mongoose';
import {
  SessionService,
  getFastestLapRecord,
  getValidSectorBreakdown,
} from './session.service';

const USER_ID = new Types.ObjectId().toString();

function createServiceWithActiveSession(telemetry: Record<string, unknown>) {
  const activeSession = {
    _id: new Types.ObjectId(),
    sessionName: 'Monza long run',
    circuitName: 'Monza',
    limitType: 'LAPS',
    lapLimit: 3,
    status: 'ACTIVE',
    telemetry,
  };
  const model = {
    findOne: () => ({ lean: () => Promise.resolve(activeSession) }),
  };

  return {
    sessionId: activeSession._id.toString(),
    service: new SessionService(model as never),
  };
}

describe('SessionService.getLiveSession', () => {
  it('reports the laps completed since the session started', async () => {
    const { service, sessionId } = createServiceWithActiveSession({
      totalLaps: 2,
      lastProcessedLapNum: 6,
    });

    const liveSession = await service.getLiveSession(sessionId, USER_ID);

    expect(liveSession).toMatchObject({ lapLimit: 3, lapsCompleted: 2 });
  });

  it('reports no completed laps for sessions saved before laps were counted', async () => {
    const { service, sessionId } = createServiceWithActiveSession({
      lastProcessedLapNum: 6,
    });

    const liveSession = await service.getLiveSession(sessionId, USER_ID);

    expect(liveSession.lapsCompleted).toBe(0);
  });
});

describe('getValidSectorBreakdown', () => {
  it('keeps complete three-sector lap breakdowns', () => {
    expect(getValidSectorBreakdown([29_100, 31_200, 30_934])).toEqual([
      29_100,
      31_200,
      30_934,
    ]);
  });

  it('rejects partial sector arrays that would shift values into the wrong sector', () => {
    expect(getValidSectorBreakdown([91_234])).toEqual([]);
  });
});

describe('getFastestLapRecord', () => {
  it('returns the fastest lap with the previous record it improved on', () => {
    const record = getFastestLapRecord([
      {
        telemetry: { fastestLapMs: 94_500 },
        userId: { username: 'first-driver' },
      },
      {
        telemetry: { fastestLapMs: 93_250 },
        userId: { drivername: 'Previous Best' },
      },
      {
        telemetry: { fastestLapMs: 92_900 },
        userId: { drivername: 'Current Best' },
      },
    ]);

    expect(record?.fastest.telemetry.fastestLapMs).toBe(92_900);
    expect(record?.previousFastest?.telemetry.fastestLapMs).toBe(93_250);
    expect(record?.previousFastestDriverName).toBe('Previous Best');
  });

  it('has no previous record when only one valid lap exists', () => {
    const record = getFastestLapRecord([
      {
        telemetry: { fastestLapMs: 91_000 },
        userId: { drivername: 'Only Best' },
      },
    ]);

    expect(record?.fastest.telemetry.fastestLapMs).toBe(91_000);
    expect(record?.previousFastest).toBeNull();
    expect(record?.previousFastestDriverName).toBeNull();
  });
});
