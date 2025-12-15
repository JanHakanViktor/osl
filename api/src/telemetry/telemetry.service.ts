import { Injectable } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { safeJsonify } from './sanitize';

@Injectable()
export class TelemetryService {
  constructor(private readonly gateway: TelemetryGateway) {}

  handleIncomingPacket(eventName: string, data: any) {
    try {
      const sanitizedJson = safeJsonify(data);
      this.gateway.broadcast(eventName, sanitizedJson);
    } catch (error) {
      console.log(`Error handling F1 packet [${eventName}]`, error);
    }
  }
}
