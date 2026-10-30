import { describe, expect, it } from '@jest/globals';
import {
  calculateBestLapGaps,
  calculateDriverStats,
  calculateSessionBests,
} from './timing-stats';
import type { TimingLap } from './timing.types';

function lap(
  lapNumber: number,
  sectorsMs: [number, number, number],
  options: { valid?: boolean; sectorsValid?: boolean[] } = {},
): TimingLap {
  return {
    lapNumber,
    lapTimeMs: sectorsMs[0] + sectorsMs[1] + sectorsMs[2],
    sectorsMs,
    valid: options.valid ?? true,
    sectorsValid: options.sectorsValid ?? [true, true, true],
  };
}

describe('calculateDriverStats', () => {
  it('has no bests before a lap is completed', () => {
    expect(calculateDriverStats([])).toEqual({
      lapsCompleted: 0,
      validLaps: 0,
      bestLap: null,
      lastLapMs: null,
      averageLapMs: null,
      consistencyMs: null,
      bestSectors: [null, null, null],
      idealLapMs: null,
    });
  });

  it('takes the best lap from valid laps only', () => {
    const stats = calculateDriverStats([
      lap(1, [30_000, 30_000, 30_000]),
      lap(2, [29_000, 29_000, 29_000], { valid: false }),
      lap(3, [30_000, 30_000, 29_500]),
    ]);

    expect(stats.lapsCompleted).toBe(3);
    expect(stats.validLaps).toBe(2);
    expect(stats.bestLap).toEqual({ lapNumber: 3, timeMs: 89_500 });
    expect(stats.lastLapMs).toBe(89_500);
  });

  it('builds the ideal lap from the best valid sectors across laps', () => {
    const stats = calculateDriverStats([
      lap(1, [29_800, 30_400, 30_000]),
      lap(2, [30_200, 29_900, 30_300]),
      lap(3, [29_000, 29_000, 29_600], {
        valid: false,
        sectorsValid: [false, false, true],
      }),
    ]);

    expect(stats.bestSectors).toEqual([
      { lapNumber: 1, timeMs: 29_800 },
      { lapNumber: 2, timeMs: 29_900 },
      { lapNumber: 3, timeMs: 29_600 },
    ]);
    expect(stats.idealLapMs).toBe(89_300);
  });

  it('leaves slow laps out of the average and consistency', () => {
    const stats = calculateDriverStats([
      lap(1, [30_000, 30_000, 30_000]),
      lap(2, [30_000, 30_000, 31_000]),
      // A pit lap, more than 7% slower than the best lap.
      lap(3, [30_000, 30_000, 50_000]),
    ]);

    expect(stats.averageLapMs).toBe(90_500);
    expect(stats.consistencyMs).toBe(500);
  });

  it('needs two representative laps to measure consistency', () => {
    const stats = calculateDriverStats([lap(1, [30_000, 30_000, 30_000])]);

    expect(stats.averageLapMs).toBe(90_000);
    expect(stats.consistencyMs).toBeNull();
  });
});

describe('calculateSessionBests', () => {
  it('finds the fastest lap and sectors across drivers', () => {
    const bests = calculateSessionBests([
      {
        carIndex: 0,
        stats: calculateDriverStats([lap(1, [29_500, 30_500, 30_000])]),
      },
      {
        carIndex: 3,
        stats: calculateDriverStats([
          lap(1, [30_000, 30_000, 29_900]),
          lap(2, [30_100, 29_800, 30_200]),
        ]),
      },
    ]);

    expect(bests.fastestLap).toEqual({
      carIndex: 3,
      lapNumber: 1,
      timeMs: 89_900,
    });
    expect(bests.fastestSectors).toEqual([
      { carIndex: 0, lapNumber: 1, timeMs: 29_500 },
      { carIndex: 3, lapNumber: 2, timeMs: 29_800 },
      { carIndex: 3, lapNumber: 1, timeMs: 29_900 },
    ]);
    expect(bests.theoreticalBestLapMs).toBe(89_200);
  });

  it('has no theoretical best while a sector has no time', () => {
    const bests = calculateSessionBests([
      { carIndex: 0, stats: calculateDriverStats([]) },
    ]);

    expect(bests.fastestLap).toBeNull();
    expect(bests.fastestSectors).toEqual([null, null, null]);
    expect(bests.theoreticalBestLapMs).toBeNull();
  });
});

describe('calculateBestLapGaps', () => {
  it('measures gaps to the fastest lap and to the car ahead', () => {
    expect(calculateBestLapGaps([90_000, 90_250, null, 91_000])).toEqual([
      { gapToLeaderMs: 0, intervalMs: null },
      { gapToLeaderMs: 250, intervalMs: 250 },
      { gapToLeaderMs: null, intervalMs: null },
      { gapToLeaderMs: 1_000, intervalMs: null },
    ]);
  });

  it('has no gaps before anyone sets a time', () => {
    expect(calculateBestLapGaps([null, null])).toEqual([
      { gapToLeaderMs: null, intervalMs: null },
      { gapToLeaderMs: null, intervalMs: null },
    ]);
  });
});
