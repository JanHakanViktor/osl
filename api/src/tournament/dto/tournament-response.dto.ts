import type { RuleSetId } from '../domain/rule-sets';
import type {
  ActiveHeatStatus,
  HeatEndReason,
  TournamentStatus,
  TournamentWeather,
} from '../domain/tournament.types';

export type DriverDto = {
  id: string;
  driverName: string;
};

export type DriverOptionDto = DriverDto & {
  tournamentWins: number;
};

export type RuleSetDto = {
  id: RuleSetId;
  name: string;
  tagline: string;
  rules: string[];
};

export type CircuitDto = {
  id: number;
  name: string;
  grandPrix: string;
  image: string | null;
};

export type HeatLapDto = {
  lapNumber: number;
  lapTimeMs: number;
  sectorsMs: number[];
  valid: boolean;
};

export type RoundResultDto = {
  driver: DriverDto;
  /** Null when the driver set no valid lap. */
  position: number | null;
  bestLapMs: number | null;
  lapsCompleted: number;
  validLaps: number;
  topSpeedKmh: number;
  basePoints: number;
  cleanLapBonus: number;
  topSpeedBonus: number;
  points: number;
  endReason: HeatEndReason;
};

export type FastestSectorDto = {
  driver: DriverDto;
  sectorMs: number;
} | null;

export type RoundDto = {
  roundNumber: number;
  circuit: CircuitDto;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETE';
  /** Ordered classification; provisional while the round is in progress. */
  results: RoundResultDto[];
  fastestSectors: FastestSectorDto[];
};

export type ActiveHeatDto = {
  roundNumber: number;
  circuit: CircuitDto;
  driver: DriverDto;
  status: ActiveHeatStatus;
  lapsCompleted: number;
  lapsTarget: number;
  bestLapMs: number | null;
  laps: HeatLapDto[];
  /** Circuit the game is currently on while waiting, when it differs. */
  detectedCircuit: CircuitDto | null;
  stagedAt: Date;
  startedAt: Date | null;
};

export type StandingDto = {
  position: number;
  driver: DriverDto;
  points: number;
  roundWins: number;
};

export type AwardsDto = {
  mostRoundWins: { driver: DriverDto; count: number } | null;
  topSpeed: { driver: DriverDto; speedKmh: number; circuit: CircuitDto } | null;
  mostCleanLaps: { driver: DriverDto; count: number } | null;
};

export type TournamentDto = {
  id: string;
  name: string;
  status: TournamentStatus;
  isHost: boolean;
  settings: {
    weather: TournamentWeather;
    lapsPerDriver: number;
    cleanLapBonus: boolean;
    topSpeedBonus: boolean;
    ruleSet: RuleSetDto;
  };
  drivers: DriverDto[];
  rounds: RoundDto[];
  currentRoundNumber: number | null;
  activeHeat: ActiveHeatDto | null;
  standings: StandingDto[];
  awards: AwardsDto | null;
  createdAt: Date;
  finishedAt: Date | null;
};

export type TournamentSummaryDto = {
  id: string;
  name: string;
  status: TournamentStatus;
  isHost: boolean;
  drivers: DriverDto[];
  roundsCompleted: number;
  roundsTotal: number;
  winner: DriverDto | null;
  createdAt: Date;
  finishedAt: Date | null;
};
