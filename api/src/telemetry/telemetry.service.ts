import { Injectable } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { safeJsonify } from './sanitize.utils';
import { SessionTelemetryService } from 'src/telemetry/session-telemetry.service';

@Injectable()
export class TelemetryService {
  constructor(
    private readonly gateway: TelemetryGateway,
    private readonly sessionTelemetry: SessionTelemetryService,
  ) {}

  async handleIncomingTelemetryPacket(
    eventName: string,
    data: any,
  ): Promise<void> {
    await this.sessionTelemetry.handlePacket(eventName, data);

    const sanitizedJson = safeJsonify(data);
    this.gateway.broadcast(eventName, sanitizedJson);
  }
}
