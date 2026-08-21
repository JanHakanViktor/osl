export type RaceNetPerformanceMetadata = {
  playerName: string;
  assistsEverUsed: boolean;
  lapTime: string;
  sectorTimes: string[];
  [key: string]: unknown;
};

export type RaceNetWorldPosition = {
  x: number;
  y: number;
  z: number;
};

export type RaceNetQuaternion = RaceNetWorldPosition & {
  w: number;
};

export type RaceNetTelemetryData = {
  performanceAnalysisMetadata: RaceNetPerformanceMetadata;
  minDistance: number;
  maxDistance: number;
  minMillis: number;
  maxMillis: number;
  millis: number[];
  distance: number[];
  speed: number[];
  throttle: number[];
  brake: number[];
  steering: number[];
  gear: number[];
  rpm: number[];
  position: RaceNetWorldPosition[];
  rotation: RaceNetQuaternion[];
  [key: string]: unknown;
};

export type RaceNetReferencePayload = {
  schemaVersion: 1;
  source: 'racenet';
  game: 'F1 25';
  extractedAt: string;
  circuitId: number;
  circuitName: string;
  raceNetTrackId: string;
  leaderboard: {
    ssid: string;
    driverName: string;
    rank: number;
    timeMs: number;
    assists: number[];
    equalPerformance: boolean;
  };
  validation?: {
    criteriaVersion: 1;
    rejectedFasterCandidates: Array<Record<string, unknown>>;
  };
  raw: {
    data: RaceNetTelemetryData;
    renderSettings: unknown;
  };
};
