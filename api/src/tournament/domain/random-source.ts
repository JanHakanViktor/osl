/** Source of randomness so dice rolls and track shuffles stay testable. */
export interface RandomSource {
  /** Returns an integer from 0 (inclusive) to maxExclusive (exclusive). */
  nextInt(maxExclusive: number): number;
}

export class MathRandomSource implements RandomSource {
  nextInt(maxExclusive: number): number {
    return Math.floor(Math.random() * maxExclusive);
  }
}

/** Fisher-Yates shuffle that returns a new array. */
export function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = random.nextInt(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}
