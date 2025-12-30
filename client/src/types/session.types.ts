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
