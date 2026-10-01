import { Injectable } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { safeJsonify } from './sanitize.utils';
import { SessionTelemetryService } from './session-telemetry.service';
import { TelemetryPacketBus } from './telemetry-packet.bus';

@Injectable()
export class TelemetryService {
  constructor(
    private readonly gateway: TelemetryGateway,
    private readonly sessionTelemetry: SessionTelemetryService,
    private readonly packetBus: TelemetryPacketBus,
  ) {}

  async handleIncomingTelemetryPacket(
    eventName: string,
    data: any,
  ): Promise<void> {
    const sessionResult = await this.sessionTelemetry.handlePacket(
      eventName,
      data,
    );

    const sanitizedPayload = safeJsonify(data);
    this.gateway.broadcast(eventName, sanitizedPayload);
    this.packetBus.publish({ type: eventName, data });

    if (sessionResult.finishedSessionId) {
      this.gateway.broadcast('sessionFinished', {
        sessionId: sessionResult.finishedSessionId,
      });
    }
  }
}
