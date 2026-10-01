import { Types } from 'mongoose';
import type {
  CompletedHeat,
  HeatLap,
  TournamentState,
} from '../domain/tournament.types';
import type {
  CompletedHeatRecord,
  HeatLapRecord,
  Tournament,
} from '../schemas/tournament.schema';

/** A tournament as read from MongoDB (lean), including its id. */
export type TournamentRecordWithId = Tournament & { _id: Types.ObjectId };

function toHeatLap(lap: HeatLapRecord): HeatLap {
  return {
    gameSessionUid: lap.gameSessionUid,
    lapNumber: lap.lapNumber,
    lapTimeMs: lap.lapTimeMs,
    sectorsMs: [...(lap.sectorsMs ?? [])],
    valid: lap.valid,
  };
}

function toCompletedHeat(heat: CompletedHeatRecord): CompletedHeat {
  return {
    driverUserId: heat.driverUserId.toString(),
    startedAt: heat.startedAt,
    finishedAt: heat.finishedAt,
    endReason: heat.endReason,
    laps: heat.laps.map(toHeatLap),
    topSpeedKmh: heat.topSpeedKmh ?? 0,
  };
}

export function toTournamentState(
  record: TournamentRecordWithId,
): TournamentState {
  const activeHeat = record.activeHeat;

  return {
    id: record._id.toString(),
    hostUserId: record.hostUserId.toString(),
    name: record.name,
    settings: {
      weather: record.weather,
      lapsPerDriver: record.lapsPerDriver,
      cleanLapBonus: record.cleanLapBonus,
      topSpeedBonus: record.topSpeedBonus,
      ruleSetId: record.ruleSetId,
    },
    drivers: record.drivers.map((driver) => ({
      userId: driver.userId.toString(),
      driverName: driver.driverName,
      country: driver.country ?? null,
      teamId: driver.teamId ?? null,
    })),
    rounds: record.rounds.map((round) => ({
      circuitId: round.circuitId,
      heats: round.heats.map(toCompletedHeat),
    })),
    activeHeat: activeHeat
      ? {
          roundIndex: activeHeat.roundIndex,
          driverUserId: activeHeat.driverUserId.toString(),
          status: activeHeat.status,
          stagedAt: activeHeat.stagedAt,
          stagedGameSessionUid: activeHeat.stagedGameSessionUid ?? null,
          startedAt: activeHeat.startedAt ?? null,
          gameSessionUid: activeHeat.gameSessionUid ?? null,
          laps: activeHeat.laps.map(toHeatLap),
          topSpeedKmh: activeHeat.topSpeedKmh ?? 0,
          detectedCircuitId: activeHeat.detectedCircuitId ?? null,
        }
      : null,
    status: record.status,
    winnerUserId: record.winnerUserId?.toString() ?? null,
    createdAt: record.createdAt,
    finishedAt: record.finishedAt ?? null,
  };
}

export function toTournamentRecord(
  state: TournamentState,
): Omit<Tournament, 'createdAt'> {
  const objectId = (id: string) => new Types.ObjectId(id);
  const activeHeat = state.activeHeat;

  return {
    hostUserId: objectId(state.hostUserId),
    name: state.name,
    weather: state.settings.weather,
    lapsPerDriver: state.settings.lapsPerDriver,
    cleanLapBonus: state.settings.cleanLapBonus,
    topSpeedBonus: state.settings.topSpeedBonus,
    ruleSetId: state.settings.ruleSetId,
    drivers: state.drivers.map((driver) => ({
      userId: objectId(driver.userId),
      driverName: driver.driverName,
      country: driver.country,
      teamId: driver.teamId,
    })),
    rounds: state.rounds.map((round) => ({
      circuitId: round.circuitId,
      heats: round.heats.map((heat) => ({
        ...heat,
        driverUserId: objectId(heat.driverUserId),
      })),
    })),
    activeHeat: activeHeat
      ? { ...activeHeat, driverUserId: objectId(activeHeat.driverUserId) }
      : null,
    status: state.status,
    winnerUserId: state.winnerUserId ? objectId(state.winnerUserId) : null,
    finishedAt: state.finishedAt,
  };
}
