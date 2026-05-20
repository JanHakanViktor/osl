import assert from "node:assert/strict";
import { buildCircuitTraceViewBox, mapWorldPositionToViewBox } from "./circuitTrace";

const samples = [
  { x: 100, z: 50 },
  { x: 120, z: 70 },
  { x: 140, z: 50 },
];

const viewBox = buildCircuitTraceViewBox(samples);

assert.equal(JSON.stringify(viewBox), JSON.stringify({
  minX: 96,
  maxX: 144,
  minZ: 48,
  maxZ: 72,
}));

assert.equal(
  JSON.stringify(mapWorldPositionToViewBox({ x: 120, z: 70 }, viewBox)),
  JSON.stringify({ x: 50, y: 91.66666666666666 }),
);
