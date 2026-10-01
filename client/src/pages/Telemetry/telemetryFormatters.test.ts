import assert from "node:assert/strict";
import {
  buildFastestLapDeltaLabel,
  buildSectorDisplays,
  calculateLapProgress,
  calculateLapsRemaining,
  countGameLapsCompleted,
  getLapDataSectors,
  mergeCompletedLaps,
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

// LAPS sessions count laps completed since the session started, so a session
// started while the game is already on lap 5 still has its full limit left.
assert.equal(calculateLapsRemaining(3, 0), 3);
assert.equal(calculateLapsRemaining(3, 2), 1);
assert.equal(calculateLapsRemaining(3, 4), 0);
assert.equal(calculateLapsRemaining(3, null), 3);
assert.equal(calculateLapsRemaining(null, 1), null);
assert.equal(calculateLapsRemaining(0, 1), null);

// The game's own race distance counts from its absolute lap number.
assert.equal(countGameLapsCompleted(2, 1), 1);
assert.equal(countGameLapsCompleted(5, 0), 4);
assert.equal(countGameLapsCompleted(null, 3), 3);
assert.equal(countGameLapsCompleted(undefined), 0);
assert.equal(calculateLapsRemaining(5, countGameLapsCompleted(2, 1)), 4);
assert.equal(calculateLapProgress(0, 5_000), 0);
assert.equal(calculateLapProgress(1_250, 5_000), 0.25);
assert.equal(calculateLapProgress(5_250, 5_000), 0.05);

assert.equal(
  JSON.stringify(
    getLapDataSectors({
      m_sector: 0,
      m_sector1TimeMSPart: 31_000,
      m_sector1TimeMinutesPart: 0,
      m_sector2TimeMSPart: 32_000,
      m_sector2TimeMinutesPart: 0,
    }),
  ),
  JSON.stringify([null, null, null]),
);

assert.equal(
  JSON.stringify(
    getLapDataSectors({
      m_sector: 1,
      m_sector1TimeMSPart: 31_000,
      m_sector1TimeMinutesPart: 0,
      m_sector2TimeMSPart: 32_000,
      m_sector2TimeMinutesPart: 0,
    }),
  ),
  JSON.stringify([31_000, null, null]),
);

assert.equal(
  buildFastestLapDeltaLabel({
    fastestLapMs: 92_800,
    previousFastestLapMs: 93_000,
  }),
  "(-0.200)",
);

assert.equal(
  JSON.stringify(
    mergeCompletedLaps([laps[0]], [laps[0], laps[1]]).map((lap) => lap.lapNumber),
  ),
  JSON.stringify([1, 2]),
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
