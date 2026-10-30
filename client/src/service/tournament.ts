import type {
  CreateTournamentPayload,
  DriverOption,
  LatestTournamentHighlight,
  RuleSet,
  Tournament,
  TournamentSummary,
} from "../types/tournament.types";

const API_URL = import.meta.env.VITE_API_URL;

async function readErrorMessage(res: Response, fallback: string) {
  try {
    const body = (await res.json()) as { message?: string | string[] };
    if (Array.isArray(body.message)) return body.message.join(", ");
    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}

async function requestJson<T>(
  path: string,
  fallbackError: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  if (!res.ok) {
    throw new Error(await readErrorMessage(res, fallbackError));
  }

  return res.json() as Promise<T>;
}

export function getRuleSets(): Promise<RuleSet[]> {
  return requestJson("/tournaments/rule-sets", "Failed to load rule sets");
}

export function getDriverOptions(): Promise<DriverOption[]> {
  return requestJson("/tournaments/drivers", "Failed to load drivers");
}

export function getTournaments(): Promise<TournamentSummary[]> {
  return requestJson("/tournaments", "Failed to load tournaments");
}

/** Public: the tournament that changed last, for the landing page. */
export function getLatestTournamentHighlight(): Promise<LatestTournamentHighlight> {
  return requestJson(
    "/tournament-highlights/latest",
    "Failed to load the latest tournament",
  );
}

export function getTournament(id: string): Promise<Tournament> {
  return requestJson(`/tournaments/${id}`, "Failed to load tournament");
}

export function createTournament(
  payload: CreateTournamentPayload,
): Promise<Tournament> {
  return requestJson("/tournaments", "Failed to create tournament", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Rolls the dice for the next driver (or re-rolls the waiting one). */
export function rollNextDriver(id: string): Promise<Tournament> {
  return requestJson(`/tournaments/${id}/active-heat`, "Failed to roll", {
    method: "POST",
  });
}

export function startHeat(id: string): Promise<Tournament> {
  return requestJson(
    `/tournaments/${id}/active-heat/start`,
    "Failed to start heat",
    { method: "POST" },
  );
}

export function finishHeat(id: string): Promise<Tournament> {
  return requestJson(
    `/tournaments/${id}/active-heat/finish`,
    "Failed to end heat",
    { method: "POST" },
  );
}

export function abortHeat(id: string): Promise<Tournament> {
  return requestJson(`/tournaments/${id}/active-heat`, "Failed to cancel heat", {
    method: "DELETE",
  });
}
