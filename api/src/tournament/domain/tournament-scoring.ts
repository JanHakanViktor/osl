import { getRuleSet } from './rule-sets';
import type {
  CompletedHeat,
  HeatLap,
  TournamentDriver,
  TournamentRound,
  TournamentSettings,
} from './tournament.types';

export type SectorTimes = [number | null, number | null, number | null];

export type HeatSummary = {
  lapsCompleted: number;
  validLapCount: number;
  bestLap: HeatLap | null;
  bestSectorsMs: SectorTimes;
  topSpeedKmh: number;
  isCleanHeat: boolean;
};

export type RoundEntry = {
  driverUserId: string;
  /** Null when the driver set no valid lap ("no time"). */
  position: number | null;
  bestLapMs: number | null;
  topSpeedKmh: number;
  basePoints: number;
  cleanLapBonus: number;
  topSpeedBonus: number;
  points: number;
};

export type FastestSector = { driverUserId: string; sectorMs: number } | null;

export type Standing = {
  position: number;
  driverUserId: string;
  points: number;
  roundWins: number;
};

export type TournamentAwards = {
  mostRoundWins: { driverUserId: string; count: number } | null;
  topSpeed: {
    driverUserId: string;
    speedKmh: number;
    circuitId: number;
  } | null;
  mostCleanLaps: { driverUserId: string; count: number } | null;
};

type ScoringInput = {
  drivers: TournamentDriver[];
  rounds: TournamentRound[];
  settings: TournamentSettings;
};

function findBestLap(laps: HeatLap[]): HeatLap | null {
  return laps.reduce<HeatLap | null>(
    (best, lap) =>
      lap.valid && (!best || lap.lapTimeMs < best.lapTimeMs) ? lap : best,
    null,
  );
}

function findBestSectors(laps: HeatLap[]): SectorTimes {
  const best: SectorTimes = [null, null, null];

  laps
    .filter((lap) => lap.valid && lap.sectorsMs.length === 3)
    .forEach((lap) =>
      lap.sectorsMs.forEach((sectorMs, index) => {
        const current = best[index];
        if (current == null || sectorMs < current) best[index] = sectorMs;
      }),
    );

  return best;
}

export function summarizeHeat(
  heat: Pick<CompletedHeat, 'laps' | 'topSpeedKmh'>,
  lapsTarget: number,
): HeatSummary {
  const validLapCount = heat.laps.filter((lap) => lap.valid).length;

  return {
    lapsCompleted: heat.laps.length,
    validLapCount,
    bestLap: findBestLap(heat.laps),
    bestSectorsMs: findBestSectors(heat.laps),
    topSpeedKmh: heat.topSpeedKmh,
    isCleanHeat:
      heat.laps.length >= lapsTarget && validLapCount === heat.laps.length,
  };
}

export function isRoundComplete(
  round: TournamentRound,
  driverCount: number,
): boolean {
  return round.heats.length >= driverCount;
}

export function classifyRound(
  round: TournamentRound,
  settings: TournamentSettings,
  driverCount: number,
): RoundEntry[] {
  const ruleSet = getRuleSet(settings.ruleSetId);
  const summaries = round.heats.map((heat) => ({
    driverUserId: heat.driverUserId,
    summary: summarizeHeat(heat, settings.lapsPerDriver),
  }));
  const roundTopSpeed = Math.max(
    0,
    ...summaries.map(({ summary }) => summary.topSpeedKmh),
  );

  // Array.prototype.sort is stable, so equal lap times keep heat order.
  const timed = summaries
    .filter(({ summary }) => summary.bestLap)
    .sort(
      (a, b) => a.summary.bestLap!.lapTimeMs - b.summary.bestLap!.lapTimeMs,
    );
  const untimed = summaries.filter(({ summary }) => !summary.bestLap);

  return [...timed, ...untimed].map(({ driverUserId, summary }, index) => {
    const position = summary.bestLap ? index + 1 : null;
    const basePoints =
      position == null ? 0 : ruleSet.pointsForPosition(position, driverCount);
    const cleanLapBonus = settings.cleanLapBonus && summary.isCleanHeat ? 1 : 0;
    const topSpeedBonus =
      settings.topSpeedBonus &&
      roundTopSpeed > 0 &&
      summary.topSpeedKmh === roundTopSpeed
        ? 1
        : 0;

    return {
      driverUserId,
      position,
      bestLapMs: summary.bestLap?.lapTimeMs ?? null,
      topSpeedKmh: summary.topSpeedKmh,
      basePoints,
      cleanLapBonus,
      topSpeedBonus,
      points: basePoints + cleanLapBonus + topSpeedBonus,
    };
  });
}

export function findFastestSectors(
  round: TournamentRound,
): [FastestSector, FastestSector, FastestSector] {
  const fastest: [FastestSector, FastestSector, FastestSector] = [
    null,
    null,
    null,
  ];

  round.heats.forEach((heat) =>
    findBestSectors(heat.laps).forEach((sectorMs, index) => {
      const current = fastest[index];
      if (sectorMs != null && (!current || sectorMs < current.sectorMs)) {
        fastest[index] = { driverUserId: heat.driverUserId, sectorMs };
      }
    }),
  );

  return fastest;
}

export function buildStandings(input: ScoringInput): Standing[] {
  const totals = new Map(
    input.drivers.map((driver, order) => [
      driver.userId,
      { driverUserId: driver.userId, points: 0, roundWins: 0, order },
    ]),
  );

  input.rounds
    .filter((round) => isRoundComplete(round, input.drivers.length))
    .forEach((round) =>
      classifyRound(round, input.settings, input.drivers.length).forEach(
        (entry) => {
          const total = totals.get(entry.driverUserId);
          if (!total) return;

          total.points += entry.points;
          if (entry.position === 1) total.roundWins += 1;
        },
      ),
    );

  return [...totals.values()]
    .sort(
      (a, b) =>
        b.points - a.points || b.roundWins - a.roundWins || a.order - b.order,
    )
    .map(({ driverUserId, points, roundWins }, index) => ({
      position: index + 1,
      driverUserId,
      points,
      roundWins,
    }));
}

export function buildAwards(input: ScoringInput): TournamentAwards {
  const standings = buildStandings(input);
  const roundWinner = standings.reduce<Standing | null>(
    (best, standing) =>
      standing.roundWins > (best?.roundWins ?? 0) ? standing : best,
    null,
  );

  let topSpeed: TournamentAwards['topSpeed'] = null;
  const cleanLaps = new Map<string, number>();

  input.rounds.forEach((round) =>
    round.heats.forEach((heat) => {
      if (heat.topSpeedKmh > (topSpeed?.speedKmh ?? 0)) {
        topSpeed = {
          driverUserId: heat.driverUserId,
          speedKmh: heat.topSpeedKmh,
          circuitId: round.circuitId,
        };
      }

      const validLaps = heat.laps.filter((lap) => lap.valid).length;
      cleanLaps.set(
        heat.driverUserId,
        (cleanLaps.get(heat.driverUserId) ?? 0) + validLaps,
      );
    }),
  );

  const mostCleanLaps = input.drivers.reduce<TournamentAwards['mostCleanLaps']>(
    (best, driver) => {
      const count = cleanLaps.get(driver.userId) ?? 0;
      return count > (best?.count ?? 0)
        ? { driverUserId: driver.userId, count }
        : best;
    },
    null,
  );

  return {
    mostRoundWins: roundWinner
      ? { driverUserId: roundWinner.driverUserId, count: roundWinner.roundWins }
      : null,
    topSpeed,
    mostCleanLaps,
  };
}
