import { SessionTelemetryService } from './session-telemetry.service';

describe('SessionTelemetryService', () => {
  let service: SessionTelemetryService;

  beforeEach(() => {
    service = new SessionTelemetryService({} as never);
  });

  describe('completeSectorBreakdown', () => {
    it('does not turn a lap total into a fake sector when sector data is missing', () => {
      const sectors = (
        service as unknown as {
          completeSectorBreakdown(lapTime: number, sectors: number[]): number[];
        }
      ).completeSectorBreakdown(91_234, []);

      expect(sectors).toEqual([]);
    });

    it('derives sector 3 only when sector 1 and sector 2 are available', () => {
      const sectors = (
        service as unknown as {
          completeSectorBreakdown(lapTime: number, sectors: number[]): number[];
        }
      ).completeSectorBreakdown(91_234, [29_100, 31_200]);

      expect(sectors).toEqual([29_100, 31_200, 30_934]);
    });
  });
});
