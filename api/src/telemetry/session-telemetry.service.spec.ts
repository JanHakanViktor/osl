import { SessionTelemetryService } from './session-telemetry.service';
import type { Session } from '../session/session.schema';
import { beforeEach, describe, expect, it } from '@jest/globals';

const SESSION_ID = 'session-1';

type PersistedSession = {
  _id: string;
  status: Session['status'];
  limitType: Session['limitType'];
  lapLimit?: number;
  timeLimitSeconds?: number;
  finishedAt?: Date;
  telemetry: Session['telemetry'];
};

/** Mimics Mongo: every query loads a fresh copy and save() writes it back. */
class FakeSessionModel {
  constructor(public persisted: PersistedSession) {}

  findOne(filter: { status: Session['status'] }) {
    const session =
      filter.status === this.persisted.status ? this.load() : null;

    return { sort: () => Promise.resolve(session) };
  }

  private load() {
    const session = {
      ...structuredClone(this.persisted),
      markModified: () => undefined,
      save: () => {
        this.persisted = structuredClone({
          ...this.persisted,
          status: session.status,
          finishedAt: session.finishedAt,
          telemetry: session.telemetry,
        });
        return Promise.resolve(session);
      },
    };

    return session;
  }
}

function createService(
  settings: Pick<
    PersistedSession,
    'limitType' | 'lapLimit' | 'timeLimitSeconds'
  > = {
    limitType: 'TIME',
  },
) {
  const model = new FakeSessionModel({
    _id: SESSION_ID,
    status: 'ACTIVE',
    ...settings,
    telemetry: {
      fastestLapMs: 0,
      fastestLapSectorsMs: [],
      topSpeedKmh: 0,
      cleanLapStreak: 0,
      bestCleanLapStreak: 0,
      totalCleanLaps: 0,
      totalLaps: 0,
      firstProcessedLapNum: 0,
      lastProcessedLapNum: 0,
    },
  });

  return { model, service: new SessionTelemetryService(model as never) };
}

function sendLapData(
  service: SessionTelemetryService,
  lap: { lapNum: number; lastLapTimeMs?: number; invalid?: boolean },
) {
  return service.handlePacket('lapData', {
    m_header: { m_playerCarIndex: 0 },
    m_lapData: [
      {
        m_currentLapNum: lap.lapNum,
        m_lastLapTimeInMS: lap.lastLapTimeMs ?? 0,
        m_currentLapInvalid: lap.invalid ? 1 : 0,
      },
    ],
  });
}

function sendTopSpeed(
  service: SessionTelemetryService,
  speedKmh: number,
  sessionTimeSeconds?: number,
) {
  return service.handlePacket('carTelemetry', {
    m_header: { m_playerCarIndex: 0, m_sessionTime: sessionTimeSeconds },
    m_carTelemetryData: [{ m_speed: speedKmh }],
  });
}

const SECTOR_1_MS = 30_000;
const SECTOR_2_MS = 30_000;

/** Sends the player's session history, where entry i holds lap i + 1. */
function sendSessionHistory(
  service: SessionTelemetryService,
  laps: Array<{ lapTimeMs: number; valid?: boolean }>,
  sessionTimeSeconds?: number,
) {
  return service.handlePacket('sessionHistory', {
    m_header: { m_playerCarIndex: 0, m_sessionTime: sessionTimeSeconds },
    m_carIdx: 0,
    m_numLaps: laps.length,
    m_lapHistoryData: laps.map(({ lapTimeMs, valid = true }) => ({
      m_lapTimeInMS: lapTimeMs,
      m_sector1TimeMSPart: SECTOR_1_MS,
      m_sector1TimeMinutesPart: 0,
      m_sector2TimeMSPart: SECTOR_2_MS,
      m_sector2TimeMinutesPart: 0,
      m_sector3TimeMSPart: lapTimeMs - SECTOR_1_MS - SECTOR_2_MS,
      m_sector3TimeMinutesPart: 0,
      m_lapValidBitFlags: valid ? 0x0f : 0x0e,
    })),
  });
}

function historySectors(lapTimeMs: number): number[] {
  return [SECTOR_1_MS, SECTOR_2_MS, lapTimeMs - SECTOR_1_MS - SECTOR_2_MS];
}

