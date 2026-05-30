/**
 * Focus Identity — Habit Calculators Tests
 */

import {
  calculateConsistencyFactorForInput,
  calculateStreakStabilityFactorForInput,
} from "../habit-calculators";

// ─── TESTS ───────────────────────────────────────────────────────────────────

describe("habit calculators", () => {
  describe("calculateConsistencyFactorForInput", () => {
    test("returns perfect consistency when sessions meet target", () => {
      const result = calculateConsistencyFactorForInput(20, 5, 0);
      expect(result.actualConsistency).toBe(1);
      expect(result.score).toBe(100);
    });

    test("reduces score for missed days", () => {
      const perfect = calculateConsistencyFactorForInput(20, 5, 0);
      const missed = calculateConsistencyFactorForInput(20, 5, 5);
      expect(missed.score).toBeLessThan(perfect.score);
    });

    test("clamps score to [0, 100]", () => {
      const result = calculateConsistencyFactorForInput(0, 5, 100);
      expect(result.score).toBe(0);
    });

    test("returns correct metadata", () => {
      const result = calculateConsistencyFactorForInput(12, 3, 2);
      expect(result.sessionsLast30Days).toBe(12);
      expect(result.targetSessionsPerWeek).toBe(3);
      expect(result.missedDaysLast30Days).toBe(2);
    });
  });

  describe("calculateStreakStabilityFactorForInput", () => {
    test("returns high score for long current and long historical streaks", () => {
      const result = calculateStreakStabilityFactorForInput(30, 90, [
        { start: Date.now() - 100 * 86400000, end: Date.now() - 10 * 86400000, length: 90 },
      ]);
      expect(result.score).toBeGreaterThan(70);
    });

    test("returns low score for zero streak", () => {
      const result = calculateStreakStabilityFactorForInput(0, 0, []);
      expect(result.score).toBeLessThanOrEqual(25);
    });

    test("handles empty streak history gracefully", () => {
      const result = calculateStreakStabilityFactorForInput(5, 10, []);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.totalStreaksStarted).toBe(0);
    });
  });
});
