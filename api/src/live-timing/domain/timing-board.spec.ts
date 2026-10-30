import { describe, expect, it } from '@jest/globals';
import { TimingBoard } from './timing-board';
import type {
  CarLiveState,
  TimingDriver,
  TimingLap,
  TimingSessionInfo,
} from './timing.types';

const NOW = new Date('2026-10-30T18:00:00Z');
const LATER = new Date('2026-10-30T18:05:00Z');

function driver(name: string): TimingDriver {
  return {
    name,
    raceNumber: 7,
    teamId: 'ferrari',
    teamName: 'Ferrari',
    isAi: false,
  };
}

function live(overrides: Partial<CarLiveState> = {}): CarLiveState {
  return {
    position: 1,
    lapNumber: 2,
    lapDistanceM: 100,
    currentLapTimeMs: 5_000,
    currentLapInvalid: false,
    sector: 1,
    pitStatus: 'NONE',
    driverStatus: 'FLYING_LAP',
    resultStatus: 'ACTIVE',
    gapToLeaderMs: 0,
    intervalMs: 0,
    gridPosition: 1,
    pitStops: 0,
    penaltiesSeconds: 0,
    warnings: 0,
    cornerCuttingWarnings: 0,
    speedTrapKmh: null,
    ...overrides,
  };
}

function lap(lapNumber: number, lapTimeMs: number): TimingLap {
  return {
    lapNumber,
    lapTimeMs,
    sectorsMs: [30_000, 30_000, lapTimeMs - 60_000],
    valid: true,
    sectorsValid: [true, true, true],
  };
}

const sessionInfo: TimingSessionInfo = {
  sessionKind: 'RACE',
  sessionName: 'Race',
  f1TrackId: 7,
  trackLengthM: 5891,
  totalLaps: 10,
  weather: 'CLEAR',
  trackTemperatureC: 30,
  airTemperatureC: 22,
  safetyCar: 'NONE',
  isOnline: true,
};

describe('TimingBoard', () => {
  it('lists every car that takes part, in car order', () => {
    const board = new TimingBoard('uid-1', NOW);

    board.applyDrivers([driver('B'), null, driver('A')], 2, NOW);
    board.applyLiveStates([live(), live({ resultStatus: 'INACTIVE' })], 2, NOW);

    const snapshot = board.snapshot();
    expect(snapshot.cars.map((car) => car.carIndex)).toEqual([0, 2]);
    expect(snapshot.playerCarIndex).toBe(2);
  });

  it('keeps the name of a driver whose name the game stops sending', () => {
    const board = new TimingBoard('uid-1', NOW);

    board.applyDrivers([driver('LeagueMate')], null, NOW);
    board.applyDrivers([{ ...driver(''), raceNumber: 9 }], null, NOW);

    expect(board.snapshot().cars[0].driver).toMatchObject({
      name: 'LeagueMate',
      raceNumber: 9,
    });
  });

  it('reports standings changes, but not cars only moving on track', () => {
    const board = new TimingBoard('uid-1', NOW);

    expect(board.applyLiveStates([live()], null, NOW)).toBe(true);
    expect(
      board.applyLiveStates(
        [live({ lapDistanceM: 900, currentLapTimeMs: 15_000 })],
        null,
        NOW,
      ),
    ).toBe(false);
    expect(board.applyLiveStates([live({ position: 2 })], null, LATER)).toBe(
      true,
    );
    expect(board.snapshot().updatedAt).toEqual(LATER);
  });

  it('replaces a car’s laps with each history, undoing flashbacks', () => {
    const board = new TimingBoard('uid-1', NOW);

    board.applyLapHistory(
      { carIndex: 0, laps: [lap(1, 92_000), lap(2, 91_000)], tyreStints: [] },
      NOW,
    );
    const changed = board.applyLapHistory(
      { carIndex: 0, laps: [lap(1, 92_000)], tyreStints: [] },
      NOW,
    );

    expect(changed).toBe(true);
    expect(board.snapshot().cars[0].laps).toEqual([lap(1, 92_000)]);
  });

  it('ignores a history that brings nothing new', () => {
    const board = new TimingBoard('uid-1', NOW);
    const history = { carIndex: 0, laps: [lap(1, 92_000)], tyreStints: [] };

    board.applyLapHistory(history, NOW);

    expect(board.applyLapHistory(history, LATER)).toBe(false);
    expect(
      board.applyLapHistory({ carIndex: 5, laps: [], tyreStints: [] }, NOW),
    ).toBe(false);
    expect(board.snapshot().cars).toHaveLength(1);
  });

  it('knows when any car completed a lap', () => {
    const board = new TimingBoard('uid-1', NOW);
    board.applyLiveStates([live()], null, NOW);
    expect(board.hasCompletedLaps).toBe(false);

    board.applyLapHistory(
      { carIndex: 0, laps: [lap(1, 92_000)], tyreStints: [] },
      NOW,
    );
    expect(board.hasCompletedLaps).toBe(true);
  });

  it('keeps the session clock out of the standings', () => {
    const board = new TimingBoard('uid-1', NOW);

    expect(
      board.applySession(
        sessionInfo,
        { sessionTimeSeconds: 10, timeLeftSeconds: 600 },
        NOW,
      ),
    ).toBe(true);
    expect(
      board.applySession(
        sessionInfo,
        { sessionTimeSeconds: 11, timeLeftSeconds: 599 },
        NOW,
      ),
    ).toBe(false);
    expect(board.sessionClock?.timeLeftSeconds).toBe(599);
  });

  it('records final results per car', () => {
    const board = new TimingBoard('uid-1', NOW);
    const result = {
      position: 1,
      points: 25,
      lapsCompleted: 10,
      gridPosition: 2,
      pitStops: 1,
      resultStatus: 'FINISHED' as const,
      bestLapMs: 90_000,
      totalRaceTimeMs: 905_000,
      penaltiesSeconds: 0,
    };

    expect(board.applyFinalResults([null, result], NOW)).toBe(true);
    expect(board.applyFinalResults([null, result], NOW)).toBe(false);
    expect(board.snapshot().cars).toEqual([
      expect.objectContaining({ carIndex: 1, result }),
    ]);
  });

  describe('restore', () => {
    it('fills in laps and drivers the board has not received yet', () => {
      const saved = new TimingBoard('uid-1', NOW);
      saved.applySession(
        sessionInfo,
        { sessionTimeSeconds: 0, timeLeftSeconds: null },
        NOW,
      );
      saved.applyDrivers([driver('Saved'), driver('Other')], 0, NOW);
      saved.applyLapHistory(
        { carIndex: 0, laps: [lap(1, 92_000), lap(2, 91_000)], tyreStints: [] },
        NOW,
      );
      saved.applyLapHistory(
        { carIndex: 1, laps: [lap(1, 93_000)], tyreStints: [] },
        NOW,
      );

      const board = new TimingBoard('uid-1', LATER);
      board.applyLapHistory(
        {
          carIndex: 1,
          laps: [lap(1, 93_000), lap(2, 92_500)],
          tyreStints: [],
        },
        LATER,
      );
      board.restore(saved.snapshot());

      const snapshot = board.snapshot();
      expect(snapshot.startedAt).toEqual(NOW);
      expect(snapshot.session).toEqual(sessionInfo);
      expect(snapshot.playerCarIndex).toBe(0);
      expect(snapshot.cars.map((car) => car.driver?.name)).toEqual([
        'Saved',
        'Other',
      ]);
      expect(snapshot.cars.map((car) => car.laps.length)).toEqual([2, 2]);
    });
  });
});
