import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { isAllowedCorsOrigin } from '../cors/cors-origin.guard';

export const TOURNAMENT_UPDATED_EVENT = 'tournamentUpdated';

/** Tells every open tournament screen to refetch after a change. */
@WebSocketGateway({
  namespace: '/tournaments',
  cors: {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => callback(null, isAllowedCorsOrigin(origin)),
    credentials: true,
  },
})
export class TournamentGateway {
  private readonly logger = new Logger(TournamentGateway.name);

  @WebSocketServer()
  server: Server;

  broadcastUpdated(tournamentId: string): void {
    try {
      this.server.emit(TOURNAMENT_UPDATED_EVENT, { tournamentId });
    } catch (error) {
      this.logger.error('Failed to broadcast tournament update', error);
    }
  }
}
