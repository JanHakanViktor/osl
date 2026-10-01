import type {
  RoundResult,
  TournamentStatus,
  TournamentWeather,
} from "../../types/tournament.types";

export const WEATHER_LABELS: Record<TournamentWeather, string> = {
  DRY: "Dry",
  WET: "Wet",
  NIGHT: "Night",
  CHANGEABLE: "Changeable",
};

export const TOURNAMENT_STATUS_CHIPS: Record<
  TournamentStatus,
  { label: string; color: "primary" | "warning" | "default" | "success" }
> = {
  HEAT_LIVE: { label: "Live", color: "primary" },
  AWAITING_DRIVER: { label: "Driver up", color: "warning" },
  READY: { label: "In progress", color: "default" },
  FINISHED: { label: "Finished", color: "success" },
};

function nameParts(name: string): string[] {
  return name.trim().split(/\s+/).filter(Boolean);
}

/** "Viktor Petersson" -> "VP". */
export function driverInitials(name: string): string {
  const parts = nameParts(name);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Broadcast-style three letter code from the surname: "Viktor Petersson" -> "PET". */
export function driverCode(name: string): string {
  const parts = nameParts(name);
  return (parts[parts.length - 1] ?? "???").slice(0, 3).toUpperCase();
}

export function formatPoints(points: number): string {
  return `${points} ${points === 1 ? "pt" : "pts"}`;
}

export function describeBonuses(result: RoundResult): string[] {
  return [
    result.cleanLapBonus > 0 ? `Clean laps +${result.cleanLapBonus}` : null,
    result.topSpeedBonus > 0 ? `Top speed +${result.topSpeedBonus}` : null,
  ].filter((bonus): bonus is string => bonus != null);
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}
