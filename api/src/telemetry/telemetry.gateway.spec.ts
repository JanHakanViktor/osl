import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { TelemetryGateway } from './telemetry.gateway';

describe('TelemetryGateway', () => {
  let gateway: TelemetryGateway;
  let mockServer: { emit: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelemetryGateway],
    }).compile();

    gateway = module.get<TelemetryGateway>(TelemetryGateway);

    mockServer = {
      emit: jest.fn(),
    };
    gateway.server = mockServer as unknown as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should broadcast event to clients', () => {
    const payload = { speed: 200 };

    gateway.broadcast('carTelemetry', payload);

    expect(mockServer.emit).toHaveBeenCalledWith('carTelemetry', payload);
  });

  it('should handle connections without error', () => {
    const mockClient = { id: '123' } as Partial<Socket> as Socket;
    expect(() => gateway.handleConnection(mockClient)).not.toThrow();
  });

  it('should handle disconnections without error', () => {
    const mockClient = { id: '123' } as Partial<Socket> as Socket;
    expect(() => gateway.handleDisconnect(mockClient)).not.toThrow();
  });
});
