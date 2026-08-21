import { describe, expect, it } from '@jest/globals';
import { mapF1TrackIdToOslCircuitId } from './f1-track-id.mapper';

describe('mapF1TrackIdToOslCircuitId', () => {
  it.each([
    [0, 0, 'Melbourne'],
    [17, 8, 'Austria'],
    [13, 1, 'Suzuka'],
    [30, 3, 'Miami'],
    [32, 20, 'Losail'],
    [3, 22, 'Sakhir'],
  ])('maps F1 track %i to OSL circuit %i (%s)', (f1TrackId, circuitId) => {
    expect(mapF1TrackIdToOslCircuitId(f1TrackId)).toBe(circuitId);
  });

  it('does not silently map unsupported reverse layouts', () => {
    expect(mapF1TrackIdToOslCircuitId(40)).toBeUndefined();
  });
});
