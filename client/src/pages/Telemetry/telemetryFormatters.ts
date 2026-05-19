import type {
  CompletedLap,
  LapData,
  LapHistoryEntry,
  SectorDisplay,
  SectorStatus,
} from "./telemetryTypes";

export const F1_SECTOR_COLORS: Record<SectorStatus, string> = {
  purple: "#A000FF",
  green: "#00E701",
  yellow: "#FFF200",
  muted: "rgba(255, 255, 255, 0.12)",
};

export function firstFiniteNumber(
  ...values: Array<number | null | undefined>
): number | null {
  return (
    values.find(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    ) ?? null
  );
}

export function formatLapTime(ms?: number | null): string {
  if (ms == null || !Number.isFinite(ms) || ms <= 0) return "--:--.---";

  const totalMs = Math.max(0, Math.round(ms));
  const totalSeconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = totalMs % 1000;

  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(
    milliseconds,
  ).padStart(3, "0")}`;
}

export function formatSessionClock(seconds?: number | null): string {
  if (seconds == null || !Number.isFinite(seconds)) return "--:--";

  return formatDuration(seconds);
}

export function formatDuration(seconds?: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) {
    return "--:--";
  }

  const roundedSeconds = Math.round(seconds);
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const remainingSeconds = roundedSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function combineSectorMs(
  minutes?: number | null,
  msPart?: number | null,
): number | null {
  if (minutes == null && msPart == null) return null;

  return (minutes ?? 0) * 60_000 + (msPart ?? 0);
}

export function combineSectorOrFlatMs(
  minutes?: number | null,
  msPart?: number | null,
  flatMs?: number | null,
): number | null {
  const combined = combineSectorMs(minutes, msPart);

  if (combined != null && combined > 0) return combined;
  return firstFiniteNumber(flatMs);
}

export function getLapDataSectors(lap?: LapData | null): [
  number | null,
  number | null,
  number | null,
] {
  if (!lap) return [null, null, null];

  const sector1 = combineSectorMs(
    lap.m_sector1TimeMinutesPart,
    firstFiniteNumber(lap.m_sector1TimeMSPart, lap.m_sector1TimeMsPart),
  );
  const sector2 = combineSectorMs(
    lap.m_sector2TimeMinutesPart,
    firstFiniteNumber(lap.m_sector2TimeMSPart, lap.m_sector2TimeMsPart),
  );

  return [sector1, sector2, null];
}

export function mapHistoryLaps(entries: LapHistoryEntry[] = []): CompletedLap[] {
  return entries
    .map((lap, index) => {
      const sector1Ms = combineSectorOrFlatMs(
        lap.m_sector1TimeMinutesPart ?? lap.m_sector1TimeMinutes,
        lap.m_sector1TimeMSPart,
        lap.m_sector1TimeInMS,
      );
      const sector2Ms = combineSectorOrFlatMs(
        lap.m_sector2TimeMinutesPart ?? lap.m_sector2TimeMinutes,
        lap.m_sector2TimeMSPart,
        lap.m_sector2TimeInMS,
      );
      const sector3Ms = combineSectorOrFlatMs(
        lap.m_sector3TimeMinutesPart ?? lap.m_sector3TimeMinutes,
        lap.m_sector3TimeMSPart,
        lap.m_sector3TimeInMS,
      );
      const lapTimeMs = firstFiniteNumber(
        lap.m_lapTimeInMS,
        lap.m_lapTimeInMs,
      );
      const hasTiming =
        lapTimeMs != null || sector1Ms != null || sector2Ms != null || sector3Ms != null;

      if (!hasTiming) return null;

      return {
        lapNumber: index + 1,
        sector1Ms,
        sector2Ms,
        sector3Ms,
        lapTimeMs,
        valid:
          lap.m_lapValidBitFlags == null || (lap.m_lapValidBitFlags & 1) === 1,
      };
    })
    .filter((lap): lap is CompletedLap => lap != null);
}

export function findFastestLap(laps: CompletedLap[]): CompletedLap | null {
  return laps.reduce<CompletedLap | null>((fastest, lap) => {
    if (!lap.valid || lap.lapTimeMs == null || lap.lapTimeMs <= 0) {
      return fastest;
    }

    if (!fastest || fastest.lapTimeMs == null || lap.lapTimeMs < fastest.lapTimeMs) {
      return lap;
    }

    return fastest;
  }, null);
}

export function buildSectorDisplays(
  currentSectors: Array<number | null>,
  completedLaps: CompletedLap[],
  fastestLap: CompletedLap | null,
): SectorDisplay[] {
  const latestLap = completedLaps[completedLaps.length - 1] ?? null;
  const previousLap = completedLaps[completedLaps.length - 2] ?? null;
  const latestSectors = [
    latestLap?.sector1Ms ?? null,
    latestLap?.sector2Ms ?? null,
    latestLap?.sector3Ms ?? null,
  ];
  const previousSectors = [
    previousLap?.sector1Ms ?? null,
    previousLap?.sector2Ms ?? null,
    previousLap?.sector3Ms ?? null,
  ];
  const bestSectors = [
    fastestLap?.sector1Ms ?? null,
    fastestLap?.sector2Ms ?? null,
    fastestLap?.sector3Ms ?? null,
  ];

  return (["S1", "S2", "S3"] as const).map((label, index) => {
    const valueMs = currentSectors[index] ?? latestSectors[index] ?? null;
    const bestSector = bestSectors[index];
    const previousSector = previousSectors[index];

    let status: SectorStatus = "muted";
    if (valueMs != null) {
      if (bestSector != null && valueMs <= bestSector) {
        status = "purple";
      } else if (previousSector != null && valueMs < previousSector) {
        status = "green";
      } else {
        status = "yellow";
      }
    }

    return { label, valueMs, status };
  });
}
