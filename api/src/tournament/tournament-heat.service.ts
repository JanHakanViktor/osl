import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { Subscription } from 'rxjs';
import { mapF1TrackIdToOslCircuitId } from '../data/f1-track-id.mapper';
import {
  TelemetryPacketBus,
  type RelayedTelemetryPacket,
} from '../telemetry/telemetry-packet.bus';
import type { RandomSource } from './domain/random-source';
import {
  TournamentProgress,
  TournamentStateError,
} from './domain/tournament-progress';
import type { TournamentState } from './domain/tournament.types';
import type { TournamentDto } from './dto/tournament-response.dto';
import { toTournamentDto } from './mappers/tournament-response.mapper';
import {
  readGameSessionUid,
  type GameSessionPacket,
  type HeatCarTelemetryPacket,
  type HeatLapDataPacket,
} from './telemetry/f1-packets';
import { HeatLapTracker } from './telemetry/heat-lap-tracker';
import { SerialTaskQueue } from './serial-task-queue';
import { TournamentGateway } from './tournament.gateway';
import { TournamentRepository } from './tournament.repository';
import { TOURNAMENT_RANDOM_SOURCE } from './tournament.tokens';

/** What the rig is doing for the tournament heat, mirrored in memory. */
type HeatRuntime =
  | {
      phase: 'STAGED';
      tournamentId: string;
      circuitId: number;
      stagedGameSessionUid: string | null;
      detectedCircuitId: number | null;
    }
  | {
      phase: 'LIVE';
      tournamentId: string;
      lapsTarget: number;
      tracker: HeatLapTracker;
    };

type GameSessionSighting = { uid: string; circuitId: number | null };

type ProgressChange = (progress: TournamentProgress) => void;

/**
 * Runs tournament heats: host actions (dice, start, finish, abort) and the
 * telemetry that starts a heat when the driver loads the right track, counts
 * their laps, and finishes the heat at the lap target.
 */
