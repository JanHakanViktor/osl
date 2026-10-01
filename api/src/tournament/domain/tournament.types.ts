import type { RuleSetId } from './rule-sets';

export const TOURNAMENT_WEATHER = [
  'DRY',
  'WET',
  'NIGHT',
  'CHANGEABLE',
] as const;
export type TournamentWeather = (typeof TOURNAMENT_WEATHER)[number];

export type TournamentStatus =
  | 'READY'
  | 'AWAITING_DRIVER'
  | 'HEAT_LIVE'
  | 'FINISHED';

export type ActiveHeatStatus = 'STAGED' | 'LIVE';

export type HeatEndReason = 'LAP_TARGET_REACHED' | 'ENDED_BY_HOST';

/** A driver as they were when the tournament was created. */
export type TournamentDriver = {
  userId: string;
  driverName: string;
  /** ISO 3166-1 alpha-2 code, or null when the driver had not chosen one. */
  country: string | null;
  /** Team id, or null when the driver had not chosen one. */
  teamId: string | null;
};

export type HeatLap = {
  gameSessionUid: string;
  lapNumber: number;
  lapTimeMs: number;
  /** [sector1, sector2, sector3] in ms, or empty when the split was not captured. */
  sectorsMs: number[];
  valid: boolean;
};

export type CompletedHeat = {
  driverUserId: string;
  startedAt: Date;
  finishedAt: Date;
  endReason: HeatEndReason;
  laps: HeatLap[];
  topSpeedKmh: number;
};

export type TournamentRound = {
  circuitId: number;
  heats: CompletedHeat[];
};

export type ActiveHeat = {
  roundIndex: number;
  driverUserId: string;
  status: ActiveHeatStatus;
  stagedAt: Date;
  /** Game session that was already running when the driver was picked. */
  stagedGameSessionUid: string | null;
  startedAt: Date | null;
  /** Game session the heat's laps are counted from. */
  gameSessionUid: string | null;
  laps: HeatLap[];
  topSpeedKmh: number;
  /** Last circuit seen in the game while waiting, used for wrong-track hints. */
  detectedCircuitId: number | null;
};

export type TournamentSettings = {
  weather: TournamentWeather;
  lapsPerDriver: number;
  cleanLapBonus: boolean;
  topSpeedBonus: boolean;
  ruleSetId: RuleSetId;
};

export type TournamentState = {
  id: string;
  hostUserId: string;
  name: string;
  settings: TournamentSettings;
  drivers: TournamentDriver[];
  rounds: TournamentRound[];
  activeHeat: ActiveHeat | null;
  status: TournamentStatus;
  winnerUserId: string | null;
  createdAt: Date;
  finishedAt: Date | null;
};
