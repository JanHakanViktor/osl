import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import type {
  DriverOptionDto,
  RuleSetDto,
  TournamentDto,
  TournamentSummaryDto,
} from './dto/tournament-response.dto';
import { TournamentHeatService } from './tournament-heat.service';
import { TournamentService } from './tournament.service';

function currentUserId(req: Request): string {
  return req.session!.user!.id;
}

@Controller('tournaments')
@UseGuards(AuthGuard)
export class TournamentController {
  constructor(
    private readonly tournamentService: TournamentService,
    private readonly heatService: TournamentHeatService,
  ) {}

  @Get('rule-sets')
  listRuleSets(): RuleSetDto[] {
    return this.tournamentService.listRuleSets();
  }

  @Get('drivers')
  listDriverOptions(): Promise<DriverOptionDto[]> {
    return this.tournamentService.listDriverOptions();
  }

  @Get()
  list(@Req() req: Request): Promise<TournamentSummaryDto[]> {
    return this.tournamentService.listForUser(currentUserId(req));
  }

  @Post()
  create(
    @Req() req: Request,
    @Body() dto: CreateTournamentDto,
  ): Promise<TournamentDto> {
    return this.tournamentService.create(currentUserId(req), dto);
  }

  @Get(':id')
  get(@Req() req: Request, @Param('id') id: string): Promise<TournamentDto> {
    return this.tournamentService.getById(id, currentUserId(req));
  }

  /** Rolls the dice: stages the next driver (or re-rolls a waiting one). */
  @Post(':id/active-heat')
  rollNextDriver(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<TournamentDto> {
    return this.heatService.rollNextDriver(id, currentUserId(req));
  }

  @Post(':id/active-heat/start')
  @HttpCode(200)
  startHeat(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<TournamentDto> {
    return this.heatService.startHeat(id, currentUserId(req));
  }

  @Post(':id/active-heat/finish')
  @HttpCode(200)
  finishHeat(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<TournamentDto> {
    return this.heatService.finishHeat(id, currentUserId(req));
  }

  @Delete(':id/active-heat')
  abortHeat(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<TournamentDto> {
    return this.heatService.abortHeat(id, currentUserId(req));
  }
}
