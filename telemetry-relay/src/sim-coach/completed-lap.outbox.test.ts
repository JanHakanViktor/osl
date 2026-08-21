import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import { CompletedLapOutbox } from "./completed-lap.outbox.ts";
import type { CompletedLapPayload } from "./completed-lap.types.ts";

const payload: CompletedLapPayload = {
  schemaVersion: 1,
  sourceLapId: "session:0:1",
  sourceSessionUid: "session",
  circuitId: 1,
  sessionType: 18,
  trackLengthM: 5000,
  playerCarIndex: 0,
  lapNumber: 1,
  lapTimeMs: 90_000,
  valid: true,
  capturedAt: "2026-08-16T10:00:00.000Z",
  samples: [
    {
      distanceM: 0,
      elapsedMs: 0,
      speedKmh: 200,
      throttle: 1,
      brake: 0,
      steer: 0,
      gear: 6,
      engineRpm: 11_000,
    },
    {
      distanceM: 100,
      elapsedMs: 1_000,
      speedKmh: 190,
      throttle: 0.5,
      brake: 0.2,
      steer: 0.1,
      gear: 5,
      engineRpm: 10_000,
    },
  ],
};

it("keeps failed uploads on disk and removes them only after acceptance", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "osl-sim-coach-"));
  const originalFetch = globalThis.fetch;
  context.after(async () => {
    globalThis.fetch = originalFetch;
    await rm(directory, { recursive: true, force: true });
  });

  const outbox = new CompletedLapOutbox(
    directory,
    "https://example.test/sim-coach/laps",
    "secret",
  );
  await outbox.enqueue(payload);
  await outbox.enqueue(payload);
  assert.equal((await readdir(directory)).length, 1);

  globalThis.fetch = (async () =>
    new Response(null, { status: 503 })) as typeof fetch;
  assert.deepEqual(await outbox.uploadPending(), { uploaded: 0, failed: 1 });
  assert.equal((await readdir(directory)).length, 1);

  globalThis.fetch = (async () =>
    new Response(null, { status: 202 })) as typeof fetch;
  assert.deepEqual(await outbox.uploadPending(), { uploaded: 1, failed: 0 });
  assert.equal((await readdir(directory)).length, 0);
});
