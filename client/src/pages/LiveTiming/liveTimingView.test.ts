import assert from "node:assert/strict";
import type {
  TimingBoard,
  TimingDriver,
  TimingFrame,
  TimingLap,
} from "../../types/liveTiming.types";
import {
  bestSectorStatus,
  buildLapTimeSeries,
  buildTowerRows,
  buildTrackMarkers,
  buildTyreStintBars,
  defaultChartDrivers,
  formatGap,
  formatSectorTime,
  lapSectorStatuses,
  markerTextColor,
  teamColor,
} from "./liveTimingView";

function lap(
  lapNumber: number,
  sectorsMs: [number, number, number],
  valid = true,
): TimingLap {
  return {
    lapNumber,
    lapTimeMs: sectorsMs[0] + sectorsMs[1] + sectorsMs[2],
    sectorsMs,
    valid,
    sectorsValid: [valid, valid, valid],
  };
}

function driver(
  carIndex: number,
  overrides: Partial<TimingDriver> = {},
): TimingDriver {
  return {
    carIndex,
    name: `Driver ${carIndex}`,
    raceNumber: carIndex + 1,
    teamId: "mclaren",
    teamName: "McLaren",
    isAi: false,
    isPlayer: false,
    position: carIndex + 1,
    gridPosition: null,
    status: "ACTIVE",
    currentLapNumber: 3,
    currentTyre: "SOFT",
    stats: {
      lapsCompleted: 0,
      validLaps: 0,
      bestLap: null,
      lastLapMs: null,
      averageLapMs: null,
      consistencyMs: null,
      bestSectors: [null, null, null],
      idealLapMs: null,
      topSpeedKmh: null,
      pitStops: 0,
      warnings: 0,
      cornerCuttingWarnings: 0,
      penaltiesSeconds: 0,
      positionsGained: null,
    },
    laps: [],
    tyreStints: [],
    result: null,
    ...overrides,
  };
}

function board(
  drivers: TimingDriver[],
  overrides: Partial<TimingBoard> = {},
): TimingBoard {
  return {
    session: {
      sessionUid: "123",
      sessionKind: "RACE",
      sessionName: "Race",
      circuit: null,
      trackLengthM: 5000,
      totalLaps: 10,
      weather: "CLEAR",
      trackTemperatureC: 30,
      airTemperatureC: 22,
      safetyCar: "NONE",
      isOnline: true,
      isFinished: false,
      startedAt: "2026-10-30T18:00:00.000Z",
      updatedAt: "2026-10-30T18:10:00.000Z",
    },
    drivers,
    fastestLap: null,
    fastestSectors: [null, null, null],
    theoreticalBestLapMs: null,
    topSpeed: null,
    ...overrides,
  };
}

function frame(cars: Partial<TimingFrame["cars"][number]>[]): TimingFrame {
  return {
    sessionUid: "123",
    timeLeftSeconds: 600,
    cars: cars.map((car, index) => ({
      carIndex: index,
      position: index + 1,
      lapNumber: 3,
      lapProgress: 0.5,
      sector: 2,
      currentLapMs: 40_000,
      currentLapInvalid: false,
      gapToLeaderMs: null,
      intervalMs: null,
      pitStatus: "NONE",
      driverStatus: "FLYING_LAP",
      ...car,
    })),
  };
}

// formatGap
assert.equal(formatGap(250), "+0.250");
assert.equal(formatGap(62_345), "+1:02.345");
assert.equal(formatGap(-1_500), "-1.500");
assert.equal(formatGap(null), null);

// teamColor and markerTextColor
assert.equal(teamColor("ferrari"), "#e8002d");
assert.equal(teamColor(null), "#9aa0aa");
assert.equal(markerTextColor(teamColor("mercedes")), "#0b0d14");
assert.equal(markerTextColor(teamColor("redbull")), "#ffffff");

// buildTowerRows: live positions and race gaps from the frame
{
  const rows = buildTowerRows(
    board([driver(0), driver(1, { isPlayer: true })]),
    frame([
      { carIndex: 0, position: 2, gapToLeaderMs: 1_234, intervalMs: 1_234 },
      { carIndex: 1, position: 1, pitStatus: "PITTING" },
    ]),
  );

  assert.deepEqual(
    rows.map((row) => [row.name, row.position, row.gap, row.interval]),
    [
      ["Driver 1", 1, "Leader", "—"],
      ["Driver 0", 2, "+1.234", "+1.234"],
    ],
  );
  assert.equal(rows[0].statusLabel, "PIT");
  assert.equal(rows[0].isPlayer, true);
}

// buildTowerRows: a finished race takes order and gaps from the classification
{
  const result = (position: number, totalRaceTimeMs: number, laps = 10) => ({
    position,
    points: 0,
    lapsCompleted: laps,
    totalRaceTimeMs,
    penaltiesSeconds: 0,
    resultStatus: "FINISHED" as const,
  });
  const finished = board(
    [
      driver(0, { position: 1, result: result(1, 900_000) }),
      driver(1, {
        position: 2,
        result: { ...result(2, 902_000), penaltiesSeconds: 5 },
      }),
      driver(2, { position: 3, result: result(3, 905_000, 9) }),
      driver(3, {
        position: 4,
        status: "DID_NOT_FINISH",
        result: { ...result(4, 0, 4), resultStatus: "DID_NOT_FINISH" },
      }),
    ],
    {
      session: { ...board([]).session, isFinished: true },
    },
  );

  const rows = buildTowerRows(finished, frame([{ carIndex: 0, position: 3 }]));
  assert.deepEqual(
    rows.map((row) => [row.position, row.gap, row.interval, row.statusLabel]),
    [
      [1, "Leader", "—", null],
      [2, "+7.000", "+7.000", null],
      [3, "+1 Lap", "—", null],
      [4, "—", "—", "DNF"],
    ],
  );
}

