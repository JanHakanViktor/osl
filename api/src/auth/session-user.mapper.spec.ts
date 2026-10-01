import { describe, expect, it } from '@jest/globals';
import { Types } from 'mongoose';
import { toSessionUser } from './session-user.mapper';

describe('toSessionUser', () => {
  it('exposes the driver country and team', () => {
    const _id = new Types.ObjectId();

    expect(
      toSessionUser({
        _id,
        username: 'lando4',
        drivername: 'Lando Norris',
        isAdmin: false,
        country: 'GB',
        teamId: 'mclaren',
      }),
    ).toEqual({
      id: _id.toString(),
      username: 'lando4',
      drivername: 'Lando Norris',
      isAdmin: false,
      country: 'GB',
      teamId: 'mclaren',
    });
  });

  it('reports a missing country and team as null for users who signed up before them', () => {
    const sessionUser = toSessionUser({
      _id: new Types.ObjectId(),
      username: 'veteran',
      isAdmin: true,
    });

    expect(sessionUser.drivername).toBe('veteran');
    expect(sessionUser.country).toBeNull();
    expect(sessionUser.teamId).toBeNull();
  });
});
