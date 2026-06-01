/**
 * Progression Service Tests
 */

import {
  calculateLevelThreshold,
  calculateTotalXpToLevel,
  calculateLevelFromTotalXp,
} from '../service-xp-calculations';

describe('ProgressionService', () => {
  describe('calculateLevelThreshold', () => {
    it('should calculate correct XP for level 1', () => {
      expect(calculateLevelThreshold(1)).toBe(100);
    });

    it('should calculate correct XP for level 2', () => {
      expect(calculateLevelThreshold(2)).toBe(125);
    });

    it('should calculate correct XP for level 5', () => {
      expect(calculateLevelThreshold(5)).toBe(244);
    });

    it('should calculate correct XP for level 10', () => {
      expect(calculateLevelThreshold(10)).toBe(745);
    });

    it('should increase exponentially by level', () => {
      const level5 = calculateLevelThreshold(5);
      const level6 = calculateLevelThreshold(6);
      expect(level6).toBeGreaterThan(level5);
    });
  });

  describe('calculateTotalXpToLevel', () => {
    it('should return 0 for level 1', () => {
      expect(calculateTotalXpToLevel(1)).toBe(0);
    });

    it('should return base XP for level 2', () => {
      expect(calculateTotalXpToLevel(2)).toBe(100);
    });

    it('should accumulate XP correctly (exponential)', () => {
      expect(calculateTotalXpToLevel(5)).toBe(576);
    });
  });

  describe('calculateLevelFromTotalXp', () => {
    it('should return level 1 for 0 XP', () => {
      expect(calculateLevelFromTotalXp(0)).toBe(1);
    });

    it('should return level 1 for 50 XP', () => {
      expect(calculateLevelFromTotalXp(50)).toBe(1);
    });

    it('should return level 2 at threshold', () => {
      expect(calculateLevelFromTotalXp(100)).toBe(2);
    });

    it('should cap at max level', () => {
      expect(calculateLevelFromTotalXp(Number.MAX_SAFE_INTEGER)).toBe(100);
    });
  });
});
