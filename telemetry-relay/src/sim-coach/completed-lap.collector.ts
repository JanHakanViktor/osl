import type {
  CarTelemetryPacket,
  CompletedLapPayload,
  CompletedLapSample,
  LapData,
  LapDataPacket,
  MotionPacket,
  SessionPacket,
  TelemetryControls,
  WorldPosition,
} from "./completed-lap.types.ts";

const F1_25_PACKET_FORMAT = 2025;
const F1_25_PACKET_VERSION = 1;
const SUPPORTED_SESSION_TYPES = new Set([1, 2, 3, 4, 18]);
const DISTANCE_BUCKET_METRES = 5;
const MAX_CONTROL_AGE_SECONDS = 0.25;
const MAX_MOTION_AGE_SECONDS = 0.25;

type ActiveLap = {
  lapNumber: number;
  invalid: boolean;
  samples: CompletedLapSample[];
  lastDistanceBucket: number | null;
};

type SessionState = {
  sourceSessionUid: string;
  sessionType: number;
  circuitId: number;
  trackLengthM: number;
  playerCarIndex: number;
  controls?: TelemetryControls & { sessionTime: number };
  motion?: {
    position: WorldPosition;
    yawRad: number;
    sessionTime: number;
  };
  activeLap?: ActiveLap;
};

function firstFiniteNumber(
  ...values: Array<number | undefined>
): number | undefined {
  return values.find(
    (value): value is number =>
      typeof value === "number" && Number.isFinite(value),
  );
}

function readSessionUid(value: bigint | number | string | undefined) {
  if (value == null) return null;
  return String(value);
}

function hasSupportedHeader(header: SessionPacket["m_header"]): boolean {
  return (
    header?.m_packetFormat === F1_25_PACKET_FORMAT &&
    header.m_packetVersion === F1_25_PACKET_VERSION &&
    readSessionUid(header.m_sessionUID) != null
  );
}

export class CompletedLapCollector {
  private readonly sessions = new Map<string, SessionState>();

  handleSession(packet: SessionPacket): void {
    if (!hasSupportedHeader(packet.m_header)) return;

    const sourceSessionUid = readSessionUid(packet.m_header?.m_sessionUID)!;
    const sessionType = packet.m_sessionType;
    const circuitId = packet.m_trackId;
    const trackLengthM = packet.m_trackLength;

    if (
      typeof sessionType !== "number" ||
      !SUPPORTED_SESSION_TYPES.has(sessionType) ||
      typeof circuitId !== "number" ||
      circuitId < 0 ||
      typeof trackLengthM !== "number" ||
      trackLengthM <= 0
    ) {
      this.sessions.delete(sourceSessionUid);
      return;
    }

    const previous = this.sessions.get(sourceSessionUid);
    this.sessions.set(sourceSessionUid, {
      ...previous,
      sourceSessionUid,
      sessionType,
      circuitId,
      trackLengthM,
      playerCarIndex: packet.m_header?.m_playerCarIndex ?? 0,
    });
  }

  handleCarTelemetry(packet: CarTelemetryPacket): void {
    if (!hasSupportedHeader(packet.m_header)) return;

    const sourceSessionUid = readSessionUid(packet.m_header?.m_sessionUID)!;
    const state = this.sessions.get(sourceSessionUid);
    if (!state) return;

    const playerCarIndex = packet.m_header?.m_playerCarIndex ?? 0;
    const telemetry = packet.m_carTelemetryData?.[playerCarIndex];
    const sessionTime = packet.m_header?.m_sessionTime;

    if (!telemetry || typeof sessionTime !== "number") return;

    const speedKmh = firstFiniteNumber(telemetry.m_speed);
    const throttle = firstFiniteNumber(telemetry.m_throttle);
    const brake = firstFiniteNumber(telemetry.m_brake);
    const steer = firstFiniteNumber(telemetry.m_steer);
    const gear = firstFiniteNumber(telemetry.m_gear);
    const engineRpm = firstFiniteNumber(telemetry.m_engineRPM);

    if (
      speedKmh == null ||
      throttle == null ||
      brake == null ||
      steer == null ||
      gear == null ||
      engineRpm == null
    ) {
      return;
    }

    state.playerCarIndex = playerCarIndex;
    state.controls = {
      speedKmh,
      throttle,
      brake,
      steer,
      gear,
      engineRpm,
      sessionTime,
    };
  }

