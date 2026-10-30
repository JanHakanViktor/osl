import type {
  LiveTimingCurrent,
  TimingBoard,
  TimingSessionSummary,
} from "../types/liveTiming.types";

const API_URL = import.meta.env.VITE_API_URL;

async function getJson<T>(path: string, errorMessage: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });

  if (!res.ok) {
    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}

export function getCurrentLiveTiming(): Promise<LiveTimingCurrent> {
  return getJson("/live-timing/current", "Failed to load live timing");
}

export function getTimingSessions(): Promise<TimingSessionSummary[]> {
  return getJson("/live-timing/sessions", "Failed to load timing sessions");
}

export function getTimingSession(sessionUid: string): Promise<TimingBoard> {
  return getJson(
    `/live-timing/sessions/${encodeURIComponent(sessionUid)}`,
    "Failed to load the timing session",
  );
}
