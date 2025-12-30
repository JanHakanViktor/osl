// src/telemetry/session-telemetry.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from 'src/session/session.schema';

@Injectable()
export class SessionTelemetryService {
  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
  ) {}

  private readonly logger = new Logger(SessionTelemetryService.name);

  async handlePacket(event: string, packet: unknown): Promise<void> {
    const session = await this.sessionModel.findOne({ status: 'ACTIVE' });

    if (!session) {
      this.logger.debug('No active session found');
      return;
    }

    if (!session.telemetry) {
      session.telemetry = {
        fastestLapMs: 0,
        topSpeedKmh: 0,
        cleanLapStreak: 0,
        bestCleanLapStreak: 0,
        totalCleanLaps: 0,
      };
    }

    const telemetry = session.telemetry;
    let dirty = false;

    const header = (packet as { m_header?: { m_playerCarIndex?: number } })
      .m_header;
    const playerIndex = header?.m_playerCarIndex ?? 0;

    // LAP DATA
    if (event === 'lapData') {
      const lapData = (
        packet as {
          m_lapData?: Array<{
            m_lastLapTimeInMS?: number;
            m_currentLapInvalid?: number;
          }>;
        }
      ).m_lapData;

      const lap = lapData?.[playerIndex];
      if (!lap?.m_lastLapTimeInMS) return;

      const lapTime = lap.m_lastLapTimeInMS;
      const isCleanLap = lap.m_currentLapInvalid === 0;

      if (
        isCleanLap &&
        (telemetry.fastestLapMs === 0 || lapTime < telemetry.fastestLapMs)
      ) {
        telemetry.fastestLapMs = lapTime;
        dirty = true;
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
    }

    // CAR TELEMETRY
    if (event === 'carTelemetry') {
      const carData = (
        packet as {
          m_carTelemetryData?: Array<{ m_speed?: number }>;
        }
      ).m_carTelemetryData;

      const speed = carData?.[playerIndex]?.m_speed;

      if (typeof speed === 'number' && speed > telemetry.topSpeedKmh) {
        telemetry.topSpeedKmh = speed;
        dirty = true;
      }
    }

    if (dirty) {
      await session.save();
    }
  }
}
