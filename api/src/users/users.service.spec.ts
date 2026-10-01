import { describe, expect, it, jest } from '@jest/globals';
import { Types } from 'mongoose';
import { UsersService } from './users.service';

function userModelWithoutExistingUsers() {
  return {
    findOne: jest.fn(() => Promise.resolve(null)),
    create: jest.fn((user: Record<string, unknown>) => Promise.resolve(user)),
  };
}

describe('UsersService createUser', () => {
  it('stores the country and team chosen at sign-up', async () => {
    const userModel = userModelWithoutExistingUsers();
    const service = new UsersService(userModel as never);

    await service.createUser({
      username: 'lando4',
      password: 'papaya1',
      drivername: 'Lando Norris',
      country: 'GB',
      teamId: 'mclaren',
    });

    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'lando4',
        drivername: 'Lando Norris',
        country: 'GB',
        teamId: 'mclaren',
        isAdmin: false,
      }),
    );
  });

  it('leaves country and team unset when the driver skips them', async () => {
    const userModel = userModelWithoutExistingUsers();
    const service = new UsersService(userModel as never);

    await service.createUser({ username: 'rookie1', password: 'secret1' });

    const [storedUser] = userModel.create.mock.calls[0];
    expect(storedUser.drivername).toBe('rookie1');
    expect(storedUser.country).toBeUndefined();
    expect(storedUser.teamId).toBeUndefined();
  });
});

describe('UsersService findSessionUser', () => {
  it('loads the country and team but never the password hash', async () => {
    const select = jest.fn(() => Promise.resolve(null));
    const userModel = { findById: jest.fn(() => ({ select })) };
    const service = new UsersService(userModel as never);

    await service.findSessionUser(new Types.ObjectId().toString());

    const [projection] = select.mock.calls[0] as unknown as [string];
    const fields = projection.split(' ');
    expect(fields).toEqual(expect.arrayContaining(['country', 'teamId']));
    expect(fields).not.toContain('password');
  });
});

describe('UsersService driver lists', () => {
  const landoId = new Types.ObjectId();
  const veteranId = new Types.ObjectId();
  const storedUsers = [
    {
      _id: landoId,
      username: 'lando4',
      drivername: 'Lando Norris',
      country: 'GB',
      teamId: 'mclaren',
    },
    { _id: veteranId, username: 'veteran' },
  ];

  function userModelReturning(users: typeof storedUsers) {
    const query = {
      select: jest.fn(() => query),
      sort: jest.fn(() => query),
      lean: jest.fn(() => Promise.resolve(users)),
    };
    return { model: { find: jest.fn(() => query) }, query };
  }

  it.each([
    ['findDrivers', (service: UsersService) => service.findDrivers()],
    [
      'findDriversByIds',
      (service: UsersService) =>
        service.findDriversByIds([landoId.toString(), veteranId.toString()]),
    ],
  ])(
    '%s includes each driver flag and team, null when not chosen',
    async (_method, listDrivers) => {
      const { model, query } = userModelReturning(storedUsers);
      const service = new UsersService(model as never);

      await expect(listDrivers(service)).resolves.toEqual([
        {
          id: landoId.toString(),
          driverName: 'Lando Norris',
          country: 'GB',
          teamId: 'mclaren',
        },
        {
          id: veteranId.toString(),
          driverName: 'veteran',
          country: null,
          teamId: null,
        },
      ]);
      const [projection] = query.select.mock.calls[0] as unknown as [string];
      expect(projection.split(' ')).toEqual(
        expect.arrayContaining(['country', 'teamId']),
      );
    },
  );
});
