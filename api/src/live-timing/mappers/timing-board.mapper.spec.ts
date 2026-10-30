import { describe, expect, it } from '@jest/globals';
import type {
  CarLiveState,
  FinalResult,
  TimingBoardSnapshot,
  TimingCar,
  TimingLap,
  TimingSessionInfo,
} from '../domain/timing.types';
import {
  toTimingBoardDto,
  toTimingFrameDto,
  toTimingSessionSummaryDto,
} from './timing-board.mapper';

const STARTED_AT = new Date('2026-10-30T18:00:00Z');

function live(overrides: Partial<CarLiveState> = {}): CarLiveState {
  return {
    position: 1,
    lapNumber: 3,
    lapDistanceM: 0,
    currentLapTimeMs: 10_000,
    currentLapInvalid: false,
    sector: 1,
    pitStatus: 'NONE',
    driverStatus: 'FLYING_LAP',
    resultStatus: 'ACTIVE',
    gapToLeaderMs: 0,
    intervalMs: 0,
    gridPosition: null,
    pitStops: 0,
    penaltiesSeconds: 0,
    warnings: 0,
    cornerCuttingWarnings: 0,
    speedTrapKmh: null,
    ...overrides,
  };
}

function lap(lapNumber: number, lapTimeMs: number): TimingLap {
  const sectorMs = lapTimeMs / 3;
  return {
    lapNumber,
    lapTimeMs,
    sectorsMs: [sectorMs, sectorMs, sectorMs],
    valid: true,
    sectorsValid: [true, true, true],
  };
}

function car(carIndex: number, overrides: Partial<TimingCar> = {}): TimingCar {
  return {
    carIndex,
    driver: {
      name: `Driver ${carIndex}`,
      raceNumber: carIndex + 1,
      teamId: 'mclaren',
      teamName: 'McLaren',
      isAi: false,
    },
    live: live(),
    laps: [],
    tyreStints: [],
    result: null,
    ...overrides,
  };
}

function session(
  overrides: Partial<TimingSessionInfo> = {},
): TimingSessionInfo {
  return {
    sessionKind: 'RACE',
    sessionName: 'Race',
    f1TrackId: 7,
    trackLengthM: 5_000,
    totalLaps: 10,
    weather: 'CLEAR',
    trackTemperatureC: 30,
    airTemperatureC: 22,
    safetyCar: 'NONE',
    isOnline: true,
    ...overrides,
  };
}

function snapshot(
  cars: TimingCar[],
  overrides: Partial<TimingBoardSnapshot> = {},
): TimingBoardSnapshot {
  return {
    sessionUid: '123',
    startedAt: STARTED_AT,
    updatedAt: STARTED_AT,
    session: session(),
    playerCarIndex: 1,
    cars,
    ...overrides,
  };
}

const finished: FinalResult = {
  position: 1,
  points: 25,
  lapsCompleted: 10,
  gridPosition: 4,
  pitStops: 1,
  resultStatus: 'FINISHED',
  bestLapMs: 90_000,
  totalRaceTimeMs: 905_000,
  penaltiesSeconds: 0,
};

describe('toTimingBoardDto', () => {
  it('describes the session and its circuit', () => {
    const board = toTimingBoardDto(snapshot([]));

    expect(board.session).toMatchObject({
      sessionUid: '123',
      sessionKind: 'RACE',
      circuit: {
        id: 9,
        name: 'Silverstone Circuit',
        grandPrix: 'Great Britain',
      },
      isFinished: false,
      startedAt: '2026-10-30T18:00:00.000Z',
    });
  });

  it('orders drivers by running position and marks the player', () => {
    const board = toTimingBoardDto(
      snapshot([
        car(0, { live: live({ position: 2 }) }),
        car(1, { live: live({ position: 1 }) }),
        car(2, { live: null, driver: null }),
      ]),
    );

    expect(board.drivers.map((driver) => driver.name)).toEqual([
      'Driver 1',
      'Driver 0',
      'Car 3',
    ]);
    expect(board.drivers[0].isPlayer).toBe(true);
    expect(board.drivers[2].position).toBeNull();
  });

  it('lets the final classification decide positions', () => {
    const board = toTimingBoardDto(
      snapshot([
        car(0, {
          live: live({ position: 1 }),
          result: { ...finished, position: 2 },
        }),
        car(1, { live: live({ position: 2 }), result: finished }),
      ]),
    );

    expect(board.session.isFinished).toBe(true);
    expect(board.drivers.map((driver) => driver.carIndex)).toEqual([1, 0]);
    expect(board.drivers[0].stats.positionsGained).toBe(3);
  });

  it('only counts positions gained in a race', () => {
    const board = toTimingBoardDto(
      snapshot([car(0, { live: live({ position: 1, gridPosition: 3 }) })], {
        session: session({ sessionKind: 'QUALIFYING' }),
      }),
    );

    expect(board.drivers[0].stats.positionsGained).toBeNull();
  });

  it('names who holds the fastest lap, sectors and top speed', () => {
    const board = toTimingBoardDto(
      snapshot([
        car(0, {
          laps: [lap(1, 91_500)],
          live: live({ speedTrapKmh: 321.26 }),
        }),
        car(1, { laps: [lap(1, 90_000)], live: live({ speedTrapKmh: 318 }) }),
      ]),
    );

    expect(board.fastestLap).toEqual({
      carIndex: 1,
      driverName: 'Driver 1',
      lapNumber: 1,
      timeMs: 90_000,
    });
    expect(board.fastestSectors.map((sector) => sector?.carIndex)).toEqual([
      1, 1, 1,
    ]);
    expect(board.theoreticalBestLapMs).toBe(90_000);
    expect(board.topSpeed).toEqual({
      carIndex: 0,
      driverName: 'Driver 0',
      speedKmh: 321.3,
    });
  });

  it('shows the tyre of the stint a driver is on', () => {
    const board = toTimingBoardDto(
      snapshot([
        car(0, {
          tyreStints: [
            { compound: 'MEDIUM', endLap: 12 },
            { compound: 'HARD', endLap: null },
          ],
        }),
      ]),
    );

    expect(board.drivers[0].currentTyre).toBe('HARD');
  });
});

