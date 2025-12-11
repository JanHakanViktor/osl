import {
  constants,
  F1TelemetryClient,
} from '@deltazeroproduction/f1-udp-parser';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TelemetryGateway } from './telemetry.gateway';
import { safeJsonify } from './sanitize';

const { PACKETS } = constants;

@Injectable()
export class TelemetryService implements OnModuleInit, OnModuleDestroy {
  private client: F1TelemetryClient;

  constructor(private readonly gateway: TelemetryGateway) {
    this.client = new F1TelemetryClient({ port: 20777 });
  }

  onModuleInit() {
    this.client.on(PACKETS.carTelemetry, (data: any) =>
      this.handleIncomingPacket('carTelemetry', data),
    );
    this.client.on(PACKETS.lapData, (data: any) =>
      this.handleIncomingPacket('lapData', data),
    );
    this.client.on(PACKETS.session, (data: any) =>
      this.handleIncomingPacket('session', data),
    );

    this.client.start();
  }

  onModuleDestroy() {
    try {
      this.client.stop();
      console.log('🔴🔴🔴🔴 Telemetry Client Exited');
    } catch (error) {
      console.log(error);
    }
  }

  private handleIncomingPacket(eventName: string, data: any) {
    try {
      const sanitizedJson = safeJsonify(data);
      this.gateway.broadcast(eventName, sanitizedJson);
    } catch (error) {
      console.log(`Error handling F1 packet [${eventName}]`, error);
    }
  }
}
