import { describe, expect, it } from '@jest/globals';
import { mapRaceNetReference } from './race-net-reference.mapper';
import type { RaceNetReferencePayload } from './race-net-reference.types';
import { assertRaceNetReference } from './race-net-reference.validator';

const payload: RaceNetReferencePayload = {
  schemaVersion: 1,
  source: 'racenet',
  game: 'F1 25',
  extractedAt: '2026-08-16T12:00:00.000Z',
  circuitId: 0,
  circuitName: 'Australia',
  raceNetTrackId: '00',
  leaderboard: {
    ssid: '1016414074977',
    driverName: 'Otis Lawrence',
    rank: 4,
    timeMs: 74_833,
    assists: [4],
    equalPerformance: true,
  },
  raw: {
    data: {
      performanceAnalysisMetadata: {
        playerName: 'Otis Lawrence',
        assistsEverUsed: false,
        lapTime: '74.834',
        sectorTimes: ['25.914', '17.201', '31.719'],
      },
      minDistance: 0,
      maxDistance: 20,
      minMillis: 0,
      maxMillis: 250,
      millis: [0, 250],
      distance: [0, 20],
      speed: [300, 280],
      throttle: [100, 25],
      brake: [0, 80],
      steering: [-50, 25],
      gear: [8, 6],
      rpm: [150, 120],
      position: [
        { x: 10, y: 2, z: 20 },
        { x: 30, y: 3, z: 40 },
      ],
      rotation: [
        { w: 1, x: 0, y: 0, z: 0 },
        { w: 1, x: 0, y: 0, z: 0 },
      ],
    },
    renderSettings: {},
  },
};

describe('mapRaceNetReference', () => {
  it('preserves provenance and normalizes RaceNet telemetry units', () => {
    expect(mapRaceNetReference(payload)).toEqual({
      id: 'racenet:f1-25:00:1016414074977',
      circuitId: 0,
      source: 'racenet',
      driverName: 'Otis Lawrence',
      leaderboardRank: 4,
      lapNumber: 0,
      lapTimeMs: 74_833,
      valid: true,
      trackLengthM: 20,
      samples: [
        {
          distanceM: 0,
          elapsedMs: 0,
          speedKmh: 300,
          throttle: 1,
          brake: 0,
          steer: -0.5,
          gear: 8,
          engineRpm: 15_000,
          position: { x: 10, y: 2, z: 20 },
        },
        {
          distanceM: 20,
          elapsedMs: 250,
          speedKmh: 280,
          throttle: 0.25,
          brake: 0.8,
          steer: 0.25,
          gear: 6,
          engineRpm: 12_000,
          position: { x: 30, y: 3, z: 40 },
        },
      ],
    });
  });

  it('rejects a lap whose RaceNet metadata reports an assist', () => {
    const assistedPayload: RaceNetReferencePayload = {
      ...payload,
      raw: {
        ...payload.raw,
        data: {
          ...payload.raw.data,
          performanceAnalysisMetadata: {
            ...payload.raw.data.performanceAnalysisMetadata,
            assistsEverUsed: true,
          },
        },
      },
    };

    expect(() => assertRaceNetReference(assistedPayload)).toThrow(
      'no-assist equal-performance',
    );
  });
});
