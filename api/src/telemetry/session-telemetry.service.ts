// src/telemetry/session-telemetry.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from '../session/session.schema';

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
        lastProcessedLapNum: 0,
      };
    }

    const telemetry = session.telemetry;
    let dirty = false;
    let completedLapNum: number | null = null;
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

      const fastestHistoryLap = this.findFastestHistoryLap(telemetryPacket);

      if (fastestHistoryLap) {
        telemetry.fastestLapMs = fastestHistoryLap.lapTime;
        telemetry.fastestLapSectorsMs = fastestHistoryLap.sectors;
        dirty = true;
      }
    }

    // LAP DATA
    if (event === 'lapData') {
      const lap = telemetryPacket.m_lapData?.[playerIndex];
      const lapTime = this.firstNumber(
        lap?.m_lastLapTimeInMS,
        lap?.m_lastLapTimeInMs,
      );

      if (!lap || !lapTime) return {};

      const isCleanLap = lap.m_currentLapInvalid === 0;
      const currentLapNum = lap.m_currentLapNum ?? 1;
      const liveSectors = this.readAvailableSectors(lap);
      const liveSectorKey = this.getSectorSnapshotKey(sessionId, currentLapNum);

      if (liveSectors.length > 0) {
        const previousSectors = this.sectorSnapshots.get(liveSectorKey) ?? [];
        if (liveSectors.length >= previousSectors.length) {
          this.sectorSnapshots.set(liveSectorKey, liveSectors);
        }
      }

      completedLapNum = Math.max(currentLapNum - 1, 0);
      const isNewCompletedLap =
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

        telemetry.lastProcessedLapNum = completedLapNum;

        if (
          telemetry.fastestLapMs === 0 ||
          lapTime < telemetry.fastestLapMs
        ) {
          telemetry.fastestLapMs = lapTime;
          telemetry.fastestLapSectorsMs = completedSectors;
        }

        if (isCleanLap) {
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

    if (this.hasReachedSessionLimit(session, telemetryPacket, completedLapNum)) {
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

  private completeSectorBreakdown(lapTime: number, sectors: number[]): number[] {
    const sector1 = sectors[0] ?? 0;
    const sector2 = sectors[1] ?? 0;
    const sector3 = lapTime - sector1 - sector2;

    return [sector1, sector2, sector3].filter((sectorMs) => sectorMs > 0);
  }

  private findFastestHistoryLap(
    packet: TelemetryPacket,
  ): { lapTime: number; sectors: number[] } | null {
    const historyLength = packet.m_lapHistoryData?.length ?? 0;
    const lapCount =
      typeof packet.m_numLaps === 'number' && packet.m_numLaps > 0
        ? Math.min(packet.m_numLaps, historyLength)
        : historyLength;
    const history = packet.m_lapHistoryData?.slice(0, lapCount) ?? [];

    return history.reduce<{ lapTime: number; sectors: number[] } | null>(
      (best, lap) => {
        const lapTime = this.firstNumber(
          lap.m_lapTimeInMS,
          lap.m_lapTimeInMs,
        );
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
    completedLapNum: number | null,
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
        typeof completedLapNum === 'number' &&
        typeof session.lapLimit === 'number' &&
        session.lapLimit > 0 &&
        completedLapNum >= session.lapLimit
      );
    }

    return false;
  }
}
