import type {
  CarLapHistory,
  CarLiveState,
  FinalResult,
  SessionClock,
  TimingDriver,
  TimingLap,
  TimingSessionInfo,
} from '../domain/timing.types';
import {
  readDriverStatus,
  readPitStatus,
  readResultStatus,
  readSafetyCarStatus,
  readSessionType,
  readTeam,
  readTyreCompound,
  readWeather,
} from './f1-timing-codes';
import type {
  F1FinalClassificationPacket,
  F1LapDataEntry,
  F1LapDataPacket,
  F1LapHistoryEntry,
  F1ParticipantsPacket,
  F1SessionHistoryPacket,
  F1SessionPacket,
  F1TimingHeader,
} from './f1-timing-packets';

/** 255 marks "not set" in the lap and stint fields that use it. */
const NOT_SET = 255;

const LAP_VALID_FLAG = 0x01;
const SECTOR_VALID_FLAGS = [0x02, 0x04, 0x08];

function positiveOrNull(value?: number): number | null {
  return typeof value === 'number' && value > 0 ? value : null;
}

function combineMs(minutes?: number, msPart?: number): number {
  return (minutes ?? 0) * 60_000 + (msPart ?? 0);
}

export function readSessionUid(header?: F1TimingHeader): string | null {
  const uid = header?.m_sessionUID;
  if (uid == null) return null;

  const value = String(uid);
  return value === '0' || value === '' ? null : value;
}

export function readPlayerCarIndex(header?: F1TimingHeader): number | null {
  const index = header?.m_playerCarIndex;
  return typeof index === 'number' && index !== NOT_SET ? index : null;
}

export function readSessionInfo(packet: F1SessionPacket): TimingSessionInfo {
  const sessionType = readSessionType(packet.m_sessionType);
  const trackId = packet.m_trackId;

  return {
    sessionKind: sessionType.kind,
    sessionName: sessionType.name,
    f1TrackId: typeof trackId === 'number' && trackId >= 0 ? trackId : null,
    trackLengthM: positiveOrNull(packet.m_trackLength),
    totalLaps: positiveOrNull(packet.m_totalLaps),
    weather: readWeather(packet.m_weather),
    trackTemperatureC: packet.m_trackTemperature ?? 0,
    airTemperatureC: packet.m_airTemperature ?? 0,
    safetyCar: readSafetyCarStatus(packet.m_safetyCarStatus),
    isOnline: packet.m_networkGame === 1,
  };
}

export function readSessionClock(packet: F1SessionPacket): SessionClock {
  return {
    sessionTimeSeconds: packet.m_header?.m_sessionTime ?? 0,
    timeLeftSeconds: packet.m_sessionTimeLeft ?? null,
  };
}

/** One entry per car index; cars past the active count are null. */
export function readDrivers(
  packet: F1ParticipantsPacket,
): Array<TimingDriver | null> {
  const participants = packet.m_participants ?? [];
  const activeCars = packet.m_numActiveCars ?? participants.length;

  return participants.map((participant, carIndex) => {
    if (carIndex >= activeCars) return null;

    const team = readTeam(participant.m_teamId);
    return {
      name: (participant.m_name ?? '').trim(),
      raceNumber: positiveOrNull(participant.m_raceNumber),
      teamId: team.teamId,
      teamName: team.name,
      isAi: participant.m_aiControlled === 1,
    };
  });
}

function readCarLiveState(entry: F1LapDataEntry): CarLiveState | null {
  const resultStatus = readResultStatus(entry.m_resultStatus);
  if (!resultStatus) return null;

  const hasSpeedTrap =
    entry.m_speedTrapFastestLap != null &&
    entry.m_speedTrapFastestLap !== NOT_SET;

  return {
    position: entry.m_carPosition ?? 0,
    lapNumber: entry.m_currentLapNum ?? 0,
    lapDistanceM: entry.m_lapDistance ?? 0,
    currentLapTimeMs: entry.m_currentLapTimeInMS ?? 0,
    currentLapInvalid: entry.m_currentLapInvalid === 1,
    sector: entry.m_sector === 2 ? 3 : entry.m_sector === 1 ? 2 : 1,
    pitStatus: readPitStatus(entry.m_pitStatus),
    driverStatus: readDriverStatus(entry.m_driverStatus),
    resultStatus,
    gapToLeaderMs: combineMs(
      entry.m_deltaToRaceLeaderMinutesPart,
      entry.m_deltaToRaceLeaderMSPart,
    ),
    intervalMs: combineMs(
      entry.m_deltaToCarInFrontMinutesPart,
      entry.m_deltaToCarInFrontMSPart,
    ),
    gridPosition: positiveOrNull(entry.m_gridPosition),
    pitStops: entry.m_numPitStops ?? 0,
    penaltiesSeconds: entry.m_penalties ?? 0,
    warnings: entry.m_totalWarnings ?? 0,
    cornerCuttingWarnings: entry.m_cornerCuttingWarnings ?? 0,
    speedTrapKmh: hasSpeedTrap
      ? positiveOrNull(entry.m_speedTrapFastestSpeed)
      : null,
  };
}

