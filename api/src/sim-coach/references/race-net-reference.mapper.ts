import type { AnalysisLap } from '../analysis/sim-coach-analysis.types';
import type { RaceNetReferencePayload } from './race-net-reference.types';

export type DefaultReferenceLap = AnalysisLap & {
  circuitId: number;
  source: 'racenet';
  driverName: string;
  leaderboardRank: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function mapRaceNetReference(
  payload: RaceNetReferencePayload,
): DefaultReferenceLap {
  const telemetry = payload.raw.data;

  return {
    id: `racenet:f1-25:${payload.raceNetTrackId}:${payload.leaderboard.ssid}`,
    circuitId: payload.circuitId,
    source: 'racenet',
    driverName: payload.leaderboard.driverName,
    leaderboardRank: payload.leaderboard.rank,
    lapNumber: 0,
    lapTimeMs: payload.leaderboard.timeMs,
    valid: true,
    trackLengthM: Math.round(telemetry.maxDistance),
    samples: telemetry.millis.map((elapsedMs, index) => ({
      distanceM: telemetry.distance[index],
      elapsedMs: Math.round(elapsedMs),
      speedKmh: telemetry.speed[index],
      throttle: clamp(telemetry.throttle[index] / 100, 0, 1),
      brake: clamp(telemetry.brake[index] / 100, 0, 1),
      steer: clamp(telemetry.steering[index] / 100, -1, 1),
      gear: clamp(Math.round(telemetry.gear[index]), -1, 8),
      engineRpm: Math.max(0, Math.round(telemetry.rpm[index] * 100)),
      position: telemetry.position[index],
    })),
  };
}
