/**
 * The subset of parsed F1 25 UDP packets (format 2025) that tournament heats
 * read. Field names match the relay's parser output; nothing outside the
 * tournament telemetry folder should depend on them.
 */
export type F1PacketHeader = {
  m_sessionUID?: string | number;
  m_playerCarIndex?: number;
};

export type HeatLapDataEntry = {
  m_currentLapNum?: number;
  m_currentLapTimeInMS?: number;
  m_lastLapTimeInMS?: number;
  m_sector1TimeMSPart?: number;
  m_sector1TimeMinutesPart?: number;
  m_sector2TimeMSPart?: number;
  m_sector2TimeMinutesPart?: number;
  /** 0 = valid, 1 = invalid. */
  m_currentLapInvalid?: number;
  /** 0 = in garage, 1 = flying lap, 2 = in lap, 3 = out lap, 4 = on track. */
  m_driverStatus?: number;
};

export type HeatLapDataPacket = {
  m_header?: F1PacketHeader;
  m_lapData?: HeatLapDataEntry[];
};

export type HeatCarTelemetryPacket = {
  m_header?: F1PacketHeader;
  m_carTelemetryData?: Array<{ m_speed?: number }>;
};

export type GameSessionPacket = {
  m_header?: F1PacketHeader;
  /** F1 track id, -1 when unknown. */
  m_trackId?: number;
};

export function readGameSessionUid(header?: F1PacketHeader): string | null {
  const uid = header?.m_sessionUID;
  if (uid == null) return null;

  const value = String(uid);
  return value === '0' || value === '' ? null : value;
}

export function readPlayerEntry<T>(
  header: F1PacketHeader | undefined,
  entries: T[] | undefined,
): T | null {
  return entries?.[header?.m_playerCarIndex ?? 0] ?? null;
}
