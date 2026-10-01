import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

function body(overrides: Record<string, unknown> = {}) {
  return {
    username: 'lando4',
    password: 'papaya1',
    drivername: 'Lando Norris',
    country: 'GB',
    teamId: 'mclaren',
    ...overrides,
  };
}

async function errorsFor(overrides: Record<string, unknown> = {}) {
  const dto = plainToInstance(RegisterUserDto, body(overrides));
  const errors = await validate(dto);
  return { dto, properties: errors.map((error) => error.property) };
}

describe('RegisterUserDto', () => {
  it('accepts a complete sign-up with country and team', async () => {
    const { dto, properties } = await errorsFor();

    expect(properties).toEqual([]);
    expect(dto.country).toBe('GB');
    expect(dto.teamId).toBe('mclaren');
  });

  it('stores country codes upper-case like the country-list package', async () => {
    const { dto, properties } = await errorsFor({ country: 'se' });

    expect(properties).toEqual([]);
    expect(dto.country).toBe('SE');
  });

  it('keeps country and team optional for older clients', async () => {
    const { properties } = await errorsFor({
      country: undefined,
      teamId: undefined,
    });

    expect(properties).toEqual([]);
  });

  it('treats a null country or team as not chosen', async () => {
    const { dto, properties } = await errorsFor({
      country: null,
      teamId: null,
    });

    expect(properties).toEqual([]);
    expect(dto.country).toBeUndefined();
    expect(dto.teamId).toBeUndefined();
  });

  it.each([
    ['country', { country: 'Sweden' }],
    ['country', { country: 'SWE' }],
    ['country', { country: 'XX' }],
    ['country', { country: '' }],
    ['country', { country: 46 }],
    ['teamId', { teamId: 'red-bull' }],
    ['teamId', { teamId: 'Ferrari' }],
    ['teamId', { teamId: '' }],
    ['username', { username: 'abc' }],
    ['password', { password: '12345' }],
    ['drivername', { drivername: 'x'.repeat(25) }],
  ])('rejects an invalid %s', async (property, overrides) => {
    const { properties } = await errorsFor(overrides);

    expect(properties).toContain(property);
  });
});
