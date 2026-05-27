import {
  calculateTimeBonus,
  calculateStreakBonus,
  getStreakMultiplier,
  BONUS_CONSTANTS,
} from "./bonus-calculator-helpers";

describe("BonusCalculator", () => {
  describe("calculateTimeBonus", () => {
    it("should award bonus for early completion", () => {
      const bonus = calculateTimeBonus({
        plannedDuration: 1500,
        actualDuration: 1400,
        completionPercentage: 100,
      });
      expect(bonus).toBeGreaterThan(0);
    });

    it("should not award bonus for late completion", () => {
      const bonus = calculateTimeBonus({
        plannedDuration: 1500,
        actualDuration: 1600,
        completionPercentage: 100,
      });
      expect(bonus).toBe(0);
    });

    it("should not award bonus for incomplete session", () => {
      const bonus = calculateTimeBonus({
        plannedDuration: 1500,
        actualDuration: 1000,
        completionPercentage: 66,
      });
      expect(bonus).toBe(0);
    });

    it("should cap time bonus at maximum", () => {
      const bonus = calculateTimeBonus({
        plannedDuration: 1500,
        actualDuration: 500,
        completionPercentage: 100,
      });
      expect(bonus).toBeLessThanOrEqual(BONUS_CONSTANTS.TIME_BONUS_MAX);
    });

    it("should calculate proportional bonus for moderate early completion", () => {
      const bonus = calculateTimeBonus({
        plannedDuration: 1500,
        actualDuration: 1350,
        completionPercentage: 100,
      });
      expect(bonus).toBeGreaterThan(0);
      expect(bonus).toBeLessThan(50);
    });
  });

  describe("calculateStreakBonus", () => {
    it("should award base bonus for streak of 1", () => {
      const bonus = calculateStreakBonus({ currentStreak: 1, basePoints: 100 });
      expect(bonus).toBe(BONUS_CONSTANTS.STREAK_BONUS_BASE);
    });

    it("should increase bonus with longer streaks", () => {
      const smallStreak = calculateStreakBonus({
        currentStreak: 3,
        basePoints: 100,
      });
      const largeStreak = calculateStreakBonus({
        currentStreak: 30,
        basePoints: 100,
      });
      expect(largeStreak).toBeGreaterThan(smallStreak);
    });

    it("should cap streak bonus at maximum", () => {
      const bonus = calculateStreakBonus({
        currentStreak: 365,
        basePoints: 1000,
      });
      expect(bonus).toBeLessThanOrEqual(BONUS_CONSTANTS.STREAK_BONUS_MAX);
    });

    it("should handle streak of 0", () => {
      const bonus = calculateStreakBonus({ currentStreak: 0, basePoints: 100 });
      expect(bonus).toBe(BONUS_CONSTANTS.STREAK_BONUS_BASE);
    });
  });

  describe("getStreakMultiplier", () => {
    it("should return 1 for no streak", () => {
      expect(getStreakMultiplier(0)).toBe(1);
      expect(getStreakMultiplier(1)).toBe(1);
    });

    it("should return higher multiplier for milestone streaks", () => {
      expect(getStreakMultiplier(7)).toBe(1.25);
      expect(getStreakMultiplier(30)).toBe(1.5);
      expect(getStreakMultiplier(90)).toBe(2);
    });

    it("should return correct multiplier for intermediate streaks", () => {
      expect(getStreakMultiplier(10)).toBe(1.25);
      expect(getStreakMultiplier(14)).toBe(1.35);
    });
  });
});
