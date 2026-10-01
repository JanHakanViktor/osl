import assert from "node:assert/strict";
import {
  buildLiveTelemetryView,
  buildSessionTarget,
  type LiveTelemetryInput,
} from "./liveTelemetryView";

const emptyInput: LiveTelemetryInput = {
  carTelemetry: null,
  lapData: null,
  session: null,
  playerSessionHistory: null,
  liveLaps: [],
  heldSector3Ms: null,
};

const input: LiveTelemetryInput = {
  ...emptyInput,
  carTelemetry: {
    m_header: { m_playerCarIndex: 1 },
    m_carTelemetryData: [{ m_speed: 100 }, { m_speed: 287, m_gear: 7 }],
  },
  lapData: {
    m_header: { m_playerCarIndex: 1 },
    m_lapData: [
      {},
      { m_currentLapNum: 3, m_currentLapTimeInMS: 41_000, m_lapDistance: 1000 },
    ],
  },
  session: { m_trackLength: 4000, m_header: { m_sessionTime: 300 } },
  liveLaps: [
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
  ],
};

const view = buildLiveTelemetryView(input);

assert.equal(view.speed, 287);
assert.equal(view.gear, 7);
assert.equal(view.currentLapMs, 41_000);
assert.equal(view.fastestLapMs, 92_800);
assert.equal(view.fastestLapDeltaLabel, "(-0.200)");
assert.equal(view.lapProgress, 0.25);
assert.equal(view.sessionElapsedSeconds, 300);

assert.deepEqual(
  buildSessionTarget(
    { id: "s", sessionName: "S", circuitName: "C", limitType: "LAPS", lapLimit: 5 },
    view,
    input.session,
  ),
  { label: "Laps Remaining", value: "3", visible: true },
);

assert.deepEqual(
  buildSessionTarget(
    {
      id: "s",
      sessionName: "S",
      circuitName: "C",
      limitType: "TIME",
      timeLimitSeconds: 900,
    },
    view,
    input.session,
  ),
  { label: "Time Remaining", value: "10:00", visible: true },
);

assert.deepEqual(
  buildSessionTarget(undefined, buildLiveTelemetryView(emptyInput), null),
  { label: "Time Remaining", value: "--:--", visible: false },
);
