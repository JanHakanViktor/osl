export type PacketHeader = {
  m_playerCarIndex?: number;
  m_sessionTime?: number;
};

export type CarTelemetry = {
  m_speed?: number;
  m_throttle?: number;
  m_brake?: number;
  m_gear?: number;
  m_engineRPM?: number;
};

export type CarTelemetryPacket = {
  m_header?: PacketHeader;
  m_carTelemetryData?: CarTelemetry[];
};

export type LapData = {
  m_lastLapTimeInMS?: number;
  m_lastLapTimeInMs?: number;
  m_currentLapTimeInMS?: number;
  m_currentLapTimeInMs?: number;
  m_sector1TimeMSPart?: number;
  m_sector1TimeMsPart?: number;
  m_sector1TimeMinutesPart?: number;
  m_sector2TimeMSPart?: number;
  m_sector2TimeMsPart?: number;
  m_sector2TimeMinutesPart?: number;
  m_bestLapTimeInMS?: number;
  m_bestLapTimeInMs?: number;
  m_currentLapInvalid?: number;
  m_currentLapNum?: number;
};

export type LapDataPacket = {
  m_header?: PacketHeader;
  m_lapData?: LapData[];
};

export type SessionPacket = {
  m_header?: PacketHeader;
  m_totalLaps?: number;
  m_sessionDuration?: number;
  m_sessionTimeLeft?: number;
};

export type LapHistoryEntry = {
  m_lapTimeInMS?: number;
  m_lapTimeInMs?: number;
  m_sector1TimeInMS?: number;
  m_sector1TimeMSPart?: number;
  m_sector1TimeMinutes?: number;
  m_sector1TimeMinutesPart?: number;
  m_sector2TimeInMS?: number;
  m_sector2TimeMSPart?: number;
  m_sector2TimeMinutes?: number;
  m_sector2TimeMinutesPart?: number;
  m_sector3TimeInMS?: number;
  m_sector3TimeMSPart?: number;
  m_sector3TimeMinutes?: number;
  m_sector3TimeMinutesPart?: number;
  m_lapValidBitFlags?: number;
};

export type SessionHistoryPacket = {
  m_header?: PacketHeader;
  m_carIdx?: number;
  m_numLaps?: number;
  m_lapHistoryData?: LapHistoryEntry[];
};

export type SessionFinishedPayload = {
  sessionId: string;
};

export type SectorStatus = "purple" | "green" | "yellow" | "muted";

export type SectorDisplay = {
  label: "S1" | "S2" | "S3";
  valueMs: number | null;
  status: SectorStatus;
};

export type CompletedLap = {
  lapNumber: number;
  sector1Ms: number | null;
  sector2Ms: number | null;
  sector3Ms: number | null;
  lapTimeMs: number | null;
  valid: boolean;
};