// buildTowerRows: qualifying without a frame uses best-lap gaps
{
  const withBest = (carIndex: number, timeMs: number | null) =>
    driver(carIndex, {
      stats: {
        ...driver(carIndex).stats,
        bestLap: timeMs ? { lapNumber: 2, timeMs } : null,
      },
    });
  const qualifying = board(
    [withBest(0, 90_000), withBest(1, 90_400), withBest(2, null)],
    {
      session: { ...board([]).session, sessionKind: "QUALIFYING" },
    },
  );

  assert.deepEqual(
    buildTowerRows(qualifying, null).map((row) => [row.gap, row.interval]),
    [
      ["Leader", "—"],
      ["+0.400", "+0.400"],
      ["—", "—"],
    ],
  );
}

// buildTrackMarkers: only cars on track, player drawn last
{
  const markers = buildTrackMarkers(
    board([driver(0, { isPlayer: true }), driver(1), driver(2)]),
    frame([
      { carIndex: 0, position: 3 },
      { carIndex: 1, position: 1, lapProgress: 0.9 },
      { carIndex: 2, position: 2, lapProgress: null },
    ]),
  );

  assert.deepEqual(
    markers.map((marker) => marker.carIndex),
    [1, 0],
  );
  assert.equal(buildTrackMarkers(board([driver(0)]), null).length, 0);
}

// lapSectorStatuses and bestSectorStatus
{
  const fast = driver(0, {
    laps: [lap(1, [30_000, 31_000, 29_000]), lap(2, [29_500, 30_500, 29_800])],
    stats: {
      ...driver(0).stats,
      bestSectors: [
        { lapNumber: 2, timeMs: 29_500 },
        { lapNumber: 2, timeMs: 30_500 },
        { lapNumber: 1, timeMs: 29_000 },
      ],
    },
  });
  const timing = board([fast], {
    fastestSectors: [
      { carIndex: 0, driverName: "Driver 0", lapNumber: 2, timeMs: 29_500 },
      { carIndex: 7, driverName: "Other", lapNumber: 4, timeMs: 30_100 },
      { carIndex: 0, driverName: "Driver 0", lapNumber: 1, timeMs: 29_000 },
    ],
  });

  assert.deepEqual(lapSectorStatuses(fast.laps[1], fast, timing), [
    "purple",
    "green",
    "yellow",
  ]);
  assert.deepEqual(lapSectorStatuses(lap(3, [1, 1, 1], false), fast, timing), [
    "muted",
    "muted",
    "muted",
  ]);
  assert.equal(bestSectorStatus(fast, timing, 0), "purple");
  assert.equal(bestSectorStatus(fast, timing, 1), "green");
  assert.equal(bestSectorStatus(driver(3), timing, 1), "muted");
}

// defaultChartDrivers: top five plus the player
{
  const drivers = Array.from({ length: 8 }, (_, index) =>
    driver(index, { isPlayer: index === 6 }),
  );
  assert.deepEqual(defaultChartDrivers(board(drivers)), [0, 1, 2, 3, 4, 6]);
}

// buildLapTimeSeries: valid laps only, pit laps left out
{
  const racer = driver(0, {
    laps: [
      lap(1, [30_000, 30_000, 30_000]),
      lap(2, [30_000, 30_000, 31_000], false),
      lap(3, [30_000, 30_000, 50_000]),
      lap(4, [30_000, 30_000, 30_500]),
    ],
    stats: { ...driver(0).stats, bestLap: { lapNumber: 1, timeMs: 90_000 } },
  });
  const chart = buildLapTimeSeries([racer, driver(1)], [0]);

  assert.deepEqual(chart.lapNumbers, [1, 2, 3, 4]);
  assert.deepEqual(chart.series[0].data, [90_000, null, null, 90_500]);

  // Team mates share a team colour, so the second one is lighter.
  const teamMates = buildLapTimeSeries([racer, driver(1)], [0, 1]);
  assert.deepEqual(
    teamMates.series.map((series) => series.color),
    ["#ff8000", "#ffc080"],
  );
}

// formatSectorTime
assert.equal(formatSectorTime(29_512), "29.512");
assert.equal(formatSectorTime(65_000), "1:05.000");
assert.equal(formatSectorTime(null), "--.---");

// buildTyreStintBars: lap ranges, the current stint up to the current lap
{
  const bars = buildTyreStintBars(
    driver(0, {
      currentLapNumber: 18,
      tyreStints: [
        { compound: "MEDIUM", endLap: 12 },
        { compound: "HARD", endLap: null },
      ],
    }),
  );

  assert.deepEqual(bars, [
    { compound: "MEDIUM", startLap: 1, endLap: 12 },
    { compound: "HARD", startLap: 13, endLap: 18 },
  ]);
}
