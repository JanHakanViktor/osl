import type {
  AlignedAnalysisPoint,
  CoachingEvidence,
  CoachingRecommendation,
  CornerAnalysis,
  CornerMetrics,
} from './sim-coach-analysis.types';

const TURNING_THRESHOLD = 0.04;
const MINIMUM_TURNING_PEAK = 0.08;
const SINGLE_SAMPLE_TURNING_PEAK = 0.25;
const MAX_TURNING_GAP_POINTS = 2;
const APPROACH_POINTS = 5;
const EXIT_POINTS = 6;
const BRAKE_THRESHOLD = 0.08;
const RELEASED_BRAKE_THRESHOLD = 0.05;
const THROTTLE_THRESHOLD = 0.15;
const FULL_THROTTLE_THRESHOLD = 0.95;
const MINIMUM_INSTRUCTION_LOSS_MS = 30;
const MAX_INSTRUCTIONS = 3;

type Driver = 'target' | 'reference';

type TurningGroup = {
  startIndex: number;
  endIndex: number;
  direction: -1 | 1;
  peakSteer: number;
  sampleCount: number;
};

type CornerRange = {
  turnNumber: number;
  startIndex: number;
  turningStartIndex: number;
  apexIndex: number;
  turningEndIndex: number;
  endIndex: number;
};

type RecommendationCandidate = Omit<CoachingRecommendation, 'rank'>;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number, decimals = 0): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function getBrake(point: AlignedAnalysisPoint, driver: Driver): number {
  return driver === 'target' ? point.targetBrake : point.referenceBrake;
}

function getThrottle(point: AlignedAnalysisPoint, driver: Driver): number {
  return driver === 'target' ? point.targetThrottle : point.referenceThrottle;
}

function getSpeed(point: AlignedAnalysisPoint, driver: Driver): number {
  return driver === 'target' ? point.targetSpeedKmh : point.referenceSpeedKmh;
}

function getSteer(point: AlignedAnalysisPoint, driver: Driver): number {
  return driver === 'target' ? point.targetSteer : point.referenceSteer;
}

function getElapsed(point: AlignedAnalysisPoint, driver: Driver): number {
  return driver === 'target'
    ? point.targetElapsedMs
    : point.referenceElapsedMs;
}

function finishTurningGroup(
  groups: TurningGroup[],
  group: TurningGroup | null,
): void {
  if (
    group &&
    group.peakSteer >= MINIMUM_TURNING_PEAK &&
    (group.sampleCount >= 2 ||
      group.peakSteer >= SINGLE_SAMPLE_TURNING_PEAK)
  ) {
    groups.push(group);
  }
}

function detectCornerRanges(points: AlignedAnalysisPoint[]): CornerRange[] {
  const groups: TurningGroup[] = [];
  let activeGroup: TurningGroup | null = null;

  for (let index = 0; index < points.length; index += 1) {
    const steer = points[index].referenceSteer;
    if (Math.abs(steer) < TURNING_THRESHOLD) continue;

    const direction = Math.sign(steer) as -1 | 1;
    if (
      !activeGroup ||
      index - activeGroup.endIndex > MAX_TURNING_GAP_POINTS ||
      direction !== activeGroup.direction
    ) {
      finishTurningGroup(groups, activeGroup);
      activeGroup = {
        startIndex: index,
        endIndex: index,
        direction,
        peakSteer: Math.abs(steer),
        sampleCount: 1,
      };
      continue;
    }

    activeGroup.endIndex = index;
    activeGroup.peakSteer = Math.max(
      activeGroup.peakSteer,
      Math.abs(steer),
    );
    activeGroup.sampleCount += 1;
  }

  finishTurningGroup(groups, activeGroup);

  return groups.map((group, index) => {
    const apexSearchStart = Math.max(0, group.startIndex - 1);
    const apexSearchEnd = Math.min(points.length - 1, group.endIndex + 2);
    const turningMidpoint = (group.startIndex + group.endIndex) / 2;
    let apexIndex = apexSearchStart;
    for (
      let pointIndex = apexSearchStart + 1;
      pointIndex <= apexSearchEnd;
      pointIndex += 1
    ) {
      const candidateSpeed = points[pointIndex].referenceSpeedKmh;
      const apexSpeed = points[apexIndex].referenceSpeedKmh;
      if (
        candidateSpeed < apexSpeed ||
        (candidateSpeed === apexSpeed &&
          Math.abs(pointIndex - turningMidpoint) <
            Math.abs(apexIndex - turningMidpoint))
      ) {
        apexIndex = pointIndex;
      }
    }

    return {
      turnNumber: index + 1,
      startIndex: Math.max(0, group.startIndex - APPROACH_POINTS),
      turningStartIndex: group.startIndex,
      apexIndex,
      turningEndIndex: group.endIndex,
      endIndex: Math.min(points.length - 1, group.endIndex + EXIT_POINTS),
    };
  });
}

