import { describe, expect, it } from '@jest/globals';
import { SimCoachAnalysisEngine } from '../analysis/sim-coach-analysis.engine';
import { DefaultReferenceLapRepository } from './default-reference-lap.repository';

describe('DefaultReferenceLapRepository', () => {
  it('loads one validated RaceNet reference for every OSL circuit', () => {
    const repository = new DefaultReferenceLapRepository();
    const references = repository.getAll();

    expect(references).toHaveLength(24);
    expect(references.map((lap) => lap.circuitId)).toEqual(
      Array.from({ length: 24 }, (_, circuitId) => circuitId),
    );
    expect(references.every((lap) => lap.source === 'racenet')).toBe(true);
    expect(references.every((lap) => lap.samples.length >= 200)).toBe(true);
  });

  it('detects a useful sequence of corner events on every reference circuit', () => {
    const repository = new DefaultReferenceLapRepository();
    const engine = new SimCoachAnalysisEngine();

    const cornerCounts = repository
      .getAll()
      .map((reference) => engine.analyze(reference, reference).corners.length);

    expect(Math.min(...cornerCounts)).toBeGreaterThanOrEqual(5);
    expect(Math.max(...cornerCounts)).toBeLessThanOrEqual(30);
  });
});
