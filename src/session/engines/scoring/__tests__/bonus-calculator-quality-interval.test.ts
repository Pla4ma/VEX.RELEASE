import {
  calculateQualityBonus,
  calculateIntervalBonus,
  BONUS_CONSTANTS,
} from "./bonus-calculator-helpers";
import type { FocusQualityMetrics } from "./bonus-calculator-helpers";

describe("BonusCalculator", () => {
  describe("calculateQualityBonus", () => {
    const createMetrics = (overallScore: number): FocusQualityMetrics => ({
      sessionId: "test",
      timeInDeepFocus: 1000,
      timeInShallowFocus: 200,
      timeDistracted: 100,
      focusSegments: [],
      consistencyScore: overallScore,
      depthScore: overallScore,
      recoveryScore: overallScore,
      overallScore,
      calculatedAt: Date.now(),
    });

    it("should award excellent bonus for high quality", () => {
      const bonus = calculateQualityBonus({
        focusMetrics: createMetrics(95),
        interruptions: 0,
        pauses: 0,
      });
      expect(bonus).toBe(BONUS_CONSTANTS.EXCELLENT_QUALITY_BONUS);
    });

    it("should award good bonus for moderate quality", () => {
      const bonus = calculateQualityBonus({
        focusMetrics: createMetrics(80),
        interruptions: 0,
        pauses: 0,
      });
      expect(bonus).toBe(BONUS_CONSTANTS.GOOD_QUALITY_BONUS);
    });

    it("should award average bonus for acceptable quality", () => {
      const bonus = calculateQualityBonus({
        focusMetrics: createMetrics(60),
        interruptions: 1,
        pauses: 2,
      });
      expect(bonus).toBe(BONUS_CONSTANTS.AVERAGE_QUALITY_BONUS);
    });

    it("should not award bonus for poor quality", () => {
      const bonus = calculateQualityBonus({
        focusMetrics: createMetrics(30),
        interruptions: 5,
        pauses: 10,
      });
      expect(bonus).toBe(0);
    });

    it("should reduce bonus for disruptions", () => {
      const cleanBonus = calculateQualityBonus({
        focusMetrics: createMetrics(95),
        interruptions: 0,
        pauses: 0,
      });
      const disruptedBonus = calculateQualityBonus({
        focusMetrics: createMetrics(95),
        interruptions: 3,
        pauses: 5,
      });
      expect(disruptedBonus).toBeLessThan(cleanBonus);
    });
  });

  describe("calculateIntervalBonus", () => {
    it("should award bonus for multiple intervals", () => {
      const bonus = calculateIntervalBonus({
        completedIntervals: 4,
        totalIntervals: 4,
        allIntervalsCompleted: false,
      });
      expect(bonus).toBeGreaterThan(0);
    });

    it("should award larger bonus for completing all intervals", () => {
      const partial = calculateIntervalBonus({
        completedIntervals: 3,
        totalIntervals: 4,
        allIntervalsCompleted: false,
      });
      const complete = calculateIntervalBonus({
        completedIntervals: 4,
        totalIntervals: 4,
        allIntervalsCompleted: true,
      });
      expect(complete).toBeGreaterThan(partial);
      expect(complete).toBeGreaterThanOrEqual(
        BONUS_CONSTANTS.POMODORO_COMPLETE_BONUS,
      );
    });

    it("should scale with interval count", () => {
      const small = calculateIntervalBonus({
        completedIntervals: 2,
        totalIntervals: 4,
        allIntervalsCompleted: false,
      });
      const large = calculateIntervalBonus({
        completedIntervals: 8,
        totalIntervals: 8,
        allIntervalsCompleted: false,
      });
      expect(large).toBeGreaterThan(small);
    });
  });
});
