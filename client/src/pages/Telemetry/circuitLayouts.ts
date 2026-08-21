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

type CircuitLayoutCalibration = {
  angleDegrees: number;
  scale: number;
  center: CircuitLayoutPoint;
  flipX?: boolean;
  progressOffset?: number;
};

export type CircuitLayout = {
  circuitName: string;
  points: CircuitLayoutPoint[];
  source: "fallback" | "geojson";
  markers: CircuitMarker[];
  telemetryProgressOffset: number;
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

// These transforms align ordered GeoJSON centerlines to the shipped F1 25 circuit PNGs.
// The GeoJSON keeps lap-distance ordering; the calibration fixes game-thumbnail angle.
const circuitLayoutCalibrations: Record<string, CircuitLayoutCalibration> = {
  "Albert Park Circuit": {
    angleDegrees: -50,
    scale: 0.8452,
    center: { x: 47.22, y: 54.55 },
    progressOffset: -0.1,
  },
  "Suzuka International Racing Course": {
    angleDegrees: 0,
    scale: 0.9634,
    center: { x: 51.39, y: 46.52 },
  },
  "Shanghai International Circuit": {
    angleDegrees: -8,
    scale: 0.6632,
    center: { x: 55.13, y: 56.54 },
  },
  "Miami International Autodrome": {
    angleDegrees: 174,
    scale: 0.9728,
    center: { x: 51.31, y: 51 },
  },
  "Imola Circuit": {
    angleDegrees: 178,
    scale: 0.8698,
    center: { x: 44.62, y: 57.72 },
    flipX: true,
  },
  "Circuit de Monaco": {
    angleDegrees: 46,
    scale: 0.8658,
    center: { x: 47.9, y: 48.09 },
  },
  "Circuit Gilles Villeneuve": {
    angleDegrees: 92,
    scale: 0.9106,
    center: { x: 50.27, y: 49.5 },
    flipX: true,
  },
  "Circuit de Barcelona-Catalunya": {
    angleDegrees: 60,
    scale: 0.8554,
    center: { x: 49.55, y: 50.94 },
  },
  "Red Bull Ring": {
    angleDegrees: -23,
    scale: 0.8852,
    center: { x: 49.83, y: 46.78 },
  },
  "Silverstone Circuit": {
    angleDegrees: 88,
    scale: 0.9967,
    center: { x: 54.5, y: 52.4 },
  },
  "Hungaroring": {
    angleDegrees: 56,
    scale: 1.2511,
    center: { x: 40.91, y: 51.42 },
  },
  "Circuit de Spa-Francorchamps": {
    angleDegrees: -98,
    scale: 0.9468,
    center: { x: 56.65, y: 51.03 },
  },
  "Circuit Zandvoort": {
    angleDegrees: 21,
    scale: 0.9313,
    center: { x: 49.3, y: 54.97 },
  },
  "Monza Circuit": {
    angleDegrees: -96,
    scale: 0.9806,
    center: { x: 44.62, y: 57.72 },
  },
  "Baku City Circuit": {
    angleDegrees: 55,
    scale: 0.8302,
    center: { x: 48.31, y: 49.34 },
  },
  "Marina Bay Street Circuit": {
    angleDegrees: 0,
    scale: 0.9838,
    center: { x: 51.95, y: 50.21 },
  },
  "Circuit of the Americas": {
    angleDegrees: 6,
    scale: 0.9803,
    center: { x: 46.44, y: 44.8 },
  },
  "Autódromo Hermanos Rodríguez": {
    angleDegrees: 1,
    scale: 0.8829,
    center: { x: 56.17, y: 39.97 },
  },
  "Interlagos Circuit": {
    angleDegrees: 86,
    scale: 0.9949,
    center: { x: 54.31, y: 45.18 },
  },
  "Las Vegas Strip Circuit": {
    angleDegrees: -92,
    scale: 0.9215,
    center: { x: 54.17, y: 51.27 },
  },
  "Yas Marina Circuit": {
    angleDegrees: 103,
    scale: 0.942,
    center: { x: 45.69, y: 51.66 },
  },
  "Bahrain International Circuit": {
    angleDegrees: 57,
    scale: 0.6807,
    center: { x: 45.21, y: 56.55 },
  },
  "Jeddah Corniche Circuit": {
    angleDegrees: -110,
    scale: 1.0342,
    center: { x: 51.82, y: 53.64 },
  },
};

const fallbackCircuitLayout: CircuitLayout = {
  circuitName: "Selected circuit",
  source: "fallback",
  markers: [startFinishMarker],
  telemetryProgressOffset: 0,
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

function buildCircuitMarkers(progressOffset = 0): CircuitMarker[] {
  return [
    {
      ...startFinishMarker,
      progress: normalizeProgress(progressOffset),
    },
  ];
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

function getPointCloudCenter(points: CircuitLayoutPoint[]): CircuitLayoutPoint {
  const sum = points.reduce(
    (total, point) => ({
      x: total.x + point.x,
      y: total.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

function applyCircuitCalibration(
  points: CircuitLayoutPoint[],
  calibration?: CircuitLayoutCalibration,
): CircuitLayoutPoint[] {
  if (!calibration) return points;

  const sourceCenter = getPointCloudCenter(points);
  const radians = (calibration.angleDegrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return points.map((point) => {
    const centeredX = point.x - sourceCenter.x;
    const centeredY = point.y - sourceCenter.y;
    const x = calibration.flipX ? -centeredX : centeredX;
    const rotatedX = x * cos - centeredY * sin;
    const rotatedY = x * sin + centeredY * cos;

    return {
      x: Number((calibration.center.x + rotatedX * calibration.scale).toFixed(2)),
      y: Number((calibration.center.y + rotatedY * calibration.scale).toFixed(2)),
    };
  });
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
    markers: buildCircuitMarkers(
      circuitLayoutCalibrations[circuitName]?.progressOffset,
    ),
    telemetryProgressOffset:
      circuitLayoutCalibrations[circuitName]?.progressOffset ?? 0,
    points: applyCircuitCalibration(
      toLayoutPoints(geoPoints),
      circuitLayoutCalibrations[circuitName],
    ),
  };
}

export function getTelemetryCircuitProgress(
  layout: CircuitLayout,
  lapProgress?: number | null,
): number {
  return normalizeProgress((lapProgress ?? 0) + layout.telemetryProgressOffset);
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
