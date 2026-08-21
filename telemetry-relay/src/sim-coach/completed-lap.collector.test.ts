import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CompletedLapCollector } from "./completed-lap.collector.ts";

const header = (sessionTime: number) => ({
  m_packetFormat: 2025,
  m_packetVersion: 1,
  m_sessionUID: 123n,
  m_sessionTime: sessionTime,
  m_playerCarIndex: 0,
});

describe("CompletedLapCollector", () => {
  it("emits a distance-sampled lap when the lap number advances", () => {
    const collector = new CompletedLapCollector();
    collector.handleSession({
      m_header: header(0),
      m_sessionType: 18,
      m_trackId: 3,
      m_trackLength: 5200,
    });

    for (const [index, distanceM] of [0, 100, 200].entries()) {
      const sessionTime = index * 0.1;
      collector.handleMotion({
        m_header: header(sessionTime),
        m_carMotionData: [
          {
            m_worldPositionX: 10 + index,
            m_worldPositionY: 2,
            m_worldPositionZ: 20 + index,
            m_yaw: 0.5 + index * 0.1,
          },
        ],
      });
      collector.handleCarTelemetry({
        m_header: header(sessionTime),
        m_carTelemetryData: [
          {
            m_speed: 200 + index,
            m_throttle: 0.8,
            m_brake: 0,
            m_steer: 0.1,
            m_gear: 6,
            m_engineRPM: 11_000,
          },
        ],
      });
      collector.handleLapData({
        m_header: header(sessionTime),
        m_lapData: [
          {
            m_currentLapNum: 1,
            m_currentLapTimeInMS: index * 1_000,
            m_lapDistance: distanceM,
            m_currentLapInvalid: 0,
          },
        ],
      });
    }

    const completed = collector.handleLapData({
      m_header: header(90),
      m_lapData: [
        {
          m_currentLapNum: 2,
          m_lastLapTimeInMS: 89_500,
          m_currentLapTimeInMS: 100,
          m_lapDistance: 5,
          m_currentLapInvalid: 0,
        },
      ],
    });

    assert.equal(completed?.sourceLapId, "123:0:1");
    assert.equal(completed?.lapTimeMs, 89_500);
    assert.equal(completed?.valid, true);
    assert.equal(completed?.samples.length, 3);
    assert.deepEqual(
      completed?.samples.map((sample) => sample.distanceM),
      [0, 100, 200],
    );
    assert.deepEqual(completed?.samples[1].position, {
      x: 11,
      y: 2,
      z: 21,
    });
    assert.equal(completed?.samples[1].yawRad, 0.6);
  });

  it("keeps completed laps compatible when motion data is unavailable", () => {
    const collector = new CompletedLapCollector();
    collector.handleSession({
      m_header: header(0),
      m_sessionType: 18,
      m_trackId: 3,
      m_trackLength: 5200,
    });

    for (const [index, distanceM] of [0, 100].entries()) {
      const sessionTime = index * 0.1;
      collector.handleCarTelemetry({
        m_header: header(sessionTime),
        m_carTelemetryData: [
          {
            m_speed: 200,
            m_throttle: 0.8,
            m_brake: 0,
            m_steer: 0.1,
            m_gear: 6,
            m_engineRPM: 11_000,
          },
        ],
      });
      collector.handleLapData({
        m_header: header(sessionTime),
        m_lapData: [
          {
            m_currentLapNum: 1,
            m_currentLapTimeInMS: index * 1_000,
            m_lapDistance: distanceM,
            m_currentLapInvalid: 0,
          },
        ],
      });
    }

    const completed = collector.handleLapData({
      m_header: header(90),
      m_lapData: [
        {
          m_currentLapNum: 2,
          m_lastLapTimeInMS: 89_500,
          m_currentLapTimeInMS: 100,
          m_lapDistance: 5,
          m_currentLapInvalid: 0,
        },
      ],
    });

    assert.equal(completed?.samples[0].position, undefined);
    assert.equal(completed?.samples[0].yawRad, undefined);
  });

  it("remembers invalidity from the lap being completed", () => {
    const collector = new CompletedLapCollector();
    collector.handleSession({
      m_header: header(0),
      m_sessionType: 1,
      m_trackId: 0,
      m_trackLength: 5300,
    });

    for (const [index, invalid] of [0, 1].entries()) {
      collector.handleCarTelemetry({
        m_header: header(index * 0.1),
        m_carTelemetryData: [
          {
            m_speed: 150,
            m_throttle: 0.5,
            m_brake: 0.2,
            m_steer: 0,
            m_gear: 4,
            m_engineRPM: 9_000,
          },
        ],
      });
      collector.handleLapData({
        m_header: header(index * 0.1),
        m_lapData: [
          {
            m_currentLapNum: 4,
            m_currentLapTimeInMS: 1_000 + index * 1_000,
            m_lapDistance: index * 100,
            m_currentLapInvalid: invalid,
          },
        ],
      });
    }

    const completed = collector.handleLapData({
      m_header: header(90),
      m_lapData: [
        {
          m_currentLapNum: 5,
          m_lastLapTimeInMS: 90_000,
          m_currentLapTimeInMS: 100,
          m_lapDistance: 4,
          m_currentLapInvalid: 0,
        },
      ],
    });

    assert.equal(completed?.valid, false);
  });

  it("ignores race sessions and unsupported packet versions", () => {
    const collector = new CompletedLapCollector();
    collector.handleSession({
      m_header: header(0),
      m_sessionType: 15,
      m_trackId: 0,
      m_trackLength: 5300,
    });

    const completed = collector.handleLapData({
      m_header: header(90),
      m_lapData: [{ m_currentLapNum: 2, m_lastLapTimeInMS: 90_000 }],
    });

    assert.equal(completed, null);
  });
});