describe('toTimingFrameDto', () => {
  it('places cars on the lap, wrapping a negative distance before the line', () => {
    const frame = toTimingFrameDto(
      snapshot([
        car(0, { live: live({ lapDistanceM: 1_250 }) }),
        car(1, { live: live({ position: 2, lapDistanceM: -500 }) }),
        car(2, {
          live: live({ position: 3, driverStatus: 'IN_GARAGE' }),
        }),
        car(3, {
          live: live({ position: 4, resultStatus: 'RETIRED' }),
        }),
      ]),
      { sessionTimeSeconds: 100, timeLeftSeconds: 1_200 },
    );

    expect(frame.timeLeftSeconds).toBe(1_200);
    expect(frame.cars.map((frameCar) => frameCar.lapProgress)).toEqual([
      0.25,
      0.9,
      null,
      null,
    ]);
  });

  it('uses the game’s race gaps, with none for the leader', () => {
    const frame = toTimingFrameDto(
      snapshot([
        car(0, {
          live: live({ position: 2, gapToLeaderMs: 1_200, intervalMs: 1_200 }),
        }),
        car(1, {
          live: live({ position: 1, gapToLeaderMs: 0, intervalMs: 0 }),
        }),
      ]),
      null,
    );

    expect(frame.cars).toEqual([
      expect.objectContaining({
        carIndex: 1,
        gapToLeaderMs: null,
        intervalMs: null,
      }),
      expect.objectContaining({
        carIndex: 0,
        gapToLeaderMs: 1_200,
        intervalMs: 1_200,
      }),
    ]);
  });

  it('measures qualifying gaps by best lap', () => {
    const frame = toTimingFrameDto(
      snapshot(
        [
          car(0, { live: live({ position: 1 }), laps: [lap(1, 90_000)] }),
          car(1, { live: live({ position: 2 }), laps: [lap(1, 90_300)] }),
          car(2, { live: live({ position: 3 }) }),
        ],
        { session: session({ sessionKind: 'QUALIFYING' }) },
      ),
      null,
    );

    expect(
      frame.cars.map(({ gapToLeaderMs, intervalMs }) => [
        gapToLeaderMs,
        intervalMs,
      ]),
    ).toEqual([
      [0, null],
      [300, 300],
      [null, null],
    ]);
  });

  it('has no lap progress without a track length', () => {
    const frame = toTimingFrameDto(snapshot([car(0)], { session: null }), null);

    expect(frame.cars[0].lapProgress).toBeNull();
  });
});

describe('toTimingSessionSummaryDto', () => {
  it('summarises who led and who was fastest', () => {
    const summary = toTimingSessionSummaryDto(
      snapshot([
        car(0, { live: live({ position: 2 }), laps: [lap(1, 89_000)] }),
        car(1, { live: live({ position: 1 }), laps: [lap(1, 90_000)] }),
      ]),
    );

    expect(summary).toMatchObject({
      sessionUid: '123',
      sessionName: 'Race',
      driverCount: 2,
      leader: { carIndex: 1, driverName: 'Driver 1' },
      fastestLap: { carIndex: 0, timeMs: 89_000 },
    });
  });
});
