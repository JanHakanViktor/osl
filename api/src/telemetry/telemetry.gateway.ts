import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  namespace: '/telemetry',
  cors: { origin: ['*'] },
})
export class TelemetryGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TelemetryGateway.name);
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log('🟢🟢🟢🟢 Client Connected', client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('🔴🔴🔴🔴 Client Disconnected', client.id);
  }

  broadcast(event: string, payload: unknown) {
    try {
      this.server.emit(event, payload);
    } catch (error) {
      console.error('🔴🔴🔴🔴 TelemetryGateway Broadcast error', error);
    }
  }
}
