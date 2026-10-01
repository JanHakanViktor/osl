import { describe, expect, it } from '@jest/globals';
import type {
  CompletedHeat,
  TournamentState,
} from '../domain/tournament.types';
import {
  toTournamentDto,
  toTournamentHighlightDto,
  toTournamentSummaryDto,
} from './tournament-response.mapper';

const date = new Date('2026-10-01T18:00:00Z');

function heat(driverUserId: string, lapTimeMs: number, valid = true) {
  const completed: CompletedHeat = {
    driverUserId,
    startedAt: date,
    finishedAt: date,
    endReason: 'LAP_TARGET_REACHED',
    laps: [
      { gameSessionUid: 'uid', lapNumber: 1, lapTimeMs, sectorsMs: [], valid },
    ],
    topSpeedKmh: 300,
  };
  return completed;
}

function tournament(overrides: Partial<TournamentState> = {}): TournamentState {
  return {
    id: 'tournament-1',
    hostUserId: 'host',
    name: 'Friday League',
    settings: {
      weather: 'WET',
      lapsPerDriver: 1,
      cleanLapBonus: false,
      topSpeedBonus: false,
      ruleSetId: 'LADDER',
    },
    drivers: [
      {
        userId: 'viktor',
        driverName: 'Viktor Petersson',
        country: 'SE',
        teamId: 'ferrari',
      },
      {
        userId: 'tim',
        driverName: 'Tim Andersson',
        country: null,
        teamId: null,
      },
    ],
    rounds: [
      {
        circuitId: 5,
        heats: [heat('viktor', 72_000), heat('tim', 70_000, false)],
      },
      { circuitId: 13, heats: [heat('tim', 81_000)] },
      { circuitId: 11, heats: [] },
    ],
    activeHeat: null,
    status: 'READY',
    winnerUserId: null,
    createdAt: date,
    finishedAt: null,
    ...overrides,
  };
}

describe('toTournamentDto', () => {
  it('describes each round with its status, circuit and classification', () => {
    const dto = toTournamentDto(tournament(), 'host');

    expect(dto.isHost).toBe(true);
    expect(dto.currentRoundNumber).toBe(2);
    expect(dto.rounds.map((round) => round.status)).toEqual([
      'COMPLETE',
      'IN_PROGRESS',
      'UPCOMING',
    ]);
    expect(dto.rounds[0].circuit).toMatchObject({ id: 5, grandPrix: 'Monaco' });
    expect(
      dto.rounds[0].results.map(({ driver, position, points }) => [
        driver.driverName,
        position,
        points,
      ]),
    ).toEqual([
      ['Viktor Petersson', 1, 2],
      ['Tim Andersson', null, 0],
    ]);
    expect(dto.standings[0]).toMatchObject({
      position: 1,
      driver: { id: 'viktor' },
      points: 2,
    });
    expect(dto.awards).toBeNull();
  });

  it('only reports a detected circuit when the game is on the wrong track', () => {
    const activeHeat = {
      roundIndex: 1,
      driverUserId: 'viktor',
      status: 'STAGED' as const,
      stagedAt: date,
      stagedGameSessionUid: null,
      startedAt: null,
      gameSessionUid: null,
      laps: [],
      topSpeedKmh: 0,
      detectedCircuitId: 11,
    };

    const wrongTrack = toTournamentDto(
      tournament({ activeHeat, status: 'AWAITING_DRIVER' }),
      'tim',
    );
    const rightTrack = toTournamentDto(
      tournament({
        activeHeat: { ...activeHeat, detectedCircuitId: 13 },
        status: 'AWAITING_DRIVER',
      }),
      'tim',
    );

    expect(wrongTrack.isHost).toBe(false);
    expect(wrongTrack.activeHeat).toMatchObject({
      roundNumber: 2,
      circuit: { id: 13 },
      driver: { driverName: 'Viktor Petersson' },
      lapsTarget: 1,
      detectedCircuit: { id: 11 },
    });
    expect(rightTrack.activeHeat?.detectedCircuit).toBeNull();
  });

  it('adds awards once the tournament is finished', () => {
    const dto = toTournamentDto(
      tournament({
        rounds: [
          {
            circuitId: 5,
            heats: [heat('viktor', 72_000), heat('tim', 71_000)],
          },
        ],
        status: 'FINISHED',
        winnerUserId: 'tim',
        finishedAt: date,
      }),
      'host',
    );

    expect(dto.awards?.mostRoundWins).toEqual({
      driver: {
        id: 'tim',
        driverName: 'Tim Andersson',
        country: null,
        teamId: null,
      },
      count: 1,
    });
  });

  it('shows each driver flag and team wherever the driver appears', () => {
    const viktor = {
      id: 'viktor',
      driverName: 'Viktor Petersson',
      country: 'SE',
      teamId: 'ferrari',
    };

    const dto = toTournamentDto(tournament(), 'host');

    expect(dto.drivers[0]).toEqual(viktor);
    expect(dto.standings[0].driver).toEqual(viktor);
    expect(dto.rounds[0].results[0].driver).toEqual(viktor);
    expect(dto.drivers[1]).toMatchObject({ country: null, teamId: null });
  });

  it('shows no flag or team for a winner missing from the driver list', () => {
    const summary = toTournamentSummaryDto(
      tournament({ status: 'FINISHED', winnerUserId: 'removed' }),
      'host',
    );

    expect(summary.winner).toEqual({
      id: 'removed',
      driverName: 'Unknown driver',
      country: null,
      teamId: null,
    });
  });
});

