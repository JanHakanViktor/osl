import type { TeamId } from '../../data/team';
import type {
  DriverStatus,
  PitStatus,
  ResultStatus,
  SafetyCarStatus,
  SessionKind,
  TrackWeather,
  TyreCompound,
} from '../domain/timing.types';

/** Enum values from the F1 25 UDP specification (packet format 2025). */
type SessionType = { name: string; kind: SessionKind };

const SESSION_TYPES: Readonly<Record<number, SessionType>> = {
  1: { name: 'Practice 1', kind: 'PRACTICE' },
  2: { name: 'Practice 2', kind: 'PRACTICE' },
  3: { name: 'Practice 3', kind: 'PRACTICE' },
  4: { name: 'Short Practice', kind: 'PRACTICE' },
  5: { name: 'Qualifying 1', kind: 'QUALIFYING' },
  6: { name: 'Qualifying 2', kind: 'QUALIFYING' },
  7: { name: 'Qualifying 3', kind: 'QUALIFYING' },
  8: { name: 'Short Qualifying', kind: 'QUALIFYING' },
  9: { name: 'One-Shot Qualifying', kind: 'QUALIFYING' },
  10: { name: 'Sprint Shootout 1', kind: 'QUALIFYING' },
  11: { name: 'Sprint Shootout 2', kind: 'QUALIFYING' },
  12: { name: 'Sprint Shootout 3', kind: 'QUALIFYING' },
  13: { name: 'Short Sprint Shootout', kind: 'QUALIFYING' },
  14: { name: 'One-Shot Sprint Shootout', kind: 'QUALIFYING' },
  15: { name: 'Race', kind: 'RACE' },
  16: { name: 'Race 2', kind: 'RACE' },
  17: { name: 'Race 3', kind: 'RACE' },
  18: { name: 'Time Trial', kind: 'TIME_TRIAL' },
};

const UNKNOWN_SESSION: SessionType = { name: 'Session', kind: 'UNKNOWN' };

const WEATHER: readonly TrackWeather[] = [
  'CLEAR',
  'LIGHT_CLOUD',
  'OVERCAST',
  'LIGHT_RAIN',
  'HEAVY_RAIN',
  'STORM',
];

const SAFETY_CAR: readonly SafetyCarStatus[] = [
  'NONE',
  'FULL',
  'VIRTUAL',
  'FORMATION_LAP',
];

const PIT_STATUS: readonly PitStatus[] = ['NONE', 'PITTING', 'IN_PIT_AREA'];

const DRIVER_STATUS: readonly DriverStatus[] = [
  'IN_GARAGE',
  'FLYING_LAP',
  'IN_LAP',
  'OUT_LAP',
  'ON_TRACK',
];

/** Index 0 is "invalid", a car slot nobody uses. */
const RESULT_STATUS: readonly (ResultStatus | null)[] = [
  null,
  'INACTIVE',
  'ACTIVE',
  'FINISHED',
  'DID_NOT_FINISH',
  'DISQUALIFIED',
  'NOT_CLASSIFIED',
  'RETIRED',
];

/** Visual compounds of the current F1 cars. */
const TYRE_COMPOUNDS: Readonly<Record<number, TyreCompound>> = {
  7: 'INTERMEDIATE',
  8: 'WET',
  16: 'SOFT',
  17: 'MEDIUM',
  18: 'HARD',
};

type F1Team = { name: string | null; teamId: TeamId | null };

/** Current teams, their 2024 cars, and the game's own teams. */
const TEAMS: Readonly<Record<number, F1Team>> = {
  0: { name: 'Mercedes', teamId: 'mercedes' },
  1: { name: 'Ferrari', teamId: 'ferrari' },
  2: { name: 'Red Bull Racing', teamId: 'redbull' },
  3: { name: 'Williams', teamId: 'williams' },
  4: { name: 'Aston Martin', teamId: 'aston' },
  5: { name: 'Alpine', teamId: 'alpine' },
  6: { name: 'Racing Bulls', teamId: 'vcarb' },
  7: { name: 'Haas', teamId: 'haas' },
  8: { name: 'McLaren', teamId: 'mclaren' },
  9: { name: 'Sauber', teamId: 'sauber' },
  41: { name: 'F1 Generic', teamId: null },
  104: { name: 'My Team', teamId: null },
  129: { name: 'Konnersport', teamId: null },
  142: { name: 'APXGP', teamId: null },
  154: { name: 'APXGP', teamId: null },
  155: { name: 'Konnersport', teamId: null },
  185: { name: 'Mercedes', teamId: 'mercedes' },
  186: { name: 'Ferrari', teamId: 'ferrari' },
  187: { name: 'Red Bull Racing', teamId: 'redbull' },
  188: { name: 'Williams', teamId: 'williams' },
  189: { name: 'Aston Martin', teamId: 'aston' },
  190: { name: 'Alpine', teamId: 'alpine' },
  191: { name: 'Racing Bulls', teamId: 'vcarb' },
  192: { name: 'Haas', teamId: 'haas' },
  193: { name: 'McLaren', teamId: 'mclaren' },
  194: { name: 'Sauber', teamId: 'sauber' },
};

export function readTeam(code?: number): F1Team {
  return (code != null && TEAMS[code]) || { name: null, teamId: null };
}

export function readSessionType(code?: number): SessionType {
  return (code != null && SESSION_TYPES[code]) || UNKNOWN_SESSION;
}

export function readWeather(code?: number): TrackWeather | null {
  return (code != null && WEATHER[code]) || null;
}

export function readSafetyCarStatus(code?: number): SafetyCarStatus {
  return (code != null && SAFETY_CAR[code]) || 'NONE';
}

export function readPitStatus(code?: number): PitStatus {
  return (code != null && PIT_STATUS[code]) || 'NONE';
}

export function readDriverStatus(code?: number): DriverStatus {
  return (code != null && DRIVER_STATUS[code]) || 'ON_TRACK';
}

/** Null for car slots the game marks invalid (unused). */
export function readResultStatus(code?: number): ResultStatus | null {
  return (code != null && RESULT_STATUS[code]) || null;
}

export function readTyreCompound(visualCode?: number): TyreCompound | null {
  return (visualCode != null && TYRE_COMPOUNDS[visualCode]) || null;
}