function findBrakeStart(
  segment: AlignedAnalysisPoint[],
  apexOffset: number,
  driver: Driver,
): number | null {
  for (let index = 0; index <= apexOffset; index += 1) {
    if (
      getBrake(segment[index], driver) >= BRAKE_THRESHOLD &&
      (index === 0 ||
        getBrake(segment[index - 1], driver) < BRAKE_THRESHOLD)
    ) {
      return index;
    }
  }
  return null;
}

function findThrottleStart(
  segment: AlignedAnalysisPoint[],
  apexOffset: number,
  driver: Driver,
): number | null {
  const searchStart = Math.max(0, apexOffset - 2);
  for (let index = searchStart; index < segment.length; index += 1) {
    if (
      getThrottle(segment[index], driver) >= THROTTLE_THRESHOLD &&
      (index === searchStart ||
        getThrottle(segment[index - 1], driver) < THROTTLE_THRESHOLD)
    ) {
      return index;
    }
  }
  return null;
}

function calculateBrakeRelease(
  segment: AlignedAnalysisPoint[],
  peakBrakeIndex: number,
  driver: Driver,
): { durationMs: number | null; smoothness: number; releaseEndIndex: number } {
  let releaseEndIndex = segment.length - 1;
  for (let index = peakBrakeIndex + 1; index < segment.length; index += 1) {
    if (getBrake(segment[index], driver) <= RELEASED_BRAKE_THRESHOLD) {
      releaseEndIndex = index;
      break;
    }
  }

  if (releaseEndIndex <= peakBrakeIndex) {
    return { durationMs: null, smoothness: 100, releaseEndIndex };
  }

  let reapplication = 0;
  let abruptness = 0;
  for (let index = peakBrakeIndex + 1; index <= releaseEndIndex; index += 1) {
    const change =
      getBrake(segment[index], driver) -
      getBrake(segment[index - 1], driver);
    reapplication += Math.max(0, change);
    abruptness += Math.max(0, Math.abs(change) - 0.22);
  }

  return {
    durationMs:
      getElapsed(segment[releaseEndIndex], driver) -
      getElapsed(segment[peakBrakeIndex], driver),
    smoothness: round(
      clamp(100 - reapplication * 160 - abruptness * 100, 0, 100),
    ),
    releaseEndIndex,
  };
}

function countSteeringCorrections(
  points: AlignedAnalysisPoint[],
  driver: Driver,
): number {
  let previousDirection = 0;
  let reversals = 0;

  for (let index = 1; index < points.length; index += 1) {
    const change = getSteer(points[index], driver) - getSteer(points[index - 1], driver);
    if (Math.abs(change) < 0.04) continue;
    const direction = Math.sign(change);
    if (previousDirection !== 0 && direction !== previousDirection) reversals += 1;
    previousDirection = direction;
  }

  return Math.max(0, reversals - 1);
}

