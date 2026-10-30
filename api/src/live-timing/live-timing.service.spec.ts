import { NotFoundException } from '@nestjs/common';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { TelemetryPacketBus } from '../telemetry/telemetry-packet.bus';
import type { TimingBoardSnapshot } from './domain/timing.types';
import type { TimingBoardDto, TimingFrameDto } from './dto/live-timing.dto';
import type { LiveTimingGateway } from './live-timing.gateway';
import {
  FRAME_INTERVAL_MS,
  LiveTimingService,
  SAVE_INTERVAL_MS,
} from './live-timing.service';
import type { TimingSessionRepository } from './timing-session.repository';

class InMemoryTimingSessionRepository {
  readonly sessions = new Map<string, TimingBoardSnapshot>();
  saves = 0;

  findBySessionUid(sessionUid: string) {
    const saved = this.sessions.get(sessionUid);
    return Promise.resolve(saved ? structuredClone(saved) : null);
  }

  listRecent() {
    return Promise.resolve([...this.sessions.values()]);
  }

  save(snapshot: TimingBoardSnapshot) {
    this.saves += 1;
    this.sessions.set(snapshot.sessionUid, structuredClone(snapshot));
    return Promise.resolve();
  }
}

class RecordingGateway {
  readonly frames: TimingFrameDto[] = [];
  readonly boards: TimingBoardDto[] = [];

  broadcastFrame(frame: TimingFrameDto) {
    this.frames.push(frame);
  }

  broadcastBoard(board: TimingBoardDto) {
    this.boards.push(board);
  }
}

function header(uid: string) {
  return { m_sessionUID: uid, m_playerCarIndex: 0, m_sessionTime: 12 };
}

function sessionPacket(uid: string) {
  return {
    type: 'session',
    data: {
      m_header: header(uid),
      m_sessionType: 15,
      m_trackId: 7,
      m_trackLength: 5_000,
      m_sessionTimeLeft: 1_800,
    },
  };
}

function lapDataPacket(uid: string, lapDistance = 100, position = 1) {
  return {
    type: 'lapData',
    data: {
      m_header: header(uid),
      m_lapData: [
        {
          m_resultStatus: 2,
          m_carPosition: position,
          m_currentLapNum: 2,
          m_lapDistance: lapDistance,
        },
      ],
    },
  };
}

function historyPacket(uid: string, lapTimesMs: number[]) {
  return {
    type: 'sessionHistory',
    data: {
      m_header: header(uid),
      m_carIdx: 0,
      m_numLaps: lapTimesMs.length,
      m_lapHistoryData: lapTimesMs.map((lapTimeMs) => ({
        m_lapTimeInMS: lapTimeMs,
        m_lapValidBitFlags: 0x0f,
      })),
    },
  };
}

function finalClassificationPacket(uid: string) {
  return {
    type: 'finalClassification',
    data: {
      m_header: header(uid),
      m_numCars: 1,
      m_classificationData: [{ m_position: 1, m_resultStatus: 3 }],
    },
  };
}

