import type { LiveSessionDetails } from "../../types/session.types";
import {
  buildFastestLapDeltaLabel,
  buildSectorDisplays,
  calculateLapProgress,
  calculateLapsRemaining,
  countGameLapsCompleted,
  filterSessionLaps,
  findFastestLap,
  firstFiniteNumber,
  formatDuration,
  getLapDataSectors,
  mapHistoryLaps,
  mergeCompletedLaps,
} from "./telemetryFormatters";
import type {
  CarTelemetryPacket,
  CompletedLap,
  LapDataPacket,
  SectorDisplay,
  SessionHistoryPacket,
  SessionPacket,
} from "./telemetryTypes";

export type LiveTelemetryInput = {
  carTelemetry: CarTelemetryPacket | null;
  lapData: LapDataPacket | null;
  session: SessionPacket | null;
  playerSessionHistory: SessionHistoryPacket | null;
  liveLaps: CompletedLap[];
  heldSector3Ms: number | null;
};

/** Limits the dashboard's laps to the ones an OSL session recorded. */
export type SessionLapScope = {
  /** Game lap the session's recorded laps start from; null shows none yet. */
  firstRecordedLapNumber: number | null;
};

export type LiveTelemetryView = {
  speed?: number;
  gear?: number;
  throttle?: number;
  brake?: number;
  currentLapMs: number | null;
  currentLapNumber?: number;
  fastestLapMs: number | null;
  fastestLapDeltaLabel: string | null;
  sectorDisplays: SectorDisplay[];
  completedLaps: CompletedLap[];
  /** Laps the game has completed, including any the session scope hides. */
  gameLapsCompleted: number;
  lapProgress: number | null;
  sessionElapsedSeconds: number | null;
};

export type LiveTarget = {
  label: string;
  value: string;
  visible: boolean;
};

function getPlayerIndex(input: LiveTelemetryInput): number {
  return (
    input.lapData?.m_header?.m_playerCarIndex ??
    input.carTelemetry?.m_header?.m_playerCarIndex ??
    input.session?.m_header?.m_playerCarIndex ??
    0
  );
}

function getHistoryLaps(history: SessionHistoryPacket | null): CompletedLap[] {
  const lapCount = history?.m_numLaps;
  const historyData =
    typeof lapCount === "number" && lapCount > 0
      ? history?.m_lapHistoryData?.slice(0, lapCount)
      : history?.m_lapHistoryData;

  return mapHistoryLaps(historyData ?? []);
}

/** The player's lap number in the game, which changes on every new lap. */
export function readCurrentLapNumber(
  input: LiveTelemetryInput,
): number | undefined {
  return input.lapData?.m_lapData?.[getPlayerIndex(input)]?.m_currentLapNum;
}

/**
 * Derives everything the live dashboard shows from the latest packets.
 * Without a session scope, every lap of the game session is shown.
 */
export function buildLiveTelemetryView(
  input: LiveTelemetryInput,
  sessionScope?: SessionLapScope,
): LiveTelemetryView {
  const playerIndex = getPlayerIndex(input);
  const playerLap = input.lapData?.m_lapData?.[playerIndex] ?? null;
  const playerTelemetry =
    input.carTelemetry?.m_carTelemetryData?.[playerIndex] ?? null;
  const bestLapMs = firstFiniteNumber(
    playerLap?.m_bestLapTimeInMS,
    playerLap?.m_bestLapTimeInMs,
  );
  const currentSectors = getLapDataSectors(playerLap);
  const visibleSectors = [
    currentSectors[0],
    currentSectors[1],
    currentSectors[2] ?? input.heldSector3Ms,
  ];

  const gameLaps = mergeCompletedLaps(
    getHistoryLaps(input.playerSessionHistory),
    input.liveLaps,
  );
  const completedLaps = sessionScope
    ? filterSessionLaps(gameLaps, sessionScope.firstRecordedLapNumber)
    : gameLaps;
  const fastestCompletedLap = findFastestLap(completedLaps);
  const fastestLapMs = fastestCompletedLap?.lapTimeMs ?? bestLapMs;
  const previousFastestLap = fastestCompletedLap
    ? findFastestLap(
        completedLaps.filter(
          (lap) => lap.lapNumber < fastestCompletedLap.lapNumber,
        ),
      )
    : null;

  return {
    speed: playerTelemetry?.m_speed,
    gear: playerTelemetry?.m_gear,
    throttle: playerTelemetry?.m_throttle,
    brake: playerTelemetry?.m_brake,
    currentLapMs: firstFiniteNumber(
      playerLap?.m_currentLapTimeInMS,
      playerLap?.m_currentLapTimeInMs,
    ),
    currentLapNumber: playerLap?.m_currentLapNum,
    fastestLapMs,
    fastestLapDeltaLabel: buildFastestLapDeltaLabel({
      fastestLapMs,
      previousFastestLapMs: previousFastestLap?.lapTimeMs,
    }),
    sectorDisplays: buildSectorDisplays(
      visibleSectors,
      completedLaps,
      fastestCompletedLap,
    ),
    completedLaps,
    gameLapsCompleted: countGameLapsCompleted(
      playerLap?.m_currentLapNum,
      gameLaps.length,
    ),
    lapProgress: calculateLapProgress(
      playerLap?.m_lapDistance,
      input.session?.m_trackLength,
    ),
    sessionElapsedSeconds: input.session?.m_header?.m_sessionTime ?? null,
  };
}

/** The "laps / time remaining" target for an OSL session. */
export function buildSessionTarget(
  liveSession: LiveSessionDetails | undefined,
  view: LiveTelemetryView,
  session: SessionPacket | null,
): LiveTarget {
  const { sessionElapsedSeconds } = view;
  // LAPS sessions count from the session start, like the API's auto-finish;
  // other sessions count down the game's own race distance.
  const lapsRemaining =
    liveSession?.limitType === "LAPS"
      ? calculateLapsRemaining(liveSession.lapLimit, liveSession.lapsCompleted)
      : calculateLapsRemaining(session?.m_totalLaps, view.gameLapsCompleted);
  const remainingSeconds = firstFiniteNumber(
    session?.m_sessionTimeLeft,
    liveSession?.limitType === "TIME" &&
      liveSession.timeLimitSeconds != null &&
      sessionElapsedSeconds != null
      ? liveSession.timeLimitSeconds - sessionElapsedSeconds
      : session?.m_sessionDuration != null && sessionElapsedSeconds != null
        ? session.m_sessionDuration - sessionElapsedSeconds
        : null,
  );

  if (lapsRemaining != null) {
    return {
      label: "Laps Remaining",
      value: String(lapsRemaining),
      visible: true,
    };
  }

  if (liveSession?.limitType === "LAPS") {
    return { label: "Laps Remaining", value: "--", visible: true };
  }

  return {
    label: "Time Remaining",
    value: formatDuration(remainingSeconds),
    visible: liveSession?.limitType === "TIME" || remainingSeconds != null,
  };
}
