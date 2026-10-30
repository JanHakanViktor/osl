import type {
  CarLapHistory,
  CarLiveState,
  FinalResult,
  SessionClock,
  TimingBoardSnapshot,
  TimingCar,
  TimingDriver,
  TimingSessionInfo,
} from './timing.types';

/** Live fields the standings and stats show, not only the track map. */
const STANDINGS_FIELDS = [
  'position',
  'lapNumber',
  'pitStatus',
  'resultStatus',
  'gridPosition',
  'pitStops',
  'penaltiesSeconds',
  'warnings',
  'cornerCuttingWarnings',
  'speedTrapKmh',
] as const satisfies readonly (keyof CarLiveState)[];

function sameData(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function standingsChanged(
  previous: CarLiveState | null,
  next: CarLiveState,
): boolean {
  return (
    !previous ||
    STANDINGS_FIELDS.some((field) => previous[field] !== next[field])
  );
}

function hasTakenPart(car: TimingCar): boolean {
  return (
    car.driver !== null ||
    car.laps.length > 0 ||
    car.result !== null ||
    (car.live !== null && car.live.resultStatus !== 'INACTIVE')
  );
}

/**
 * Everything live timing knows about one game session: who is in it, where
 * each car is, the laps each car completed, and the final classification.
 *
 * Session history is the game's own record of a car's laps, so each history
 * packet replaces that car's laps, which also drops laps a flashback undid.
 *
 * The apply methods return true when the change shows in the standings or
 * stats, rather than only moving cars around the track.
 */
export class TimingBoard {
  readonly sessionUid: string;
  private startedAt: Date;
  private updatedAt: Date;
  private session: TimingSessionInfo | null = null;
  private clock: SessionClock | null = null;
  private playerCarIndex: number | null = null;
  private readonly cars = new Map<number, TimingCar>();

  constructor(sessionUid: string, now: Date) {
    this.sessionUid = sessionUid;
    this.startedAt = now;
    this.updatedAt = now;
  }

  get sessionClock(): SessionClock | null {
    return this.clock;
  }

  get hasCompletedLaps(): boolean {
    return [...this.cars.values()].some((car) => car.laps.length > 0);
  }

  applySession(
    info: TimingSessionInfo,
    clock: SessionClock,
    now: Date,
  ): boolean {
    this.clock = clock;
    if (sameData(this.session, info)) return false;

    this.session = info;
    return this.touch(now);
  }

  applyDrivers(
    drivers: Array<TimingDriver | null>,
    playerCarIndex: number | null,
    now: Date,
  ): boolean {
    let changed = this.setPlayerCarIndex(playerCarIndex);

    drivers.forEach((driver, carIndex) => {
      // A driver who left keeps the name their laps were set under.
      if (!driver) return;

      const car = this.car(carIndex);
      const next = { ...driver, name: driver.name || car.driver?.name || '' };
      if (sameData(car.driver, next)) return;

      car.driver = next;
      changed = true;
    });

    return changed && this.touch(now);
  }

  applyLiveStates(
    states: Array<CarLiveState | null>,
    playerCarIndex: number | null,
    now: Date,
  ): boolean {
    let changed = this.setPlayerCarIndex(playerCarIndex);

    states.forEach((live, carIndex) => {
      if (!live) return;

      const car = this.car(carIndex);
      changed = standingsChanged(car.live, live) || changed;
      car.live = live;
    });

    return changed && this.touch(now);
  }

  applyLapHistory(history: CarLapHistory, now: Date): boolean {
    const known = this.cars.get(history.carIndex);
    if (!known && history.laps.length === 0) return false;

    const car = known ?? this.car(history.carIndex);
    if (
      sameData(car.laps, history.laps) &&
      sameData(car.tyreStints, history.tyreStints)
    ) {
      return false;
    }

    car.laps = history.laps;
    car.tyreStints = history.tyreStints;
    return this.touch(now);
  }

  applyFinalResults(results: Array<FinalResult | null>, now: Date): boolean {
    let changed = false;

    results.forEach((result, carIndex) => {
      if (!result) return;

      const car = this.car(carIndex);
      if (sameData(car.result, result)) return;

      car.result = result;
      changed = true;
    });

    return changed && this.touch(now);
  }

  /**
   * Fills in what a saved copy of this session knows and the board has not
   * received yet, such as laps set before the API restarted.
   */
  restore(saved: TimingBoardSnapshot): void {
    this.session ??= saved.session;
    this.playerCarIndex ??= saved.playerCarIndex;
    if (saved.startedAt < this.startedAt) this.startedAt = saved.startedAt;

    for (const savedCar of saved.cars) {
      const car = this.car(savedCar.carIndex);

      car.driver ??= savedCar.driver;
      car.live ??= savedCar.live;
      car.result ??= savedCar.result;
      if (car.laps.length < savedCar.laps.length) car.laps = savedCar.laps;
      if (car.tyreStints.length < savedCar.tyreStints.length) {
        car.tyreStints = savedCar.tyreStints;
      }
    }
  }

  snapshot(): TimingBoardSnapshot {
    return {
      sessionUid: this.sessionUid,
      startedAt: this.startedAt,
      updatedAt: this.updatedAt,
      session: this.session,
      playerCarIndex: this.playerCarIndex,
      cars: [...this.cars.values()]
        .filter(hasTakenPart)
        .sort((a, b) => a.carIndex - b.carIndex)
        .map((car) => ({ ...car })),
    };
  }

  private car(carIndex: number): TimingCar {
    let car = this.cars.get(carIndex);

    if (!car) {
      car = {
        carIndex,
        driver: null,
        live: null,
        laps: [],
        tyreStints: [],
        result: null,
      };
      this.cars.set(carIndex, car);
    }

    return car;
  }

  private setPlayerCarIndex(playerCarIndex: number | null): boolean {
    if (playerCarIndex === null || playerCarIndex === this.playerCarIndex) {
      return false;
    }

    this.playerCarIndex = playerCarIndex;
    return true;
  }

  private touch(now: Date): true {
    this.updatedAt = now;
    return true;
  }
}
