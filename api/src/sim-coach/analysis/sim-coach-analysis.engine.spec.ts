import { describe, expect, it } from '@jest/globals';
import { SimCoachAnalysisEngine } from './sim-coach-analysis.engine';
import type { AnalysisLap, AnalysisSample } from './sim-coach-analysis.types';

function sample(
  distanceM: number,
  elapsedMs: number,
  speedKmh: number,
  brake = 0,
  throttle = 1,
): AnalysisSample {
  return {
    distanceM,
    elapsedMs,
    speedKmh,
    brake,
    throttle,
    steer: 0,
    gear: 5,
    engineRpm: 10_000,
  };
}

function lap(
  id: string,
  lapTimeMs: number,
  samples: AnalysisSample[],
): AnalysisLap {
  return {
    id,
    lapNumber: 2,
    lapTimeMs,
    valid: true,
    trackLengthM: 1000,
    samples,
  };
}

describe('SimCoachAnalysisEngine', () => {
  it('aligns laps by distance instead of packet index', () => {
    const engine = new SimCoachAnalysisEngine();
    const analysis = engine.analyze(
      lap('target', 10_500, [
        sample(0, 0, 200),
        sample(100, 1_100, 180),
        sample(200, 2_200, 200),
      ]),
      lap('reference', 10_000, [
        sample(0, 0, 200),
        sample(50, 500, 190),
        sample(200, 2_000, 200),
      ]),
    );

    const pointAt100 = analysis.alignedPoints.find(
      (point) => point.distanceM === 100,
    );
    expect(pointAt100?.targetElapsedMs).toBe(1_100);
    expect(pointAt100?.referenceElapsedMs).toBe(1_000);
    expect(pointAt100?.deltaMs).toBe(100);
  });

  it('ranks a meaningful braking and minimum-speed loss with evidence', () => {
    const engine = new SimCoachAnalysisEngine();
    const distances = Array.from({ length: 21 }, (_, index) => index * 20);
    const target = distances.map((distance) => ({
      ...sample(
        distance,
        distance * 10 + (distance >= 200 ? (distance - 180) * 2 : 0),
        distance >= 160 && distance <= 280 ? 120 : 200,
        distance >= 160 && distance <= 240 ? 0.8 : 0,
        distance >= 300 ? 1 : 0.2,
      ),
      steer: distance >= 160 && distance <= 280 ? 0.35 : 0,
    }));
    const reference = distances.map((distance) => ({
      ...sample(
        distance,
        distance * 10,
        distance >= 180 && distance <= 260 ? 135 : 200,
        distance >= 200 && distance <= 240 ? 0.8 : 0,
        distance >= 280 ? 1 : 0.2,
      ),
      steer: distance >= 160 && distance <= 280 ? 0.3 : 0,
    }));

    const analysis = engine.analyze(
      lap('target', 4_500, target),
      lap('reference', 4_000, reference),
    );

    expect(analysis.recommendations[0].timeLossMs).toBeGreaterThanOrEqual(60);
    expect(analysis.recommendations[0].evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metric: 'brake-point' }),
        expect.objectContaining({ metric: 'minimum-speed' }),
        expect.objectContaining({ metric: 'time-loss' }),
      ]),
    );
  });

  it('does not invent advice when the delta does not meaningfully grow', () => {
    const engine = new SimCoachAnalysisEngine();
    const samples = [sample(0, 0, 200), sample(200, 2_000, 200)];
    const analysis = engine.analyze(
      lap('target', 10_000, samples),
      lap('reference', 10_000, samples),
    );

    expect(analysis.recommendations).toEqual([]);
  });

  it('returns world-space samples for synchronized racing-line playback', () => {
    const engine = new SimCoachAnalysisEngine();
    const targetSamples = [
      { ...sample(0, 0, 200), position: { x: 10, y: 1, z: 20 } },
      { ...sample(200, 2_000, 180), position: { x: 30, y: 2, z: 40 } },
    ];
    const referenceSamples = [
      { ...sample(0, 0, 205), position: { x: 11, y: 1, z: 21 } },
      { ...sample(200, 1_900, 185), position: { x: 31, y: 2, z: 41 } },
    ];

    const analysis = engine.analyze(
      lap('target', 2_000, targetSamples),
      lap('reference', 1_900, referenceSamples),
    );

    expect(analysis.racingLines.target).toEqual(targetSamples);
    expect(analysis.racingLines.reference).toEqual(referenceSamples);
  });
});
