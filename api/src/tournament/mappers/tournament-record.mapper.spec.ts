import { describe, expect, it } from '@jest/globals';
import { Types } from 'mongoose';
import {
  toTournamentRecord,
  toTournamentState,
  type TournamentRecordWithId,
} from './tournament-record.mapper';

const viktorId = new Types.ObjectId();
const timId = new Types.ObjectId();

function record(
  drivers: TournamentRecordWithId['drivers'],
): TournamentRecordWithId {
  return {
    _id: new Types.ObjectId(),
    hostUserId: viktorId,
    name: 'Friday League',
    weather: 'DRY',
    lapsPerDriver: 3,
    cleanLapBonus: false,
    topSpeedBonus: false,
    ruleSetId: 'LADDER',
    drivers,
    rounds: [{ circuitId: 5, heats: [] }],
    activeHeat: null,
    status: 'READY',
    winnerUserId: null,
    finishedAt: null,
    createdAt: new Date('2026-10-01T18:00:00Z'),
  };
}

describe('tournament record mapping', () => {
  it('keeps each driver flag and team through a save and load', () => {
    const state = toTournamentState(
      record([
        {
          userId: viktorId,
          driverName: 'Viktor Petersson',
          country: 'SE',
          teamId: 'ferrari',
        },
      ]),
    );

    expect(state.drivers).toEqual([
      {
        userId: viktorId.toString(),
        driverName: 'Viktor Petersson',
        country: 'SE',
        teamId: 'ferrari',
      },
    ]);
    expect(toTournamentRecord(state).drivers).toEqual([
      {
        userId: viktorId,
        driverName: 'Viktor Petersson',
        country: 'SE',
        teamId: 'ferrari',
      },
    ]);
  });

  it('reads tournaments saved before drivers had a flag or team', () => {
    const state = toTournamentState(
      record([{ userId: timId, driverName: 'Tim Andersson' }]),
    );

    expect(state.drivers).toEqual([
      {
        userId: timId.toString(),
        driverName: 'Tim Andersson',
        country: null,
        teamId: null,
      },
    ]);
  });
});
