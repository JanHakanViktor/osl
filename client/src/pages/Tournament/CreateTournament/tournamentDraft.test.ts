import assert from "node:assert/strict";
import {
  firstInvalidStep,
  initialTournamentDraft,
  MAX_DRIVERS,
  toCreateTournamentPayload,
  tournamentDraftReducer,
  validateStep,
  type TournamentDraft,
} from "./tournamentDraft";

const apply = (
  draft: TournamentDraft,
  ...actions: Parameters<typeof tournamentDraftReducer>[1][]
) => actions.reduce(tournamentDraftReducer, draft);

// A fresh draft starts at the settings step.
assert.equal(firstInvalidStep(initialTournamentDraft), "settings");
assert.equal(
  validateStep("settings", { ...initialTournamentDraft, name: "   " }),
  "Give the tournament a name",
);
assert.match(
  validateStep("settings", {
    ...initialTournamentDraft,
    name: "Friday",
    lapsPerDriver: 0,
  }) ?? "",
  /between 1 and 20/,
);

// Drivers toggle on and off, in the order they were picked, up to the limit.
const withDrivers = apply(
  initialTournamentDraft,
  { type: "toggleDriver", driverId: "tim" },
  { type: "toggleDriver", driverId: "viktor" },
  { type: "toggleDriver", driverId: "felix" },
  { type: "toggleDriver", driverId: "tim" },
);
assert.deepEqual(withDrivers.driverIds, ["viktor", "felix"]);

const fullGrid = Array.from({ length: MAX_DRIVERS + 2 }, (_, index) => ({
  type: "toggleDriver" as const,
  driverId: `driver-${index}`,
}));
assert.equal(
  apply(initialTournamentDraft, ...fullGrid).driverIds.length,
  MAX_DRIVERS,
);

// Tracks toggle and clear.
const withTracks = apply(
  initialTournamentDraft,
  { type: "toggleCircuit", circuitId: 5 },
  { type: "toggleCircuit", circuitId: 13 },
  { type: "toggleCircuit", circuitId: 5 },
);
assert.deepEqual(withTracks.circuitIds, [13]);
assert.deepEqual(
  tournamentDraftReducer(withTracks, { type: "clearCircuits" }).circuitIds,
  [],
);

// A complete draft becomes a trimmed create payload.
const complete = apply(
  initialTournamentDraft,
  {
    type: "update",
    changes: { name: "  Friday League ", ruleSetId: "LADDER", weather: "WET" },
  },
  { type: "toggleDriver", driverId: "viktor" },
  { type: "toggleDriver", driverId: "tim" },
  { type: "toggleCircuit", circuitId: 5 },
);
assert.equal(firstInvalidStep(complete), null);
assert.deepEqual(toCreateTournamentPayload(complete), {
  name: "Friday League",
  weather: "WET",
  lapsPerDriver: 3,
  cleanLapBonus: false,
  topSpeedBonus: false,
  ruleSetId: "LADDER",
  driverIds: ["viktor", "tim"],
  circuitIds: [5],
});
