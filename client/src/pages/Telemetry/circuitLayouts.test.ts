import assert from "node:assert/strict";
import {
  buildCircuitPolylinePoints,
  getCircuitMarkerLine,
  getCircuitLayout,
  getPointAtCircuitProgress,
  shouldAnimateCircuitMarker,
} from "./circuitLayouts";

const simpleCircuit = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
];

assert.equal(buildCircuitPolylinePoints(simpleCircuit), "0,0 100,0 100,100");
assert.deepEqual(getPointAtCircuitProgress(simpleCircuit, 0), { x: 0, y: 0 });
assert.deepEqual(getPointAtCircuitProgress(simpleCircuit, 0.25), { x: 50, y: 0 });
assert.deepEqual(getPointAtCircuitProgress(simpleCircuit, 0.75), { x: 100, y: 50 });
assert.deepEqual(getPointAtCircuitProgress(simpleCircuit, 1.25), { x: 50, y: 0 });

const albertParkLayout = getCircuitLayout("Albert Park Circuit");
assert.equal(albertParkLayout.circuitName, "Albert Park Circuit");
assert.equal(albertParkLayout.source, "geojson");
assert.ok(albertParkLayout.points.length > 80);
assert.equal(albertParkLayout.points[0].x, albertParkLayout.points.at(-1)?.x);
assert.equal(albertParkLayout.points[0].y, albertParkLayout.points.at(-1)?.y);

const startFinishMarker = getCircuitMarkerLine(albertParkLayout.points, 0);
assert.ok(startFinishMarker);
assert.notEqual(startFinishMarker?.start.x, startFinishMarker?.end.x);
assert.notEqual(startFinishMarker?.start.y, startFinishMarker?.end.y);

assert.equal(shouldAnimateCircuitMarker(0.2, 0.24), true);
assert.equal(shouldAnimateCircuitMarker(0.98, 0.01), true);
assert.equal(shouldAnimateCircuitMarker(0.65, 0.02), false);

const fallbackLayout = getCircuitLayout("Unknown Test Circuit");
assert.equal(fallbackLayout.circuitName, "Unknown Test Circuit");
assert.ok(fallbackLayout.points.length > 1);
