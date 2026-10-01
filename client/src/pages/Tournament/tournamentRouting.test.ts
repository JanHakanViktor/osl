import assert from "node:assert/strict";
import type { Tournament, TournamentRound } from "../../types/tournament.types";
import { pathAfterHeat, redirectForStatus } from "./tournamentRouting";

function round(
  roundNumber: number,
  status: TournamentRound["status"],
): TournamentRound {
  return {
    roundNumber,
    status,
    circuit: { id: roundNumber, name: "", grandPrix: "", image: null },
    results: [],
    fastestSectors: [],
  };
}

function tournament(
  status: Tournament["status"],
  rounds: TournamentRound[] = [round(1, "COMPLETE"), round(2, "IN_PROGRESS")],
) {
  return { id: "t1", status, rounds };
}

// The standings hub follows the rig: live heats and finished tournaments move on.
assert.equal(redirectForStatus(tournament("READY"), "standings"), null);
assert.equal(redirectForStatus(tournament("AWAITING_DRIVER"), "standings"), null);
assert.equal(
  redirectForStatus(tournament("HEAT_LIVE"), "standings"),
  "/tournaments/t1/live",
);
assert.equal(
  redirectForStatus(tournament("FINISHED"), "standings"),
  "/tournaments/t1/podium",
);

// The live page stays while the heat runs, then shows the finished round.
assert.equal(redirectForStatus(tournament("HEAT_LIVE"), "live", 2), null);
assert.equal(
  redirectForStatus(
    tournament("READY", [round(1, "COMPLETE"), round(2, "COMPLETE")]),
    "live",
    2,
  ),
  "/tournaments/t1/rounds/2",
);
assert.equal(
  redirectForStatus(tournament("READY"), "live", 2),
  "/tournaments/t1",
);

// Round results stay put unless a new heat goes live.
assert.equal(redirectForStatus(tournament("FINISHED"), "round"), null);
assert.equal(
  redirectForStatus(tournament("HEAT_LIVE"), "round"),
  "/tournaments/t1/live",
);

// The podium only exists once the tournament is finished.
assert.equal(redirectForStatus(tournament("FINISHED"), "podium"), null);
assert.equal(redirectForStatus(tournament("READY"), "podium"), "/tournaments/t1");

// Without a remembered heat the live page falls back to the hub or podium.
assert.equal(pathAfterHeat(tournament("READY"), null), "/tournaments/t1");
assert.equal(
  pathAfterHeat(tournament("FINISHED", [round(1, "COMPLETE")]), null),
  "/tournaments/t1/podium",
);
