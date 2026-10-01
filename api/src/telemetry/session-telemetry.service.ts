// src/telemetry/session-telemetry.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from '../session/session.schema';
import { SessionLapTracker } from './session-lap-tracker';

type TelemetryPacket = {
  m_header?: {
    m_playerCarIndex?: number;
    m_sessionTime?: number;
  };
  m_lapData?: LapTelemetry[];
  m_carTelemetryData?: CarTelemetry[];
  m_carIdx?: number;
  m_numLaps?: number;
  m_lapHistoryData?: LapHistoryTelemetry[];
};

type LapTelemetry = {
  m_lastLapTimeInMS?: number;
  m_lastLapTimeInMs?: number;
  m_currentLapNum?: number;
  m_currentLapInvalid?: number;
  m_sector1TimeMSPart?: number;
  m_sector1TimeMsPart?: number;
  m_sector1TimeMinutesPart?: number;
  m_sector2TimeMSPart?: number;
  m_sector2TimeMsPart?: number;
  m_sector2TimeMinutesPart?: number;
};

type CarTelemetry = {
  m_speed?: number;
};

type LapHistoryTelemetry = {
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

/** Game lap numbers the session recorded in the current game session. */
type RecordedLapRange = {
  firstLapNum: number;
  lastLapNum: number;
};

type SessionTelemetryResult = {
  finishedSessionId?: string;
};

@Injectable()
export class SessionTelemetryService {
  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
  ) {}

  private readonly logger = new Logger(SessionTelemetryService.name);
  private readonly sectorSnapshots = new Map<string, number[]>();
  private readonly lapTracker = new SessionLapTracker();

  async handlePacket(
    event: string,
    packet: unknown,
  ): Promise<SessionTelemetryResult> {
    const session = await this.findSessionForPacket(event);

    if (!session) {
      this.logger.debug('No active session found');
      return {};
    }

    if (!session.telemetry) {
      session.telemetry = {
        fastestLapMs: 0,
        fastestLapSectorsMs: [],
        topSpeedKmh: 0,
        cleanLapStreak: 0,
        bestCleanLapStreak: 0,
        totalCleanLaps: 0,
        totalLaps: 0,
        firstProcessedLapNum: 0,
        lastProcessedLapNum: 0,
      };
    }

    const telemetry = session.telemetry;
    let dirty = false;
    let lapsCompleted: number | null = null;
    let finishedSessionId: string | undefined;
    const sessionId = session._id.toString();

    const telemetryPacket = packet as TelemetryPacket;
    const playerIndex = telemetryPacket.m_header?.m_playerCarIndex ?? 0;

    if (event === 'sessionHistory') {
      if (
        typeof telemetryPacket.m_carIdx === 'number' &&
        telemetryPacket.m_carIdx !== playerIndex
      ) {
        return {};
      }

      const recordedLaps = this.getRecordedLapRange(telemetry);
      const fastestHistoryLap = recordedLaps
        ? this.findFastestHistoryLap(telemetryPacket, recordedLaps)
        : null;

      if (fastestHistoryLap) {
        telemetry.fastestLapMs = fastestHistoryLap.lapTime;
        telemetry.fastestLapSectorsMs = fastestHistoryLap.sectors;
        dirty = true;
      }
    }

    // LAP DATA
    if (event === 'lapData') {
      const lap = telemetryPacket.m_lapData?.[playerIndex];

      if (!lap) return {};

      const currentLapNum = lap.m_currentLapNum ?? 1;
      this.lapTracker.observe(
        sessionId,
        currentLapNum,
        lap.m_currentLapInvalid === 1,
      );

      const lapTime = this.firstNumber(
        lap.m_lastLapTimeInMS,
        lap.m_lastLapTimeInMs,
      );

      if (!lapTime) return {};

      const liveSectors = this.readAvailableSectors(lap);
      const liveSectorKey = this.getSectorSnapshotKey(sessionId, currentLapNum);

      if (liveSectors.length > 0) {
        const previousSectors = this.sectorSnapshots.get(liveSectorKey) ?? [];
        if (liveSectors.length >= previousSectors.length) {
          this.sectorSnapshots.set(liveSectorKey, liveSectors);
        }
      }

      // Only laps watched in progress are recorded, which skips laps finished
      // before the session started. lastProcessedLapNum is persisted, so a lap
      // whose save was overwritten by a concurrent packet is recorded again.
      const completedLapNum = currentLapNum - 1;
      const completedLap = this.lapTracker.findCompletedLap(
        sessionId,
        completedLapNum,
      );
      const isNewCompletedLap =
        completedLap !== null &&
        completedLapNum > 0 &&
        completedLapNum !== (telemetry.lastProcessedLapNum ?? 0);

      if (isNewCompletedLap) {
        const completedSectorKey = this.getSectorSnapshotKey(
          sessionId,
          completedLapNum,
        );
        const completedSectors = this.completeSectorBreakdown(
          lapTime,
          this.sectorSnapshots.get(completedSectorKey) ??
            this.readAvailableSectors(lap),
        );

        // Lap numbers only go back when the game session restarted. Its
        // history starts over too, so the recorded laps start a new range.
        if (
          !telemetry.firstProcessedLapNum ||
          completedLapNum < (telemetry.lastProcessedLapNum ?? 0)
        ) {
          telemetry.firstProcessedLapNum = completedLapNum;
        }

        telemetry.lastProcessedLapNum = completedLapNum;
        telemetry.totalLaps = (telemetry.totalLaps ?? 0) + 1;

        if (telemetry.fastestLapMs === 0 || lapTime < telemetry.fastestLapMs) {
          telemetry.fastestLapMs = lapTime;
          telemetry.fastestLapSectorsMs = completedSectors;
        }

        if (!completedLap.invalid) {
          telemetry.cleanLapStreak += 1;
          telemetry.totalCleanLaps += 1;

          if (telemetry.cleanLapStreak > telemetry.bestCleanLapStreak) {
            telemetry.bestCleanLapStreak = telemetry.cleanLapStreak;
          }

          dirty = true;
        } else if (telemetry.cleanLapStreak !== 0) {
          telemetry.cleanLapStreak = 0;
          dirty = true;
        }

        this.sectorSnapshots.delete(completedSectorKey);
      }

      if (isNewCompletedLap) {
        dirty = true;
      }

      lapsCompleted = telemetry.totalLaps ?? 0;
    }

    // CAR TELEMETRY
    if (event === 'carTelemetry') {
      const speed = this.firstNumber(
        telemetryPacket.m_carTelemetryData?.[playerIndex]?.m_speed,
      );

      if (typeof speed === 'number' && speed > telemetry.topSpeedKmh) {
        telemetry.topSpeedKmh = speed;
        dirty = true;
      }
    }

    // Session history still reaches sessions that finished in the last two
    // minutes; those must not be finished again.
    if (
      session.status === 'ACTIVE' &&
      this.hasReachedSessionLimit(session, telemetryPacket, lapsCompleted)
    ) {
      session.status = 'FINISHED';
      session.finishedAt = new Date();
      finishedSessionId = sessionId;
      dirty = true;
    }

    if (dirty) {
      session.markModified('telemetry');
      await session.save();
    }

    return { finishedSessionId };
  }

  private firstNumber(
    ...values: Array<number | null | undefined>
  ): number | undefined {
    return values.find(
      (value): value is number =>
        typeof value === 'number' && Number.isFinite(value),
    );
  }

  private async findSessionForPacket(event: string): Promise<Session | null> {
    const activeSession = await this.sessionModel
      .findOne({ status: 'ACTIVE' })
      .sort({ startedAt: 1, _id: 1 });

    if (activeSession || event !== 'sessionHistory') {
      return activeSession;
    }

    return this.sessionModel
      .findOne({
        status: 'FINISHED',
        finishedAt: { $gte: new Date(Date.now() - 120_000) },
      })
      .sort({ finishedAt: -1, _id: -1 });
  }

  private combineSectorMs(minutes?: number, msPart?: number): number {
    if (minutes == null && msPart == null) return 0;

    return (minutes ?? 0) * 60_000 + (msPart ?? 0);
  }

  private getSectorSnapshotKey(sessionId: string, lapNum: number): string {
    return `${sessionId}:${lapNum}`;
  }

  private readAvailableSectors(lap: LapTelemetry): number[] {
    const sector1 = this.combineSectorMs(
      lap.m_sector1TimeMinutesPart,
      this.firstNumber(lap.m_sector1TimeMSPart, lap.m_sector1TimeMsPart),
    );
    const sector2 = this.combineSectorMs(
      lap.m_sector2TimeMinutesPart,
      this.firstNumber(lap.m_sector2TimeMSPart, lap.m_sector2TimeMsPart),
    );

    return [sector1, sector2].filter((sectorMs) => sectorMs > 0);
  }

  private completeSectorBreakdown(
    lapTime: number,
    sectors: number[],
  ): number[] {
    const [sector1, sector2] = sectors;

    if (!sector1 || !sector2) {
      return [];
    }

    const sector3 = lapTime - sector1 - sector2;

    if (sector3 <= 0) {
      return [];
    }

    return [sector1, sector2, sector3];
  }

  private getRecordedLapRange(
    telemetry: Session['telemetry'],
  ): RecordedLapRange | null {
    const firstLapNum = telemetry.firstProcessedLapNum ?? 0;
    const lastLapNum = telemetry.lastProcessedLapNum ?? 0;

    if (firstLapNum < 1 || lastLapNum < firstLapNum) return null;

    return { firstLapNum, lastLapNum };
  }

  private findFastestHistoryLap(
    packet: TelemetryPacket,
    recordedLaps: RecordedLapRange,
  ): { lapTime: number; sectors: number[] } | null {
    const historyLength = packet.m_lapHistoryData?.length ?? 0;
    const lapCount =
      typeof packet.m_numLaps === 'number' && packet.m_numLaps > 0
        ? Math.min(packet.m_numLaps, historyLength)
        : historyLength;
    // m_lapHistoryData[i] holds lap i + 1. The game session's history also
    // has laps driven before the session started or after it finished.
    const history =
      packet.m_lapHistoryData?.slice(
        recordedLaps.firstLapNum - 1,
        Math.min(lapCount, recordedLaps.lastLapNum),
      ) ?? [];

    return history.reduce<{ lapTime: number; sectors: number[] } | null>(
      (best, lap) => {
        const lapTime = this.firstNumber(lap.m_lapTimeInMS, lap.m_lapTimeInMs);
        const sectors = this.readHistorySectors(lap);
        const lapIsValid =
          lap.m_lapValidBitFlags == null || (lap.m_lapValidBitFlags & 1) === 1;

        if (!lapIsValid || !lapTime || sectors.length !== 3) return best;
        if (!best || lapTime < best.lapTime) {
          return { lapTime, sectors };
        }

        return best;
      },
      null,
    );
  }

  private readHistorySectors(lap: LapHistoryTelemetry): number[] {
    const sector1 = this.combineSectorOrFlatMs(
      lap.m_sector1TimeMinutesPart,
      lap.m_sector1TimeMSPart,
      lap.m_sector1TimeInMS,
    );
    const sector2 = this.combineSectorOrFlatMs(
      lap.m_sector2TimeMinutesPart,
      lap.m_sector2TimeMSPart,
      lap.m_sector2TimeInMS,
    );
    const sector3 = this.combineSectorOrFlatMs(
      lap.m_sector3TimeMinutesPart,
      lap.m_sector3TimeMSPart,
      lap.m_sector3TimeInMS,
    );

    return [sector1, sector2, sector3].filter(
      (sectorMs): sectorMs is number =>
        typeof sectorMs === 'number' && sectorMs > 0,
    );
  }

  private combineSectorOrFlatMs(
    minutes?: number,
    msPart?: number,
    flatMs?: number,
  ): number | undefined {
    const combined = this.combineSectorMs(minutes, msPart);

    if (combined > 0) return combined;
    return this.firstNumber(flatMs);
  }

  private hasReachedSessionLimit(
    session: Session,
    packet: TelemetryPacket,
    lapsCompleted: number | null,
  ): boolean {
    if (session.limitType === 'TIME') {
      const sessionTime = packet.m_header?.m_sessionTime;
      return (
        typeof sessionTime === 'number' &&
        typeof session.timeLimitSeconds === 'number' &&
        session.timeLimitSeconds > 0 &&
        sessionTime >= session.timeLimitSeconds
      );
    }

    if (session.limitType === 'LAPS') {
      return (
        typeof lapsCompleted === 'number' &&
        typeof session.lapLimit === 'number' &&
        session.lapLimit > 0 &&
        lapsCompleted >= session.lapLimit
      );
    }

    return false;
  }
}
