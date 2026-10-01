import { describe, expect, it } from '@jest/globals';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TEAM_IDS } from './team';

describe('TEAM_IDS', () => {
  it('matches the team ids the client offers at sign-up', () => {
    const clientTeamsSource = readFileSync(
      join(process.cwd(), '..', 'client', 'src', 'data', 'team.ts'),
      'utf8',
    );
    const clientTeamIds = [
      ...clientTeamsSource.matchAll(/\bid:\s*["']([^"']+)["']/g),
    ].map(([, id]) => id);

    expect([...TEAM_IDS].sort()).toEqual(clientTeamIds.sort());
  });
});
