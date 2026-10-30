import CircuitLibrary from '../../data/circuit';
import { mapF1TrackIdToOslCircuitId } from '../../data/f1-track-id.mapper';
import {
  calculateBestLapGaps,
  calculateDriverStats,
  calculateSessionBests,
  type CarRecord,
  type DriverStats,
  type TimingGap,
} from '../domain/timing-stats';
import type {
  CarLiveState,
  SessionClock,
  SessionKind,
  TimingBoardSnapshot,
  TimingCar,
} from '../domain/timing.types';
import type {
  TimingBoardDto,
  TimingCarFrameDto,
  TimingCarRecordDto,
  TimingCircuitDto,
  TimingDriverDto,
  TimingDriverStatsDto,
  TimingFrameDto,
  TimingSessionDto,
  TimingSessionSummaryDto,
  TimingTopSpeedDto,
} from '../dto/live-timing.dto';

const NO_GAP: TimingGap = { gapToLeaderMs: null, intervalMs: null };

function toCircuitDto(f1TrackId: number | null): TimingCircuitDto | null {
  const circuitId =
    f1TrackId === null ? undefined : mapF1TrackIdToOslCircuitId(f1TrackId);
  const circuit = CircuitLibrary.find(
    (candidate) => Number(candidate.trackId) === circuitId,
  );
  if (circuitId === undefined || !circuit) return null;

  return {
    id: circuitId,
    name: circuit.circuit,
    grandPrix: circuit.grandPrix,
    image: circuit.image,
  };
}

function driverName(car: TimingCar): string {
  return car.driver?.name || `Car ${car.carIndex + 1}`;
}

/** The final classification decides positions once the game sent it. */
function runningPosition(car: TimingCar): number | null {
  const position = car.result?.position ?? car.live?.position ?? 0;
  return position > 0 ? position : null;
}

