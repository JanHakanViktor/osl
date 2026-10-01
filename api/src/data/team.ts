/**
 * Teams a driver can pick at sign-up. Mirrors the ids in
 * client/src/data/team.ts, which owns the team names and logos.
 */
export const TEAM_IDS = [
  'redbull',
  'ferrari',
  'mercedes',
  'mclaren',
  'alpine',
  'vcarb',
  'haas',
  'sauber',
  'williams',
  'aston',
] as const;

export type TeamId = (typeof TEAM_IDS)[number];
