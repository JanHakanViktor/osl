import { Injectable } from '@nestjs/common';
import type {
  AlignedAnalysisPoint,
  AnalysisLap,
  AnalysisSample,
  SimCoachAnalysis,
} from './sim-coach-analysis.types';
import { analyzeCorners } from './corner-analysis';

const ALIGNMENT_STEP_METRES = 20;

type InterpolatedSample = Omit<AnalysisSample, 'distanceM'> & {
  distanceM: number;
};

@Injectable()
export class SimCoachAnalysisEngine {
  analyze(target: AnalysisLap, reference: AnalysisLap): SimCoachAnalysis {
    const alignedPoints = this.alignByDistance(
      target.samples,
      reference.samples,
    );
    const cornerAnalysis = analyzeCorners(alignedPoints);

    return {
      targetLap: {
        id: target.id,
        lapNumber: target.lapNumber,
        lapTimeMs: target.lapTimeMs,
        valid: target.valid,
      },
      referenceLap: {
        id: reference.id,
        source: reference.source ?? 'session',
        driverName: reference.driverName ?? null,
        leaderboardRank: reference.leaderboardRank ?? null,
        lapNumber: reference.lapNumber,
        lapTimeMs: reference.lapTimeMs,
        valid: reference.valid,
      },
      totalDeltaMs: target.lapTimeMs - reference.lapTimeMs,
      racingLines: {
        target: this.normalizeSamples(target.samples),
        reference: this.normalizeSamples(reference.samples),
      },
      alignedPoints,
      corners: cornerAnalysis.corners,
      recommendations: cornerAnalysis.recommendations,
    };
  }

  private alignByDistance(
    targetSamples: AnalysisSample[],
    referenceSamples: AnalysisSample[],
  ): AlignedAnalysisPoint[] {
    const target = this.normalizeSamples(targetSamples);
    const reference = this.normalizeSamples(referenceSamples);
    if (target.length < 2 || reference.length < 2) return [];

    const startDistance =
      Math.ceil(
        Math.max(target[0].distanceM, reference[0].distanceM) /
          ALIGNMENT_STEP_METRES,
      ) * ALIGNMENT_STEP_METRES;
    const endDistance = Math.min(
      target[target.length - 1].distanceM,
      reference[reference.length - 1].distanceM,
    );
    const points: AlignedAnalysisPoint[] = [];

    for (
      let distanceM = startDistance;
      distanceM <= endDistance;
      distanceM += ALIGNMENT_STEP_METRES
    ) {
      const targetPoint = this.interpolate(target, distanceM);
      const referencePoint = this.interpolate(reference, distanceM);
      if (!targetPoint || !referencePoint) continue;

      points.push({
        distanceM,
        targetElapsedMs: Math.round(targetPoint.elapsedMs),
        referenceElapsedMs: Math.round(referencePoint.elapsedMs),
        deltaMs: Math.round(targetPoint.elapsedMs - referencePoint.elapsedMs),
        targetSpeedKmh: Math.round(targetPoint.speedKmh * 10) / 10,
        referenceSpeedKmh: Math.round(referencePoint.speedKmh * 10) / 10,
        targetThrottle: targetPoint.throttle,
        referenceThrottle: referencePoint.throttle,
        targetBrake: targetPoint.brake,
        referenceBrake: referencePoint.brake,
        targetSteer: targetPoint.steer,
        referenceSteer: referencePoint.steer,
      });
    }

    return points;
  }

  private normalizeSamples(samples: AnalysisSample[]): AnalysisSample[] {
    const sorted = [...samples]
      .filter(
        (sample) =>
          Number.isFinite(sample.distanceM) &&
          Number.isFinite(sample.elapsedMs) &&
          sample.distanceM >= 0,
      )
      .sort((left, right) => left.distanceM - right.distanceM);

    return sorted.filter(
      (sample, index) =>
        index === 0 || sample.distanceM > sorted[index - 1].distanceM,
    );
  }

  private interpolate(
    samples: AnalysisSample[],
    distanceM: number,
  ): InterpolatedSample | null {
    const upperIndex = samples.findIndex(
      (sample) => sample.distanceM >= distanceM,
    );
    if (upperIndex < 0) return null;
    if (upperIndex === 0) return { ...samples[0], distanceM };

    const lower = samples[upperIndex - 1];
    const upper = samples[upperIndex];
    const span = upper.distanceM - lower.distanceM;
    const ratio = span === 0 ? 0 : (distanceM - lower.distanceM) / span;
    const mix = (start: number, end: number) => start + (end - start) * ratio;

    return {
      distanceM,
      elapsedMs: mix(lower.elapsedMs, upper.elapsedMs),
      speedKmh: mix(lower.speedKmh, upper.speedKmh),
      throttle: mix(lower.throttle, upper.throttle),
      brake: mix(lower.brake, upper.brake),
      steer: mix(lower.steer, upper.steer),
      gear: mix(lower.gear, upper.gear),
      engineRpm: mix(lower.engineRpm, upper.engineRpm),
    };
  }

}
