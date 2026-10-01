import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Tournament } from "../../../types/tournament.types";
import { redirectForStatus, type TournamentView } from "../tournamentRouting";

/** Keeps the viewer on the screen that matches the tournament's status. */
export function useTournamentRedirect(
  tournament: Tournament | undefined,
  view: TournamentView,
  heatRoundNumber: number | null = null,
) {
  const navigate = useNavigate();
  const redirect = tournament
    ? redirectForStatus(tournament, view, heatRoundNumber)
    : null;

  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true });
  }, [navigate, redirect]);

  return redirect;
}
