import type { HeatLap } from '../domain/tournament.types';
import {
  readGameSessionUid,
  readPlayerEntry,
  type HeatCarTelemetryPacket,
  type HeatLapDataEntry,
  type HeatLapDataPacket,
} from './f1-packets';

/** A lap first seen this close to its start still counts as a full attempt. */
const LAP_START_GRACE_MS = 5_000;
const IN_LAP = 2;
const OUT_LAP = 3;

export type HeatTrackerSnapshot = {
  gameSessionUid: string | null;
  laps: HeatLap[];
  topSpeedKmh: number;
};

type LapInProgress = {
  lapNumber: number;
  /** True when the driver started this lap during the heat. */
  countable: boolean;
  invalid: boolean;
  pitLap: boolean;
  sector1Ms: number | null;
  sector2Ms: number | null;
  lastSeenLapTimeMs: number;
};

function combineSectorMs(minutes?: number, msPart?: number): number | null {
  const total = (minutes ?? 0) * 60_000 + (msPart ?? 0);
  return total > 0 ? total : null;
}

function readSectors(entry: HeatLapDataEntry) {
  return {
    sector1Ms: combineSectorMs(
      entry.m_sector1TimeMinutesPart,
      entry.m_sector1TimeMSPart,
    ),
    sector2Ms: combineSectorMs(
      entry.m_sector2TimeMinutesPart,
      entry.m_sector2TimeMSPart,
    ),
  };
}

function isPitLap(entry: HeatLapDataEntry): boolean {
  return entry.m_driverStatus === IN_LAP || entry.m_driverStatus === OUT_LAP;
}

function completeSectors(
  lapTimeMs: number,
  sector1Ms: number | null,
  sector2Ms: number | null,
): number[] {
  if (sector1Ms == null || sector2Ms == null) return [];

  const sector3Ms = lapTimeMs - sector1Ms - sector2Ms;
  return sector3Ms > 0 ? [sector1Ms, sector2Ms, sector3Ms] : [];
}

/**
 * Turns the player's lap data packets into the laps of one tournament heat.
 *
 * Only laps the driver started during the heat count, out and in laps are not
 * timed attempts, a lap stays invalid once the game invalidated it, and a lap
 * completed again after a flashback replaces the earlier attempt.
 */
export class HeatLapTracker {
  private gameSessionUid: string | null;
  private readonly laps: HeatLap[];
  private topSpeedKmh: number;
  private currentLap: LapInProgress | null = null;
  private readonly lapsSeenFromStart = new Set<string>();

  constructor(initial: HeatTrackerSnapshot) {
    this.gameSessionUid = initial.gameSessionUid;
    this.laps = [...initial.laps];
    this.topSpeedKmh = initial.topSpeedKmh;
  }

  snapshot(): HeatTrackerSnapshot {
    return {
      gameSessionUid: this.gameSessionUid,
      laps: [...this.laps],
      topSpeedKmh: this.topSpeedKmh,
    };
  }

  /** Returns the lap this packet completed, if any. */
  handleLapData(packet: HeatLapDataPacket): HeatLap | null {
    const uid = readGameSessionUid(packet.m_header);
    const entry = readPlayerEntry(packet.m_header, packet.m_lapData);
    const lapNumber = entry?.m_currentLapNum;

    if (!uid || !entry || !lapNumber || lapNumber < 1) return null;

    if (uid !== this.gameSessionUid) {
      this.gameSessionUid = uid;
      this.currentLap = null;
    }

    const lapTimeMs = entry.m_currentLapTimeInMS ?? 0;
    const inProgress = this.currentLap;

    if (inProgress?.lapNumber === lapNumber) {
      this.updateLap(inProgress, entry, lapTimeMs);
      return null;
    }

    const crossedLine = inProgress?.lapNumber === lapNumber - 1;
    const completedLap = crossedLine
      ? this.recordLap(inProgress, uid, entry)
      : null;
    const sawStart =
      crossedLine ||
      lapTimeMs <= LAP_START_GRACE_MS ||
      this.lapsSeenFromStart.has(`${uid}:${lapNumber}`);

    this.currentLap = this.beginLap(uid, lapNumber, entry, lapTimeMs, sawStart);
    return completedLap;
  }

  /** Returns true when the packet set a new heat top speed. */
  handleCarTelemetry(packet: HeatCarTelemetryPacket): boolean {
    const uid = readGameSessionUid(packet.m_header);
    const speed = readPlayerEntry(
      packet.m_header,
      packet.m_carTelemetryData,
    )?.m_speed;

    if (!uid || uid !== this.gameSessionUid || typeof speed !== 'number') {
      return false;
    }
    if (speed <= this.topSpeedKmh) return false;

    this.topSpeedKmh = speed;
    return true;
  }

  private beginLap(
    uid: string,
    lapNumber: number,
    entry: HeatLapDataEntry,
    lapTimeMs: number,
    sawStart: boolean,
  ): LapInProgress {
    if (sawStart) this.lapsSeenFromStart.add(`${uid}:${lapNumber}`);

    return {
      lapNumber,
      countable: sawStart,
      invalid: entry.m_currentLapInvalid === 1,
      pitLap: isPitLap(entry),
      ...readSectors(entry),
      lastSeenLapTimeMs: lapTimeMs,
    };
  }

  private updateLap(
    lap: LapInProgress,
    entry: HeatLapDataEntry,
    lapTimeMs: number,
  ): void {
    const sectors = readSectors(entry);
    const rewound = lapTimeMs < lap.lastSeenLapTimeMs;

    if (rewound) {
      // A flashback or lap restart: trust the game's view of this lap again.
      lap.invalid = entry.m_currentLapInvalid === 1;
      lap.pitLap = isPitLap(entry);
      lap.sector1Ms = sectors.sector1Ms;
      lap.sector2Ms = sectors.sector2Ms;
      lap.countable ||= lapTimeMs <= LAP_START_GRACE_MS;
    } else {
      lap.invalid ||= entry.m_currentLapInvalid === 1;
      lap.pitLap ||= isPitLap(entry);
      lap.sector1Ms = sectors.sector1Ms ?? lap.sector1Ms;
      lap.sector2Ms = sectors.sector2Ms ?? lap.sector2Ms;
    }

    lap.lastSeenLapTimeMs = lapTimeMs;
  }

  private recordLap(
    lap: LapInProgress,
    uid: string,
    entry: HeatLapDataEntry,
  ): HeatLap | null {
    const lapTimeMs = entry.m_lastLapTimeInMS ?? 0;
    if (!lap.countable || lap.pitLap || lapTimeMs <= 0) return null;

    const heatLap: HeatLap = {
      gameSessionUid: uid,
      lapNumber: lap.lapNumber,
      lapTimeMs,
      sectorsMs: completeSectors(lapTimeMs, lap.sector1Ms, lap.sector2Ms),
      valid: !lap.invalid,
    };
    const existingIndex = this.laps.findIndex(
      (recorded) =>
        recorded.gameSessionUid === uid && recorded.lapNumber === lap.lapNumber,
    );

    if (existingIndex === -1) {
      this.laps.push(heatLap);
    } else {
      this.laps[existingIndex] = heatLap;
    }

    return heatLap;
  }
}