  handleMotion(packet: MotionPacket): void {
    if (!hasSupportedHeader(packet.m_header)) return;

    const sourceSessionUid = readSessionUid(packet.m_header?.m_sessionUID)!;
    const state = this.sessions.get(sourceSessionUid);
    if (!state) return;

    const playerCarIndex = packet.m_header?.m_playerCarIndex ?? 0;
    const motion = packet.m_carMotionData?.[playerCarIndex];
    const sessionTime = packet.m_header?.m_sessionTime;
    if (!motion || typeof sessionTime !== "number") return;

    const x = firstFiniteNumber(motion.m_worldPositionX);
    const y = firstFiniteNumber(motion.m_worldPositionY);
    const z = firstFiniteNumber(motion.m_worldPositionZ);
    const yawRad = firstFiniteNumber(motion.m_yaw);
    if (x == null || y == null || z == null || yawRad == null) return;

    state.playerCarIndex = playerCarIndex;
    state.motion = {
      position: { x, y, z },
      yawRad,
      sessionTime,
    };
  }

  handleLapData(packet: LapDataPacket): CompletedLapPayload | null {
    if (!hasSupportedHeader(packet.m_header)) return null;

    const sourceSessionUid = readSessionUid(packet.m_header?.m_sessionUID)!;
    const state = this.sessions.get(sourceSessionUid);
    if (!state) return null;

    const playerCarIndex = packet.m_header?.m_playerCarIndex ?? 0;
    const lap = packet.m_lapData?.[playerCarIndex];
    const lapNumber = lap?.m_currentLapNum;

    if (!lap || typeof lapNumber !== "number" || lapNumber <= 0) return null;

    state.playerCarIndex = playerCarIndex;

    if (!state.activeLap || lapNumber < state.activeLap.lapNumber) {
      state.activeLap = this.createActiveLap(lapNumber, lap);
    }

    let completedLap: CompletedLapPayload | null = null;

    if (lapNumber > state.activeLap.lapNumber) {
      completedLap = this.completeLap(state, packet, lap);
      state.activeLap = this.createActiveLap(lapNumber, lap);
    }

    state.activeLap.invalid ||= lap.m_currentLapInvalid === 1;
    this.captureSample(state, packet, lap);

    return completedLap;
  }

  private createActiveLap(lapNumber: number, lap: LapData): ActiveLap {
    return {
      lapNumber,
      invalid: lap.m_currentLapInvalid === 1,
      samples: [],
      lastDistanceBucket: null,
    };
  }

  private captureSample(
    state: SessionState,
    packet: LapDataPacket,
    lap: LapData,
  ): void {
    const distanceM = firstFiniteNumber(lap.m_lapDistance);
    const elapsedMs = firstFiniteNumber(
      lap.m_currentLapTimeInMS,
      lap.m_currentLapTimeInMs,
    );
    const packetSessionTime = packet.m_header?.m_sessionTime;
    const controls = state.controls;
    const motion = state.motion;

    if (
      distanceM == null ||
      distanceM < 0 ||
      elapsedMs == null ||
      elapsedMs < 0 ||
      packetSessionTime == null ||
      !controls ||
      Math.abs(packetSessionTime - controls.sessionTime) >
        MAX_CONTROL_AGE_SECONDS
    ) {
      return;
    }

    const bucket = Math.floor(distanceM / DISTANCE_BUCKET_METRES);
    if (bucket === state.activeLap?.lastDistanceBucket) return;

    state.activeLap?.samples.push({
      distanceM: Math.min(distanceM, state.trackLengthM),
      elapsedMs,
      speedKmh: controls.speedKmh,
      throttle: controls.throttle,
      brake: controls.brake,
      steer: controls.steer,
      gear: controls.gear,
      engineRpm: controls.engineRpm,
      ...(motion &&
      Math.abs(packetSessionTime - motion.sessionTime) <=
        MAX_MOTION_AGE_SECONDS
        ? { position: motion.position, yawRad: motion.yawRad }
        : {}),
    });

    if (state.activeLap) state.activeLap.lastDistanceBucket = bucket;
  }

  private completeLap(
    state: SessionState,
    packet: LapDataPacket,
    currentLap: LapData,
  ): CompletedLapPayload | null {
    const activeLap = state.activeLap;
    const lapTimeMs = firstFiniteNumber(
      currentLap.m_lastLapTimeInMS,
      currentLap.m_lastLapTimeInMs,
    );

    if (!activeLap || !lapTimeMs || activeLap.samples.length < 2) return null;

    return {
      schemaVersion: 1,
      sourceLapId: `${state.sourceSessionUid}:${state.playerCarIndex}:${activeLap.lapNumber}`,
      sourceSessionUid: state.sourceSessionUid,
      circuitId: state.circuitId,
      sessionType: state.sessionType,
      trackLengthM: state.trackLengthM,
      playerCarIndex: state.playerCarIndex,
      lapNumber: activeLap.lapNumber,
      lapTimeMs,
      valid: !activeLap.invalid,
      capturedAt: new Date().toISOString(),
      samples: [...activeLap.samples].sort(
        (left, right) => left.distanceM - right.distanceM,
      ),
    };
  }
}
