export type SimCoachLapSummary = {
  id: string;
  lapNumber: number;
  lapTimeMs: number;
  valid: boolean;
  capturedAt: string;
  referenceLapId: string | null;
};

export type SimCoachAlignedPoint = {
  distanceM: number;
  targetElapsedMs: number;
  referenceElapsedMs: number;
  deltaMs: number;
  targetSpeedKmh: number;
  referenceSpeedKmh: number;
  targetThrottle: number;
  referenceThrottle: number;
  targetBrake: number;
  referenceBrake: number;
  targetSteer: number;
  referenceSteer: number;
};

export type SimCoachWorldPosition = {
  x: number;
  y: number;
  z: number;
};

export type SimCoachRacingLineSample = {
  distanceM: number;
  elapsedMs: number;
  speedKmh: number;
  throttle: number;
  brake: number;
  steer: number;
  gear: number;
  engineRpm: number;
  position?: SimCoachWorldPosition;
  yawRad?: number;
};

export type SimCoachEvidence = {
  metric:
    | "brake-point"
    | "maximum-brake"
    | "brake-release"
    | "coasting"
    | "minimum-speed"
    | "throttle-application"
    | "full-throttle"
    | "steering-correction"
    | "time-loss";
  targetValue: number;
  referenceValue: number;
  unit: "m" | "km/h" | "ms" | "percent" | "score" | "count";
  explanation: string;
};

export type SimCoachCornerMetrics = {
  brakeStartDistanceM: number | null;
  maximumBrakePercent: number;
  brakeReleaseSmoothness: number;
  brakeReleaseDurationMs: number | null;
  brakeReleaseEndDistanceM: number | null;
  coastingTimeMs: number;
  minimumSpeedKmh: number;
  throttleStartDistanceM: number | null;
  timeToFullThrottleMs: number | null;
  fullThrottleDistanceM: number | null;
  steeringCorrections: number;
};

export type SimCoachCornerAnalysis = {
  turnNumber: number;
  startDistanceM: number;
  apexDistanceM: number;
  endDistanceM: number;
  timeDeltaMs: number;
  target: SimCoachCornerMetrics;
  reference: SimCoachCornerMetrics;
};

export type SimCoachRecommendation = {
  rank: number;
  turnNumber: number;
  startDistanceM: number;
  endDistanceM: number;
  timeLossMs: number;
  confidence: "medium" | "high";
  title: string;
  action: string;
  evidence: SimCoachEvidence[];
};

export type SimCoachAnalysis = {
  targetLap: {
    id: string;
    lapNumber: number;
    lapTimeMs: number;
    valid: boolean;
  };
  referenceLap: {
    id: string;
    source: "session" | "racenet";
    driverName: string | null;
    leaderboardRank: number | null;
    lapNumber: number;
    lapTimeMs: number;
    valid: boolean;
  };
  totalDeltaMs: number;
  racingLines?: {
    target: SimCoachRacingLineSample[];
    reference: SimCoachRacingLineSample[];
  };
  alignedPoints: SimCoachAlignedPoint[];
  corners?: SimCoachCornerAnalysis[];
  recommendations: SimCoachRecommendation[];
};
