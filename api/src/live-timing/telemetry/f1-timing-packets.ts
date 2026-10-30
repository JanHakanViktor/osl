/**
 * The subset of parsed F1 25 UDP packets (format 2025) that live timing
 * reads. Field names match the relay's parser output; nothing outside the
 * live timing telemetry folder should depend on them.
 */
export type F1TimingHeader = {
  m_sessionUID?: string | number;
  m_sessionTime?: number;
  m_playerCarIndex?: number;
};

export type F1SessionPacket = {
  m_header?: F1TimingHeader;
  m_weather?: number;
  m_trackTemperature?: number;
  m_airTemperature?: number;
  m_totalLaps?: number;
  m_trackLength?: number;
  m_sessionType?: number;
  m_trackId?: number;
  m_sessionTimeLeft?: number;
  m_safetyCarStatus?: number;
  m_networkGame?: number;
};

export type F1ParticipantEntry = {
  m_aiControlled?: number;
  m_teamId?: number;
  m_raceNumber?: number;
  m_name?: string;
};

export type F1ParticipantsPacket = {
  m_header?: F1TimingHeader;
  m_numActiveCars?: number;
  m_participants?: F1ParticipantEntry[];
};

export type F1LapDataEntry = {
  m_currentLapTimeInMS?: number;
  m_deltaToCarInFrontMSPart?: number;
  m_deltaToCarInFrontMinutesPart?: number;
  m_deltaToRaceLeaderMSPart?: number;
  m_deltaToRaceLeaderMinutesPart?: number;
  m_lapDistance?: number;
  m_carPosition?: number;
  m_currentLapNum?: number;
  m_pitStatus?: number;
  m_numPitStops?: number;
  m_sector?: number;
  m_currentLapInvalid?: number;
  m_penalties?: number;
  m_totalWarnings?: number;
  m_cornerCuttingWarnings?: number;
  m_gridPosition?: number;
  m_driverStatus?: number;
  m_resultStatus?: number;
  m_speedTrapFastestSpeed?: number;
  m_speedTrapFastestLap?: number;
};

export type F1LapDataPacket = {
  m_header?: F1TimingHeader;
  m_lapData?: F1LapDataEntry[];
};

export type F1LapHistoryEntry = {
  m_lapTimeInMS?: number;
  m_sector1TimeMSPart?: number;
  m_sector1TimeMinutesPart?: number;
  m_sector2TimeMSPart?: number;
  m_sector2TimeMinutesPart?: number;
  m_sector3TimeMSPart?: number;
  m_sector3TimeMinutesPart?: number;
  m_lapValidBitFlags?: number;
};

export type F1TyreStintEntry = {
  m_endLap?: number;
  m_tyreVisualCompound?: number;
};

export type F1SessionHistoryPacket = {
  m_header?: F1TimingHeader;
  m_carIdx?: number;
  m_numLaps?: number;
  m_numTyreStints?: number;
  m_lapHistoryData?: F1LapHistoryEntry[];
  m_tyreStintsHistoryData?: F1TyreStintEntry[];
};

export type F1FinalClassificationEntry = {
  m_position?: number;
  m_numLaps?: number;
  m_gridPosition?: number;
  m_points?: number;
  m_numPitStops?: number;
  m_resultStatus?: number;
  m_bestLapTimeInMS?: number;
  /** Seconds, without penalties. */
  m_totalRaceTime?: number;
  m_penaltiesTime?: number;
};

export type F1FinalClassificationPacket = {
  m_header?: F1TimingHeader;
  m_numCars?: number;
  m_classificationData?: F1FinalClassificationEntry[];
};
