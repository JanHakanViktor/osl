import CircuitLibrary from '../../data/circuit';
import { getRuleSet, type PointsRuleSet } from '../domain/rule-sets';
import { findCurrentRoundIndex } from '../domain/tournament-progress';
import {
  buildAwards,
  buildStandings,
  classifyRound,
  findFastestSectors,
  isRoundComplete,
  summarizeHeat,
} from '../domain/tournament-scoring';
import type {
  ActiveHeat,
  HeatLap,
  TournamentRound,
  TournamentState,
} from '../domain/tournament.types';
import type {
  ActiveHeatDto,
  AwardsDto,
  CircuitDto,
  DriverDto,
  HeatLapDto,
  RoundDto,
  RuleSetDto,
  TournamentDto,
  TournamentSummaryDto,
} from '../dto/tournament-response.dto';

type DriverLookup = (userId: string) => DriverDto;

function createDriverLookup(state: TournamentState): DriverLookup {
  const drivers = new Map(
    state.drivers.map((driver) => [
      driver.userId,
      {
        id: driver.userId,
        driverName: driver.driverName,
        country: driver.country,
        teamId: driver.teamId,
      },
    ]),
  );

  return (userId) =>
    drivers.get(userId) ?? {
      id: userId,
      driverName: 'Unknown driver',
      country: null,
      teamId: null,
    };
}

export function toCircuitDto(circuitId: number): CircuitDto {
  const circuit = CircuitLibrary.find(
    (candidate) => Number(candidate.trackId) === circuitId,
  );

  return {
    id: circuitId,
    name: circuit?.circuit ?? `Circuit ${circuitId}`,
    grandPrix: circuit?.grandPrix ?? 'Unknown',
    image: circuit?.image ?? null,
  };
}

export function toRuleSetDto(ruleSet: PointsRuleSet): RuleSetDto {
  return {
    id: ruleSet.id,
    name: ruleSet.name,
    tagline: ruleSet.tagline,
    rules: [...ruleSet.rules],
  };
}

function toHeatLapDto(lap: HeatLap): HeatLapDto {
  return {
    lapNumber: lap.lapNumber,
    lapTimeMs: lap.lapTimeMs,
    sectorsMs: lap.sectorsMs,
    valid: lap.valid,
  };
}

function toRoundDto(
  state: TournamentState,
  round: TournamentRound,
  index: number,
  currentRoundIndex: number | null,
  driver: DriverLookup,
): RoundDto {
  const { settings } = state;
  const heats = new Map(round.heats.map((heat) => [heat.driverUserId, heat]));
  const status = isRoundComplete(round, state.drivers.length)
    ? 'COMPLETE'
    : index === currentRoundIndex
      ? 'IN_PROGRESS'
      : 'UPCOMING';

  return {
    roundNumber: index + 1,
    circuit: toCircuitDto(round.circuitId),
    status,
    results: classifyRound(round, settings, state.drivers.length).map(
      (entry) => {
        const heat = heats.get(entry.driverUserId)!;
        const summary = summarizeHeat(heat, settings.lapsPerDriver);

        return {
          driver: driver(entry.driverUserId),
          position: entry.position,
          bestLapMs: entry.bestLapMs,
          lapsCompleted: summary.lapsCompleted,
          validLaps: summary.validLapCount,
          topSpeedKmh: entry.topSpeedKmh,
          basePoints: entry.basePoints,
          cleanLapBonus: entry.cleanLapBonus,
          topSpeedBonus: entry.topSpeedBonus,
          points: entry.points,
          endReason: heat.endReason,
        };
      },
    ),
    fastestSectors: findFastestSectors(round).map((sector) =>
      sector
        ? { driver: driver(sector.driverUserId), sectorMs: sector.sectorMs }
        : null,
    ),
  };
}

