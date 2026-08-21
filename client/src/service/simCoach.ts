import type {
  SimCoachAnalysis,
  SimCoachLapSummary,
} from "../types/sim-coach.types";

const API_URL = import.meta.env.VITE_API_URL;

async function readResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message ?? fallback);
  }

  return response.json() as Promise<T>;
}

export async function getSimCoachLaps(
  sessionId: string,
): Promise<SimCoachLapSummary[]> {
  const response = await fetch(
    `${API_URL}/sim-coach/sessions/${sessionId}/laps`,
    {
      credentials: "include",
    },
  );
  return readResponse(response, "Failed to load coaching laps");
}

export async function selectSimCoachReference(
  lapId: string,
  referenceLapId: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/sim-coach/laps/${lapId}/reference`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ referenceLapId }),
  });
  await readResponse(response, "Failed to select reference lap");
}

export async function clearSimCoachReference(lapId: string): Promise<void> {
  const response = await fetch(`${API_URL}/sim-coach/laps/${lapId}/reference`, {
    method: "DELETE",
    credentials: "include",
  });
  await readResponse(response, "Failed to restore the professional reference");
}

export async function getSimCoachAnalysis(
  lapId: string,
): Promise<SimCoachAnalysis> {
  const response = await fetch(`${API_URL}/sim-coach/laps/${lapId}/analysis`, {
    credentials: "include",
  });
  return readResponse(response, "Failed to analyze lap");
}
