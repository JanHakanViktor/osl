export type SessionFormValues = {
  sessionName: string;
  circuitId: number;
  circuitName: string;
  limitType: "TIME" | "LAPS";
  timeLimitSeconds?: number;
  lapLimit?: number;
};

export type ActiveSessionValues = {
  id: string;
  status: "ACTIVE";
  circuitId: number;
  circuitName: string;
  limitType: "TIME" | "LAPS";
  timeLimitSeconds?: number;
  lapLimit?: number;
};
