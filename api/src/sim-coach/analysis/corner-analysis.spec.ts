import { describe, expect, it } from '@jest/globals';
import { analyzeCorners } from './corner-analysis';
import type { AlignedAnalysisPoint } from './sim-coach-analysis.types';

function point(
  index: number,
  overrides: Partial<AlignedAnalysisPoint> = {},
): AlignedAnalysisPoint {
  const distanceM = index * 20;
  return {
    distanceM,
    targetElapsedMs: index * 200,
    referenceElapsedMs: index * 200,
    deltaMs: 0,
    targetSpeedKmh: 180,
    referenceSpeedKmh: 180,
    targetThrottle: 1,
    referenceThrottle: 1,
    targetBrake: 0,
    referenceBrake: 0,
    targetSteer: 0,
    referenceSteer: 0,
    ...overrides,
  };
}

describe('analyzeCorners', () => {
  it('measures the full braking, apex, throttle, correction, and delta story', () => {
    const points = Array.from({ length: 18 }, (_, index) => {
      const turning = index >= 6 && index <= 10;
      const targetBrake = index === 3 ? 0.3 : index === 4 ? 0.9 : index === 5 ? 0.55 : 0;
      const referenceBrake = index === 4 ? 0.25 : index === 5 ? 0.82 : index === 6 ? 0.42 : 0;
      const targetThrottle = index < 10 ? 0 : index < 13 ? 0.5 : 1;
      const referenceThrottle = index < 9 ? 0 : index < 11 ? 0.55 : 1;
      const targetElapsedMs = index * 210 + (index >= 8 ? 90 : 0);
      const referenceElapsedMs = index * 200;

      return point(index, {
        targetElapsedMs,
        referenceElapsedMs,
        deltaMs: targetElapsedMs - referenceElapsedMs,
        targetSpeedKmh: turning ? 118 + Math.abs(index - 8) * 7 : 190,
        referenceSpeedKmh: turning ? 126 + Math.abs(index - 8) * 7 : 192,
        targetBrake,
        referenceBrake,
        targetThrottle,
        referenceThrottle,
        targetSteer: turning
          ? [0.1, 0.32, 0.18, 0.36, 0.08][index - 6]
          : 0,
        referenceSteer: turning
          ? [0.1, 0.22, 0.34, 0.2, 0.08][index - 6]
          : 0,
      });
    });

    const result = analyzeCorners(points);

    expect(result.corners).toHaveLength(1);
    expect(result.corners[0]).toEqual(
      expect.objectContaining({
        turnNumber: 1,
        timeDeltaMs: expect.any(Number),
        target: expect.objectContaining({
          brakeStartDistanceM: 60,
          maximumBrakePercent: 90,
          brakeReleaseSmoothness: expect.any(Number),
          brakeReleaseDurationMs: expect.any(Number),
          coastingTimeMs: expect.any(Number),
          minimumSpeedKmh: 118,
          throttleStartDistanceM: 200,
          timeToFullThrottleMs: expect.any(Number),
          steeringCorrections: expect.any(Number),
        }),
      }),
    );
  });

  it('turns an early braking difference into a direct instruction', () => {
    const points = Array.from({ length: 16 }, (_, index) => {
      const turning = index >= 6 && index <= 9;
      const targetElapsedMs = index * 200 + (index >= 7 ? 140 : 0);
      return point(index, {
        targetElapsedMs,
        deltaMs: targetElapsedMs - index * 200,
        targetBrake: index >= 2 && index <= 5 ? 0.8 : 0,
        referenceBrake: index >= 3 && index <= 6 ? 0.8 : 0,
        targetThrottle: index >= 10 ? 1 : 0,
        referenceThrottle: index >= 10 ? 1 : 0,
        targetSteer: turning ? 0.3 : 0,
        referenceSteer: turning ? 0.3 : 0,
        targetSpeedKmh: turning ? 120 : 190,
        referenceSpeedKmh: turning ? 120 : 190,
      });
    });

    const result = analyzeCorners(points);

    expect(result.recommendations[0].action).toBe(
      'Turn 1: brake approximately 20 metres later.',
    );
  });

  it('reports avoidable coasting as time before throttle', () => {
    const points = Array.from({ length: 16 }, (_, index) => {
      const turning = index >= 6 && index <= 9;
      const targetElapsedMs = index * 200 + (index >= 9 ? 180 : 0);
      return point(index, {
        targetElapsedMs,
        deltaMs: targetElapsedMs - index * 200,
        targetBrake: index >= 3 && index <= 5 ? 0.8 : 0,
        referenceBrake: index >= 3 && index <= 5 ? 0.8 : 0,
        targetThrottle: index >= 9 ? 1 : 0,
        referenceThrottle: index >= 9 ? 1 : 0,
        targetSteer: turning ? 0.3 : 0,
        referenceSteer: turning ? 0.3 : 0,
      });
    });

    const result = analyzeCorners(points);

    expect(result.recommendations[0].action).toBe(
      'Turn 1: 0.18 seconds lost from coasting before throttle.',
    );
  });

  it('connects premature throttle to an extra steering correction', () => {
    const targetSteer = [0.1, 0.3, 0.15, 0.35];
    const referenceSteer = [0.1, 0.2, 0.3, 0.2];
    const points = Array.from({ length: 16 }, (_, index) => {
      const turning = index >= 6 && index <= 9;
      const targetElapsedMs = index * 200 + (index >= 9 ? 110 : 0);
      return point(index, {
        targetElapsedMs,
        deltaMs: targetElapsedMs - index * 200,
        targetBrake: index >= 3 && index <= 5 ? 0.8 : 0,
        referenceBrake: index >= 3 && index <= 5 ? 0.8 : 0,
        targetThrottle: index >= 8 ? 1 : 0,
        referenceThrottle: index >= 9 ? 1 : 0,
        targetSteer: turning ? targetSteer[index - 6] : 0,
        referenceSteer: turning ? referenceSteer[index - 6] : 0,
      });
    });

    const result = analyzeCorners(points);

    expect(result.recommendations[0].action).toBe(
      'Turn 1: earlier throttle caused a correction and cost 0.11 seconds.',
    );
  });

  it('never returns more than three ranked instructions', () => {
    const points = Array.from({ length: 54 }, (_, index) => {
      const cornerOffset = index % 13;
      const turning = cornerOffset >= 5 && cornerOffset <= 7;
      const completedCorners = Math.floor(index / 13);
      const targetElapsedMs = index * 200 + completedCorners * 100;
      return point(index, {
        targetElapsedMs,
        deltaMs: targetElapsedMs - index * 200,
        targetBrake: cornerOffset >= 2 && cornerOffset <= 4 ? 0.8 : 0,
        referenceBrake: cornerOffset >= 3 && cornerOffset <= 5 ? 0.8 : 0,
        targetThrottle: cornerOffset >= 9 ? 1 : 0,
        referenceThrottle: cornerOffset >= 9 ? 1 : 0,
        targetSteer: turning ? (completedCorners % 2 === 0 ? 0.3 : -0.3) : 0,
        referenceSteer: turning
          ? completedCorners % 2 === 0
            ? 0.3
            : -0.3
          : 0,
      });
    });

    const result = analyzeCorners(points);

    expect(result.corners.length).toBeGreaterThanOrEqual(4);
    expect(result.recommendations).toHaveLength(3);
    expect(result.recommendations.map((item) => item.rank)).toEqual([1, 2, 3]);
  });
});
