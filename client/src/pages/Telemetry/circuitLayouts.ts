import { CIRCUIT_GEO_LAYOUTS } from "./circuitGeoData";

export type CircuitLayoutPoint = {
  x: number;
  y: number;
};

export type CircuitMarkerKind = "startFinish" | "drs";

export type CircuitMarker = {
  kind: CircuitMarkerKind;
  label: string;
  progress: number;
};

export type CircuitMarkerLine = {
  start: CircuitLayoutPoint;
  end: CircuitLayoutPoint;
};

export type CircuitLayout = {
  circuitName: string;
  points: CircuitLayoutPoint[];
  source: "fallback" | "geojson";
  markers: CircuitMarker[];
};

const startFinishMarker: CircuitMarker = {
  kind: "startFinish",
  label: "S/F",
  progress: 0,
};

const circuitGeoLayouts: Record<
  string,
  readonly (readonly [number, number])[]
> = CIRCUIT_GEO_LAYOUTS;

const fallbackCircuitLayout: CircuitLayout = {
  circuitName: "Selected circuit",
  source: "fallback",
  markers: [startFinishMarker],
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

function toLayoutPoints(
  points: readonly (readonly [number, number])[],
): CircuitLayoutPoint[] {
  return points.map(([x, y]) => ({ x, y }));
}

function getCircuitSegments(points: CircuitLayoutPoint[]): number[] {
  return points.slice(1).map((point, index) =>
    measureSegmentLength(points[index], point),
  );
}

function getCircuitSegmentAtProgress(
  points: CircuitLayoutPoint[],
  progress: number,
): {
  start: CircuitLayoutPoint;
  end: CircuitLayoutPoint;
  segmentProgress: number;
} | null {
  if (points.length < 2) return null;

  const segmentLengths = getCircuitSegments(points);
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);

  if (totalLength <= 0) return null;

  const targetDistance = totalLength * normalizeProgress(progress);
  let travelledDistance = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];
    const nextTravelledDistance = travelledDistance + segmentLength;

    if (targetDistance <= nextTravelledDistance) {
      return {
        start: points[index],
        end: points[index + 1],
        segmentProgress:
          segmentLength === 0
            ? 0
            : (targetDistance - travelledDistance) / segmentLength,
      };
    }

    travelledDistance = nextTravelledDistance;
  }

  return {
    start: points[points.length - 2],
    end: points[points.length - 1],
    segmentProgress: 1,
  };
}

export function getCircuitLayout(circuitName?: string | null): CircuitLayout {
  if (!circuitName) return fallbackCircuitLayout;

  const geoPoints = circuitGeoLayouts[circuitName];
  if (!geoPoints) {
    return {
      ...fallbackCircuitLayout,
      circuitName,
    };
  }

  return {
    circuitName,
    source: "geojson",
    markers: [startFinishMarker],
    points: toLayoutPoints(geoPoints),
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

  const segment = getCircuitSegmentAtProgress(points, progress ?? 0);
  if (!segment) return points[0];

  return {
    x: segment.start.x + (segment.end.x - segment.start.x) * segment.segmentProgress,
    y: segment.start.y + (segment.end.y - segment.start.y) * segment.segmentProgress,
  };
}

export function getCircuitMarkerLine(
  points: CircuitLayoutPoint[],
  progress: number,
  length = 7,
): CircuitMarkerLine | null {
  const segment = getCircuitSegmentAtProgress(points, progress);
  if (!segment) return null;

  const center = getPointAtCircuitProgress(points, progress);
  const tangentLength = measureSegmentLength(segment.start, segment.end);
  if (tangentLength <= 0) return null;

  const normal = {
    x: -(segment.end.y - segment.start.y) / tangentLength,
    y: (segment.end.x - segment.start.x) / tangentLength,
  };
  const halfLength = length / 2;

  return {
    start: {
      x: center.x - normal.x * halfLength,
      y: center.y - normal.y * halfLength,
    },
    end: {
      x: center.x + normal.x * halfLength,
      y: center.y + normal.y * halfLength,
    },
  };
}

export function shouldAnimateCircuitMarker(
  previousProgress?: number | null,
  nextProgress?: number | null,
): boolean {
  if (
    previousProgress == null ||
    nextProgress == null ||
    !Number.isFinite(previousProgress) ||
    !Number.isFinite(nextProgress)
  ) {
    return false;
  }

  const directDistance = Math.abs(
    normalizeProgress(nextProgress) - normalizeProgress(previousProgress),
  );
  const wrappedDistance = Math.min(directDistance, 1 - directDistance);

  return wrappedDistance <= 0.18;
}
