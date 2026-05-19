import { getValidSectorBreakdown } from './session.service';

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