function toActiveHeatDto(
  state: TournamentState,
  heat: ActiveHeat,
  driver: DriverLookup,
): ActiveHeatDto {
  const circuitId = state.rounds[heat.roundIndex].circuitId;
  const lapsTarget = state.settings.lapsPerDriver;
  const wrongCircuitId =
    heat.detectedCircuitId != null && heat.detectedCircuitId !== circuitId
      ? heat.detectedCircuitId
      : null;

  return {
    roundNumber: heat.roundIndex + 1,
    circuit: toCircuitDto(circuitId),
    driver: driver(heat.driverUserId),
    status: heat.status,
    lapsCompleted: heat.laps.length,
    lapsTarget,
    bestLapMs: summarizeHeat(heat, lapsTarget).bestLap?.lapTimeMs ?? null,
    laps: heat.laps.map(toHeatLapDto),
    detectedCircuit:
      wrongCircuitId == null ? null : toCircuitDto(wrongCircuitId),
    stagedAt: heat.stagedAt,
    startedAt: heat.startedAt,
  };
}

function toAwardsDto(state: TournamentState, driver: DriverLookup): AwardsDto {
  const awards = buildAwards(state);

  return {
    mostRoundWins: awards.mostRoundWins
      ? {
          driver: driver(awards.mostRoundWins.driverUserId),
          count: awards.mostRoundWins.count,
        }
      : null,
    topSpeed: awards.topSpeed
      ? {
          driver: driver(awards.topSpeed.driverUserId),
          speedKmh: awards.topSpeed.speedKmh,
          circuit: toCircuitDto(awards.topSpeed.circuitId),
        }
      : null,
    mostCleanLaps: awards.mostCleanLaps
      ? {
          driver: driver(awards.mostCleanLaps.driverUserId),
          count: awards.mostCleanLaps.count,
        }
      : null,
  };
}

export function toTournamentDto(
  state: TournamentState,
  viewerUserId: string,
): TournamentDto {
  const driver = createDriverLookup(state);
  const currentRoundIndex = findCurrentRoundIndex(state);

  return {
    id: state.id,
    name: state.name,
    status: state.status,
    isHost: state.hostUserId === viewerUserId,
    settings: {
      weather: state.settings.weather,
      lapsPerDriver: state.settings.lapsPerDriver,
      cleanLapBonus: state.settings.cleanLapBonus,
      topSpeedBonus: state.settings.topSpeedBonus,
      ruleSet: toRuleSetDto(getRuleSet(state.settings.ruleSetId)),
    },
    drivers: state.drivers.map((entry) => driver(entry.userId)),
    rounds: state.rounds.map((round, index) =>
      toRoundDto(state, round, index, currentRoundIndex, driver),
    ),
    currentRoundNumber:
      currentRoundIndex == null ? null : currentRoundIndex + 1,
    activeHeat: state.activeHeat
      ? toActiveHeatDto(state, state.activeHeat, driver)
      : null,
    standings: buildStandings(state).map((standing) => ({
      position: standing.position,
      driver: driver(standing.driverUserId),
      points: standing.points,
      roundWins: standing.roundWins,
    })),
    awards: state.status === 'FINISHED' ? toAwardsDto(state, driver) : null,
    createdAt: state.createdAt,
    finishedAt: state.finishedAt,
  };
}

export function toTournamentSummaryDto(
  state: TournamentState,
  viewerUserId: string,
): TournamentSummaryDto {
  const driver = createDriverLookup(state);

  return {
    id: state.id,
    name: state.name,
    status: state.status,
    isHost: state.hostUserId === viewerUserId,
    drivers: state.drivers.map((entry) => driver(entry.userId)),
    roundsCompleted: state.rounds.filter((round) =>
      isRoundComplete(round, state.drivers.length),
    ).length,
    roundsTotal: state.rounds.length,
    winner: state.winnerUserId ? driver(state.winnerUserId) : null,
    createdAt: state.createdAt,
    finishedAt: state.finishedAt,
  };
}