@Injectable()
export class TournamentHeatService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TournamentHeatService.name);
  private readonly queue = new SerialTaskQueue();
  private runtime: HeatRuntime | null = null;
  private latestGameSession: GameSessionSighting | null = null;
  private subscription?: Subscription;

  constructor(
    private readonly tournaments: TournamentRepository,
    private readonly gateway: TournamentGateway,
    private readonly packetBus: TelemetryPacketBus,
    @Inject(TOURNAMENT_RANDOM_SOURCE)
    private readonly random: RandomSource,
  ) {}

  async onModuleInit(): Promise<void> {
    this.subscription = this.packetBus.packets$.subscribe((packet) => {
      void this.handlePacket(packet);
    });
    this.syncRuntime(await this.tournaments.findWithActiveHeat());
  }

  onModuleDestroy(): void {
    this.subscription?.unsubscribe();
  }

  rollNextDriver(tournamentId: string, userId: string): Promise<TournamentDto> {
    return this.queue.run(async () => {
      const state = await this.loadForHost(tournamentId, userId);
      const busy = await this.tournaments.findWithActiveHeat();

      if (busy && busy.id !== state.id) {
        throw new ConflictException(`"${busy.name}" is already using the rig`);
      }

      const next = await this.applyAndSave(state, (progress) => {
        progress.stageNextDriver(
          this.random,
          this.latestGameSession?.uid ?? null,
          new Date(),
        );
      });
      return toTournamentDto(next, userId);
    });
  }

  startHeat(tournamentId: string, userId: string): Promise<TournamentDto> {
    return this.runHostAction(tournamentId, userId, (progress) =>
      progress.startHeat(this.latestGameSession?.uid ?? null, new Date()),
    );
  }

  finishHeat(tournamentId: string, userId: string): Promise<TournamentDto> {
    return this.runHostAction(tournamentId, userId, (progress) => {
      const runtime = this.runtime;
      if (runtime?.phase === 'LIVE' && runtime.tournamentId === tournamentId) {
        progress.recordHeatProgress(runtime.tracker.snapshot());
      }
      progress.completeHeat('ENDED_BY_HOST', new Date());
    });
  }

  abortHeat(tournamentId: string, userId: string): Promise<TournamentDto> {
    return this.runHostAction(tournamentId, userId, (progress) =>
      progress.abortHeat(),
    );
  }

  handlePacket(packet: RelayedTelemetryPacket): Promise<void> {
    switch (packet.type) {
      case 'session':
        return this.handleGameSession(packet.data as GameSessionPacket);
      case 'lapData':
        return this.handleLapData(packet.data as HeatLapDataPacket);
      case 'carTelemetry':
        this.handleCarTelemetry(packet.data as HeatCarTelemetryPacket);
        return Promise.resolve();
      default:
        return Promise.resolve();
    }
  }

  private handleGameSession(packet: GameSessionPacket): Promise<void> {
    const uid = readGameSessionUid(packet.m_header);
    if (!uid) return Promise.resolve();

    const circuitId =
      typeof packet.m_trackId === 'number'
        ? (mapF1TrackIdToOslCircuitId(packet.m_trackId) ?? null)
        : null;
    this.latestGameSession = { uid, circuitId };

    if (this.runtime?.phase !== 'STAGED') return Promise.resolve();
    return this.runTelemetryTask(() => this.reactToGameSession(uid, circuitId));
  }

  private async reactToGameSession(
    uid: string,
    circuitId: number | null,
  ): Promise<void> {
    const runtime = this.runtime;
    if (runtime?.phase !== 'STAGED') return;

    const isNewGameSession = uid !== runtime.stagedGameSessionUid;

    if (isNewGameSession && circuitId === runtime.circuitId) {
      await this.applyById(runtime.tournamentId, (progress) =>
        progress.startHeat(uid, new Date()),
      );
    } else if (circuitId !== runtime.detectedCircuitId) {
      await this.applyById(runtime.tournamentId, (progress) => {
        progress.noteDetectedCircuit(circuitId);
      });
    }
  }

  private handleLapData(packet: HeatLapDataPacket): Promise<void> {
    const uid = readGameSessionUid(packet.m_header);
    if (uid && uid !== this.latestGameSession?.uid) {
      this.latestGameSession = { uid, circuitId: null };
    }

    if (this.runtime?.phase !== 'LIVE') return Promise.resolve();
    return this.runTelemetryTask(() => this.trackLap(packet));
  }

  private async trackLap(packet: HeatLapDataPacket): Promise<void> {
    const runtime = this.runtime;
    if (runtime?.phase !== 'LIVE') return;
    if (!runtime.tracker.handleLapData(packet)) return;

    const snapshot = runtime.tracker.snapshot();
    const reachedTarget = snapshot.laps.length >= runtime.lapsTarget;

    await this.applyById(runtime.tournamentId, (progress) => {
      progress.recordHeatProgress(snapshot);
      if (reachedTarget) {
        progress.completeHeat('LAP_TARGET_REACHED', new Date());
      }
    });
  }

  private handleCarTelemetry(packet: HeatCarTelemetryPacket): void {
    if (this.runtime?.phase === 'LIVE') {
      this.runtime.tracker.handleCarTelemetry(packet);
    }
  }

  private runHostAction(
    tournamentId: string,
    userId: string,
    change: ProgressChange,
  ): Promise<TournamentDto> {
    return this.queue.run(async () => {
      const state = await this.loadForHost(tournamentId, userId);
      const next = await this.applyAndSave(state, change);
      return toTournamentDto(next, userId);
    });
  }

  private runTelemetryTask(task: () => Promise<void>): Promise<void> {
    return this.queue.run(task).catch((error: unknown) => {
      this.logger.error(
        'Failed to apply telemetry to a tournament heat',
        error,
      );
    });
  }

  private async applyById(
    tournamentId: string,
    change: ProgressChange,
  ): Promise<void> {
    const state = await this.tournaments.findById(tournamentId);

    if (!state) {
      this.runtime = null;
      return;
    }

    await this.applyAndSave(state, change);
  }

  private async applyAndSave(
    state: TournamentState,
    change: ProgressChange,
  ): Promise<TournamentState> {
    const progress = new TournamentProgress(state);

    try {
      change(progress);
    } catch (error) {
      if (error instanceof TournamentStateError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }

    const next = progress.snapshot;
    await this.tournaments.save(next);
    this.syncRuntime(next);
    this.gateway.broadcastUpdated(next.id);

    return next;
  }

  private async loadForHost(
    tournamentId: string,
    userId: string,
  ): Promise<TournamentState> {
    const state = await this.tournaments.findById(tournamentId);

    if (!state) throw new NotFoundException('Tournament not found');
    if (state.hostUserId !== userId) {
      throw new ForbiddenException('Only the host can run this tournament');
    }

    return state;
  }

  private syncRuntime(state: TournamentState | null): void {
    const heat = state?.activeHeat;

    if (!state || !heat) {
      if (!state || this.runtime?.tournamentId === state.id) {
        this.runtime = null;
      }
      return;
    }

    if (heat.status === 'STAGED') {
      this.runtime = {
        phase: 'STAGED',
        tournamentId: state.id,
        circuitId: state.rounds[heat.roundIndex].circuitId,
        stagedGameSessionUid: heat.stagedGameSessionUid,
        detectedCircuitId: heat.detectedCircuitId,
      };
      return;
    }

    const current = this.runtime;
    const tracker =
      current?.phase === 'LIVE' && current.tournamentId === state.id
        ? current.tracker
        : new HeatLapTracker({
            gameSessionUid: heat.gameSessionUid,
            laps: heat.laps,
            topSpeedKmh: heat.topSpeedKmh,
          });

    this.runtime = {
      phase: 'LIVE',
      tournamentId: state.id,
      lapsTarget: state.settings.lapsPerDriver,
      tracker,
    };
  }
}
