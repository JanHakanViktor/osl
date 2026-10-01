export const RULE_SET_IDS = [
  'LADDER',
  'GRAND_PRIX',
  'WINNER_TAKES_ALL',
] as const;

export type RuleSetId = (typeof RULE_SET_IDS)[number];

/** Strategy for turning a round finishing position into points. */
export interface PointsRuleSet {
  readonly id: RuleSetId;
  readonly name: string;
  readonly tagline: string;
  readonly rules: readonly string[];
  pointsForPosition(position: number, driverCount: number): number;
}

class LadderRuleSet implements PointsRuleSet {
  readonly id = 'LADDER';
  readonly name = 'Ladder';
  readonly tagline = 'Every place counts';
  readonly rules = [
    'The fastest driver scores one point per driver in the tournament',
    'Each place below scores one point less',
    'No valid lap time scores 0 points',
    'Most points after the final track wins',
  ];

  pointsForPosition(position: number, driverCount: number): number {
    return Math.max(driverCount - position + 1, 0);
  }
}

class GrandPrixRuleSet implements PointsRuleSet {
  private static readonly POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

  readonly id = 'GRAND_PRIX';
  readonly name = 'Grand Prix';
  readonly tagline = 'Classic F1 points';
  readonly rules = [
    'Points per track: 25 · 18 · 15 · 12 · 10 · 8 · 6 · 4 · 2 · 1',
    'Big reward for winning a track',
    'No valid lap time scores 0 points',
    'Most points after the final track wins',
  ];

  pointsForPosition(position: number): number {
    return GrandPrixRuleSet.POINTS[position - 1] ?? 0;
  }
}

class WinnerTakesAllRuleSet implements PointsRuleSet {
  private static readonly WIN_POINTS = 3;

  readonly id = 'WINNER_TAKES_ALL';
  readonly name = 'Winner Takes All';
  readonly tagline = 'Only the fastest scores';
  readonly rules = [
    'The fastest driver on each track scores 3 points',
    'Everybody else scores 0 points',
    'Bonus points can still swing the title',
    'Most points after the final track wins',
  ];

  pointsForPosition(position: number): number {
    return position === 1 ? WinnerTakesAllRuleSet.WIN_POINTS : 0;
  }
}

const RULE_SETS: Record<RuleSetId, PointsRuleSet> = {
  LADDER: new LadderRuleSet(),
  GRAND_PRIX: new GrandPrixRuleSet(),
  WINNER_TAKES_ALL: new WinnerTakesAllRuleSet(),
};

export function getRuleSet(id: RuleSetId): PointsRuleSet {
  return RULE_SETS[id];
}

export function listRuleSets(): PointsRuleSet[] {
  return RULE_SET_IDS.map((id) => RULE_SETS[id]);
}

export function isRuleSetId(value: unknown): value is RuleSetId {
  return (
    typeof value === 'string' &&
    (RULE_SET_IDS as readonly string[]).includes(value)
  );
}
