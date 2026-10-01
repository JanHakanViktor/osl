import { describe, expect, it } from '@jest/globals';
import { getRuleSet, isRuleSetId, listRuleSets } from './rule-sets';

describe('rule sets', () => {
  it('ladder awards one point per beaten driver plus one', () => {
    const ladder = getRuleSet('LADDER');

    expect([1, 2, 3, 4].map((p) => ladder.pointsForPosition(p, 4))).toEqual([
      4, 3, 2, 1,
    ]);
  });

  it('grand prix uses the classic F1 top-ten points', () => {
    const grandPrix = getRuleSet('GRAND_PRIX');

    expect(grandPrix.pointsForPosition(1, 3)).toBe(25);
    expect(grandPrix.pointsForPosition(3, 3)).toBe(15);
    expect(grandPrix.pointsForPosition(10, 12)).toBe(1);
    expect(grandPrix.pointsForPosition(11, 12)).toBe(0);
  });

  it('winner takes all only rewards the round winner', () => {
    const winnerTakesAll = getRuleSet('WINNER_TAKES_ALL');

    expect(winnerTakesAll.pointsForPosition(1, 3)).toBe(3);
    expect(winnerTakesAll.pointsForPosition(2, 3)).toBe(0);
  });

  it('describes every rule set for the selection screen', () => {
    const ruleSets = listRuleSets();

    expect(ruleSets.map((ruleSet) => ruleSet.id)).toEqual([
      'LADDER',
      'GRAND_PRIX',
      'WINNER_TAKES_ALL',
    ]);
    ruleSets.forEach((ruleSet) => {
      expect(ruleSet.name).not.toHaveLength(0);
      expect(ruleSet.rules.length).toBeGreaterThan(0);
    });
  });

  it('recognises only known rule set ids', () => {
    expect(isRuleSetId('LADDER')).toBe(true);
    expect(isRuleSetId('SPRINT')).toBe(false);
  });
});
