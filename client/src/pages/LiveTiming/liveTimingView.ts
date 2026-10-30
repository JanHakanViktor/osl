import type {
  ResultStatus,
  TimingBoard,
  TimingCarFrame,
  TimingDriver,
  TimingFrame,
  TimingLap,
  TrackWeather,
  TyreCompound,
} from "../../types/liveTiming.types";
import { formatLapTime } from "../Telemetry/telemetryFormatters";
import type { SectorStatus } from "../Telemetry/telemetryTypes";

const TEAM_COLORS: Record<string, string> = {
  mercedes: "#27f4d2",
  ferrari: "#e8002d",
  redbull: "#3671c6",
  mclaren: "#ff8000",
  alpine: "#0093cc",
  aston: "#229971",
  vcarb: "#6692ff",
  haas: "#b6babd",
  sauber: "#52e252",
  williams: "#64c4ff",
};

const FALLBACK_TEAM_COLOR = "#9aa0aa";

export const TYRE_STYLES: Record<
  TyreCompound,
  { label: string; color: string }
> = {
  SOFT: { label: "S", color: "#ff3333" },
  MEDIUM: { label: "M", color: "#ffd12e" },
  HARD: { label: "H", color: "#f0f0f0" },
  INTERMEDIATE: { label: "I", color: "#43b02a" },
  WET: { label: "W", color: "#2f8fdd" },
};

const WEATHER_LABELS: Record<TrackWeather, string> = {
  CLEAR: "Clear",
  LIGHT_CLOUD: "Light cloud",
  OVERCAST: "Overcast",
  LIGHT_RAIN: "Light rain",
  HEAVY_RAIN: "Heavy rain",
  STORM: "Storm",
};

const RESULT_LABELS: Partial<Record<ResultStatus, string>> = {
  DID_NOT_FINISH: "DNF",
  DISQUALIFIED: "DSQ",
  NOT_CLASSIFIED: "NC",
  RETIRED: "RET",
};

/** Laps this much slower than a driver's best are left out of the chart. */
const CHART_OUTLIER_RATIO = 1.1;

export type TowerRow = {
  carIndex: number;
  position: number | null;
  name: string;
  raceNumber: number | null;
  teamName: string | null;
  color: string;
  isPlayer: boolean;
  isAi: boolean;
  gap: string;
  interval: string;
  lapNumber: number | null;
  lapsCompleted: number;
  lastLapMs: number | null;
  bestLapMs: number | null;
  hasFastestLap: boolean;
  tyre: TyreCompound | null;
  /** PIT, GARAGE or a result such as DNF; null while racing normally. */
  statusLabel: string | null;
  currentLapInvalid: boolean;
};

export type TrackMarker = {
  carIndex: number;
  position: number;
  progress: number;
  color: string;
  isPlayer: boolean;
  name: string;
};

export type LapTimeSeries = {
  carIndex: number;
  label: string;
  color: string;
  data: Array<number | null>;
};

export type TyreStintBar = {
  compound: TyreCompound | null;
  startLap: number;
  endLap: number;
};

type Gap = { gapToLeaderMs: number | null; intervalMs: number | null };

type GapLabels = { gap: string; interval: string };

export function teamColor(teamId: string | null): string {
  return (teamId && TEAM_COLORS[teamId]) || FALLBACK_TEAM_COLOR;
}

/** Dark text on light team colours, white text on dark ones. */
export function markerTextColor(hexColor: string): string {
  const [red, green, blue] = [1, 3, 5].map(
    (start) => parseInt(hexColor.slice(start, start + 2), 16) / 255,
  );
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

  return luminance > 0.55 ? "#0b0d14" : "#ffffff";
}

export function formatWeather(weather: TrackWeather | null): string | null {
  return weather ? WEATHER_LABELS[weather] : null;
}

/** Mixes a colour towards white, to tell team mates apart. */
function lighten(hexColor: string, amount: number): string {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hexColor.slice(start, start + 2), 16);
    return Math.round(value + (255 - value) * amount)
      .toString(16)
      .padStart(2, "0");
  });

  return `#${channels.join("")}`;
}

/** "29.512" below a minute, otherwise a full lap time. */
export function formatSectorTime(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms <= 0) return "--.---";
  return ms < 60_000 ? (ms / 1000).toFixed(3) : formatLapTime(ms);
}

/** "+0.250", "+1:02.345", or null without a gap. */
export function formatGap(ms: number | null): string | null {
  if (ms == null || !Number.isFinite(ms)) return null;

  const sign = ms < 0 ? "-" : "+";
  const totalMs = Math.round(Math.abs(ms));
  const minutes = Math.floor(totalMs / 60_000);
  const seconds = ((totalMs % 60_000) / 1000).toFixed(3);

  return minutes > 0
    ? `${sign}${minutes}:${seconds.padStart(6, "0")}`
    : `${sign}${seconds}`;
}

