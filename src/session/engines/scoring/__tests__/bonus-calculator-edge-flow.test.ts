import {
  BonusCalculator,
  calculateTimeBonus,
  calculateStreakBonus,
  getStreakMultiplier,
  calculateQualityBonus,
  calculateIntervalBonus,
  calculateSpecialBonuses,
  BONUS_CONSTANTS,
} from "./bonus-calculator-helpers";
import type { FocusQualityMetrics } from "./bonus-calculator-helpers";

describe("BonusCalculator", () => {
  describe("edge cases", () => {
    it("should handle negative durations", () => {
      const bonus = calculateTimeBonus({
        plannedDuration: 1500,
        actualDuration: -100,
        completionPercentage: 100,
      });
      expect(bonus).toBe(0);
    });

    it("should handle very long streaks", () => {
      const multiplier = getStreakMultiplier(1000);
      expect(multiplier).toBeGreaterThanOrEqual(2);
      expect(Number.isFinite(multiplier)).toBe(true);
    });

    it("should handle perfect score with zero metrics", () => {
      const metrics: FocusQualityMetrics = {
        sessionId: "test",
        timeInDeepFocus: 0,
        timeInShallowFocus: 0,
        timeDistracted: 0,
        focusSegments: [],
        consistencyScore: 100,
        depthScore: 100,
        recoveryScore: 100,
        overallScore: 100,
        calculatedAt: Date.now(),
      };
      const bonus = calculateQualityBonus({
        focusMetrics: metrics,
        interruptions: 0,
        pauses: 0,
      });
      expect(bonus).toBe(BONUS_CONSTANTS.EXCELLENT_QUALITY_BONUS);
    });

    it("should handle extreme disruption counts", () => {
      const bonus = calculateQualityBonus({
        focusMetrics: {
          sessionId: "test",
          timeInDeepFocus: 100,
          timeInShallowFocus: 100,
          timeDistracted: 1000,
          focusSegments: [],
          consistencyScore: 50,
          depthScore: 50,
          recoveryScore: 50,
          overallScore: 50,
          calculatedAt: Date.now(),
        },
        interruptions: 100,
        pauses: 100,
      });
      expect(bonus).toBe(0);
    });
  });

  describe("full bonus calculation flow", () => {
    it("should calculate total bonuses for perfect session", () => {
      const timeBonus = calculateTimeBonus({
        plannedDuration: 1500,
        actualDuration: 1450,
        completionPercentage: 100,
      });
      const streakBonus = calculateStreakBonus({
        currentStreak: 7,
        basePoints: 250,
      });
      const qualityBonus = calculateQualityBonus({
        focusMetrics: {
          sessionId: "test",
          timeInDeepFocus: 1200,
          timeInShallowFocus: 200,
          timeDistracted: 100,
          focusSegments: [],
          consistencyScore: 95,
          depthScore: 95,
          recoveryScore: 95,
          overallScore: 95,
          calculatedAt: Date.now(),
        },
        interruptions: 0,
        pauses: 0,
      });
      const intervalBonus = calculateIntervalBonus({
        completedIntervals: 4,
        totalIntervals: 4,
        allIntervalsCompleted: true,
      });
      const specialBonus = calculateSpecialBonuses({
        session: { id: "test", completionPercentage: 100 },
        startTime: Date.now() - 1500000,
        endTime: Date.now(),
        noPauses: true,
        noInterruptions: true,
      });
      const total = BonusCalculator.calculateTotalBonus({
        timeBonus,
        streakBonus,
        qualityBonus,
        intervalBonus,
        specialBonus: specialBonus.totalBonus,
      });
      expect(total.total).toBeGreaterThan(0);
      expect(total.breakdown.quality).toBe(
        BONUS_CONSTANTS.EXCELLENT_QUALITY_BONUS,
      );
    });
  });
});
