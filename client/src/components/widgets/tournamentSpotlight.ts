import type {
  TournamentCircuit,
  TournamentDriver,
  TournamentHighlight,
} from "../../types/tournament.types";

/** The one thing the tournament widget calls out right now. */
export type TournamentSpotlight =
  | {
      kind: "live";
      driver: TournamentDriver;
      circuit: TournamentCircuit;
      lapsCompleted: number;
      lapsTarget: number;
      bestLapMs: number | null;
    }
  | { kind: "upNext"; driver: TournamentDriver; circuit: TournamentCircuit }
  | { kind: "nextTrack"; roundNumber: number; circuit: TournamentCircuit }
  | { kind: "champion"; driver: TournamentDriver; points: number };

function currentRound(tournament: TournamentHighlight) {
  return tournament.rounds.find(
    (round) => round.roundNumber === tournament.currentRoundNumber,
  );
}

export function buildTournamentSpotlight(
  tournament: TournamentHighlight,
): TournamentSpotlight | null {
  const heat = tournament.activeHeat;

  if (heat?.status === "LIVE") {
    return {
      kind: "live",
      driver: heat.driver,
      circuit: heat.circuit,
      lapsCompleted: heat.lapsCompleted,
      lapsTarget: heat.lapsTarget,
      bestLapMs: heat.bestLapMs,
    };
  }

  if (heat?.status === "STAGED") {
    return { kind: "upNext", driver: heat.driver, circuit: heat.circuit };
  }

  const { champion } = tournament;
  if (tournament.status === "FINISHED" && champion) {
    const points =
      tournament.standings.find((standing) => standing.driver.id === champion.id)
        ?.points ?? 0;
    return { kind: "champion", driver: champion, points };
  }

  const round = currentRound(tournament);
  return round
    ? { kind: "nextTrack", roundNumber: round.roundNumber, circuit: round.circuit }
    : null;
}

/** Where the action is, or the last track driven once it is over. */
export function featuredCircuit(
  tournament: TournamentHighlight,
): TournamentCircuit | null {
  return (
    tournament.activeHeat?.circuit ??
    currentRound(tournament)?.circuit ??
    tournament.rounds[tournament.rounds.length - 1]?.circuit ??
    null
  );
}
