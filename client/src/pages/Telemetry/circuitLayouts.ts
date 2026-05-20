export type CircuitLayoutPoint = {
  x: number;
  y: number;
};

export type CircuitLayout = {
  circuitName: string;
  points: CircuitLayoutPoint[];
};

const fallbackCircuitLayout: CircuitLayout = {
  circuitName: "Selected circuit",
  points: [
    { x: 18, y: 55 },
    { x: 26, y: 38 },
    { x: 46, y: 25 },
    { x: 67, y: 31 },
    { x: 82, y: 48 },
    { x: 75, y: 68 },
    { x: 52, y: 78 },
    { x: 28, y: 72 },
    { x: 18, y: 55 },
  ],
};

const circuitLayoutsByName: Record<string, CircuitLayout> = {
  "Albert Park Circuit": {
    circuitName: "Albert Park Circuit",
    points: [
      { x: 15, y: 58 },
      { x: 23, y: 48 },
      { x: 33, y: 43 },
      { x: 45, y: 51 },
      { x: 55, y: 62 },
      { x: 67, y: 64 },
      { x: 78, y: 56 },
      { x: 83, y: 44 },
      { x: 76, y: 34 },
      { x: 65, y: 29 },
      { x: 58, y: 18 },
      { x: 48, y: 12 },
      { x: 42, y: 18 },
      { x: 48, y: 30 },
      { x: 60, y: 39 },
      { x: 54, y: 50 },
      { x: 43, y: 47 },
      { x: 32, y: 39 },
      { x: 23, y: 44 },
      { x: 16, y: 52 },
      { x: 15, y: 58 },
    ],
  },
};

function normalizeProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;

  return ((progress % 1) + 1) % 1;
}

function measureSegmentLength(
  start: CircuitLayoutPoint,
  end: CircuitLayoutPoint,
): number {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

export function getCircuitLayout(circuitName?: string | null): CircuitLayout {
  if (!circuitName) return fallbackCircuitLayout;

  return circuitLayoutsByName[circuitName] ?? {
    ...fallbackCircuitLayout,
    circuitName,
  };
}

export function buildCircuitPolylinePoints(points: CircuitLayoutPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function getPointAtCircuitProgress(
  points: CircuitLayoutPoint[],
  progress?: number | null,
): CircuitLayoutPoint {
  if (points.length === 0) return { x: 50, y: 50 };
  if (points.length === 1) return points[0];

  const segmentLengths = points.slice(1).map((point, index) =>
    measureSegmentLength(points[index], point),
  );
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);

  if (totalLength <= 0) return points[0];

  const targetDistance = totalLength * normalizeProgress(progress ?? 0);
  let travelledDistance = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];
    const nextTravelledDistance = travelledDistance + segmentLength;

    if (targetDistance <= nextTravelledDistance) {
      const segmentProgress =
        segmentLength === 0 ? 0 : (targetDistance - travelledDistance) / segmentLength;
      const start = points[index];
      const end = points[index + 1];

      return {
        x: start.x + (end.x - start.x) * segmentProgress,
        y: start.y + (end.y - start.y) * segmentProgress,
      };
    }

    travelledDistance = nextTravelledDistance;
  }

  return points[points.length - 1];
}
