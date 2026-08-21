export type TelemetryControls = {
  speedKmh: number;
  throttle: number;
  brake: number;
  steer: number;
  gear: number;
  engineRpm: number;
};

export type CompletedLapSample = TelemetryControls & {
  distanceM: number;
  elapsedMs: number;
  position?: WorldPosition;
  yawRad?: number;
};

export type WorldPosition = {
  x: number;
  y: number;
  z: number;
};

export type CompletedLapPayload = {
  schemaVersion: 1;
  sourceLapId: string;
  sourceSessionUid: string;
  circuitId: number;
  sessionType: number;
  trackLengthM: number;
  playerCarIndex: number;
  lapNumber: number;
  lapTimeMs: number;
  valid: boolean;
  capturedAt: string;
  samples: CompletedLapSample[];
};

export type PacketHeader = {
  m_packetFormat?: number;
  m_packetVersion?: number;
  m_sessionUID?: bigint | number | string;
  m_sessionTime?: number;
  m_playerCarIndex?: number;
};

export type SessionPacket = {
  m_header?: PacketHeader;
  m_sessionType?: number;
  m_trackId?: number;
  m_trackLength?: number;
};

export type LapData = {
  m_lastLapTimeInMS?: number;
  m_lastLapTimeInMs?: number;
  m_currentLapTimeInMS?: number;
  m_currentLapTimeInMs?: number;
  m_lapDistance?: number;
  m_currentLapNum?: number;
  m_currentLapInvalid?: number;
};

export type LapDataPacket = {
  m_header?: PacketHeader;
  m_lapData?: LapData[];
};

export type CarTelemetryData = {
  m_speed?: number;
  m_throttle?: number;
  m_brake?: number;
  m_steer?: number;
  m_gear?: number;
  m_engineRPM?: number;
};

export type CarTelemetryPacket = {
  m_header?: PacketHeader;
  m_carTelemetryData?: CarTelemetryData[];
};

export type CarMotionData = {
  m_worldPositionX?: number;
  m_worldPositionY?: number;
  m_worldPositionZ?: number;
  m_yaw?: number;
};

export type MotionPacket = {
  m_header?: PacketHeader;
  m_carMotionData?: CarMotionData[];
};
