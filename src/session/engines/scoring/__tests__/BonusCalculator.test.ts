import {
  BonusCalculator,
  calculateTimeBonus,
  calculateStreakBonus,
  getStreakMultiplier,
  calculateQualityBonus,
  calculateIntervalBonus,
  calculateSpecialBonuses,
  BONUS_CONSTANTS,
} from "../BonusCalculator";
import type { FocusQualityMetrics } from "../../../types";
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
  describe("calculateSpecialBonuses", () => {
    const createMockSession = (overrides: any = {}) => ({
      id: "test",
      completionPercentage: 100,
      interruptions: 0,
      pauses: 0,
      config: { duration: 1500 },
      ...overrides,
    });
    it("should identify perfect session", () => {
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime: Date.now() - 1500000,
        endTime: Date.now(),
        noPauses: true,
        noInterruptions: true,
      });
      expect(result.perfectSession).toBe(true);
      expect(result.totalBonus).toBeGreaterThan(0);
      expect(result.badges).toContain("PERFECT_SESSION");
    });
    it("should identify marathon session", () => {
      const startTime = Date.now() - 3600000;
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime,
        endTime: Date.now(),
        noPauses: false,
        noInterruptions: false,
      });
      expect(result.marathon).toBe(true);
      expect(result.badges).toContain("MARATHON");
    });
    it("should identify early bird", () => {
      const startTime = new Date().setHours(6, 0, 0, 0);
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime,
        endTime: startTime + 1500000,
        noPauses: false,
        noInterruptions: false,
      });
      expect(result.earlyBird).toBe(true);
      expect(result.badges).toContain("EARLY_BIRD");
    });
    it("should identify night owl", () => {
      const startTime = new Date().setHours(23, 0, 0, 0);
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime,
        endTime: startTime + 1500000,
        noPauses: false,
        noInterruptions: false,
      });
      expect(result.nightOwl).toBe(true);
      expect(result.badges).toContain("NIGHT_OWL");
    });
    it("should accumulate multiple bonuses", () => {
      const startTime = new Date().setHours(6, 0, 0, 0);
      const result = calculateSpecialBonuses({
        session: createMockSession(),
        startTime,
        endTime: Date.now(),
        noPauses: true,
        noInterruptions: true,
      });
      expect(result.badges.length).toBeGreaterThanOrEqual(2);
      expect(result.totalBonus).toBeGreaterThan(
        BONUS_CONSTANTS.PERFECT_SESSION_BONUS +
          BONUS_CONSTANTS.EARLY_BIRD_BONUS,
      );
    });
  });
  describe("BonusCalculator.calculateTotalBonus", () => {
    it("should sum all bonus types", () => {
      const result = BonusCalculator.calculateTotalBonus({
        timeBonus: 50,
        streakBonus: 30,
        qualityBonus: 100,
        intervalBonus: 50,
        specialBonus: 200,
      });
      expect(result.total).toBe(430);
      expect(result.breakdown.time).toBe(50);
      expect(result.breakdown.streak).toBe(30);
      expect(result.breakdown.quality).toBe(100);
      expect(result.breakdown.interval).toBe(50);
      expect(result.breakdown.special).toBe(200);
    });
    it("should handle zero bonuses", () => {
      const result = BonusCalculator.calculateTotalBonus({
        timeBonus: 0,
        streakBonus: 0,
        qualityBonus: 0,
        intervalBonus: 0,
        specialBonus: 0,
      });
      expect(result.total).toBe(0);
    });
  });
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
