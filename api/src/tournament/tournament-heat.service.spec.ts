import { ConflictException, ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TelemetryPacketBus } from '../telemetry/telemetry-packet.bus';
import type { RandomSource } from './domain/random-source';
import { createTournamentState } from './domain/tournament-progress';
import type { TournamentState } from './domain/tournament.types';
import { TournamentHeatService } from './tournament-heat.service';
import type { TournamentGateway } from './tournament.gateway';
import type { TournamentRepository } from './tournament.repository';

const MONACO_F1_TRACK_ID = 5;
const MONACO_CIRCUIT_ID = 5;
const SPA_F1_TRACK_ID = 10;
const SPA_CIRCUIT_ID = 11;

class InMemoryTournamentRepository {
  readonly states = new Map<string, TournamentState>();

  findById(id: string) {
    const state = this.states.get(id);
    return Promise.resolve(state ? structuredClone(state) : null);
  }

  findWithActiveHeat() {
    const active = [...this.states.values()].find(
      (state) =>
        state.status === 'AWAITING_DRIVER' || state.status === 'HEAT_LIVE',
    );
    return Promise.resolve(active ? structuredClone(active) : null);
  }

  save(state: TournamentState) {
    this.states.set(state.id, structuredClone(state));
    return Promise.resolve();
  }
}

const firstPick: RandomSource = { nextInt: () => 0 };

function seedTournament(
  repository: InMemoryTournamentRepository,
  id = 'tournament-1',
  overrides: Partial<TournamentState> = {},
): TournamentState {
  const state = {
    ...createTournamentState(
      {
        id,
        hostUserId: 'host',
        name: `Tournament ${id}`,
        settings: {
          weather: 'DRY',
          lapsPerDriver: 2,
          cleanLapBonus: false,
          topSpeedBonus: false,
          ruleSetId: 'LADDER',
        },
        drivers: [
          { userId: 'viktor', driverName: 'Viktor' },
          { userId: 'tim', driverName: 'Tim' },
        ],
        circuitIds: [MONACO_CIRCUIT_ID],
      },
      firstPick,
      new Date('2026-10-01T18:00:00Z'),
    ),
    ...overrides,
  };
  repository.states.set(id, state);
  return state;
}

function sessionPacket(uid: string, trackId: number) {
  return {
    type: 'session',
    data: {
      m_header: { m_sessionUID: uid, m_playerCarIndex: 0 },
      m_trackId: trackId,
    },
  };
}

function lapPacket(
  uid: string,
  lapNumber: number,
  currentLapTimeInMS: number,
  lastLapTimeInMS = 0,
) {
  return {
    type: 'lapData',
    data: {
      m_header: { m_sessionUID: uid, m_playerCarIndex: 0 },
      m_lapData: [
        {
          m_currentLapNum: lapNumber,
          m_currentLapTimeInMS: currentLapTimeInMS,
          m_lastLapTimeInMS: lastLapTimeInMS,
          m_currentLapInvalid: 0,
          m_driverStatus: 1,
        },
      ],
    },
  };
}

