import { describe, expect, it } from '@jest/globals';
import type { RandomSource } from './random-source';
import {
  createTournamentState,
  TournamentProgress,
  TournamentStateError,
} from './tournament-progress';
import type { HeatLap, TournamentState } from './tournament.types';

const firstPick: RandomSource = { nextInt: () => 0 };
const now = new Date('2026-10-01T18:00:00Z');

function newTournament(circuitIds = [5, 11, 13]): TournamentState {
  return createTournamentState(
    {
      id: 'tournament-1',
      hostUserId: 'host',
      name: 'Friday League',
      settings: {
        weather: 'DRY',
        lapsPerDriver: 1,
        cleanLapBonus: false,
        topSpeedBonus: false,
        ruleSetId: 'LADDER',
      },
      drivers: [
        { userId: 'viktor', driverName: 'Viktor' },
        { userId: 'tim', driverName: 'Tim' },
      ],
      circuitIds,
    },
    firstPick,
    now,
  );
}

function lap(lapTimeMs: number): HeatLap {
  return {
    gameSessionUid: 'uid',
    lapNumber: 1,
    lapTimeMs,
    sectorsMs: [],
    valid: true,
  };
}

function driveHeat(progress: TournamentProgress, lapTimeMs: number) {
  const driver = progress.stageNextDriver(firstPick, null, now);
  progress.startHeat('uid', now);
  progress.recordHeatProgress({
    gameSessionUid: 'uid',
    laps: [lap(lapTimeMs)],
    topSpeedKmh: 300,
  });
  progress.completeHeat('LAP_TARGET_REACHED', now);
  return driver;
}

describe('createTournamentState', () => {
  it('randomizes the track order and starts ready for the first dice roll', () => {
    const state = newTournament([5, 11, 13]);

    expect(state.rounds.map((round) => round.circuitId)).toEqual([11, 13, 5]);
    expect(state.status).toBe('READY');
    expect(state.activeHeat).toBeNull();
  });
});

describe('TournamentProgress', () => {
  it('stages a driver who has not driven the current track yet', () => {
    const progress = new TournamentProgress(newTournament());

    driveHeat(progress, 72_000);
    const next = progress.stageNextDriver(firstPick, 'previous-uid', now);

    expect(next.userId).toBe('tim');
    expect(progress.snapshot.status).toBe('AWAITING_DRIVER');
    expect(progress.snapshot.activeHeat).toMatchObject({
      roundIndex: 0,
      driverUserId: 'tim',
      status: 'STAGED',
      stagedGameSessionUid: 'previous-uid',
    });
  });

  it('re-rolls to a different waiting driver when one is already staged', () => {
    const progress = new TournamentProgress(newTournament());

    const first = progress.stageNextDriver(firstPick, null, now);
    const reroll = progress.stageNextDriver(firstPick, null, now);

    expect(first.userId).toBe('viktor');
    expect(reroll.userId).toBe('tim');
  });

  it('does not start a heat before a driver is staged', () => {
    const progress = new TournamentProgress(newTournament());

    expect(() => progress.startHeat('uid', now)).toThrow(TournamentStateError);
  });

  it('moves to the next track once every driver has driven the current one', () => {
    const progress = new TournamentProgress(newTournament());

    driveHeat(progress, 72_000);
    expect(progress.currentRoundIndex()).toBe(0);
    driveHeat(progress, 71_000);

    expect(progress.currentRoundIndex()).toBe(1);
    expect(progress.snapshot.rounds[0].heats).toHaveLength(2);
    expect(progress.snapshot.status).toBe('READY');
  });

  it('finishes with a winner after the final track', () => {
    const progress = new TournamentProgress(newTournament([5]));

    driveHeat(progress, 72_000);
    driveHeat(progress, 71_000);

    expect(progress.snapshot.status).toBe('FINISHED');
    expect(progress.snapshot.winnerUserId).toBe('tim');
    expect(progress.snapshot.finishedAt).toEqual(now);
    expect(() => progress.stageNextDriver(firstPick, null, now)).toThrow(
      TournamentStateError,
    );
  });

  it('aborts a heat without recording a result', () => {
    const progress = new TournamentProgress(newTournament());

    progress.stageNextDriver(firstPick, null, now);
    progress.startHeat('uid', now);
    progress.abortHeat();

    expect(progress.snapshot.status).toBe('READY');
    expect(progress.snapshot.activeHeat).toBeNull();
    expect(progress.snapshot.rounds[0].heats).toHaveLength(0);
  });

  it('remembers the circuit the game is on while waiting for the driver', () => {
    const progress = new TournamentProgress(newTournament());

    progress.stageNextDriver(firstPick, null, now);

    expect(progress.noteDetectedCircuit(10)).toBe(true);
    expect(progress.noteDetectedCircuit(10)).toBe(false);
    expect(progress.snapshot.activeHeat?.detectedCircuitId).toBe(10);
    expect(progress.activeHeatCircuitId()).toBe(11);
  });

  it('does not mutate the state it was created from', () => {
    const state = newTournament();
    const progress = new TournamentProgress(state);

    progress.stageNextDriver(firstPick, null, now);

    expect(state.status).toBe('READY');
  });
});
