import type { TeamId } from '../../data/team';

/**
 * Live timing for one F1 25 game session, covering every car in it: the
 * player, other players in an online lobby, and AI drivers.
 */
export type SessionKind =
  | 'PRACTICE'
  | 'QUALIFYING'
  | 'RACE'
  | 'TIME_TRIAL'
  | 'UNKNOWN';

export type TrackWeather =
  | 'CLEAR'
  | 'LIGHT_CLOUD'
  | 'OVERCAST'
  | 'LIGHT_RAIN'
  | 'HEAVY_RAIN'
  | 'STORM';

export type SafetyCarStatus = 'NONE' | 'FULL' | 'VIRTUAL' | 'FORMATION_LAP';

export type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';

export type PitStatus = 'NONE' | 'PITTING' | 'IN_PIT_AREA';

export type DriverStatus =
  | 'IN_GARAGE'
  | 'FLYING_LAP'
  | 'IN_LAP'
  | 'OUT_LAP'
  | 'ON_TRACK';

export type ResultStatus =
  | 'INACTIVE'
  | 'ACTIVE'
  | 'FINISHED'
  | 'DID_NOT_FINISH'
  | 'DISQUALIFIED'
  | 'NOT_CLASSIFIED'
  | 'RETIRED';

/** What the game says about the session itself. */
export type TimingSessionInfo = {
  sessionKind: SessionKind;
  sessionName: string;
  f1TrackId: number | null;
  trackLengthM: number | null;
  totalLaps: number | null;
  weather: TrackWeather | null;
  trackTemperatureC: number;
  airTemperatureC: number;
  safetyCar: SafetyCarStatus;
  isOnline: boolean;
};

/** The session timer, which changes on every session packet. */
export type SessionClock = {
  sessionTimeSeconds: number;
  timeLeftSeconds: number | null;
};

export type TimingDriver = {
  name: string;
  raceNumber: number | null;
  /** The F1 team the driver races for, null for teams OSL has no logo for. */
  teamId: TeamId | null;
  teamName: string | null;
  isAi: boolean;
};

/** Where a car is and how its session is going, from the lap data packet. */
export type CarLiveState = {
  position: number;
  lapNumber: number;
  lapDistanceM: number;
  currentLapTimeMs: number;
  currentLapInvalid: boolean;
  sector: 1 | 2 | 3;
  pitStatus: PitStatus;
  driverStatus: DriverStatus;
  resultStatus: ResultStatus;
  /** Race only: time behind the leader. */
  gapToLeaderMs: number;
  /** Race only: time behind the car one place ahead. */
  intervalMs: number;
  gridPosition: number | null;
  pitStops: number;
  penaltiesSeconds: number;
  warnings: number;
  cornerCuttingWarnings: number;
  speedTrapKmh: number | null;
};

export type TimingLap = {
  lapNumber: number;
  lapTimeMs: number;
  /** Sector 1-3 times; null when the game has no time for a sector. */
  sectorsMs: Array<number | null>;
  valid: boolean;
  sectorsValid: boolean[];
};

export type TyreStint = {
  compound: TyreCompound | null;
  /** Lap the stint ended on; null while the car is still on it. */
  endLap: number | null;
};

/** The game's own record of one car's completed laps and tyre stints. */
export type CarLapHistory = {
  carIndex: number;
  laps: TimingLap[];
  tyreStints: TyreStint[];
};

/** A car's result from the final classification, authoritative at the end. */
export type FinalResult = {
  position: number;
  points: number;
  lapsCompleted: number;
  gridPosition: number | null;
  pitStops: number;
  resultStatus: ResultStatus;
  bestLapMs: number | null;
  totalRaceTimeMs: number | null;
  penaltiesSeconds: number;
};

export type TimingCar = {
  carIndex: number;
  driver: TimingDriver | null;
  live: CarLiveState | null;
  laps: TimingLap[];
  tyreStints: TyreStint[];
  result: FinalResult | null;
};

export type TimingBoardSnapshot = {
  sessionUid: string;
  startedAt: Date;
  updatedAt: Date;
  session: TimingSessionInfo | null;
  playerCarIndex: number | null;
  cars: TimingCar[];
};
