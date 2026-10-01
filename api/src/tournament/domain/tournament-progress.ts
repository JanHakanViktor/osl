import { shuffle, type RandomSource } from './random-source';
import { buildStandings } from './tournament-scoring';
import type {
  ActiveHeat,
  HeatEndReason,
  HeatLap,
  TournamentDriver,
  TournamentSettings,
  TournamentState,
  TournamentStatus,
} from './tournament.types';

export class TournamentStateError extends Error {}

export type NewTournament = {
  id: string;
  hostUserId: string;
  name: string;
  settings: TournamentSettings;
  drivers: TournamentDriver[];
  circuitIds: number[];
};

export type HeatProgress = {
  gameSessionUid: string | null;
  laps: HeatLap[];
  topSpeedKmh: number;
};

/** Index of the first track not every driver has driven yet, or null when done. */
export function findCurrentRoundIndex(
  state: Pick<TournamentState, 'rounds' | 'drivers'>,
): number | null {
  const index = state.rounds.findIndex(
    (round) => round.heats.length < state.drivers.length,
  );

  return index === -1 ? null : index;
}

export function createTournamentState(
  input: NewTournament,
  random: RandomSource,
  now: Date,
): TournamentState {
  return {
    id: input.id,
    hostUserId: input.hostUserId,
    name: input.name,
    settings: input.settings,
    drivers: input.drivers,
    rounds: shuffle(input.circuitIds, random).map((circuitId) => ({
      circuitId,
      heats: [],
    })),
    activeHeat: null,
    status: 'READY',
    winnerUserId: null,
    createdAt: now,
    finishedAt: null,
  };
}

/**
 * The tournament's rules of play: which driver may go next, when a heat may
 * start, and what happens when a heat ends. Works on its own copy of the state.
 */
export class TournamentProgress {
  private readonly state: TournamentState;

  constructor(state: TournamentState) {
    this.state = structuredClone(state);
  }

  get snapshot(): TournamentState {
    return this.state;
  }

  currentRoundIndex(): number | null {
    return findCurrentRoundIndex(this.state);
  }

  waitingDrivers(): TournamentDriver[] {
    const roundIndex = this.currentRoundIndex();
    if (roundIndex == null) return [];

    const finished = new Set(
      this.state.rounds[roundIndex].heats.map((heat) => heat.driverUserId),
    );

    return this.state.drivers.filter((driver) => !finished.has(driver.userId));
  }

  activeHeatCircuitId(): number | null {
    const heat = this.state.activeHeat;
    return heat ? this.state.rounds[heat.roundIndex].circuitId : null;
  }

  stageNextDriver(
    random: RandomSource,
    runningGameSessionUid: string | null,
    now: Date,
  ): TournamentDriver {
    this.assertStatus(['READY', 'AWAITING_DRIVER'], 'roll for the next driver');

    const roundIndex = this.currentRoundIndex()!;
    const stagedDriverId = this.state.activeHeat?.driverUserId;
    const waiting = this.waitingDrivers();
    const candidates =
      waiting.length > 1
        ? waiting.filter((driver) => driver.userId !== stagedDriverId)
        : waiting;
    const driver = candidates[random.nextInt(candidates.length)];

    this.state.activeHeat = {
      roundIndex,
      driverUserId: driver.userId,
      status: 'STAGED',
      stagedAt: now,
      stagedGameSessionUid: runningGameSessionUid,
      startedAt: null,
      gameSessionUid: null,
      laps: [],
      topSpeedKmh: 0,
      detectedCircuitId: null,
    };
    this.state.status = 'AWAITING_DRIVER';

    return driver;
  }

  noteDetectedCircuit(circuitId: number | null): boolean {
    const heat = this.requireActiveHeat('STAGED');
    if (heat.detectedCircuitId === circuitId) return false;

    heat.detectedCircuitId = circuitId;
    return true;
  }

  startHeat(gameSessionUid: string | null, now: Date): void {
    this.assertStatus(['AWAITING_DRIVER'], 'start a heat');

    const heat = this.requireActiveHeat('STAGED');
    heat.status = 'LIVE';
    heat.startedAt = now;
    heat.gameSessionUid = gameSessionUid;
    this.state.status = 'HEAT_LIVE';
  }

  recordHeatProgress(progress: HeatProgress): void {
    const heat = this.requireActiveHeat('LIVE');

    heat.gameSessionUid = progress.gameSessionUid;
    heat.laps = progress.laps;
    heat.topSpeedKmh = progress.topSpeedKmh;
  }

  completeHeat(endReason: HeatEndReason, now: Date): void {
    const heat = this.requireActiveHeat('LIVE');

    this.state.rounds[heat.roundIndex].heats.push({
      driverUserId: heat.driverUserId,
      startedAt: heat.startedAt ?? now,
      finishedAt: now,
      endReason,
      laps: heat.laps,
      topSpeedKmh: heat.topSpeedKmh,
    });
    this.state.activeHeat = null;

    if (this.currentRoundIndex() == null) {
      this.finish(now);
    } else {
      this.state.status = 'READY';
    }
  }

  abortHeat(): void {
    this.assertStatus(['AWAITING_DRIVER', 'HEAT_LIVE'], 'abort a heat');

    this.state.activeHeat = null;
    this.state.status = 'READY';
  }

  private finish(now: Date): void {
    this.state.status = 'FINISHED';
    this.state.finishedAt = now;
    this.state.winnerUserId =
      buildStandings(this.state)[0]?.driverUserId ?? null;
  }

  private requireActiveHeat(status: ActiveHeat['status']): ActiveHeat {
    const heat = this.state.activeHeat;

    if (!heat || heat.status !== status) {
      throw new TournamentStateError(
        status === 'LIVE' ? 'No heat is live' : 'No driver is waiting to start',
      );
    }

    return heat;
  }

  private assertStatus(allowed: TournamentStatus[], action: string): void {
    if (!allowed.includes(this.state.status)) {
      throw new TournamentStateError(
        `Cannot ${action} while the tournament is ${this.state.status}`,
      );
    }
  }
}
