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

  async handlePacket(event: string, packet: any): Promise<void> {
    const session = await this.sessionModel.findOne({
      status: 'ACTIVE',
    });

    if (!session) {
      this.logger.debug('No active session found');
      return;
    }

    const playerIndex = packet.m_header?.m_playerCarIndex ?? 0;

    if (event === 'lapData') {
      const lap = packet.m_lapData?.[playerIndex];

      if (!lap?.m_lastLapTimeInMS) return;

      if (
        !session.fastestLapMs ||
        lap.m_lastLapTimeInMS < session.fastestLapMs
      ) {
        session.fastestLapMs = lap.m_lastLapTimeInMS;
        await session.save();
      }
    }

    if (event === 'carTelemetry') {
      const car = packet.m_carTelemetryData?.[playerIndex];

      if (!car?.m_speed) return;

      session.topSpeedKmh = Math.max(session.topSpeedKmh, car.m_speed);

      await session.save();
    }
  }
}
