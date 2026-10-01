import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import cookieSession from 'cookie-session';
import { Types } from 'mongoose';
import request from 'supertest';
import { UsersService, type NewUser } from 'src/users/users.service';
import { AuthController } from './auth.controller';

const storedUser = {
  _id: new Types.ObjectId(),
  username: 'lando4',
  drivername: 'Lando Norris',
  isAdmin: false,
  country: 'GB',
  teamId: 'mclaren',
};

const signUp = {
  username: 'lando4',
  password: 'papaya1',
  drivername: 'Lando Norris',
  country: 'GB',
  teamId: 'mclaren',
};

describe('AuthController', () => {
  let app: NestExpressApplication;
  const usersService = {
    createUser: jest.fn<(newUser: NewUser) => Promise<typeof storedUser>>(() =>
      Promise.resolve(storedUser),
    ),
    findSessionUser: jest.fn(() => Promise.resolve(storedUser)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    // Same request pipeline as main.ts.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.use(cookieSession({ name: 'session', keys: ['test-secret'] }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('stores the sign-up country and team and returns them for the session', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/register')
      .send(signUp)
      .expect(201);

    expect(usersService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ country: 'GB', teamId: 'mclaren' }),
    );
    expect(response.body).toEqual({
      id: storedUser._id.toString(),
      username: 'lando4',
      drivername: 'Lando Norris',
      isAdmin: false,
      country: 'GB',
      teamId: 'mclaren',
    });
  });

  it('returns the stored country and team from GET /users/me', async () => {
    const agent = request.agent(app.getHttpServer());
    await agent.post('/users/register').send(signUp).expect(201);

    const response = await agent.get('/users/me').expect(200);

    expect(response.body).toMatchObject({ country: 'GB', teamId: 'mclaren' });
  });

  it.each([
    ['country', { country: 'Sweden' }],
    ['teamId', { teamId: 'brawn' }],
  ])(
    'rejects an unknown %s before creating the user',
    async (_field, overrides) => {
      await request(app.getHttpServer())
        .post('/users/register')
        .send({ ...signUp, ...overrides })
        .expect(400);

      expect(usersService.createUser).not.toHaveBeenCalled();
    },
  );
});
