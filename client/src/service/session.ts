import type {
  SessionFormValues,
  SessionResponse,
} from "../types/session.types";

const API_URL = import.meta.env.VITE_API_URL;

export async function createSession(
  payload: SessionFormValues
): Promise<SessionResponse> {
  const res = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create session");
  }

  return res.json();
}

export async function startSession(
  sessionId: string
): Promise<SessionResponse> {
  const res = await fetch(`${API_URL}/sessions/${sessionId}/start`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to start session");
  }

  return res.json();
}
