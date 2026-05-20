import {
  getFastestLapRecord,
  getValidSectorBreakdown,
} from './session.service';

describe('getValidSectorBreakdown', () => {
  it('keeps complete three-sector lap breakdowns', () => {
    expect(getValidSectorBreakdown([29_100, 31_200, 30_934])).toEqual([
      29_100,
      31_200,
      30_934,
    ]);
  });

  it('rejects partial sector arrays that would shift values into the wrong sector', () => {
    expect(getValidSectorBreakdown([91_234])).toEqual([]);
  });
});

describe('getFastestLapRecord', () => {
  it('returns the fastest lap with the previous record it improved on', () => {
    const record = getFastestLapRecord([
      {
        telemetry: { fastestLapMs: 94_500 },
        userId: { username: 'first-driver' },
      },
      {
        telemetry: { fastestLapMs: 93_250 },
        userId: { drivername: 'Previous Best' },
      },
      {
        telemetry: { fastestLapMs: 92_900 },
        userId: { drivername: 'Current Best' },
      },
    ]);

    expect(record?.fastest.telemetry.fastestLapMs).toBe(92_900);
    expect(record?.previousFastest?.telemetry.fastestLapMs).toBe(93_250);
    expect(record?.previousFastestDriverName).toBe('Previous Best');
  });

  it('has no previous record when only one valid lap exists', () => {
    const record = getFastestLapRecord([
      {
        telemetry: { fastestLapMs: 91_000 },
        userId: { drivername: 'Only Best' },
      },
    ]);

    expect(record?.fastest.telemetry.fastestLapMs).toBe(91_000);
    expect(record?.previousFastest).toBeNull();
    expect(record?.previousFastestDriverName).toBeNull();
  });
});
