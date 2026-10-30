import { TEAM_IDS, type TeamId } from '../../data/team';
import type {
  TimingBoardSnapshot,
  TimingCar,
  TimingDriver,
} from '../domain/timing.types';
import type {
  TimingCarRecord,
  TimingDriverRecord,
  TimingSession,
} from '../schemas/timing-session.schema';

function toTeamId(teamId: string | null): TeamId | null {
  return TEAM_IDS.find((candidate) => candidate === teamId) ?? null;
}

function toDriver(record: TimingDriverRecord | null): TimingDriver | null {
  return (
    record && {
      name: record.name,
      raceNumber: record.raceNumber,
      teamId: toTeamId(record.teamId),
      teamName: record.teamName,
      isAi: record.isAi,
    }
  );
}

function toCar(record: TimingCarRecord): TimingCar {
  return {
    carIndex: record.carIndex,
    driver: toDriver(record.driver),
    live: record.live,
    laps: record.laps,
    tyreStints: record.tyreStints,
    result: record.result,
  };
}

/** The domain snapshot is plain data, so it is stored as it is. */
export function toTimingSessionRecord(
  snapshot: TimingBoardSnapshot,
): TimingSession {
  return {
    sessionUid: snapshot.sessionUid,
    startedAt: snapshot.startedAt,
    updatedAt: snapshot.updatedAt,
    session: snapshot.session,
    playerCarIndex: snapshot.playerCarIndex,
    cars: snapshot.cars,
  };
}

export function toTimingBoardSnapshot(
  record: TimingSession,
): TimingBoardSnapshot {
  return {
    sessionUid: record.sessionUid,
    startedAt: record.startedAt,
    updatedAt: record.updatedAt,
    session: record.session,
    playerCarIndex: record.playerCarIndex,
    cars: record.cars.map(toCar),
  };
}