function toGapLabels(gap: Gap, position: number | null): GapLabels {
  const isLeader = position === 1 && !gap.gapToLeaderMs;

  return {
    gap: isLeader ? "Leader" : (formatGap(gap.gapToLeaderMs) ?? "—"),
    interval: isLeader ? "—" : (formatGap(gap.intervalMs) ?? "—"),
  };
}

function lapsLabel(laps: number): string {
  return `+${laps} Lap${laps === 1 ? "" : "s"}`;
}

/** Race gaps from the classification: total time with penalties, or laps down. */
function classificationGaps(drivers: TimingDriver[]): Map<number, GapLabels> {
  const classified = drivers
    .filter((driver) => driver.result)
    .sort((a, b) => a.result!.position - b.result!.position);
  const raceTimeMs = (driver: TimingDriver) =>
    driver.result?.totalRaceTimeMs == null
      ? null
      : driver.result.totalRaceTimeMs + driver.result.penaltiesSeconds * 1000;
  const winner = classified[0];

  return new Map(
    classified.map((driver, index): [number, GapLabels] => {
      const ahead = classified[index - 1];
      const lapsDown =
        winner.result!.lapsCompleted - driver.result!.lapsCompleted;
      const timeMs = raceTimeMs(driver);
      const winnerMs = raceTimeMs(winner);
      const aheadMs = ahead ? raceTimeMs(ahead) : null;

      if (driver === winner) {
        return [driver.carIndex, { gap: "Leader", interval: "—" }];
      }
      if (driver.result!.resultStatus !== "FINISHED") {
        return [driver.carIndex, { gap: "—", interval: "—" }];
      }
      if (lapsDown > 0) {
        return [driver.carIndex, { gap: lapsLabel(lapsDown), interval: "—" }];
      }

      return [
        driver.carIndex,
        toGapLabels(
          {
            gapToLeaderMs:
              timeMs != null && winnerMs != null ? timeMs - winnerMs : null,
            intervalMs:
              timeMs != null && aheadMs != null ? timeMs - aheadMs : null,
          },
          driver.result!.position,
        ),
      ];
    }),
  );
}

/** Practice and qualifying gaps, by best lap, in board order. */
function bestLapGaps(drivers: TimingDriver[]): Map<number, GapLabels> {
  const times = drivers
    .map((driver) => driver.stats.bestLap?.timeMs)
    .filter((timeMs): timeMs is number => timeMs != null);
  const leaderMs = times.length > 0 ? Math.min(...times) : null;

  return new Map(
    drivers.map((driver, index): [number, GapLabels] => {
      const timeMs = driver.stats.bestLap?.timeMs ?? null;
      const aheadMs = drivers[index - 1]?.stats.bestLap?.timeMs ?? null;

      return [
        driver.carIndex,
        toGapLabels(
          {
            gapToLeaderMs:
              timeMs != null && leaderMs != null ? timeMs - leaderMs : null,
            intervalMs:
              timeMs != null && aheadMs != null ? timeMs - aheadMs : null,
          },
          driver.position,
        ),
      ];
    }),
  );
}

/** Gaps when no live frame is available, such as for a saved session. */
function boardGaps(board: TimingBoard): Map<number, GapLabels> {
  return board.session.sessionKind === "RACE"
    ? classificationGaps(board.drivers)
    : bestLapGaps(board.drivers);
}

function statusLabel(
  driver: TimingDriver,
  carFrame: TimingCarFrame | undefined,
): string | null {
  const resultLabel = driver.status ? RESULT_LABELS[driver.status] : undefined;
  if (resultLabel) return resultLabel;
  if (!carFrame) return null;
  if (carFrame.driverStatus === "IN_GARAGE") return "GARAGE";
  if (carFrame.pitStatus !== "NONE") return "PIT";

  return null;
}

/**
 * The timing tower: the board's drivers, moved to their live positions while
 * the session runs. Once the classification is in, it decides the order.
 */
export function buildTowerRows(
  board: TimingBoard,
  frame: TimingFrame | null,
): TowerRow[] {
  const useFrame = frame !== null && !board.session.isFinished;
  const carFrames = new Map(
    (useFrame ? frame.cars : []).map((car) => [car.carIndex, car]),
  );
  const savedGaps = useFrame ? null : boardGaps(board);

  const rows = board.drivers.map((driver): TowerRow => {
    const carFrame = carFrames.get(driver.carIndex);
    const position = carFrame?.position || driver.position;
    const gaps = carFrame
      ? toGapLabels(carFrame, position)
      : (savedGaps?.get(driver.carIndex) ?? { gap: "—", interval: "—" });

    return {
      carIndex: driver.carIndex,
      position,
      name: driver.name,
      raceNumber: driver.raceNumber,
      teamName: driver.teamName,
      color: teamColor(driver.teamId),
      isPlayer: driver.isPlayer,
      isAi: driver.isAi,
      ...gaps,
      lapNumber: carFrame?.lapNumber ?? driver.currentLapNumber,
      lapsCompleted: driver.stats.lapsCompleted,
      lastLapMs: driver.stats.lastLapMs,
      bestLapMs: driver.stats.bestLap?.timeMs ?? null,
      hasFastestLap: board.fastestLap?.carIndex === driver.carIndex,
      tyre: driver.currentTyre,
      statusLabel: statusLabel(driver, carFrame),
      currentLapInvalid: carFrame?.currentLapInvalid ?? false,
    };
  });

  // Rows without a position keep the board's order, after the others.
  return rows.sort((a, b) => {
    if (a.position === b.position) return 0;
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    return a.position - b.position;
  });
}

