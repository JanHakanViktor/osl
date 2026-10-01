import { describe, expect, it } from '@jest/globals';
import {
  buildAwards,
  buildStandings,
  classifyRound,
  findFastestSectors,
  summarizeHeat,
} from './tournament-scoring';
import type {
  CompletedHeat,
  HeatLap,
  TournamentRound,
  TournamentSettings,
} from './tournament.types';

const settings: TournamentSettings = {
  weather: 'DRY',
  lapsPerDriver: 2,
  cleanLapBonus: false,
  topSpeedBonus: false,
  ruleSetId: 'LADDER',
};

const drivers = ['viktor', 'carlos', 'tim', 'felix'].map((userId) => ({
  userId,
  driverName: userId,
  country: null,
  teamId: null,
}));

function lap(
  lapNumber: number,
  lapTimeMs: number,
  valid = true,
  sectorsMs: number[] = [],
): HeatLap {
  return { gameSessionUid: 'uid', lapNumber, lapTimeMs, sectorsMs, valid };
}

function heat(
  driverUserId: string,
  laps: HeatLap[],
  topSpeedKmh = 300,
): CompletedHeat {
  return {
    driverUserId,
    startedAt: new Date('2026-10-01T18:00:00Z'),
    finishedAt: new Date('2026-10-01T18:05:00Z'),
    endReason: 'LAP_TARGET_REACHED',
    laps,
    topSpeedKmh,
  };
}

describe('summarizeHeat', () => {
  it('uses the fastest valid lap and ignores invalid laps', () => {
    const summary = summarizeHeat(
      heat('viktor', [lap(1, 70_000, false), lap(2, 72_000)]),
      2,
    );

    expect(summary.bestLap?.lapTimeMs).toBe(72_000);
    expect(summary.lapsCompleted).toBe(2);
    expect(summary.validLapCount).toBe(1);
    expect(summary.isCleanHeat).toBe(false);
  });

  it('only calls a heat clean when every target lap was valid', () => {
    expect(
      summarizeHeat(heat('viktor', [lap(1, 71_000), lap(2, 72_000)]), 2)
        .isCleanHeat,
    ).toBe(true);
    expect(summarizeHeat(heat('viktor', [lap(1, 71_000)]), 2).isCleanHeat).toBe(
      false,
    );
  });

  it('keeps the best individual sectors from valid laps', () => {
    const summary = summarizeHeat(
      heat('viktor', [
        lap(1, 71_000, true, [20_000, 26_000, 25_000]),
        lap(2, 71_500, true, [19_500, 26_500, 25_500]),
        lap(3, 69_000, false, [18_000, 26_000, 25_000]),
      ]),
      3,
    );

    expect(summary.bestSectorsMs).toEqual([19_500, 26_000, 25_000]);
  });
});

describe('classifyRound', () => {
  it('ranks by best lap and gives drivers without a valid lap no time', () => {
    const round: TournamentRound = {
      circuitId: 5,
      heats: [
        heat('viktor', [lap(1, 72_100)]),
        heat('carlos', [lap(1, 71_900)]),
        heat('tim', [lap(1, 72_500)]),
        heat('felix', [lap(1, 70_000, false)]),
      ],
    };

    const entries = classifyRound(round, settings, drivers.length);

    expect(
      entries.map(({ driverUserId, position, points }) => ({
        driverUserId,
        position,
        points,
      })),
    ).toEqual([
      { driverUserId: 'carlos', position: 1, points: 4 },
      { driverUserId: 'viktor', position: 2, points: 3 },
      { driverUserId: 'tim', position: 3, points: 2 },
      { driverUserId: 'felix', position: null, points: 0 },
    ]);
  });

  it('breaks identical lap times in favour of the driver who set it first', () => {
    const round: TournamentRound = {
      circuitId: 5,
      heats: [heat('tim', [lap(1, 72_000)]), heat('viktor', [lap(1, 72_000)])],
    };

    expect(
      classifyRound(round, settings, 2).map((entry) => entry.driverUserId),
    ).toEqual(['tim', 'viktor']);
  });

  it('adds clean-lap and top-speed bonus points when enabled', () => {
    const round: TournamentRound = {
      circuitId: 5,
      heats: [
        heat('viktor', [lap(1, 72_000), lap(2, 72_500)], 310),
        heat('carlos', [lap(1, 71_000), lap(2, 70_000, false)], 310),
        heat('tim', [lap(1, 73_000), lap(2, 73_100)], 290),
      ],
    };

    const entries = classifyRound(
      round,
      { ...settings, cleanLapBonus: true, topSpeedBonus: true },
      3,
    );

    expect(
      entries.map(({ driverUserId, cleanLapBonus, topSpeedBonus, points }) => ({
        driverUserId,
        cleanLapBonus,
        topSpeedBonus,
        points,
      })),
    ).toEqual([
      { driverUserId: 'carlos', cleanLapBonus: 0, topSpeedBonus: 1, points: 4 },
      { driverUserId: 'viktor', cleanLapBonus: 1, topSpeedBonus: 1, points: 4 },
      { driverUserId: 'tim', cleanLapBonus: 1, topSpeedBonus: 0, points: 2 },
    ]);
  });
});