function measureCorner(
  points: AlignedAnalysisPoint[],
  range: CornerRange,
  driver: Driver,
): CornerMetrics {
  const segment = points.slice(range.startIndex, range.endIndex + 1);
  const apexOffset = range.apexIndex - range.startIndex;
  const turningStartOffset = range.turningStartIndex - range.startIndex;
  const turningEndOffset = range.turningEndIndex - range.startIndex;
  const brakeStartIndex = findBrakeStart(segment, apexOffset, driver);

  let peakBrakeIndex = 0;
  for (let index = 1; index <= Math.min(segment.length - 1, apexOffset + 2); index += 1) {
    if (getBrake(segment[index], driver) > getBrake(segment[peakBrakeIndex], driver)) {
      peakBrakeIndex = index;
    }
  }
  const brakeRelease = calculateBrakeRelease(segment, peakBrakeIndex, driver);
  const throttleStartIndex = findThrottleStart(segment, apexOffset, driver);
  let fullThrottleIndex: number | null = null;
  if (throttleStartIndex != null) {
    for (let index = throttleStartIndex; index < segment.length; index += 1) {
      if (getThrottle(segment[index], driver) >= FULL_THROTTLE_THRESHOLD) {
        fullThrottleIndex = index;
        break;
      }
    }
  }

  let coastingTimeMs = 0;
  const coastEnd = throttleStartIndex ?? segment.length - 1;
  for (
    let index = Math.min(brakeRelease.releaseEndIndex, coastEnd);
    index < coastEnd;
    index += 1
  ) {
    if (
      getBrake(segment[index], driver) < RELEASED_BRAKE_THRESHOLD &&
      getThrottle(segment[index], driver) < THROTTLE_THRESHOLD
    ) {
      coastingTimeMs += Math.max(
        0,
        getElapsed(segment[index + 1], driver) -
          getElapsed(segment[index], driver),
      );
    }
  }

  const apexSamples = segment.slice(
    Math.max(0, apexOffset - 2),
    Math.min(segment.length, apexOffset + 3),
  );
  const minimumSpeedKmh = Math.min(
    ...apexSamples.map((point) => getSpeed(point, driver)),
  );
  const steeringSamples = segment.slice(
    Math.max(0, turningStartOffset - 1),
    Math.min(segment.length, turningEndOffset + 3),
  );

  return {
    brakeStartDistanceM:
      brakeStartIndex == null ? null : round(segment[brakeStartIndex].distanceM),
    maximumBrakePercent: round(
      Math.max(...segment.map((point) => getBrake(point, driver))) * 100,
    ),
    brakeReleaseSmoothness: brakeRelease.smoothness,
    brakeReleaseDurationMs: brakeRelease.durationMs,
    brakeReleaseEndDistanceM:
      brakeRelease.releaseEndIndex <= peakBrakeIndex
        ? null
        : round(segment[brakeRelease.releaseEndIndex].distanceM),
    coastingTimeMs: Math.round(coastingTimeMs),
    minimumSpeedKmh: round(minimumSpeedKmh, 1),
    throttleStartDistanceM:
      throttleStartIndex == null
        ? null
        : round(segment[throttleStartIndex].distanceM),
    timeToFullThrottleMs:
      throttleStartIndex == null || fullThrottleIndex == null
        ? null
        : Math.round(
            getElapsed(segment[fullThrottleIndex], driver) -
              getElapsed(segment[throttleStartIndex], driver),
          ),
    fullThrottleDistanceM:
      fullThrottleIndex == null
        ? null
        : round(segment[fullThrottleIndex].distanceM),
    steeringCorrections: countSteeringCorrections(steeringSamples, driver),
  };
}

