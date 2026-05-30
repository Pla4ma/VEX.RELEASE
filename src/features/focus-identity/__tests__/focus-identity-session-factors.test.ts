/**
 * Focus Identity — Session Factors Tests
 */

import {
  calculateSessionQualityFactorForInput,
  calculateDiversityFactorForInput,
  calculateRecencyFactorForInput,
} from "../session-factors";

// ─── TESTS ───────────────────────────────────────────────────────────────────

describe("session factors", () => {
  describe("calculateSessionQualityFactorForInput", () => {
    test("returns 0 score for empty sessions", () => {
      const result = calculateSessionQualityFactorForInput([]);
      expect(result.score).toBe(0);
      expect(result.averageFocusPurity).toBe(0);
    });

    test("calculates weighted score from purity, grade, perfection count", () => {
      const result = calculateSessionQualityFactorForInput([
        { focusPurity: 95, grade: "S", duration: 60, wasAbandoned: false },
        { focusPurity: 90, grade: "A", duration: 45, wasAbandoned: false },
        { focusPurity: 80, grade: "B", duration: 30, wasAbandoned: false },
      ]);
      expect(result.score).toBeGreaterThan(50);
      expect(result.perfectSessionsCount).toBe(1);
      expect(result.averageGrade).toBe("S");
    });

    test("excludes abandoned sessions from averages", () => {
      const withAbandoned = calculateSessionQualityFactorForInput([
        { focusPurity: 95, grade: "S", duration: 60, wasAbandoned: false },
        { focusPurity: 10, grade: "D", duration: 5, wasAbandoned: true },
      ]);
      expect(withAbandoned.averageFocusPurity).toBe(95);
    });
  });

  describe("calculateDiversityFactorForInput", () => {
    test("returns 0 for empty sessions", () => {
      const result = calculateDiversityFactorForInput([]);
      expect(result.score).toBe(0);
    });

    test("returns higher score for diverse sessions", () => {
      const diverse = calculateDiversityFactorForInput([
        { mode: "deep_work", hour: 9, dayOfWeek: 1, context: "office" },
        { mode: "recovery", hour: 14, dayOfWeek: 3, context: "home" },
        { mode: "standard", hour: 20, dayOfWeek: 6, context: "cafe" },
      ]);
      const mono = calculateDiversityFactorForInput([
        { mode: "standard", hour: 9, dayOfWeek: 1 },
        { mode: "standard", hour: 9, dayOfWeek: 1 },
      ]);
      expect(diverse.score).toBeGreaterThan(mono.score);
    });

    test("counts weekend sessions correctly", () => {
      const result = calculateDiversityFactorForInput([
        { mode: "standard", hour: 10, dayOfWeek: 0 }, // Sunday
        { mode: "standard", hour: 10, dayOfWeek: 6 }, // Saturday
      ]);
      expect(result.weekendSessions).toBe(2);
    });
  });

  describe("calculateRecencyFactorForInput", () => {
    test("returns highest score for same-day session", () => {
      const sameDay = calculateRecencyFactorForInput(0, 1, 5, []);
      const twoDays = calculateRecencyFactorForInput(2, 1, 5, []);
      expect(sameDay.score).toBeGreaterThan(twoDays.score);
    });

    test("detects CONCERNING trend in score history", () => {
      const decliningHistory = Array.from({ length: 10 }, (_, i) => ({
        date: `2025-05-${10 + i}`,
        score: 600 - i * 15,
      }));
      const result = calculateRecencyFactorForInput(0, 5, 20, decliningHistory);
      expect(result.trendDirection).toBe("CONCERNING");
    });

    test("detects UP trend in score history", () => {
      const risingHistory = Array.from({ length: 10 }, (_, i) => ({
        date: `2025-05-${10 + i}`,
        score: 500 + i * 15,
      }));
      const result = calculateRecencyFactorForInput(0, 5, 20, risingHistory);
      expect(result.trendDirection).toBe("UP");
    });
  });
});