describe('toTournamentHighlightDto', () => {
  it('summarizes a running tournament for the landing page', () => {
    const highlight = toTournamentHighlightDto(
      tournament({
        status: 'HEAT_LIVE',
        activeHeat: {
          roundIndex: 1,
          driverUserId: 'viktor',
          status: 'LIVE',
          stagedAt: date,
          stagedGameSessionUid: null,
          startedAt: date,
          gameSessionUid: 'uid',
          laps: [
            {
              gameSessionUid: 'uid',
              lapNumber: 1,
              lapTimeMs: 80_500,
              sectorsMs: [],
              valid: true,
            },
          ],
          topSpeedKmh: 290,
          detectedCircuitId: null,
        },
      }),
    );

    expect(highlight).toMatchObject({
      id: 'tournament-1',
      name: 'Friday League',
      status: 'HEAT_LIVE',
      ruleSetName: 'Ladder',
      weather: 'WET',
      roundsCompleted: 1,
      roundsTotal: 3,
      currentRoundNumber: 2,
      champion: null,
      activeHeat: {
        roundNumber: 2,
        status: 'LIVE',
        circuit: { id: 13 },
        driver: { id: 'viktor', country: 'SE', teamId: 'ferrari' },
        lapsCompleted: 1,
        lapsTarget: 1,
        bestLapMs: 80_500,
      },
    });
    expect(
      highlight.rounds.map(({ roundNumber, status, winner }) => [
        roundNumber,
        status,
        winner?.id ?? null,
      ]),
    ).toEqual([
      [1, 'COMPLETE', 'viktor'],
      [2, 'IN_PROGRESS', null],
      [3, 'UPCOMING', null],
    ]);
    expect(highlight.standings.map((standing) => standing.driver.id)).toEqual([
      'viktor',
      'tim',
    ]);
  });

  it('names the champion once the tournament is finished', () => {
    const highlight = toTournamentHighlightDto(
      tournament({
        rounds: [
          {
            circuitId: 5,
            heats: [heat('viktor', 72_000), heat('tim', 71_000)],
          },
        ],
        status: 'FINISHED',
        winnerUserId: 'tim',
        finishedAt: date,
      }),
    );

    expect(highlight.champion).toMatchObject({
      id: 'tim',
      driverName: 'Tim Andersson',
    });
    expect(highlight.currentRoundNumber).toBeNull();
    expect(highlight.activeHeat).toBeNull();
  });
});