describe('SessionTelemetryService', () => {
  let service: SessionTelemetryService;

  beforeEach(() => {
    service = new SessionTelemetryService({} as never);
  });

  describe('completeSectorBreakdown', () => {
    it('does not turn a lap total into a fake sector when sector data is missing', () => {
      const sectors = (
        service as unknown as {
          completeSectorBreakdown(lapTime: number, sectors: number[]): number[];
        }
      ).completeSectorBreakdown(91_234, []);

      expect(sectors).toEqual([]);
    });

    it('derives sector 3 only when sector 1 and sector 2 are available', () => {
      const sectors = (
        service as unknown as {
          completeSectorBreakdown(lapTime: number, sectors: number[]): number[];
        }
      ).completeSectorBreakdown(91_234, [29_100, 31_200]);

      expect(sectors).toEqual([29_100, 31_200, 30_934]);
    });
  });

  describe('clean laps', () => {
    it('counts a lap driven without being invalidated as clean, even when the next lap starts invalid', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 1 });
      await sendLapData(service, {
        lapNum: 2,
        lastLapTimeMs: 90_000,
        invalid: true,
      });

      expect(model.persisted.telemetry).toMatchObject({
        totalLaps: 1,
        totalCleanLaps: 1,
        cleanLapStreak: 1,
      });
    });

    it('does not count a lap invalidated while it was driven as clean', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 1 });
      await sendLapData(service, { lapNum: 1, invalid: true });
      await sendLapData(service, { lapNum: 2, lastLapTimeMs: 90_000 });

      expect(model.persisted.telemetry).toMatchObject({
        totalLaps: 1,
        totalCleanLaps: 0,
        cleanLapStreak: 0,
      });
    });

    it('keeps a lap invalid once any packet flagged it', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 1, invalid: true });
      await sendLapData(service, { lapNum: 1, invalid: false });
      await sendLapData(service, { lapNum: 2, lastLapTimeMs: 90_000 });

      expect(model.persisted.telemetry).toMatchObject({
        totalLaps: 1,
        totalCleanLaps: 0,
      });
    });

    it('tracks the clean lap streak across laps', async () => {
      const { model, service } = createService();
      const invalidLaps = [false, false, true, false];

      for (const [index, invalid] of invalidLaps.entries()) {
        const lapNum = index + 1;
        const lastLapTimeMs = lapNum > 1 ? 90_000 : 0;

        await sendLapData(service, { lapNum, lastLapTimeMs, invalid });
        await sendLapData(service, { lapNum: lapNum + 1, lastLapTimeMs });
      }

      expect(model.persisted.telemetry).toMatchObject({
        totalLaps: 4,
        totalCleanLaps: 3,
        cleanLapStreak: 1,
        bestCleanLapStreak: 2,
      });
    });

    it('does not record a lap again after a flashback back across the finish line', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 1 });
      await sendLapData(service, { lapNum: 2, lastLapTimeMs: 90_000 });
      await sendLapData(service, { lapNum: 3, lastLapTimeMs: 91_000 });
      await sendLapData(service, { lapNum: 2, lastLapTimeMs: 90_000 });
      await sendLapData(service, { lapNum: 3, lastLapTimeMs: 91_000 });

      expect(model.persisted.telemetry).toMatchObject({
        totalLaps: 2,
        totalCleanLaps: 2,
      });
    });
  });

  describe('when the game session is already under way at session start', () => {
    it('ignores the lap the game completed before the session started', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 5, lastLapTimeMs: 88_000 });

      expect(model.persisted.telemetry).toMatchObject({
        fastestLapMs: 0,
        totalLaps: 0,
        totalCleanLaps: 0,
        lastProcessedLapNum: 0,
      });
    });

    it('records the first lap completed after the session started', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 5, lastLapTimeMs: 88_000 });
      await sendLapData(service, { lapNum: 6, lastLapTimeMs: 91_000 });

      expect(model.persisted.telemetry).toMatchObject({
        fastestLapMs: 91_000,
        totalLaps: 1,
        totalCleanLaps: 1,
        lastProcessedLapNum: 5,
      });
    });

    it('counts the lap limit from the laps completed since the session started', async () => {
      const { model, service } = createService({
        limitType: 'LAPS',
        lapLimit: 2,
      });

      const atStart = await sendLapData(service, {
        lapNum: 5,
        lastLapTimeMs: 88_000,
      });
      const afterOneLap = await sendLapData(service, {
        lapNum: 6,
        lastLapTimeMs: 91_000,
      });

      expect(atStart.finishedSessionId).toBeUndefined();
      expect(afterOneLap.finishedSessionId).toBeUndefined();
      expect(model.persisted.status).toBe('ACTIVE');

      const afterTwoLaps = await sendLapData(service, {
        lapNum: 7,
        lastLapTimeMs: 90_500,
      });

      expect(afterTwoLaps.finishedSessionId).toBe(SESSION_ID);
      expect(model.persisted.status).toBe('FINISHED');
    });
  });

  describe('session history fastest lap', () => {
    it('ignores history laps completed before the session started', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 5, lastLapTimeMs: 88_000 });
      await sendLapData(service, { lapNum: 6, lastLapTimeMs: 91_000 });
      await sendSessionHistory(service, [
        { lapTimeMs: 89_000 },
        { lapTimeMs: 85_000 },
        { lapTimeMs: 87_000 },
        { lapTimeMs: 88_000 },
        { lapTimeMs: 91_000 },
      ]);

      expect(model.persisted.telemetry).toMatchObject({
        fastestLapMs: 91_000,
        fastestLapSectorsMs: historySectors(91_000),
      });
    });

    it('ignores session history until the session has recorded a lap', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 5, lastLapTimeMs: 88_000 });
      await sendSessionHistory(service, [
        { lapTimeMs: 85_000 },
        { lapTimeMs: 86_000 },
        { lapTimeMs: 87_000 },
        { lapTimeMs: 88_000 },
      ]);

      expect(model.persisted.telemetry).toMatchObject({
        fastestLapMs: 0,
        fastestLapSectorsMs: [],
      });
    });

    it('ignores history laps completed after the session finished', async () => {
      const { model, service } = createService({
        limitType: 'LAPS',
        lapLimit: 1,
      });

      await sendLapData(service, { lapNum: 1 });
      await sendLapData(service, { lapNum: 2, lastLapTimeMs: 91_000 });
      expect(model.persisted.status).toBe('FINISHED');

      await sendSessionHistory(service, [
        { lapTimeMs: 91_000 },
        { lapTimeMs: 89_000 },
      ]);

      expect(model.persisted.telemetry).toMatchObject({
        fastestLapMs: 91_000,
        fastestLapSectorsMs: historySectors(91_000),
      });
    });

    it('uses the history of a restarted game session once it records a lap', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 5 });
      await sendLapData(service, { lapNum: 6, lastLapTimeMs: 95_000 });
      // The game session restarts, so lap numbers begin again at 1.
      await sendLapData(service, { lapNum: 1 });
      await sendLapData(service, { lapNum: 2, lastLapTimeMs: 92_000 });
      await sendSessionHistory(service, [{ lapTimeMs: 92_000 }]);

      expect(model.persisted.telemetry).toMatchObject({
        fastestLapMs: 92_000,
        fastestLapSectorsMs: historySectors(92_000),
      });
    });
  });

  describe('when a session has finished', () => {
    it('does not finish a TIME session again when late session history arrives', async () => {
      const { model, service } = createService({
        limitType: 'TIME',
        timeLimitSeconds: 600,
      });

      const atLimit = await sendTopSpeed(service, 300, 600);
      expect(atLimit.finishedSessionId).toBe(SESSION_ID);

      // Finished a minute ago, still inside the session history grace period.
      const finishedAt = new Date(Date.now() - 60_000);
      model.persisted.finishedAt = finishedAt;

      const lateHistory = await sendSessionHistory(service, [], 610);

      expect(lateHistory.finishedSessionId).toBeUndefined();
      expect(model.persisted.finishedAt).toEqual(finishedAt);
    });
  });

  describe('concurrent packets', () => {
    it('records a completed lap again with its own validity when a concurrent save overwrote it', async () => {
      const { model, service } = createService();

      await sendLapData(service, { lapNum: 1, invalid: true });

      // Both packets load the session before either saves, so the top speed
      // save lands last and writes back the lap counters from before the lap.
      await Promise.all([
        sendLapData(service, { lapNum: 2, lastLapTimeMs: 90_000 }),
        sendTopSpeed(service, 312),
      ]);
      expect(model.persisted.telemetry.lastProcessedLapNum).toBe(0);

      await sendLapData(service, { lapNum: 2, lastLapTimeMs: 90_000 });

      expect(model.persisted.telemetry).toMatchObject({
        topSpeedKmh: 312,
        lastProcessedLapNum: 1,
        totalLaps: 1,
        totalCleanLaps: 0,
        cleanLapStreak: 0,
      });
    });
  });
});