describe('findFastestSectors', () => {
  it('finds the best driver for each sector across the round', () => {
    const round: TournamentRound = {
      circuitId: 5,
      heats: [
        heat('viktor', [lap(1, 71_000, true, [20_000, 26_000, 25_000])]),
        heat('carlos', [lap(1, 71_200, true, [20_500, 25_500, 25_200])]),
        heat('tim', [lap(1, 60_000, false, [10_000, 10_000, 10_000])]),
      ],
    };

    expect(findFastestSectors(round)).toEqual([
      { driverUserId: 'viktor', sectorMs: 20_000 },
      { driverUserId: 'carlos', sectorMs: 25_500 },
      { driverUserId: 'viktor', sectorMs: 25_000 },
    ]);
  });
});

describe('buildStandings', () => {
  it('sums completed rounds only and sorts by points then round wins', () => {
    const state = {
      drivers: drivers.slice(0, 3),
      settings,
      rounds: [
        {
          circuitId: 5,
          heats: [
            heat('viktor', [lap(1, 71_000)]),
            heat('carlos', [lap(1, 72_000)]),
            heat('tim', [lap(1, 73_000)]),
          ],
        },
        {
          circuitId: 13,
          heats: [
            heat('tim', [lap(1, 81_000)]),
            heat('carlos', [lap(1, 82_000)]),
            heat('viktor', [lap(1, 83_000)]),
          ],
        },
        { circuitId: 11, heats: [heat('carlos', [lap(1, 60_000)])] },
      ],
    };

    expect(buildStandings(state)).toEqual([
      { position: 1, driverUserId: 'viktor', points: 4, roundWins: 1 },
      { position: 2, driverUserId: 'tim', points: 4, roundWins: 1 },
      { position: 3, driverUserId: 'carlos', points: 4, roundWins: 0 },
    ]);
  });
});

describe('buildAwards', () => {
  it('names the most round wins, top speed and most clean laps', () => {
    const state = {
      drivers: drivers.slice(0, 2),
      settings: { ...settings, lapsPerDriver: 2 },
      rounds: [
        {
          circuitId: 5,
          heats: [
            heat('viktor', [lap(1, 71_000), lap(2, 71_500)], 290),
            heat('carlos', [lap(1, 72_000), lap(2, 72_500, false)], 305),
          ],
        },
        {
          circuitId: 13,
          heats: [
            heat('viktor', [lap(1, 81_000), lap(2, 81_500)], 315),
            heat('carlos', [lap(1, 82_000), lap(2, 82_500)], 300),
          ],
        },
      ],
    };

    expect(buildAwards(state)).toEqual({
      mostRoundWins: { driverUserId: 'viktor', count: 2 },
      topSpeed: { driverUserId: 'viktor', speedKmh: 315, circuitId: 13 },
      mostCleanLaps: { driverUserId: 'viktor', count: 4 },
    });
  });
});