describe('LiveTimingService', () => {
  let repository: InMemoryTimingSessionRepository;
  let gateway: RecordingGateway;
  let bus: TelemetryPacketBus;
  let service: LiveTimingService;

  beforeEach(() => {
    jest.useFakeTimers();
    repository = new InMemoryTimingSessionRepository();
    gateway = new RecordingGateway();
    bus = new TelemetryPacketBus();
    service = new LiveTimingService(
      repository as unknown as TimingSessionRepository,
      gateway as unknown as LiveTimingGateway,
      bus,
    );
    service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    jest.useRealTimers();
  });

  /** Lets throttled work and pending saves run. */
  async function settle(ms = 0) {
    await jest.advanceTimersByTimeAsync(ms);
  }

  it('streams frames and standings from the relay’s packets', async () => {
    bus.publish(sessionPacket('uid-1'));
    bus.publish(lapDataPacket('uid-1'));
    await settle(FRAME_INTERVAL_MS);

    expect(gateway.frames.at(-1)?.cars).toEqual([
      expect.objectContaining({ carIndex: 0, position: 1, lapProgress: 0.02 }),
    ]);
    expect(gateway.boards.at(-1)?.session).toMatchObject({
      sessionUid: 'uid-1',
      sessionKind: 'RACE',
    });
  });

  it('sends frames at most four times a second', async () => {
    bus.publish(lapDataPacket('uid-1', 100));
    bus.publish(lapDataPacket('uid-1', 200));
    bus.publish(lapDataPacket('uid-1', 300));
    expect(gateway.frames).toHaveLength(1);

    await settle(FRAME_INTERVAL_MS);
    expect(gateway.frames).toHaveLength(2);
  });

  it('only resends standings when they change', async () => {
    bus.publish(lapDataPacket('uid-1', 100));
    await settle(5_000);
    bus.publish(lapDataPacket('uid-1', 400));
    await settle(5_000);
    expect(gateway.boards).toHaveLength(1);

    bus.publish(lapDataPacket('uid-1', 500, 2));
    expect(gateway.boards).toHaveLength(2);
  });

  it('ignores packets that belong to no game session', async () => {
    bus.publish(lapDataPacket('0'));
    bus.publish({ type: 'carTelemetry', data: { m_header: header('uid-1') } });
    await settle(FRAME_INTERVAL_MS);

    expect(gateway.frames).toHaveLength(0);
    expect(service.getCurrent()).toEqual({ board: null, frame: null });
  });

  it('does not save a session before anyone completed a lap', async () => {
    bus.publish(sessionPacket('uid-1'));
    bus.publish(lapDataPacket('uid-1'));
    await settle(SAVE_INTERVAL_MS * 2);

    expect(repository.saves).toBe(0);
  });

  it('saves completed laps, at most every save interval', async () => {
    bus.publish(historyPacket('uid-1', [91_000]));
    await settle();
    expect(repository.sessions.get('uid-1')?.cars[0].laps).toHaveLength(1);

    bus.publish(historyPacket('uid-1', [91_000, 90_500]));
    await settle();
    expect(repository.saves).toBe(1);

    await settle(SAVE_INTERVAL_MS);
    expect(repository.saves).toBe(2);
    expect(repository.sessions.get('uid-1')?.cars[0].laps).toHaveLength(2);
  });

  it('saves the previous session when the game starts a new one', async () => {
    bus.publish(historyPacket('uid-1', [91_000]));
    bus.publish(historyPacket('uid-1', [91_000, 90_500]));
    bus.publish(lapDataPacket('uid-2'));
    await settle();

    expect(repository.sessions.get('uid-1')?.cars[0].laps).toHaveLength(2);
    expect(service.getCurrent().board?.session.sessionUid).toBe('uid-2');
  });

  it('saves the final classification straight away', async () => {
    bus.publish(historyPacket('uid-1', [91_000]));
    await settle();
    bus.publish(finalClassificationPacket('uid-1'));
    await settle();

    expect(repository.saves).toBe(2);
    expect(repository.sessions.get('uid-1')?.cars[0].result).toMatchObject({
      position: 1,
      resultStatus: 'FINISHED',
    });
  });

  it('picks up laps saved before the API restarted', async () => {
    bus.publish(historyPacket('uid-1', [91_000, 90_500]));
    await settle();
    await service.onModuleDestroy();

    const restarted = new LiveTimingService(
      repository as unknown as TimingSessionRepository,
      gateway as unknown as LiveTimingGateway,
      bus,
    );
    restarted.onModuleInit();
    service = restarted;
    bus.publish(lapDataPacket('uid-1'));
    await settle();

    expect(restarted.getCurrent().board?.drivers[0].laps).toHaveLength(2);
  });

  describe('getSession', () => {
    it('serves the live session, then saved ones', async () => {
      bus.publish(historyPacket('uid-1', [91_000]));
      bus.publish(lapDataPacket('uid-2'));
      await settle();

      await expect(service.getSession('uid-2')).resolves.toMatchObject({
        session: { sessionUid: 'uid-2' },
      });
      await expect(service.getSession('uid-1')).resolves.toMatchObject({
        drivers: [expect.objectContaining({ carIndex: 0 })],
      });
      await expect(service.getSession('uid-3')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  it('lists saved sessions as summaries', async () => {
    bus.publish(historyPacket('uid-1', [91_000]));
    await settle();

    await expect(service.listSessions()).resolves.toEqual([
      expect.objectContaining({
        sessionUid: 'uid-1',
        driverCount: 1,
        fastestLap: expect.objectContaining({ timeMs: 91_000 }),
      }),
    ]);
  });
});
