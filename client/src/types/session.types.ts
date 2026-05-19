export type SessionFormValues = {
  sessionName: string;
  circuitId: number;
  circuitName: string;
  limitType: "TIME" | "LAPS";
  timeLimitSeconds?: number;
  lapLimit?: number;
};

export type SessionResponse = {
  _id: string;
  status: "CREATED" | "ACTIVE" | "FINISHED";
};

export type LiveSessionDetails = {
  id: string;
  sessionName: string;
  circuitName: string;
  limitType: "TIME" | "LAPS";
  timeLimitSeconds?: number;
  lapLimit?: number;
  startedAt?: string;
};

export type LandingSummary = {
  activeSession: {
    id: string;
    sessionName: string;
    circuitName: string;
    startedAt?: string;
  } | null;
  latestSession: {
    id: string;
    sessionName: string;
    circuitName: string;
    circuitId: number;
    image: string | null;
    driverName: string;
    fastestLapMs: number;
    topSpeedKmh: number;
    totalCleanLaps: number;
    bestCleanLapStreak: number;
    finishedAt?: string;
  } | null;
  fastestLapByCircuit: Array<{
    circuitId: number;
    grandPrix: string;
    circuitName: string;
    image: string;
    fastestLapMs: number | null;
    fastestLapSectorsMs: number[];
    driverName: string | null;
  }>;
  improvementTrend: {
    driverName: string;
    circuitId: number;
    circuitName: string;
    sessions: Array<{
      id: string;
      label: string;
      sessionName: string;
      fastestLapMs: number;
    }>;
  } | null;
};
