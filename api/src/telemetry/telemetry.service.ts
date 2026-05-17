import { Injectable } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { safeJsonify } from './sanitize.utils';
import { SessionTelemetryService } from './session-telemetry.service';

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
    const sessionResult = await this.sessionTelemetry.handlePacket(
      eventName,
      data,
    );

    const sanitizedPayload = safeJsonify(data);
    this.gateway.broadcast(eventName, sanitizedPayload);

    if (sessionResult.finishedSessionId) {
      this.gateway.broadcast('sessionFinished', {
        sessionId: sessionResult.finishedSessionId,
      });
    }
  }
}