/** Car dots for the track map, with the player and the leader drawn on top. */
export function buildTrackMarkers(
  board: TimingBoard,
  frame: TimingFrame | null,
): TrackMarker[] {
  const drivers = new Map(
    board.drivers.map((driver) => [driver.carIndex, driver]),
  );

  return (frame?.cars ?? [])
    .flatMap((car): TrackMarker[] => {
      const driver = drivers.get(car.carIndex);
      if (car.lapProgress == null || !driver) return [];

      return [
        {
          carIndex: car.carIndex,
          position: car.position,
          progress: car.lapProgress,
          color: teamColor(driver.teamId),
          isPlayer: driver.isPlayer,
          name: driver.name,
        },
      ];
    })
    .sort(
      (a, b) =>
        Number(a.isPlayer) - Number(b.isPlayer) || b.position - a.position,
    );
}

/** Sector colours as on the game's timing: overall best, personal best, other. */
export function lapSectorStatuses(
  lap: TimingLap,
  driver: TimingDriver,
  board: TimingBoard,
): SectorStatus[] {
  return lap.sectorsMs.map((sectorMs, index) => {
    if (sectorMs == null || !lap.sectorsValid[index]) return "muted";

    const overall = board.fastestSectors[index];
    if (
      overall?.carIndex === driver.carIndex &&
      overall.lapNumber === lap.lapNumber
    ) {
      return "purple";
    }

    return driver.stats.bestSectors[index]?.lapNumber === lap.lapNumber
      ? "green"
      : "yellow";
  });
}

/** Colour of a driver's best sector: purple when it is the session's best. */
export function bestSectorStatus(
  driver: TimingDriver,
  board: TimingBoard,
  sectorIndex: number,
): SectorStatus {
  if (!driver.stats.bestSectors[sectorIndex]) return "muted";

  return board.fastestSectors[sectorIndex]?.carIndex === driver.carIndex
    ? "purple"
    : "green";
}

/** The drivers the lap chart starts with: the top five and the player. */
export function defaultChartDrivers(board: TimingBoard): number[] {
  return board.drivers
    .filter((driver, index) => index < 5 || driver.isPlayer)
    .map((driver) => driver.carIndex);
}

/** Valid lap times per lap number, without pit and safety car laps. */
export function buildLapTimeSeries(
  drivers: TimingDriver[],
  carIndexes: number[],
): { lapNumbers: number[]; series: LapTimeSeries[] } {
  const selected = drivers.filter((driver) =>
    carIndexes.includes(driver.carIndex),
  );
  const lastLap = Math.max(
    0,
    ...selected.flatMap((driver) => driver.laps.map((lap) => lap.lapNumber)),
  );
  const lapNumbers = Array.from({ length: lastLap }, (_, index) => index + 1);
  const usedColors = new Set<string>();

  return {
    lapNumbers,
    series: selected.map((driver) => {
      const baseColor = teamColor(driver.teamId);
      const color = usedColors.has(baseColor)
        ? lighten(baseColor, 0.5)
        : baseColor;
      usedColors.add(baseColor);
      const bestMs = driver.stats.bestLap?.timeMs ?? Infinity;
      const lapTimes = new Map(
        driver.laps
          .filter(
            (lap) => lap.valid && lap.lapTimeMs <= bestMs * CHART_OUTLIER_RATIO,
          )
          .map((lap) => [lap.lapNumber, lap.lapTimeMs]),
      );

      return {
        carIndex: driver.carIndex,
        label: driver.name,
        color,
        data: lapNumbers.map((lapNumber) => lapTimes.get(lapNumber) ?? null),
      };
    }),
  };
}

/** A driver's tyre stints as lap ranges; the current stint runs to their lap. */
export function buildTyreStintBars(driver: TimingDriver): TyreStintBar[] {
  const currentLap = Math.max(
    driver.currentLapNumber ?? 0,
    driver.laps.at(-1)?.lapNumber ?? 0,
    1,
  );
  let startLap = 1;

  return driver.tyreStints.map((stint) => {
    const endLap = Math.max(stint.endLap ?? currentLap, startLap);
    const bar = { compound: stint.compound, startLap, endLap };
    startLap = endLap + 1;
    return bar;
  });
}
