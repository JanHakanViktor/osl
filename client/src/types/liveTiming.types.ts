/** Live timing for every car in a game session, as the API sends it. */
export type SessionKind =
  | "PRACTICE"
  | "QUALIFYING"
  | "RACE"
  | "TIME_TRIAL"
  | "UNKNOWN";

export type TrackWeather =
  | "CLEAR"
  | "LIGHT_CLOUD"
  | "OVERCAST"
  | "LIGHT_RAIN"
  | "HEAVY_RAIN"
  | "STORM";

export type SafetyCarStatus = "NONE" | "FULL" | "VIRTUAL" | "FORMATION_LAP";

export type TyreCompound = "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET";

export type PitStatus = "NONE" | "PITTING" | "IN_PIT_AREA";

export type DriverStatus =
  | "IN_GARAGE"
  | "FLYING_LAP"
  | "IN_LAP"
  | "OUT_LAP"
  | "ON_TRACK";

export type ResultStatus =
  | "INACTIVE"
  | "ACTIVE"
  | "FINISHED"
  | "DID_NOT_FINISH"
  | "DISQUALIFIED"
  | "NOT_CLASSIFIED"
  | "RETIRED";

export type TimingCircuit = {
  id: number;
  name: string;
  grandPrix: string;
  image: string | null;
};

export type TimingSession = {
  sessionUid: string;
  sessionKind: SessionKind;
  sessionName: string;
  circuit: TimingCircuit | null;
  trackLengthM: number | null;
  totalLaps: number | null;
  weather: TrackWeather | null;
  trackTemperatureC: number | null;
  airTemperatureC: number | null;
  safetyCar: SafetyCarStatus;
  isOnline: boolean;
  /** True once the game sent the final classification. */
  isFinished: boolean;
  startedAt: string;
  updatedAt: string;
};

export type TimingLapRecord = {
  lapNumber: number;
  timeMs: number;
};

export type TimingDriverStats = {
  lapsCompleted: number;
  validLaps: number;
  bestLap: TimingLapRecord | null;
  lastLapMs: number | null;
  averageLapMs: number | null;
  consistencyMs: number | null;
  bestSectors: Array<TimingLapRecord | null>;
  idealLapMs: number | null;
  topSpeedKmh: number | null;
  pitStops: number;
  warnings: number;
  cornerCuttingWarnings: number;
  penaltiesSeconds: number;
  positionsGained: number | null;
};

export type TimingLap = {
  lapNumber: number;
  lapTimeMs: number;
  sectorsMs: Array<number | null>;
  valid: boolean;
  sectorsValid: boolean[];
};

export type TyreStint = {
  compound: TyreCompound | null;
  /** Null while the car is still on this stint. */
  endLap: number | null;
};

export type TimingResult = {
  position: number;
  points: number;
  lapsCompleted: number;
  totalRaceTimeMs: number | null;
  penaltiesSeconds: number;
  resultStatus: ResultStatus;
};

export type TimingDriver = {
  carIndex: number;
  name: string;
  raceNumber: number | null;
  teamId: string | null;
  teamName: string | null;
  isAi: boolean;
  isPlayer: boolean;
  position: number | null;
  gridPosition: number | null;
  status: ResultStatus | null;
  currentLapNumber: number | null;
  currentTyre: TyreCompound | null;
  stats: TimingDriverStats;
  laps: TimingLap[];
  tyreStints: TyreStint[];
  result: TimingResult | null;
};

export type TimingCarRecord = {
  carIndex: number;
  driverName: string;
  lapNumber: number;
  timeMs: number;
};

export type TimingBoard = {
  session: TimingSession;
  drivers: TimingDriver[];
  fastestLap: TimingCarRecord | null;
  fastestSectors: Array<TimingCarRecord | null>;
  theoreticalBestLapMs: number | null;
  topSpeed: { carIndex: number; driverName: string; speedKmh: number } | null;
};

export type TimingCarFrame = {
  carIndex: number;
  position: number;
  lapNumber: number;
  /** Share of the lap driven, 0-1; null when the car is not on track. */
  lapProgress: number | null;
  sector: 1 | 2 | 3;
  currentLapMs: number;
  currentLapInvalid: boolean;
  gapToLeaderMs: number | null;
  intervalMs: number | null;
  pitStatus: PitStatus;
  driverStatus: DriverStatus;
};

export type TimingFrame = {
  sessionUid: string;
  timeLeftSeconds: number | null;
  cars: TimingCarFrame[];
};

export type LiveTimingCurrent = {
  board: TimingBoard | null;
  frame: TimingFrame | null;
};

export type TimingSessionSummary = {
  sessionUid: string;
  sessionKind: SessionKind;
  sessionName: string;
  circuit: TimingCircuit | null;
  isOnline: boolean;
  isFinished: boolean;
  startedAt: string;
  updatedAt: string;
  driverCount: number;
  leader: { carIndex: number; driverName: string } | null;
  fastestLap: TimingCarRecord | null;
};