function byPosition(position: (car: TimingCar) => number | null) {
  return (a: TimingCar, b: TimingCar): number =>
    (position(a) ?? Infinity) - (position(b) ?? Infinity) ||
    a.carIndex - b.carIndex;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function toSessionDto(snapshot: TimingBoardSnapshot): TimingSessionDto {
  const info = snapshot.session;

  return {
    sessionUid: snapshot.sessionUid,
    sessionKind: info?.sessionKind ?? 'UNKNOWN',
    sessionName: info?.sessionName ?? 'Session',
    circuit: toCircuitDto(info?.f1TrackId ?? null),
    trackLengthM: info?.trackLengthM ?? null,
    totalLaps: info?.totalLaps ?? null,
    weather: info?.weather ?? null,
    trackTemperatureC: info?.trackTemperatureC ?? null,
    airTemperatureC: info?.airTemperatureC ?? null,
    safetyCar: info?.safetyCar ?? 'NONE',
    isOnline: info?.isOnline ?? false,
    isFinished: snapshot.cars.some((car) => car.result !== null),
    startedAt: snapshot.startedAt.toISOString(),
    updatedAt: snapshot.updatedAt.toISOString(),
  };
}

function toStatsDto(
  car: TimingCar,
  stats: DriverStats,
  sessionKind: SessionKind,
): TimingDriverStatsDto {
  const { live, result } = car;
  const position = runningPosition(car);
  const gridPosition = result?.gridPosition ?? live?.gridPosition ?? null;
  const topSpeedKmh = live?.speedTrapKmh ?? null;

  return {
    ...stats,
    topSpeedKmh: topSpeedKmh === null ? null : roundTo(topSpeedKmh, 1),
    pitStops: result?.pitStops ?? live?.pitStops ?? 0,
    warnings: live?.warnings ?? 0,
    cornerCuttingWarnings: live?.cornerCuttingWarnings ?? 0,
    penaltiesSeconds: result?.penaltiesSeconds ?? live?.penaltiesSeconds ?? 0,
    positionsGained:
      sessionKind === 'RACE' && gridPosition !== null && position !== null
        ? gridPosition - position
        : null,
  };
}

function toDriverDto(
  car: TimingCar,
  stats: DriverStats,
  snapshot: TimingBoardSnapshot,
): TimingDriverDto {
  const { driver, live, result } = car;
  const sessionKind = snapshot.session?.sessionKind ?? 'UNKNOWN';

  return {
    carIndex: car.carIndex,
    name: driverName(car),
    raceNumber: driver?.raceNumber ?? null,
    teamId: driver?.teamId ?? null,
    teamName: driver?.teamName ?? null,
    isAi: driver?.isAi ?? false,
    isPlayer: car.carIndex === snapshot.playerCarIndex,
    position: runningPosition(car),
    gridPosition: result?.gridPosition ?? live?.gridPosition ?? null,
    status: result?.resultStatus ?? live?.resultStatus ?? null,
    currentLapNumber: live?.lapNumber || null,
    currentTyre: car.tyreStints.at(-1)?.compound ?? null,
    stats: toStatsDto(car, stats, sessionKind),
    laps: car.laps,
    tyreStints: car.tyreStints,
    result: result && {
      position: result.position,
      points: result.points,
      lapsCompleted: result.lapsCompleted,
      totalRaceTimeMs: result.totalRaceTimeMs,
      penaltiesSeconds: result.penaltiesSeconds,
      resultStatus: result.resultStatus,
    },
  };
}

function findTopSpeed(drivers: TimingDriverDto[]): TimingTopSpeedDto | null {
  return drivers.reduce<TimingTopSpeedDto | null>((best, driver) => {
    const speedKmh = driver.stats.topSpeedKmh;
    if (speedKmh === null || (best && best.speedKmh >= speedKmh)) return best;

    return { carIndex: driver.carIndex, driverName: driver.name, speedKmh };
  }, null);
}

export function toTimingBoardDto(
  snapshot: TimingBoardSnapshot,
): TimingBoardDto {
  const cars = [...snapshot.cars].sort(byPosition(runningPosition));
  const driverStats = cars.map((car) => ({
    car,
    carIndex: car.carIndex,
    stats: calculateDriverStats(car.laps),
  }));
  const bests = calculateSessionBests(driverStats);
  const drivers = driverStats.map(({ car, stats }) =>
    toDriverDto(car, stats, snapshot),
  );
  const names = new Map(
    drivers.map((driver) => [driver.carIndex, driver.name]),
  );
  const toRecordDto = (record: CarRecord | null): TimingCarRecordDto | null =>
    record && { ...record, driverName: names.get(record.carIndex) ?? '' };

  return {
    session: toSessionDto(snapshot),
    drivers,
    fastestLap: toRecordDto(bests.fastestLap),
    fastestSectors: bests.fastestSectors.map(toRecordDto),
    theoreticalBestLapMs: bests.theoreticalBestLapMs,
    topSpeed: findTopSpeed(drivers),
  };
}

function lapProgress(
  live: CarLiveState,
  trackLengthM: number | null,
): number | null {
  const onTrack =
    (live.resultStatus === 'ACTIVE' || live.resultStatus === 'FINISHED') &&
    live.driverStatus !== 'IN_GARAGE';
  if (!onTrack || !trackLengthM) return null;

  // Lap distance is negative until a car first crosses the line.
  const progress = live.lapDistanceM / trackLengthM;
  return roundTo(((progress % 1) + 1) % 1, 4);
}

function raceGap(live: CarLiveState): TimingGap {
  return live.position === 1
    ? NO_GAP
    : { gapToLeaderMs: live.gapToLeaderMs, intervalMs: live.intervalMs };
}

export function toTimingFrameDto(
  snapshot: TimingBoardSnapshot,
  clock: SessionClock | null,
): TimingFrameDto {
  const trackLengthM = snapshot.session?.trackLengthM ?? null;
  const cars = snapshot.cars
    .filter((car): car is TimingCar & { live: CarLiveState } => !!car.live)
    .sort(byPosition((car) => car.live?.position || null));
  const gaps =
    snapshot.session?.sessionKind === 'RACE'
      ? cars.map((car) => raceGap(car.live))
      : calculateBestLapGaps(
          cars.map(
            (car) => calculateDriverStats(car.laps).bestLap?.timeMs ?? null,
          ),
        );

  return {
    sessionUid: snapshot.sessionUid,
    timeLeftSeconds: clock?.timeLeftSeconds ?? null,
    cars: cars.map(
      ({ carIndex, live }, index): TimingCarFrameDto => ({
        carIndex,
        position: live.position,
        lapNumber: live.lapNumber,
        lapProgress: lapProgress(live, trackLengthM),
        sector: live.sector,
        currentLapMs: live.currentLapTimeMs,
        currentLapInvalid: live.currentLapInvalid,
        ...gaps[index],
        pitStatus: live.pitStatus,
        driverStatus: live.driverStatus,
      }),
    ),
  };
}

export function toTimingSessionSummaryDto(
  snapshot: TimingBoardSnapshot,
): TimingSessionSummaryDto {
  const { session, drivers, fastestLap } = toTimingBoardDto(snapshot);
  const leader = drivers.find((driver) => driver.position === 1);

  return {
    sessionUid: session.sessionUid,
    sessionKind: session.sessionKind,
    sessionName: session.sessionName,
    circuit: session.circuit,
    isOnline: session.isOnline,
    isFinished: session.isFinished,
    startedAt: session.startedAt,
    updatedAt: session.updatedAt,
    driverCount: drivers.length,
    leader: leader
      ? { carIndex: leader.carIndex, driverName: leader.name }
      : null,
    fastestLap,
  };
}
