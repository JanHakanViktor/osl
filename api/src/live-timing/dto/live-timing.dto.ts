import type {
  DriverStatus,
  PitStatus,
  ResultStatus,
  SafetyCarStatus,
  SessionKind,
  TrackWeather,
  TyreCompound,
} from '../domain/timing.types';

export type TimingCircuitDto = {
  id: number;
  name: string;
  grandPrix: string;
  image: string | null;
};

export type TimingSessionDto = {
  sessionUid: string;
  sessionKind: SessionKind;
  sessionName: string;
  circuit: TimingCircuitDto | null;
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

export type TimingLapRecordDto = {
  lapNumber: number;
  timeMs: number;
};

export type TimingDriverStatsDto = {
  lapsCompleted: number;
  validLaps: number;
  bestLap: TimingLapRecordDto | null;
  lastLapMs: number | null;
  averageLapMs: number | null;
  consistencyMs: number | null;
  bestSectors: Array<TimingLapRecordDto | null>;
  idealLapMs: number | null;
  topSpeedKmh: number | null;
  pitStops: number;
  warnings: number;
  cornerCuttingWarnings: number;
  penaltiesSeconds: number;
  /** Race only: grid position minus current position. */
  positionsGained: number | null;
};

export type TimingLapDto = {
  lapNumber: number;
  lapTimeMs: number;
  sectorsMs: Array<number | null>;
  valid: boolean;
  sectorsValid: boolean[];
};

export type TyreStintDto = {
  compound: TyreCompound | null;
  endLap: number | null;
};

export type TimingResultDto = {
  position: number;
  points: number;
  lapsCompleted: number;
  totalRaceTimeMs: number | null;
  penaltiesSeconds: number;
  resultStatus: ResultStatus;
};

export type TimingDriverDto = {
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
  stats: TimingDriverStatsDto;
  laps: TimingLapDto[];
  tyreStints: TyreStintDto[];
  result: TimingResultDto | null;
};

export type TimingCarRecordDto = {
  carIndex: number;
  driverName: string;
  lapNumber: number;
  timeMs: number;
};

export type TimingTopSpeedDto = {
  carIndex: number;
  driverName: string;
  speedKmh: number;
};

/** Standings and stats of a game session; sent when they change. */
export type TimingBoardDto = {
  session: TimingSessionDto;
  /** In running order, or classification order once the session ended. */
  drivers: TimingDriverDto[];
  fastestLap: TimingCarRecordDto | null;
  fastestSectors: Array<TimingCarRecordDto | null>;
  theoreticalBestLapMs: number | null;
  topSpeed: TimingTopSpeedDto | null;
};

export type TimingCarFrameDto = {
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

/** Where every car is right now; sent several times a second. */
export type TimingFrameDto = {
  sessionUid: string;
  timeLeftSeconds: number | null;
  cars: TimingCarFrameDto[];
};

export type LiveTimingCurrentDto = {
  board: TimingBoardDto | null;
  frame: TimingFrameDto | null;
};

export type TimingSessionSummaryDto = {
  sessionUid: string;
  sessionKind: SessionKind;
  sessionName: string;
  circuit: TimingCircuitDto | null;
  isOnline: boolean;
  isFinished: boolean;
  startedAt: string;
  updatedAt: string;
  driverCount: number;
  /** The car in P1 when the session was last saved. */
  leader: { carIndex: number; driverName: string } | null;
  fastestLap: TimingCarRecordDto | null;
};
