import { describe, expect, it, jest } from '@jest/globals';
import type { SessionTelemetryService } from './session-telemetry.service';
import type { TelemetryGateway } from './telemetry.gateway';
import {
  TelemetryPacketBus,
  type RelayedTelemetryPacket,
} from './telemetry-packet.bus';
import { TelemetryService } from './telemetry.service';

describe('TelemetryService', () => {
  it('publishes every relayed packet for other modules to observe', async () => {
    const packetBus = new TelemetryPacketBus();
    const published: RelayedTelemetryPacket[] = [];
    packetBus.packets$.subscribe((packet) => published.push(packet));
    const sessionTelemetry = {
      handlePacket: jest.fn(() => Promise.resolve({})),
    };
    const gateway = { broadcast: jest.fn() };
    const service = new TelemetryService(
      gateway as unknown as TelemetryGateway,
      sessionTelemetry as unknown as SessionTelemetryService,
      packetBus,
    );
    const packet = { m_header: { m_sessionUID: '42' } };

    await service.handleIncomingTelemetryPacket('lapData', packet);

    expect(gateway.broadcast).toHaveBeenCalledWith('lapData', packet);
    expect(published).toEqual([{ type: 'lapData', data: packet }]);
  });
});
