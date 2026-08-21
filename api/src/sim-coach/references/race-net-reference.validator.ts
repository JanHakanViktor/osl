import type {
  RaceNetReferencePayload,
  RaceNetTelemetryData,
} from './race-net-reference.types';

const REQUIRED_CHANNELS = [
  'millis',
  'distance',
  'speed',
  'throttle',
  'brake',
  'steering',
  'gear',
  'rpm',
] as const satisfies ReadonlyArray<keyof RaceNetTelemetryData>;

function assertRange(
  values: number[],
  minimum: number,
  maximum: number,
  channel: string,
): void {
  if (values.some((value) => value < minimum || value > maximum)) {
    throw new Error(`RaceNet ${channel} contains an out-of-range value`);
  }
}

export function assertRaceNetReference(payload: RaceNetReferencePayload): void {
  if (
    payload.schemaVersion !== 1 ||
    payload.source !== 'racenet' ||
    payload.game !== 'F1 25'
  ) {
    throw new Error('Unsupported RaceNet reference payload');
  }

  if (
    !payload.leaderboard.equalPerformance ||
    payload.leaderboard.assists.some((assistId) => assistId !== 4) ||
    payload.raw.data.performanceAnalysisMetadata.assistsEverUsed
  ) {
    throw new Error(
      'RaceNet reference is not a no-assist equal-performance lap',
    );
  }

  const telemetry = payload.raw.data;
  const sampleCount = telemetry.millis.length;
  if (
    sampleCount < 2 ||
    telemetry.position.length !== sampleCount ||
    REQUIRED_CHANNELS.some(
      (channel) => telemetry[channel].length !== sampleCount,
    )
  ) {
    throw new Error('RaceNet reference channels have inconsistent lengths');
  }

  if (
    REQUIRED_CHANNELS.some((channel) =>
      telemetry[channel].some((value) => !Number.isFinite(value)),
    )
  ) {
    throw new Error('RaceNet reference contains a non-finite sample');
  }

  if (
    telemetry.position.some(
      (position) =>
        !Number.isFinite(position.x) ||
        !Number.isFinite(position.y) ||
        !Number.isFinite(position.z),
    )
  ) {
    throw new Error('RaceNet reference contains a non-finite position');
  }

  for (let index = 1; index < sampleCount; index += 1) {
    if (
      telemetry.millis[index] <= telemetry.millis[index - 1] ||
      telemetry.distance[index] <= telemetry.distance[index - 1]
    ) {
      throw new Error('RaceNet time and distance channels must be monotonic');
    }
  }

  assertRange(telemetry.speed, 0, 380, 'speed');
  assertRange(telemetry.throttle, 0, 100, 'throttle');
  assertRange(telemetry.brake, 0, 100, 'brake');
  assertRange(telemetry.steering, -100, 100, 'steering');

  for (let index = 8; index < sampleCount - 8; index += 1) {
    if (telemetry.speed[index] > 40 && telemetry.gear[index] <= 0) {
      throw new Error(
        `RaceNet gear discontinuity at sample ${index} (${telemetry.speed[index]} km/h)`,
      );
    }
  }
}
