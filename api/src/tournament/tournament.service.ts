import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import CircuitLibrary from '../data/circuit';
import { UsersService } from '../users/users.service';
import type { RandomSource } from './domain/random-source';
import { listRuleSets } from './domain/rule-sets';
import { createTournamentState } from './domain/tournament-progress';
import type { TournamentDriver } from './domain/tournament.types';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import type {
  DriverOptionDto,
  LatestTournamentHighlightDto,
  RuleSetDto,
  TournamentDto,
  TournamentSummaryDto,
} from './dto/tournament-response.dto';
import {
  toRuleSetDto,
  toTournamentDto,
  toTournamentHighlightDto,
  toTournamentSummaryDto,
} from './mappers/tournament-response.mapper';
import { TournamentRepository } from './tournament.repository';
import { TOURNAMENT_RANDOM_SOURCE } from './tournament.tokens';

@Injectable()
export class TournamentService {
  constructor(
    private readonly tournaments: TournamentRepository,
    private readonly users: UsersService,
    @Inject(TOURNAMENT_RANDOM_SOURCE)
    private readonly random: RandomSource,
  ) {}

  listRuleSets(): RuleSetDto[] {
    return listRuleSets().map(toRuleSetDto);
  }

  async listDriverOptions(): Promise<DriverOptionDto[]> {
    const [drivers, wins] = await Promise.all([
      this.users.findDrivers(),
      this.tournaments.countWinsByDriver(),
    ]);

    return drivers.map((driver) => ({
      ...driver,
      tournamentWins: wins.get(driver.id) ?? 0,
    }));
  }

  async create(
    hostUserId: string,
    dto: CreateTournamentDto,
  ): Promise<TournamentDto> {
    this.assertKnownCircuits(dto.circuitIds);
    const drivers = await this.resolveDrivers(dto.driverIds);

    const state = await this.tournaments.create(
      createTournamentState(
        {
          id: new Types.ObjectId().toString(),
          hostUserId,
          name: dto.name,
          settings: {
            weather: dto.weather,
            lapsPerDriver: dto.lapsPerDriver,
            cleanLapBonus: dto.cleanLapBonus,
            topSpeedBonus: dto.topSpeedBonus,
            ruleSetId: dto.ruleSetId,
          },
          drivers,
          circuitIds: dto.circuitIds,
        },
        this.random,
        new Date(),
      ),
    );

    return toTournamentDto(state, hostUserId);
  }

  async listForUser(userId: string): Promise<TournamentSummaryDto[]> {
    const tournaments = await this.tournaments.listForUser(userId);
    return tournaments.map((state) => toTournamentSummaryDto(state, userId));
  }

  async getById(id: string, viewerUserId: string): Promise<TournamentDto> {
    const state = await this.tournaments.findById(id);
    if (!state) throw new NotFoundException('Tournament not found');

    return toTournamentDto(state, viewerUserId);
  }

  async getLatestHighlight(): Promise<LatestTournamentHighlightDto> {
    const state = await this.tournaments.findMostRecentlyActive();
    return { tournament: state ? toTournamentHighlightDto(state) : null };
  }

  private assertKnownCircuits(circuitIds: number[]): void {
    const unknown = circuitIds.find(
      (circuitId) =>
        !CircuitLibrary.some(
          (circuit) => Number(circuit.trackId) === circuitId,
        ),
    );

    if (unknown != null) {
      throw new BadRequestException(`Unknown circuit ${unknown}`);
    }
  }

  /** Registered drivers in the order the host picked them. */
  private async resolveDrivers(
    driverIds: string[],
  ): Promise<TournamentDriver[]> {
    const registered = new Map(
      (await this.users.findDriversByIds(driverIds)).map((driver) => [
        driver.id,
        driver,
      ]),
    );

    return driverIds.map((id) => {
      const driver = registered.get(id);
      if (!driver) {
        throw new BadRequestException('Every driver must be a registered user');
      }

      return {
        userId: driver.id,
        driverName: driver.driverName,
        country: driver.country,
        teamId: driver.teamId,
      };
    });
  }
}
