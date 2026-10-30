import type { TimingLap } from './timing.types';

/**
 * Valid laps within this share of a driver's best lap count towards their
 * average and consistency; slower ones are pit, traffic or safety car laps.
 */
const REPRESENTATIVE_LAP_RATIO = 1.07;

export type LapRecord = {
  lapNumber: number;
  timeMs: number;
};

export type CarRecord = LapRecord & { carIndex: number };

export type DriverStats = {
  lapsCompleted: number;
  validLaps: number;
  bestLap: LapRecord | null;
  lastLapMs: number | null;
  averageLapMs: number | null;
  /** Standard deviation of the representative laps. */
  consistencyMs: number | null;
  bestSectors: Array<LapRecord | null>;
  /** Best lap the driver's best sectors add up to. */
  idealLapMs: number | null;
};

export type SessionBests = {
  fastestLap: CarRecord | null;
  fastestSectors: Array<CarRecord | null>;
  /** Best lap the session's fastest sectors add up to. */
  theoreticalBestLapMs: number | null;
};

export type TimingGap = {
  gapToLeaderMs: number | null;
  intervalMs: number | null;
};

const SECTOR_INDEXES = [0, 1, 2];

function findFastest<T extends LapRecord>(records: T[]): T | null {
  return records.reduce<T | null>(
    (best, record) => (!best || record.timeMs < best.timeMs ? record : best),
    null,
  );
}

function sumOrNull(records: Array<LapRecord | null>): number | null {
  return records.every((record) => record !== null)
    ? records.reduce((total, record) => total + record.timeMs, 0)
    : null;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function standardDeviation(values: number[]): number | null {
  const mean = average(values);
  if (mean === null || values.length < 2) return null;

  return Math.sqrt(average(values.map((value) => (value - mean) ** 2))!);
}

function roundOrNull(value: number | null): number | null {
  return value === null ? null : Math.round(value);
}

function sectorRecords(laps: TimingLap[], sectorIndex: number): LapRecord[] {
  return laps.flatMap((lap) => {
    const timeMs = lap.sectorsMs[sectorIndex];
    return timeMs != null && lap.sectorsValid[sectorIndex]
      ? [{ lapNumber: lap.lapNumber, timeMs }]
      : [];
  });
}

/** Only valid laps and sectors count for bests, as on the game's timing. */
export function calculateDriverStats(laps: TimingLap[]): DriverStats {
  const validLaps = laps.filter((lap) => lap.valid);
  const bestLap = findFastest(
    validLaps.map((lap) => ({
      lapNumber: lap.lapNumber,
      timeMs: lap.lapTimeMs,
    })),
  );
  const representativeLapsMs = bestLap
    ? validLaps
        .map((lap) => lap.lapTimeMs)
        .filter((timeMs) => timeMs <= bestLap.timeMs * REPRESENTATIVE_LAP_RATIO)
    : [];
  const bestSectors = SECTOR_INDEXES.map((index) =>
    findFastest(sectorRecords(laps, index)),
  );

  return {
    lapsCompleted: laps.length,
    validLaps: validLaps.length,
    bestLap,
    lastLapMs: laps.at(-1)?.lapTimeMs ?? null,
    averageLapMs: roundOrNull(average(representativeLapsMs)),
    consistencyMs: roundOrNull(standardDeviation(representativeLapsMs)),
    bestSectors,
    idealLapMs: sumOrNull(bestSectors),
  };
}

export function calculateSessionBests(
  drivers: Array<{ carIndex: number; stats: DriverStats }>,
): SessionBests {
  const withCar = (carIndex: number, record: LapRecord | null) =>
    record ? [{ ...record, carIndex }] : [];

  const fastestSectors = SECTOR_INDEXES.map((index) =>
    findFastest(
      drivers.flatMap(({ carIndex, stats }) =>
        withCar(carIndex, stats.bestSectors[index]),
      ),
    ),
  );

  return {
    fastestLap: findFastest(
      drivers.flatMap(({ carIndex, stats }) =>
        withCar(carIndex, stats.bestLap),
      ),
    ),
    fastestSectors,
    theoreticalBestLapMs: sumOrNull(fastestSectors),
  };
}

/**
 * Gaps by best lap, as practice and qualifying timing shows them, for cars
 * listed in running order. Cars without a lap time have no gap.
 */
export function calculateBestLapGaps(
  bestLapsMs: Array<number | null>,
): TimingGap[] {
  const times = bestLapsMs.filter(
    (timeMs): timeMs is number => timeMs !== null,
  );
  const leaderMs = times.length > 0 ? Math.min(...times) : null;

  return bestLapsMs.map((timeMs, index) => {
    if (timeMs === null || leaderMs === null) {
      return { gapToLeaderMs: null, intervalMs: null };
    }

    const aheadMs = index > 0 ? bestLapsMs[index - 1] : null;
    return {
      gapToLeaderMs: timeMs - leaderMs,
      intervalMs: aheadMs === null ? null : timeMs - aheadMs,
    };
  });
}
