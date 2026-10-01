import { describe, expect, it } from '@jest/globals';
import type { HeatLapDataEntry, HeatLapDataPacket } from './f1-packets';
import { HeatLapTracker } from './heat-lap-tracker';

const FLYING_LAP = 1;
const OUT_LAP = 3;

function lapPacket(
  uid: string,
  entry: HeatLapDataEntry,
  playerCarIndex = 0,
): HeatLapDataPacket {
  const lapData: HeatLapDataEntry[] = [];
  lapData[playerCarIndex] = {
    m_currentLapInvalid: 0,
    m_driverStatus: FLYING_LAP,
    ...entry,
  };

  return {
    m_header: { m_sessionUID: uid, m_playerCarIndex: playerCarIndex },
    m_lapData: lapData,
  };
}

/** Packets for driving lap `lapNumber` from start to the line. */
function driveLap(
  uid: string,
  lapNumber: number,
  options: { invalidAtMs?: number; driverStatus?: number } = {},
): HeatLapDataPacket[] {
  const status = { m_driverStatus: options.driverStatus ?? FLYING_LAP };
  const invalidFrom = options.invalidAtMs ?? Infinity;

  return [100, 25_000, 50_000, 70_000].map((timeMs) =>
    lapPacket(uid, {
      ...status,
      m_currentLapNum: lapNumber,
      m_currentLapTimeInMS: timeMs,
      m_sector1TimeMSPart: timeMs >= 25_000 ? 24_500 : 0,
      m_sector2TimeMSPart: timeMs >= 50_000 ? 25_000 : 0,
      m_currentLapInvalid: timeMs >= invalidFrom ? 1 : 0,
    }),
  );
}

function crossLine(uid: string, nextLapNumber: number, lastLapTimeMs: number) {
  return lapPacket(uid, {
    m_currentLapNum: nextLapNumber,
    m_currentLapTimeInMS: 50,
    m_lastLapTimeInMS: lastLapTimeMs,
  });
}

function feed(tracker: HeatLapTracker, packets: HeatLapDataPacket[]) {
  return packets.map((packet) => tracker.handleLapData(packet)).filter(Boolean);
}

function newTracker(gameSessionUid: string | null = 'uid-1') {
  return new HeatLapTracker({ gameSessionUid, laps: [], topSpeedKmh: 0 });
}

describe('HeatLapTracker', () => {
  it('records a lap the driver started during the heat', () => {
    const tracker = newTracker();

    const completed = feed(tracker, [
      ...driveLap('uid-1', 1),
      crossLine('uid-1', 2, 72_345),
    ]);

    expect(completed).toEqual([
      {
        gameSessionUid: 'uid-1',
        lapNumber: 1,
        lapTimeMs: 72_345,
        sectorsMs: [24_500, 25_000, 22_845],
        valid: true,
      },
    ]);
  });

  it('skips the lap that was already under way when the heat started', () => {
    const tracker = newTracker();

    feed(tracker, [
      lapPacket('uid-1', { m_currentLapNum: 4, m_currentLapTimeInMS: 40_000 }),
      crossLine('uid-1', 5, 70_000),
    ]);

    expect(tracker.snapshot().laps).toEqual([]);
  });

  it('keeps a lap invalid once it was invalidated, even after the next lap starts clean', () => {
    const tracker = newTracker();

    feed(tracker, [
      ...driveLap('uid-1', 1, { invalidAtMs: 25_000 }),
      crossLine('uid-1', 2, 71_000),
    ]);

    expect(tracker.snapshot().laps[0].valid).toBe(false);
  });

  it('does not count out laps as timed attempts', () => {
    const tracker = newTracker();

    feed(tracker, [
      ...driveLap('uid-1', 1, { driverStatus: OUT_LAP }),
      crossLine('uid-1', 2, 95_000),
      ...driveLap('uid-1', 2),
      crossLine('uid-1', 3, 72_000),
    ]);

    expect(tracker.snapshot().laps.map((lap) => lap.lapNumber)).toEqual([2]);
  });

  it('keeps counting after the driver restarts into a new game session', () => {
    const tracker = newTracker();

    feed(tracker, [
      ...driveLap('uid-1', 1),
      crossLine('uid-1', 2, 72_000),
      lapPacket('uid-1', { m_currentLapNum: 2, m_currentLapTimeInMS: 30_000 }),
      ...driveLap('uid-2', 1),
      crossLine('uid-2', 2, 71_500),
    ]);

    expect(
      tracker
        .snapshot()
        .laps.map(({ gameSessionUid, lapNumber }) => [
          gameSessionUid,
          lapNumber,
        ]),
    ).toEqual([
      ['uid-1', 1],
      ['uid-2', 1],
    ]);
    expect(tracker.snapshot().gameSessionUid).toBe('uid-2');
  });

  it('replaces a lap that is completed again after a flashback', () => {
    const tracker = newTracker();

    feed(tracker, [
      ...driveLap('uid-1', 1),
      crossLine('uid-1', 2, 73_000),
      lapPacket('uid-1', { m_currentLapNum: 1, m_currentLapTimeInMS: 68_000 }),
      crossLine('uid-1', 2, 72_000),
    ]);

    expect(tracker.snapshot().laps).toHaveLength(1);
    expect(tracker.snapshot().laps[0].lapTimeMs).toBe(72_000);
  });

  it('reads the player car and ignores other cars', () => {
    const tracker = newTracker();
    const playerIndex = 3;

    feed(tracker, [
      lapPacket(
        'uid-1',
        { m_currentLapNum: 1, m_currentLapTimeInMS: 100 },
        playerIndex,
      ),
      lapPacket(
        'uid-1',
        {
          m_currentLapNum: 2,
          m_currentLapTimeInMS: 50,
          m_lastLapTimeInMS: 74_000,
        },
        playerIndex,
      ),
    ]);

    expect(tracker.snapshot().laps[0].lapTimeMs).toBe(74_000);
  });

  it('tracks top speed for the heat game session only', () => {
    const tracker = newTracker();
    const speedPacket = (uid: string, speed: number) => ({
      m_header: { m_sessionUID: uid, m_playerCarIndex: 0 },
      m_carTelemetryData: [{ m_speed: speed }],
    });

    expect(tracker.handleCarTelemetry(speedPacket('uid-1', 312))).toBe(true);
    expect(tracker.handleCarTelemetry(speedPacket('uid-1', 300))).toBe(false);
    expect(tracker.handleCarTelemetry(speedPacket('other-uid', 340))).toBe(
      false,
    );
    expect(tracker.snapshot().topSpeedKmh).toBe(312);
  });

  it('binds to the first game session it sees when started without one', () => {
    const tracker = newTracker(null);

    feed(tracker, [...driveLap('uid-9', 1), crossLine('uid-9', 2, 72_000)]);

    expect(tracker.snapshot().gameSessionUid).toBe('uid-9');
    expect(tracker.snapshot().laps).toHaveLength(1);
  });
});
