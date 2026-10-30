import { describe, expect, it } from '@jest/globals';
import {
  readCarLapHistory,
  readCarLiveStates,
  readDrivers,
  readFinalResults,
  readPlayerCarIndex,
  readSessionInfo,
  readSessionUid,
} from './timing-packet.mapper';

describe('timing packet mapper', () => {
  describe('readSessionUid', () => {
    it('reads the relay’s stringified 64-bit uid', () => {
      expect(readSessionUid({ m_sessionUID: '18446744073709551615' })).toBe(
        '18446744073709551615',
      );
    });

    it('treats a zero or missing uid as no session', () => {
      expect(readSessionUid({ m_sessionUID: '0' })).toBeNull();
      expect(readSessionUid({})).toBeNull();
      expect(readSessionUid(undefined)).toBeNull();
    });
  });

  it('reads 255 as no player car', () => {
    expect(readPlayerCarIndex({ m_playerCarIndex: 255 })).toBeNull();
    expect(readPlayerCarIndex({ m_playerCarIndex: 3 })).toBe(3);
  });

  it('maps the session packet to readable session info', () => {
    expect(
      readSessionInfo({
        m_sessionType: 15,
        m_trackId: 7,
        m_trackLength: 5891,
        m_totalLaps: 25,
        m_weather: 3,
        m_trackTemperature: 31,
        m_airTemperature: 22,
        m_safetyCarStatus: 2,
        m_networkGame: 1,
      }),
    ).toEqual({
      sessionKind: 'RACE',
      sessionName: 'Race',
      f1TrackId: 7,
      trackLengthM: 5891,
      totalLaps: 25,
      weather: 'LIGHT_RAIN',
      trackTemperatureC: 31,
      airTemperatureC: 22,
      safetyCar: 'VIRTUAL',
      isOnline: true,
    });
  });

  it('marks an unknown track and session type', () => {
    const info = readSessionInfo({ m_sessionType: 99, m_trackId: -1 });

    expect(info.sessionKind).toBe('UNKNOWN');
    expect(info.f1TrackId).toBeNull();
    expect(info.trackLengthM).toBeNull();
  });

  describe('readDrivers', () => {
    it('reads names, teams and AI control for the active cars only', () => {
      const drivers = readDrivers({
        m_numActiveCars: 2,
        m_participants: [
          {
            m_name: 'NORRIS ',
            m_teamId: 8,
            m_raceNumber: 4,
            m_aiControlled: 1,
          },
          { m_name: 'LeagueMate', m_teamId: 104, m_raceNumber: 0 },
          { m_name: '', m_teamId: 0 },
        ],
      });

      expect(drivers).toEqual([
        {
          name: 'NORRIS',
          raceNumber: 4,
          teamId: 'mclaren',
          teamName: 'McLaren',
          isAi: true,
        },
        {
          name: 'LeagueMate',
          raceNumber: null,
          teamId: null,
          teamName: 'My Team',
          isAi: false,
        },
        null,
      ]);
    });

    it('maps 2024 cars to the same OSL team', () => {
      const [driver] = readDrivers({
        m_numActiveCars: 1,
        m_participants: [{ m_name: 'A', m_teamId: 186 }],
      });

      expect(driver?.teamId).toBe('ferrari');
    });
  });

  describe('readCarLiveStates', () => {
    it('combines minute and millisecond parts and reads the enums', () => {
      const [state] = readCarLiveStates({
        m_lapData: [
          {
            m_carPosition: 3,
            m_currentLapNum: 7,
            m_lapDistance: 1200.5,
            m_currentLapTimeInMS: 45_000,
            m_currentLapInvalid: 1,
            m_sector: 1,
            m_pitStatus: 1,
            m_driverStatus: 2,
            m_resultStatus: 2,
            m_deltaToRaceLeaderMinutesPart: 1,
            m_deltaToRaceLeaderMSPart: 2_345,
            m_deltaToCarInFrontMinutesPart: 0,
            m_deltaToCarInFrontMSPart: 812,
            m_gridPosition: 5,
            m_numPitStops: 1,
            m_penalties: 5,
            m_totalWarnings: 2,
            m_cornerCuttingWarnings: 1,
            m_speedTrapFastestSpeed: 318.4,
            m_speedTrapFastestLap: 4,
          },
        ],
      });

      expect(state).toEqual({
        position: 3,
        lapNumber: 7,
        lapDistanceM: 1200.5,
        currentLapTimeMs: 45_000,
        currentLapInvalid: true,
        sector: 2,
        pitStatus: 'PITTING',
        driverStatus: 'IN_LAP',
        resultStatus: 'ACTIVE',
        gapToLeaderMs: 62_345,
        intervalMs: 812,
        gridPosition: 5,
        pitStops: 1,
        penaltiesSeconds: 5,
        warnings: 2,
        cornerCuttingWarnings: 1,
        speedTrapKmh: 318.4,
      });
    });

    it('returns null for unused car slots', () => {
      expect(readCarLiveStates({ m_lapData: [{ m_resultStatus: 0 }] })).toEqual(
        [null],
      );
    });

    it('has no speed trap speed while the speed trap lap is 255', () => {
      const [state] = readCarLiveStates({
        m_lapData: [
          {
            m_resultStatus: 2,
            m_speedTrapFastestSpeed: 0,
            m_speedTrapFastestLap: 255,
            m_gridPosition: 0,
          },
        ],
      });

      expect(state?.speedTrapKmh).toBeNull();
      expect(state?.gridPosition).toBeNull();
    });
  });

  describe('readCarLapHistory', () => {
    it('reads completed laps, dropping the lap in progress', () => {
      const history = readCarLapHistory({
        m_carIdx: 4,
        m_numLaps: 3,
        m_lapHistoryData: [
          {
            m_lapTimeInMS: 91_500,
            m_sector1TimeMSPart: 30_100,
            m_sector2TimeMinutesPart: 0,
            m_sector2TimeMSPart: 31_200,
            m_sector3TimeMSPart: 30_200,
            m_lapValidBitFlags: 0x0f,
          },
          {
            m_lapTimeInMS: 95_000,
            m_sector1TimeMSPart: 30_000,
            m_sector2TimeMSPart: 34_000,
            m_sector3TimeMSPart: 31_000,
            m_lapValidBitFlags: 0x0a,
          },
          { m_lapTimeInMS: 0, m_sector1TimeMSPart: 29_900 },
          { m_lapTimeInMS: 90_000 },
        ],
        m_numTyreStints: 2,
        m_tyreStintsHistoryData: [
          { m_tyreVisualCompound: 17, m_endLap: 1 },
          { m_tyreVisualCompound: 16, m_endLap: 255 },
          { m_tyreVisualCompound: 18, m_endLap: 0 },
        ],
      });

      expect(history).toEqual({
        carIndex: 4,
        laps: [
          {
            lapNumber: 1,
            lapTimeMs: 91_500,
            sectorsMs: [30_100, 31_200, 30_200],
            valid: true,
            sectorsValid: [true, true, true],
          },
          {
            lapNumber: 2,
            lapTimeMs: 95_000,
            sectorsMs: [30_000, 34_000, 31_000],
            valid: false,
            sectorsValid: [true, false, true],
          },
        ],
        tyreStints: [
          { compound: 'MEDIUM', endLap: 1 },
          { compound: 'SOFT', endLap: null },
        ],
      });
    });

    it('combines sector minutes for slow sectors', () => {
      const history = readCarLapHistory({
        m_carIdx: 0,
        m_numLaps: 1,
        m_lapHistoryData: [
          {
            m_lapTimeInMS: 150_000,
            m_sector1TimeMinutesPart: 1,
            m_sector1TimeMSPart: 5_000,
          },
        ],
      });

      expect(history?.laps[0].sectorsMs).toEqual([65_000, null, null]);
    });
  });

  it('reads final results in milliseconds and skips unclassified slots', () => {
    const results = readFinalResults({
      m_numCars: 2,
      m_classificationData: [
        {
          m_position: 1,
          m_numLaps: 25,
          m_gridPosition: 3,
          m_points: 25,
          m_numPitStops: 1,
          m_resultStatus: 3,
          m_bestLapTimeInMS: 89_123,
          m_totalRaceTime: 2_301.4567,
          m_penaltiesTime: 5,
        },
        { m_position: 0, m_resultStatus: 0 },
      ],
    });

    expect(results).toEqual([
      {
        position: 1,
        points: 25,
        lapsCompleted: 25,
        gridPosition: 3,
        pitStops: 1,
        resultStatus: 'FINISHED',
        bestLapMs: 89_123,
        totalRaceTimeMs: 2_301_457,
        penaltiesSeconds: 5,
      },
      null,
    ]);
  });
});