/** One entry per car index; unused car slots are null. */
export function readCarLiveStates(
  packet: F1LapDataPacket,
): Array<CarLiveState | null> {
  return (packet.m_lapData ?? []).map(readCarLiveState);
}

function readHistoryLap(
  entry: F1LapHistoryEntry,
  lapNumber: number,
): TimingLap | null {
  const lapTimeMs = entry.m_lapTimeInMS ?? 0;
  if (lapTimeMs <= 0) return null;

  // A lap without validity flags counts as valid.
  const flags = entry.m_lapValidBitFlags;
  const sectorsMs = [
    combineMs(entry.m_sector1TimeMinutesPart, entry.m_sector1TimeMSPart),
    combineMs(entry.m_sector2TimeMinutesPart, entry.m_sector2TimeMSPart),
    combineMs(entry.m_sector3TimeMinutesPart, entry.m_sector3TimeMSPart),
  ].map((sectorMs) => (sectorMs > 0 ? sectorMs : null));

  return {
    lapNumber,
    lapTimeMs,
    sectorsMs,
    valid: flags == null || (flags & LAP_VALID_FLAG) !== 0,
    sectorsValid: SECTOR_VALID_FLAGS.map(
      (flag) => flags == null || (flags & flag) !== 0,
    ),
  };
}

/**
 * The completed laps and tyre stints of one car. The game cycles session
 * history through the cars, and the last lap entry is the lap in progress.
 */
export function readCarLapHistory(
  packet: F1SessionHistoryPacket,
): CarLapHistory | null {
  const carIndex = packet.m_carIdx;
  if (typeof carIndex !== 'number') return null;

  const lapEntries = (packet.m_lapHistoryData ?? []).slice(
    0,
    packet.m_numLaps ?? 0,
  );
  const stintEntries = (packet.m_tyreStintsHistoryData ?? []).slice(
    0,
    packet.m_numTyreStints ?? 0,
  );

  return {
    carIndex,
    laps: lapEntries
      .map((entry, index) => readHistoryLap(entry, index + 1))
      .filter((lap): lap is TimingLap => lap !== null),
    tyreStints: stintEntries.map((stint) => ({
      compound: readTyreCompound(stint.m_tyreVisualCompound),
      endLap:
        stint.m_endLap == null || stint.m_endLap === NOT_SET
          ? null
          : stint.m_endLap,
    })),
  };
}

/** One entry per car index; cars without a classified result are null. */
export function readFinalResults(
  packet: F1FinalClassificationPacket,
): Array<FinalResult | null> {
  const entries = (packet.m_classificationData ?? []).slice(
    0,
    packet.m_numCars ?? 0,
  );

  return entries.map((entry) => {
    const resultStatus = readResultStatus(entry.m_resultStatus);
    const position = positiveOrNull(entry.m_position);
    if (!resultStatus || position == null) return null;

    const totalRaceTimeSeconds = positiveOrNull(entry.m_totalRaceTime);
    return {
      position,
      points: entry.m_points ?? 0,
      lapsCompleted: entry.m_numLaps ?? 0,
      gridPosition: positiveOrNull(entry.m_gridPosition),
      pitStops: entry.m_numPitStops ?? 0,
      resultStatus,
      bestLapMs: positiveOrNull(entry.m_bestLapTimeInMS),
      totalRaceTimeMs:
        totalRaceTimeSeconds == null
          ? null
          : Math.round(totalRaceTimeSeconds * 1000),
      penaltiesSeconds: entry.m_penaltiesTime ?? 0,
    };
  });
}