describe('TournamentHeatService', () => {
  let repository: InMemoryTournamentRepository;
  let gateway: { broadcastUpdated: jest.Mock };
  let service: TournamentHeatService;

  beforeEach(() => {
    repository = new InMemoryTournamentRepository();
    gateway = { broadcastUpdated: jest.fn() };
    service = new TournamentHeatService(
      repository as unknown as TournamentRepository,
      gateway as unknown as TournamentGateway,
      new TelemetryPacketBus(),
      firstPick,
    );
  });

  it('stages the next driver against the game session that is already running', async () => {
    seedTournament(repository);
    await service.handlePacket(
      sessionPacket('old-session', MONACO_F1_TRACK_ID),
    );

    const dto = await service.rollNextDriver('tournament-1', 'host');

    expect(dto.status).toBe('AWAITING_DRIVER');
    expect(dto.activeHeat?.driver.id).toBe('viktor');
    expect(repository.states.get('tournament-1')?.activeHeat).toMatchObject({
      stagedGameSessionUid: 'old-session',
    });
    expect(gateway.broadcastUpdated).toHaveBeenCalledWith('tournament-1');
  });

  it('starts the heat when a new game session loads on the round track', async () => {
    seedTournament(repository);
    await service.handlePacket(
      sessionPacket('old-session', MONACO_F1_TRACK_ID),
    );
    await service.rollNextDriver('tournament-1', 'host');

    await service.handlePacket(
      sessionPacket('old-session', MONACO_F1_TRACK_ID),
    );
    expect(repository.states.get('tournament-1')?.status).toBe(
      'AWAITING_DRIVER',
    );

    await service.handlePacket(
      sessionPacket('new-session', MONACO_F1_TRACK_ID),
    );
    expect(repository.states.get('tournament-1')).toMatchObject({
      status: 'HEAT_LIVE',
      activeHeat: { status: 'LIVE', gameSessionUid: 'new-session' },
    });
  });

  it('remembers a wrong track instead of starting the heat', async () => {
    seedTournament(repository);
    await service.rollNextDriver('tournament-1', 'host');

    await service.handlePacket(sessionPacket('new-session', SPA_F1_TRACK_ID));

    expect(repository.states.get('tournament-1')).toMatchObject({
      status: 'AWAITING_DRIVER',
      activeHeat: { detectedCircuitId: SPA_CIRCUIT_ID },
    });
  });

  it('finishes the heat by itself once the driver completes the lap target', async () => {
    seedTournament(repository);
    await service.rollNextDriver('tournament-1', 'host');
    await service.handlePacket(sessionPacket('run-1', MONACO_F1_TRACK_ID));

    for (const packet of [
      lapPacket('run-1', 1, 100),
      lapPacket('run-1', 1, 60_000),
      lapPacket('run-1', 2, 50, 72_400),
      lapPacket('run-1', 2, 60_000),
      lapPacket('run-1', 3, 50, 71_900),
    ]) {
      await service.handlePacket(packet);
    }

    const state = repository.states.get('tournament-1')!;
    expect(state.status).toBe('READY');
    expect(state.activeHeat).toBeNull();
    expect(state.rounds[0].heats[0]).toMatchObject({
      driverUserId: 'viktor',
      endReason: 'LAP_TARGET_REACHED',
      laps: [{ lapTimeMs: 72_400 }, { lapTimeMs: 71_900 }],
    });
  });

  it('lets the host end a heat early with the laps driven so far', async () => {
    seedTournament(repository);
    await service.rollNextDriver('tournament-1', 'host');
    await service.startHeat('tournament-1', 'host');

    await service.handlePacket(lapPacket('run-1', 1, 100));
    await service.handlePacket(lapPacket('run-1', 2, 50, 73_000));
    const dto = await service.finishHeat('tournament-1', 'host');

    expect(dto.status).toBe('READY');
    expect(dto.rounds[0].results[0]).toMatchObject({
      driver: { id: 'viktor' },
      bestLapMs: 73_000,
      lapsCompleted: 1,
      endReason: 'ENDED_BY_HOST',
    });
  });

  it('only lets the host run the tournament', async () => {
    seedTournament(repository);

    await expect(service.rollNextDriver('tournament-1', 'tim')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('keeps a second tournament off the rig while another heat is active', async () => {
    seedTournament(repository, 'tournament-1');
    seedTournament(repository, 'tournament-2');
    await service.rollNextDriver('tournament-1', 'host');

    await expect(
      service.rollNextDriver('tournament-2', 'host'),
    ).rejects.toThrow(ConflictException);
  });

  it('reports out-of-order host actions as conflicts', async () => {
    seedTournament(repository);

    await expect(service.startHeat('tournament-1', 'host')).rejects.toThrow(
      ConflictException,
    );
  });
});
