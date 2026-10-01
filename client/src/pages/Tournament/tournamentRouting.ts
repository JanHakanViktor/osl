import type { Tournament } from "../../types/tournament.types";

export type TournamentView = "standings" | "live" | "round" | "podium";

export const tournamentPath = {
  list: () => "/tournaments",
  create: () => "/tournaments/new",
  standings: (id: string) => `/tournaments/${id}`,
  live: (id: string) => `/tournaments/${id}/live`,
  round: (id: string, roundNumber: number) =>
    `/tournaments/${id}/rounds/${roundNumber}`,
  podium: (id: string) => `/tournaments/${id}/podium`,
};

type RoutableTournament = Pick<Tournament, "id" | "status" | "rounds">;

/** Where to go once a live heat is over: its round results if that round is done. */
export function pathAfterHeat(
  tournament: RoutableTournament,
  heatRoundNumber: number | null,
): string {
  const round =
    heatRoundNumber == null ? undefined : tournament.rounds[heatRoundNumber - 1];

  if (round?.status === "COMPLETE") {
    return tournamentPath.round(tournament.id, round.roundNumber);
  }

  return tournament.status === "FINISHED"
    ? tournamentPath.podium(tournament.id)
    : tournamentPath.standings(tournament.id);
}

/**
 * The screen a tournament status belongs on. Returns null when the current
 * view is already right, so pages only navigate when the status moves on.
 */
export function redirectForStatus(
  tournament: RoutableTournament,
  view: TournamentView,
  heatRoundNumber: number | null = null,
): string | null {
  const { id, status } = tournament;

  if (status === "HEAT_LIVE") {
    return view === "live" ? null : tournamentPath.live(id);
  }

  if (view === "live") return pathAfterHeat(tournament, heatRoundNumber);
  if (view === "round") return null;

  if (status === "FINISHED") {
    return view === "podium" ? null : tournamentPath.podium(id);
  }

  return view === "standings" ? null : tournamentPath.standings(id);
}
