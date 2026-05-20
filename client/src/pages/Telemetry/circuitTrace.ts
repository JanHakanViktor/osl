import type { CircuitTracePoint } from "./telemetryTypes";

export type CircuitTraceViewBox = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

const paddingRatio = 0.1;
const fallbackRange = 20;

export function buildCircuitTraceViewBox(
  points: CircuitTracePoint[],
): CircuitTraceViewBox | null {
  if (points.length === 0) return null;

  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minZ = Math.min(...points.map((point) => point.z));
  const maxZ = Math.max(...points.map((point) => point.z));
  const xRange = Math.max(maxX - minX, fallbackRange);
  const zRange = Math.max(maxZ - minZ, fallbackRange);

  return {
    minX: minX - xRange * paddingRatio,
    maxX: maxX + xRange * paddingRatio,
    minZ: minZ - zRange * paddingRatio,
    maxZ: maxZ + zRange * paddingRatio,
  };
}

export function mapWorldPositionToViewBox(
  point: CircuitTracePoint,
  viewBox: CircuitTraceViewBox,
) {
  const xRange = viewBox.maxX - viewBox.minX || 1;
  const zRange = viewBox.maxZ - viewBox.minZ || 1;

  return {
    x: ((point.x - viewBox.minX) / xRange) * 100,
    y: ((point.z - viewBox.minZ) / zRange) * 100,
  };
}

export function buildSvgPolylinePoints(points: CircuitTracePoint[]): string {
  const viewBox = buildCircuitTraceViewBox(points);
  if (!viewBox) return "";

  return points
    .map((point) => mapWorldPositionToViewBox(point, viewBox))
    .map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`)
    .join(" ");
}
