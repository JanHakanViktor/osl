import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import { Types } from 'mongoose';
import type { RegisteredDriver, UsersService } from '../users/users.service';
import type { RandomSource } from './domain/random-source';
import type { TournamentState } from './domain/tournament.types';
import type { CreateTournamentDto } from './dto/create-tournament.dto';
import type { TournamentGateway } from './tournament.gateway';
import type { TournamentRepository } from './tournament.repository';
import { TournamentService } from './tournament.service';

const viktorId = new Types.ObjectId().toString();
const timId = new Types.ObjectId().toString();
const hostId = new Types.ObjectId().toString();

function createDto(overrides: Partial<CreateTournamentDto> = {}) {
  return {
    name: 'Friday League',
    weather: 'NIGHT',
    lapsPerDriver: 3,
    cleanLapBonus: true,
    topSpeedBonus: false,
    ruleSetId: 'GRAND_PRIX',
    driverIds: [timId, viktorId],
    circuitIds: [5, 13],
    ...overrides,
  } as CreateTournamentDto;
}

function setup(
  registered: RegisteredDriver[],
  mostRecent: TournamentState | null = null,
) {
  const tournaments = {
    create: jest.fn((state: TournamentState) => Promise.resolve(state)),
    countWinsByDriver: jest.fn(() => Promise.resolve(new Map([[viktorId, 2]]))),
    findMostRecentlyActive: jest.fn(() => Promise.resolve(mostRecent)),
  };
  const users = {
    findDriversByIds: jest.fn(() => Promise.resolve(registered)),
    findDrivers: jest.fn(() => Promise.resolve(registered)),
  };
  const random: RandomSource = { nextInt: () => 0 };
  const gateway = { broadcastUpdated: jest.fn() };
  const service = new TournamentService(
    tournaments as unknown as TournamentRepository,
    users as unknown as UsersService,
    random,
    gateway as unknown as TournamentGateway,
  );

  return { service, tournaments, gateway };
}

const registered: RegisteredDriver[] = [
  {
    id: viktorId,
    driverName: 'Viktor Petersson',
    country: 'SE',
    teamId: 'ferrari',
  },
  { id: timId, driverName: 'Tim Andersson', country: null, teamId: null },
];

describe('TournamentService', () => {
  it('creates a ready tournament with the picked drivers in order and shuffled tracks', async () => {
    const { service, tournaments } = setup(registered);

    const dto = await service.create(hostId, createDto());

    expect(tournaments.create).toHaveBeenCalledTimes(1);
    expect(dto).toMatchObject({
      name: 'Friday League',
      status: 'READY',
      isHost: true,
      currentRoundNumber: 1,
      settings: {
        weather: 'NIGHT',
        lapsPerDriver: 3,
        ruleSet: { id: 'GRAND_PRIX' },
      },
    });
    expect(dto.drivers.map((driver) => driver.driverName)).toEqual([
      'Tim Andersson',
      'Viktor Petersson',
    ]);
    expect(dto.rounds.map((round) => round.circuit.id)).toEqual([13, 5]);
  });

  it('keeps each driver flag and team as they were at creation', async () => {
    const { service, tournaments } = setup(registered);

    const dto = await service.create(hostId, createDto());

    const [savedState] = tournaments.create.mock.calls[0];
    expect(savedState.drivers).toEqual([
      {
        userId: timId,
        driverName: 'Tim Andersson',
        country: null,
        teamId: null,
      },
      {
        userId: viktorId,
        driverName: 'Viktor Petersson',
        country: 'SE',
        teamId: 'ferrari',
      },
    ]);
    expect(dto.drivers[1]).toMatchObject({ country: 'SE', teamId: 'ferrari' });
  });

  it('rejects drivers who are not registered', async () => {
    const { service } = setup([registered[0]]);

    await expect(service.create(hostId, createDto())).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects circuits OSL does not know', async () => {
    const { service } = setup(registered);

    await expect(
      service.create(hostId, createDto({ circuitIds: [99] })),
    ).rejects.toThrow(BadRequestException);
  });

  it('lists registered drivers with their tournament wins', async () => {
    const { service } = setup(registered);

    await expect(service.listDriverOptions()).resolves.toEqual([
      {
        id: viktorId,
        driverName: 'Viktor Petersson',
        country: 'SE',
        teamId: 'ferrari',
        tournamentWins: 2,
      },
      {
        id: timId,
        driverName: 'Tim Andersson',
        country: null,
        teamId: null,
        tournamentWins: 0,
      },
    ]);
  });

  it('announces a new tournament so open screens such as the landing page refresh', async () => {
    const { service, gateway } = setup(registered);

    const dto = await service.create(hostId, createDto());

    expect(gateway.broadcastUpdated).toHaveBeenCalledWith(dto.id);
  });

  it('has no highlight before any tournament exists', async () => {
    const { service } = setup(registered);

    await expect(service.getLatestHighlight()).resolves.toEqual({
      tournament: null,
    });
  });

  it('highlights the most recently active tournament', async () => {
    const { service, tournaments } = setup(registered);
    await service.create(hostId, createDto());
    const [savedState] = tournaments.create.mock.calls[0];
    const { service: landing } = setup(registered, savedState);

    const { tournament } = await landing.getLatestHighlight();

    expect(tournament).toMatchObject({
      name: 'Friday League',
      status: 'READY',
      roundsCompleted: 0,
      roundsTotal: 2,
      currentRoundNumber: 1,
    });
  });
});
