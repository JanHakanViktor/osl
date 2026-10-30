import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { Subscription } from 'rxjs';
import {
  TelemetryPacketBus,
  type RelayedTelemetryPacket,
} from '../telemetry/telemetry-packet.bus';
import { TimingBoard } from './domain/timing-board';
import type {
  LiveTimingCurrentDto,
  TimingBoardDto,
  TimingSessionSummaryDto,
} from './dto/live-timing.dto';
import { LiveTimingGateway } from './live-timing.gateway';
import {
  toTimingBoardDto,
  toTimingFrameDto,
  toTimingSessionSummaryDto,
} from './mappers/timing-board.mapper';
import type {
  F1FinalClassificationPacket,
  F1LapDataPacket,
  F1ParticipantsPacket,
  F1SessionHistoryPacket,
  F1SessionPacket,
  F1TimingHeader,
} from './telemetry/f1-timing-packets';
import {
  readCarLapHistory,
  readCarLiveStates,
  readDrivers,
  readFinalResults,
  readPlayerCarIndex,
  readSessionClock,
  readSessionInfo,
  readSessionUid,
} from './telemetry/timing-packet.mapper';
import { Throttle } from './throttle';
import { TimingSessionRepository } from './timing-session.repository';

/** Car positions move the track map several times a second. */
export const FRAME_INTERVAL_MS = 250;
export const BOARD_INTERVAL_MS = 1_000;
export const SAVE_INTERVAL_MS = 10_000;

const TIMING_PACKETS = new Set([
  'session',
  'participants',
  'lapData',
  'sessionHistory',
  'finalClassification',
]);

type CurrentBoard = {
  board: TimingBoard;
  /** Settles once a saved copy of the session, if any, is merged in. */
  restored: Promise<void>;
};

type PacketChange = {
  frame: boolean;
  standings: boolean;
};

/**
 * Keeps live timing for the game session the relay is sending: every car's
 * position, laps and stats. It streams frames and standings to open screens
 * and saves the session, so the timing outlives it.
 */
@Injectable()
export class LiveTimingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LiveTimingService.name);
  private current: CurrentBoard | null = null;
  private saving: Promise<void> = Promise.resolve();
  private subscription?: Subscription;

  private readonly frameBroadcast = new Throttle(FRAME_INTERVAL_MS, () =>
    this.broadcastFrame(),
  );
  private readonly boardBroadcast = new Throttle(BOARD_INTERVAL_MS, () =>
    this.broadcastBoard(),
  );
  private readonly scheduledSave = new Throttle(SAVE_INTERVAL_MS, () => {
    if (this.current) void this.save(this.current);
  });

  constructor(
    private readonly repository: TimingSessionRepository,
    private readonly gateway: LiveTimingGateway,
    private readonly packetBus: TelemetryPacketBus,
  ) {}

  onModuleInit(): void {
    this.subscription = this.packetBus.packets$.subscribe((packet) =>
      this.handlePacket(packet),
    );
  }

  async onModuleDestroy(): Promise<void> {
    this.subscription?.unsubscribe();
    this.frameBroadcast.cancel();
    this.boardBroadcast.cancel();
    this.scheduledSave.cancel();

    if (this.current) await this.save(this.current);
  }

  handlePacket(packet: RelayedTelemetryPacket): void {
    if (!TIMING_PACKETS.has(packet.type)) return;

    const header = (packet.data as { m_header?: F1TimingHeader } | null)
      ?.m_header;
    const sessionUid = readSessionUid(header);
    if (!sessionUid) return;

    const current = this.boardFor(sessionUid);
    const change = this.apply(current.board, packet, new Date());

    if (change.frame) this.frameBroadcast.request();
    if (!change.standings) return;

    this.boardBroadcast.request();
    // The final classification ends the session, so it is saved right away.
    if (packet.type === 'finalClassification') {
      void this.save(current);
    } else {
      this.scheduledSave.request();
    }
  }

  getCurrent(): LiveTimingCurrentDto {
    const board = this.current?.board;
    if (!board) return { board: null, frame: null };

    const snapshot = board.snapshot();
    return {
      board: toTimingBoardDto(snapshot),
      frame: toTimingFrameDto(snapshot, board.sessionClock),
    };
  }

  async listSessions(): Promise<TimingSessionSummaryDto[]> {
    const snapshots = await this.repository.listRecent();
    return snapshots.map(toTimingSessionSummaryDto);
  }

  async getSession(sessionUid: string): Promise<TimingBoardDto> {
    const live = this.current?.board;
    const snapshot =
      live?.sessionUid === sessionUid
        ? live.snapshot()
        : await this.repository.findBySessionUid(sessionUid);

    if (!snapshot) throw new NotFoundException('Timing session not found');
    return toTimingBoardDto(snapshot);
  }

  private apply(
    board: TimingBoard,
    packet: RelayedTelemetryPacket,
    now: Date,
  ): PacketChange {
    switch (packet.type) {
      case 'session': {
        const data = packet.data as F1SessionPacket;
        const info = readSessionInfo(data);
        const clock = readSessionClock(data);
        return { frame: true, standings: board.applySession(info, clock, now) };
      }
      case 'participants': {
        const data = packet.data as F1ParticipantsPacket;
        const player = readPlayerCarIndex(data.m_header);
        return {
          frame: false,
          standings: board.applyDrivers(readDrivers(data), player, now),
        };
      }
      case 'lapData': {
        const data = packet.data as F1LapDataPacket;
        const player = readPlayerCarIndex(data.m_header);
        return {
          frame: true,
          standings: board.applyLiveStates(
            readCarLiveStates(data),
            player,
            now,
          ),
        };
      }
      case 'sessionHistory': {
        const history = readCarLapHistory(
          packet.data as F1SessionHistoryPacket,
        );
        return {
          frame: false,
          standings: history !== null && board.applyLapHistory(history, now),
        };
      }
      case 'finalClassification': {
        const data = packet.data as F1FinalClassificationPacket;
        return {
          frame: false,
          standings: board.applyFinalResults(readFinalResults(data), now),
        };
      }
      default:
        return { frame: false, standings: false };
    }
  }

  /** The board for the session the packet belongs to; a new session gets a new one. */
  private boardFor(sessionUid: string): CurrentBoard {
    if (this.current?.board.sessionUid === sessionUid) return this.current;

    // The previous session's pending save would otherwise go to the new one.
    if (this.current) void this.save(this.current);

    const board = new TimingBoard(sessionUid, new Date());
    const restored = this.repository
      .findBySessionUid(sessionUid)
      .then((saved) => {
        if (!saved) return;
        board.restore(saved);
        this.boardBroadcast.request();
      })
      .catch((error: unknown) =>
        this.logger.error('Failed to restore saved live timing', error),
      );

    this.current = { board, restored };
    return this.current;
  }

  /** Saves run one at a time, so an older snapshot never lands last. */
  private save({ board, restored }: CurrentBoard): Promise<void> {
    this.saving = this.saving
      .then(() => restored)
      .then(async () => {
        if (board.hasCompletedLaps) {
          await this.repository.save(board.snapshot());
        }
      })
      .catch((error: unknown) =>
        this.logger.error('Failed to save live timing', error),
      );

    return this.saving;
  }

  private broadcastFrame(): void {
    const board = this.current?.board;
    if (!board) return;

    this.gateway.broadcastFrame(
      toTimingFrameDto(board.snapshot(), board.sessionClock),
    );
  }

  private broadcastBoard(): void {
    const board = this.current?.board;
    if (board) this.gateway.broadcastBoard(toTimingBoardDto(board.snapshot()));
  }
}
