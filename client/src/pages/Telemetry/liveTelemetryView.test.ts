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

const lapsSession = {
  id: "s",
  sessionName: "S",
  circuitName: "C",
  limitType: "LAPS" as const,
  lapLimit: 5,
};

assert.deepEqual(
  buildSessionTarget({ ...lapsSession, lapsCompleted: 2 }, view, input.session),
  { label: "Laps Remaining", value: "3", visible: true },
);

// LAPS sessions count from the session start, not the game's lap number:
// a session started while the game is on lap 3 still has its full limit.
assert.deepEqual(
  buildSessionTarget({ ...lapsSession, lapsCompleted: 0 }, view, input.session),
  { label: "Laps Remaining", value: "5", visible: true },
);

// Without an OSL lap limit, count down the game's own race distance.
assert.deepEqual(
  buildSessionTarget(undefined, view, { ...input.session, m_totalLaps: 5 }),
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
      lapsCompleted: 0,
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
