import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Types } from 'mongoose';
import { CreateTournamentDto } from './create-tournament.dto';

function body(overrides: Record<string, unknown> = {}) {
  return {
    name: '  Friday League  ',
    weather: 'WET',
    lapsPerDriver: 3,
    cleanLapBonus: true,
    topSpeedBonus: true,
    ruleSetId: 'LADDER',
    driverIds: [
      new Types.ObjectId().toString(),
      new Types.ObjectId().toString(),
    ],
    circuitIds: [5, 11, 13],
    ...overrides,
  };
}

async function errorsFor(overrides: Record<string, unknown> = {}) {
  const dto = plainToInstance(CreateTournamentDto, body(overrides));
  const errors = await validate(dto);
  return { dto, properties: errors.map((error) => error.property) };
}

describe('CreateTournamentDto', () => {
  it('accepts a complete tournament and trims the name', async () => {
    const { dto, properties } = await errorsFor();

    expect(properties).toEqual([]);
    expect(dto.name).toBe('Friday League');
  });

  it.each([
    ['name', { name: '   ' }],
    ['weather', { weather: 'FOG' }],
    ['lapsPerDriver', { lapsPerDriver: 0 }],
    ['lapsPerDriver', { lapsPerDriver: 1.5 }],
    ['ruleSetId', { ruleSetId: 'SPRINT' }],
    ['driverIds', { driverIds: [new Types.ObjectId().toString()] }],
    ['driverIds', { driverIds: ['not-an-id', 'also-not'] }],
    ['circuitIds', { circuitIds: [] }],
    ['circuitIds', { circuitIds: [5, 5] }],
  ])('rejects an invalid %s', async (property, overrides) => {
    const { properties } = await errorsFor(overrides);

    expect(properties).toContain(property);
  });
});
