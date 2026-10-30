import assert from "node:assert/strict";
import type {
  TournamentCircuit,
  TournamentDriver,
  TournamentHighlight,
} from "../../types/tournament.types";
import { buildTournamentSpotlight, featuredCircuit } from "./tournamentSpotlight";

const monaco: TournamentCircuit = {
  id: 5,
  name: "Circuit de Monaco",
  grandPrix: "Monaco",
  image: "/circuits/monacoCircuit.png",
};
const japan: TournamentCircuit = {
  id: 1,
  name: "Suzuka International Racing Course",
  grandPrix: "Japan",
  image: "/circuits/japaneseCircuit.png",
};
const viktor: TournamentDriver = {
  id: "viktor",
  driverName: "Viktor Petersson",
  country: "SE",
  teamId: "ferrari",
};
const tim: TournamentDriver = {
  id: "tim",
  driverName: "Tim Andersson",
  country: null,
  teamId: null,
};

function highlight(overrides: Partial<TournamentHighlight> = {}): TournamentHighlight {
  return {
    id: "t1",
    name: "Saturday Showdown",
    status: "READY",
    ruleSetName: "Ladder",
    weather: "WET",
    lapsPerDriver: 2,
    roundsCompleted: 1,
    roundsTotal: 2,
    currentRoundNumber: 2,
    rounds: [
      { roundNumber: 1, circuit: monaco, status: "COMPLETE", winner: viktor },
      { roundNumber: 2, circuit: japan, status: "IN_PROGRESS", winner: null },
    ],
    standings: [
      { position: 1, driver: viktor, points: 4, roundWins: 1 },
      { position: 2, driver: tim, points: 2, roundWins: 0 },
    ],
    activeHeat: null,
    champion: null,
    createdAt: "2026-10-01T18:00:00Z",
    finishedAt: null,
    ...overrides,
  };
}

// Between heats, point at the track that is up next.
assert.deepEqual(buildTournamentSpotlight(highlight()), {
  kind: "nextTrack",
  roundNumber: 2,
  circuit: japan,
});
assert.equal(featuredCircuit(highlight()), japan);

// A driver picked by the dice is up next.
assert.deepEqual(
  buildTournamentSpotlight(
    highlight({
      status: "AWAITING_DRIVER",
      activeHeat: {
        roundNumber: 2,
        circuit: japan,
        driver: tim,
        status: "STAGED",
        lapsCompleted: 0,
        lapsTarget: 2,
        bestLapMs: null,
      },
    }),
  ),
  { kind: "upNext", driver: tim, circuit: japan },
);

// A live heat shows the driver's progress.
assert.deepEqual(
  buildTournamentSpotlight(
    highlight({
      status: "HEAT_LIVE",
      activeHeat: {
        roundNumber: 2,
        circuit: japan,
        driver: tim,
        status: "LIVE",
        lapsCompleted: 1,
        lapsTarget: 2,
        bestLapMs: 91_234,
      },
    }),
  ),
  {
    kind: "live",
    driver: tim,
    circuit: japan,
    lapsCompleted: 1,
    lapsTarget: 2,
    bestLapMs: 91_234,
  },
);

// A finished tournament crowns its champion and features the final track.
const finished = highlight({
  status: "FINISHED",
  currentRoundNumber: null,
  roundsCompleted: 2,
  rounds: [
    { roundNumber: 1, circuit: monaco, status: "COMPLETE", winner: viktor },
    { roundNumber: 2, circuit: japan, status: "COMPLETE", winner: viktor },
  ],
  champion: viktor,
});
assert.deepEqual(buildTournamentSpotlight(finished), {
  kind: "champion",
  driver: viktor,
  points: 4,
});
assert.equal(featuredCircuit(finished), japan);
