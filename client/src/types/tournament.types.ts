export type TournamentWeather = "DRY" | "WET" | "NIGHT" | "CHANGEABLE";

export type RuleSetId = "LADDER" | "GRAND_PRIX" | "WINNER_TAKES_ALL";

export type TournamentStatus =
  | "READY"
  | "AWAITING_DRIVER"
  | "HEAT_LIVE"
  | "FINISHED";

export type TournamentDriver = {
  id: string;
  driverName: string;
  /** ISO 3166-1 alpha-2 code, or null when the driver has not chosen one. */
  country: string | null;
  /** Team id from TEAMS, or null when the driver has not chosen one. */
  teamId: string | null;
};

export type DriverOption = TournamentDriver & {
  tournamentWins: number;
};

export type RuleSet = {
  id: RuleSetId;
  name: string;
  tagline: string;
  rules: string[];
};

export type TournamentCircuit = {
  id: number;
  name: string;
  grandPrix: string;
  image: string | null;
};

export type HeatLap = {
  lapNumber: number;
  lapTimeMs: number;
  sectorsMs: number[];
  valid: boolean;
};

export type RoundResult = {
  driver: TournamentDriver;
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
  endReason: "LAP_TARGET_REACHED" | "ENDED_BY_HOST";
};

export type FastestSector = {
  driver: TournamentDriver;
  sectorMs: number;
} | null;

export type TournamentRound = {
  roundNumber: number;
  circuit: TournamentCircuit;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETE";
  results: RoundResult[];
  fastestSectors: FastestSector[];
};

export type ActiveHeat = {
  roundNumber: number;
  circuit: TournamentCircuit;
  driver: TournamentDriver;
  status: "STAGED" | "LIVE";
  lapsCompleted: number;
  lapsTarget: number;
  bestLapMs: number | null;
  laps: HeatLap[];
  detectedCircuit: TournamentCircuit | null;
  stagedAt: string;
  startedAt: string | null;
};

export type Standing = {
  position: number;
  driver: TournamentDriver;
  points: number;
  roundWins: number;
};

export type TournamentAwards = {
  mostRoundWins: { driver: TournamentDriver; count: number } | null;
  topSpeed: {
    driver: TournamentDriver;
    speedKmh: number;
    circuit: TournamentCircuit;
  } | null;
  mostCleanLaps: { driver: TournamentDriver; count: number } | null;
};

export type Tournament = {
  id: string;
  name: string;
  status: TournamentStatus;
  isHost: boolean;
  settings: {
    weather: TournamentWeather;
    lapsPerDriver: number;
    cleanLapBonus: boolean;
    topSpeedBonus: boolean;
    ruleSet: RuleSet;
  };
  drivers: TournamentDriver[];
  rounds: TournamentRound[];
  currentRoundNumber: number | null;
  activeHeat: ActiveHeat | null;
  standings: Standing[];
  awards: TournamentAwards | null;
  createdAt: string;
  finishedAt: string | null;
};

export type TournamentSummary = {
  id: string;
  name: string;
  status: TournamentStatus;
  isHost: boolean;
  drivers: TournamentDriver[];
  roundsCompleted: number;
  roundsTotal: number;
  winner: TournamentDriver | null;
  createdAt: string;
  finishedAt: string | null;
};

export type CreateTournamentPayload = {
  name: string;
  weather: TournamentWeather;
  lapsPerDriver: number;
  cleanLapBonus: boolean;
  topSpeedBonus: boolean;
  ruleSetId: RuleSetId;
  driverIds: string[];
  circuitIds: number[];
};