function buildEvidence(corner: CornerAnalysis): CoachingEvidence[] {
  const evidence: CoachingEvidence[] = [];
  const target = corner.target;
  const reference = corner.reference;

  if (
    target.brakeStartDistanceM != null &&
    reference.brakeStartDistanceM != null &&
    Math.abs(reference.brakeStartDistanceM - target.brakeStartDistanceM) >= 8
  ) {
    evidence.push({
      metric: 'brake-point',
      targetValue: target.brakeStartDistanceM,
      referenceValue: reference.brakeStartDistanceM,
      unit: 'm',
      explanation: `Brake application differs by ${Math.round(Math.abs(reference.brakeStartDistanceM - target.brakeStartDistanceM))} m.`,
    });
  }
  if (Math.abs(target.maximumBrakePercent - reference.maximumBrakePercent) >= 8) {
    evidence.push({
      metric: 'maximum-brake',
      targetValue: target.maximumBrakePercent,
      referenceValue: reference.maximumBrakePercent,
      unit: 'percent',
      explanation: `Peak brake pressure was ${target.maximumBrakePercent}% versus ${reference.maximumBrakePercent}% in the reference.`,
    });
  }
  if (
    reference.brakeReleaseSmoothness - target.brakeReleaseSmoothness >= 12
  ) {
    evidence.push({
      metric: 'brake-release',
      targetValue: target.brakeReleaseSmoothness,
      referenceValue: reference.brakeReleaseSmoothness,
      unit: 'score',
      explanation: `Brake release smoothness scored ${target.brakeReleaseSmoothness}/100 versus ${reference.brakeReleaseSmoothness}/100.`,
    });
  }
  if (target.coastingTimeMs - reference.coastingTimeMs >= 80) {
    evidence.push({
      metric: 'coasting',
      targetValue: target.coastingTimeMs,
      referenceValue: reference.coastingTimeMs,
      unit: 'ms',
      explanation: `${Math.round(target.coastingTimeMs - reference.coastingTimeMs)} ms of additional coasting.`,
    });
  }
  if (reference.minimumSpeedKmh - target.minimumSpeedKmh >= 3) {
    evidence.push({
      metric: 'minimum-speed',
      targetValue: target.minimumSpeedKmh,
      referenceValue: reference.minimumSpeedKmh,
      unit: 'km/h',
      explanation: `Minimum speed was ${round(reference.minimumSpeedKmh - target.minimumSpeedKmh, 1)} km/h lower.`,
    });
  }
  if (
    target.throttleStartDistanceM != null &&
    reference.throttleStartDistanceM != null &&
    Math.abs(target.throttleStartDistanceM - reference.throttleStartDistanceM) >= 8
  ) {
    evidence.push({
      metric: 'throttle-application',
      targetValue: target.throttleStartDistanceM,
      referenceValue: reference.throttleStartDistanceM,
      unit: 'm',
      explanation: `Initial throttle application differs by ${Math.round(Math.abs(target.throttleStartDistanceM - reference.throttleStartDistanceM))} m.`,
    });
  }
  if (
    target.timeToFullThrottleMs != null &&
    reference.timeToFullThrottleMs != null &&
    target.timeToFullThrottleMs - reference.timeToFullThrottleMs >= 100
  ) {
    evidence.push({
      metric: 'full-throttle',
      targetValue: target.timeToFullThrottleMs,
      referenceValue: reference.timeToFullThrottleMs,
      unit: 'ms',
      explanation: `Full throttle took ${Math.round(target.timeToFullThrottleMs - reference.timeToFullThrottleMs)} ms longer to reach.`,
    });
  }
  if (target.steeringCorrections > reference.steeringCorrections) {
    evidence.push({
      metric: 'steering-correction',
      targetValue: target.steeringCorrections,
      referenceValue: reference.steeringCorrections,
      unit: 'count',
      explanation: `${target.steeringCorrections - reference.steeringCorrections} additional steering correction${target.steeringCorrections - reference.steeringCorrections === 1 ? '' : 's'} detected.`,
    });
  }

  evidence.push({
    metric: 'time-loss',
    targetValue: corner.timeDeltaMs,
    referenceValue: 0,
    unit: 'ms',
    explanation: `${corner.timeDeltaMs >= 0 ? `${corner.timeDeltaMs} ms lost` : `${Math.abs(corner.timeDeltaMs)} ms gained`} through this corner.`,
  });
  return evidence;
}

