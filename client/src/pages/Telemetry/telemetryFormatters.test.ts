import assert from "node:assert/strict";
import {
  buildFastestLapDeltaLabel,
  buildSectorDisplays,
  calculateLapsRemaining,
} from "./telemetryFormatters";
import type { CompletedLap } from "./telemetryTypes";

const laps: CompletedLap[] = [
  {
    lapNumber: 1,
    sector1Ms: 30_000,
    sector2Ms: 31_000,
    sector3Ms: 32_000,
    lapTimeMs: 93_000,
    valid: true,
  },
  {
    lapNumber: 2,
    sector1Ms: 29_900,
    sector2Ms: 31_100,
    sector3Ms: 31_800,
    lapTimeMs: 92_800,
    valid: true,
  },
];

assert.equal(calculateLapsRemaining(5, 2, 1), 4);
assert.equal(calculateLapsRemaining(5, null, 3), 2);
assert.equal(calculateLapsRemaining(null, 2, 1), null);

assert.equal(
  buildFastestLapDeltaLabel({
    fastestLapMs: 92_800,
    previousFastestLapMs: 93_000,
    previousFastestDriverName: "Driver",
  }),
  "(-0.200 from Driver)",
);

assert.equal(
  JSON.stringify(
    buildSectorDisplays([null, null, null], laps, laps[1]).map(
      (sector) => sector.status,
    ),
  ),
  JSON.stringify(["muted", "muted", "muted"]),
);

assert.equal(
  JSON.stringify(
    buildSectorDisplays([29_800, 31_200, null], laps, laps[1]).map(
      (sector) => sector.status,
    ),
  ),
  JSON.stringify(["purple", "yellow", "muted"]),
);
