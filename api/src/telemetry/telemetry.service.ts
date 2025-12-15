import { Injectable } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { safeJsonify } from './sanitize.utils';

@Injectable()
export class TelemetryService {
  constructor(private readonly gateway: TelemetryGateway) {}

  handleIncomingTelemetryPacket(eventName: string, data: any) {
    const sanitizedJson = safeJsonify(data);
    this.gateway.broadcast(eventName, sanitizedJson);
  }
}
