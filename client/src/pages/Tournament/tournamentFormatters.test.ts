import assert from "node:assert/strict";
import type { RoundResult } from "../../types/tournament.types";
import {
  describeBonuses,
  driverCode,
  driverInitials,
  formatPoints,
} from "./tournamentFormatters";

assert.equal(driverInitials("Viktor Petersson"), "VP");
assert.equal(driverInitials("  carlos  "), "CA");
assert.equal(driverCode("Viktor Petersson"), "PET");
assert.equal(driverCode("Tim Von Andersson"), "AND");
assert.equal(driverCode("Max"), "MAX");

assert.equal(formatPoints(1), "1 pt");
assert.equal(formatPoints(25), "25 pts");

const result = {
  cleanLapBonus: 1,
  topSpeedBonus: 0,
} as RoundResult;
assert.deepEqual(describeBonuses(result), ["Clean laps +1"]);
