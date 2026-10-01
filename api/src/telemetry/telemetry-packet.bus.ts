import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export type RelayedTelemetryPacket = {
  type: string;
  data: unknown;
};

/**
 * In-process stream of every packet the relay forwards, so other modules can
 * react to live telemetry without the telemetry module depending on them.
 */
@Injectable()
export class TelemetryPacketBus {
  private readonly packetSubject = new Subject<RelayedTelemetryPacket>();

  readonly packets$: Observable<RelayedTelemetryPacket> =
    this.packetSubject.asObservable();

  publish(packet: RelayedTelemetryPacket): void {
    this.packetSubject.next(packet);
  }
}
