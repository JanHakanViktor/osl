import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { isAllowedCorsOrigin } from '../cors/cors-origin.guard';
import type { TimingBoardDto, TimingFrameDto } from './dto/live-timing.dto';

export const TIMING_FRAME_EVENT = 'timingFrame';
export const TIMING_BOARD_EVENT = 'timingBoard';

/**
 * Streams live timing to open screens. New screens load the current board
 * and frame over REST, then follow these events.
 */
@WebSocketGateway({
  namespace: '/live-timing',
  cors: {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => callback(null, isAllowedCorsOrigin(origin)),
    credentials: true,
  },
})
export class LiveTimingGateway {
  private readonly logger = new Logger(LiveTimingGateway.name);

  @WebSocketServer()
  server: Server;

  broadcastFrame(frame: TimingFrameDto): void {
    this.emit(TIMING_FRAME_EVENT, frame);
  }

  broadcastBoard(board: TimingBoardDto): void {
    this.emit(TIMING_BOARD_EVENT, board);
  }

  private emit(event: string, payload: unknown): void {
    try {
      this.server.emit(event, payload);
    } catch (error) {
      this.logger.error(`Failed to broadcast ${event}`, error);
    }
  }
}
