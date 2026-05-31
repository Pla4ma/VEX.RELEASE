/**
 * Mastery Feature — getMasteryRankDisplay Tests
 */

import type { MasteryRank } from '../types';
import { getMasteryRankDisplay } from '../types';

describe('getMasteryRankDisplay', () => {
  it('returns valid display for each rank', () => {
    const ranks: MasteryRank[] = [
      'APPRENTICE',
      'ADEPT',
      'EXPERT',
      'MASTER',
      'GRANDMASTER',
    ];
    for (const rank of ranks) {
      const display = getMasteryRankDisplay(rank);
      expect(display).toHaveProperty('title');
      expect(display).toHaveProperty('color');
      expect(display).toHaveProperty('icon');
      expect(typeof display.title).toBe('string');
      expect(typeof display.color).toBe('string');
      expect(typeof display.icon).toBe('string');
    }
  });

  it('APPRENTICE has seedling icon', () => {
    expect(getMasteryRankDisplay('APPRENTICE').icon).toBe('🌱');
  });

  it('GRANDMASTER has star icon', () => {
    expect(getMasteryRankDisplay('GRANDMASTER').icon).toBe('⭐');
  });
});