function buildRecommendation(corner: CornerAnalysis): RecommendationCandidate {
  const target = corner.target;
  const reference = corner.reference;
  const evidence = buildEvidence(corner);
  const lossSeconds = (Math.max(0, corner.timeDeltaMs) / 1_000).toFixed(2);
  const brakeEarlierBy =
    target.brakeStartDistanceM != null && reference.brakeStartDistanceM != null
      ? reference.brakeStartDistanceM - target.brakeStartDistanceM
      : 0;
  const extraCoastingMs = target.coastingTimeMs - reference.coastingTimeMs;
  const throttleEarlierBy =
    target.throttleStartDistanceM != null &&
    reference.throttleStartDistanceM != null
      ? reference.throttleStartDistanceM - target.throttleStartDistanceM
      : 0;
  const extraCorrections =
    target.steeringCorrections - reference.steeringCorrections;

  let title = 'Focus on a cleaner corner sequence';
  let action = `Turn ${corner.turnNumber}: ${lossSeconds} seconds lost through the braking, apex, and exit sequence.`;

  if (throttleEarlierBy >= 8 && extraCorrections > 0) {
    title = 'Delay throttle until the car is settled';
    action = `Turn ${corner.turnNumber}: earlier throttle caused a correction and cost ${lossSeconds} seconds.`;
  } else if (brakeEarlierBy >= 8) {
    title = 'Move the braking point later';
    action = `Turn ${corner.turnNumber}: brake approximately ${Math.round(brakeEarlierBy)} metres later.`;
  } else if (extraCoastingMs >= 100) {
    title = 'Remove the coast phase';
    action = `Turn ${corner.turnNumber}: ${(extraCoastingMs / 1_000).toFixed(2)} seconds lost from coasting before throttle.`;
  } else if (
    target.timeToFullThrottleMs != null &&
    reference.timeToFullThrottleMs != null &&
    target.timeToFullThrottleMs - reference.timeToFullThrottleMs >= 100
  ) {
    title = 'Reach full throttle sooner';
    action = `Turn ${corner.turnNumber}: reach full throttle ${((target.timeToFullThrottleMs - reference.timeToFullThrottleMs) / 1_000).toFixed(2)}s sooner by unwinding the steering earlier.`;
  } else if (reference.minimumSpeedKmh - target.minimumSpeedKmh >= 3) {
    title = 'Carry more minimum speed';
    action = `Turn ${corner.turnNumber}: carry approximately ${Math.round(reference.minimumSpeedKmh - target.minimumSpeedKmh)} km/h more at the apex.`;
  } else if (
    reference.brakeReleaseSmoothness - target.brakeReleaseSmoothness >= 12
  ) {
    title = 'Release the brake more smoothly';
    action = `Turn ${corner.turnNumber}: trail off the brake in one progressive release instead of reapplying pressure.`;
  } else if (extraCorrections > 0) {
    title = 'Use one clean steering input';
    action = `Turn ${corner.turnNumber}: remove ${extraCorrections} unnecessary steering correction${extraCorrections === 1 ? '' : 's'} to stabilize the exit.`;
  }

  return {
    turnNumber: corner.turnNumber,
    startDistanceM: corner.startDistanceM,
    endDistanceM: corner.endDistanceM,
    timeLossMs: Math.max(0, corner.timeDeltaMs),
    confidence:
      corner.timeDeltaMs >= 150 && evidence.length >= 3 ? 'high' : 'medium',
    title,
    action,
    evidence,
  };
}

export function analyzeCorners(points: AlignedAnalysisPoint[]): {
  corners: CornerAnalysis[];
  recommendations: CoachingRecommendation[];
} {
  const ranges = detectCornerRanges(points);
  const corners = ranges.map((range) => ({
    turnNumber: range.turnNumber,
    startDistanceM: points[range.startIndex].distanceM,
    apexDistanceM: points[range.apexIndex].distanceM,
    endDistanceM: points[range.endIndex].distanceM,
    timeDeltaMs:
      points[range.endIndex].deltaMs - points[range.startIndex].deltaMs,
    target: measureCorner(points, range, 'target'),
    reference: measureCorner(points, range, 'reference'),
  }));
  const recommendations = corners
    .filter((corner) => corner.timeDeltaMs >= MINIMUM_INSTRUCTION_LOSS_MS)
    .map(buildRecommendation)
    .sort((left, right) => right.timeLossMs - left.timeLossMs)
    .slice(0, MAX_INSTRUCTIONS)
    .map((recommendation, index) => ({
      ...recommendation,
      rank: index + 1,
    }));

  return { corners, recommendations };
}
