import { calculateRestoreCost } from '../streak-funeral-costs';

describe('streak-funeral-costs', () => {
  describe('calculateRestoreCost', () => {
    it('returns 100 for streaks under 7 days', () => {
      expect(calculateRestoreCost(1)).toBe(100);
      expect(calculateRestoreCost(3)).toBe(100);
      expect(calculateRestoreCost(6)).toBe(100);
    });

    it('returns 200 for streaks 7-29 days', () => {
      expect(calculateRestoreCost(7)).toBe(200);
      expect(calculateRestoreCost(14)).toBe(200);
      expect(calculateRestoreCost(29)).toBe(200);
    });

    it('returns 500 for streaks 30+ days', () => {
      expect(calculateRestoreCost(30)).toBe(500);
      expect(calculateRestoreCost(100)).toBe(500);
      expect(calculateRestoreCost(365)).toBe(500);
    });

    it('handles zero day streak', () => {
      expect(calculateRestoreCost(0)).toBe(100);
    });
  });
});
