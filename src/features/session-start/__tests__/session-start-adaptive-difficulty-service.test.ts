/**
 * Tests for session-start adaptive difficulty service.
 */

import {
  getAdaptiveDifficultySuggestion,
  shouldShowSuggestion,
  getDifficultyDisplayName,
  getDifficultyXPMultiplier,
} from "../service/adaptiveDifficulty";

describe("session-start: adaptiveDifficulty service", () => {
  const makeSessions = (grades: string[], purity = 90) =>
    grades.map((grade, i) => ({
      id: `s${i}`,
      grade,
      purityScore: purity,
    }));

  describe("getAdaptiveDifficultySuggestion", () => {
    it("returns null suggestion when fewer than 5 sessions", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["A", "A", "A"]),
        "CASUAL",
      );
      expect(result.suggestion).toBeNull();
      expect(result.confidence).toBe("low");
      expect(result.stats.sessionsAnalyzed).toBe(3);
    });

    it("suggests upgrade from CASUAL to FOCUSED when grades are high", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["S", "S", "A", "S", "S"], 90),
        "CASUAL",
      );
      expect(result.suggestion).toBe("FOCUSED");
      expect(result.stats.averageGrade).toBeGreaterThanOrEqual(4.5);
    });

    it("suggests downgrade from FOCUSED to CASUAL when grades are low", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["D", "D", "C", "D", "D"], 40),
        "FOCUSED",
      );
      expect(result.suggestion).toBe("CASUAL");
    });

    it("suggests upgrade from FOCUSED to INTENSE when grades are high", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["S", "S", "S", "A", "S"], 92),
        "FOCUSED",
      );
      expect(result.suggestion).toBe("INTENSE");
    });

    it("suggests downgrade from INTENSE to FOCUSED when grades are low", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["D", "D", "C", "D", "D"], 35),
        "INTENSE",
      );
      expect(result.suggestion).toBe("FOCUSED");
    });

    it("returns null suggestion with encouragement when performance is mid-range", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["B", "B", "B", "B", "B"], 70),
        "FOCUSED",
      );
      expect(result.suggestion).toBeNull();
      expect(result.reason).toBeTruthy();
    });

    it("ignores sessions without a valid grade", () => {
      const sessions = [
        { id: "s1", grade: undefined, purityScore: 90 },
        { id: "s2", grade: "A", purityScore: 90 },
        { id: "s3", grade: "A", purityScore: 90 },
        { id: "s4", grade: "A", purityScore: 90 },
        { id: "s5", grade: "A", purityScore: 90 },
      ];
      const result = getAdaptiveDifficultySuggestion(sessions, "CASUAL");
      // Only 4 valid sessions → still insufficient
      expect(result.suggestion).toBeNull();
    });

    it("high confidence when grade >= 4.8 on CASUAL upgrade", () => {
      const result = getAdaptiveDifficultySuggestion(
        makeSessions(["S", "S", "S", "S", "S"], 95),
        "CASUAL",
      );
      expect(result.confidence).toBe("high");
    });
  });

  describe("shouldShowSuggestion", () => {
    it("returns true when never shown before", () => {
      expect(shouldShowSuggestion(null)).toBe(true);
    });

    it("returns false when shown recently", () => {
      expect(shouldShowSuggestion(Date.now() - 1000)).toBe(false);
    });

    it("returns true when enough time has passed", () => {
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      expect(shouldShowSuggestion(twoDaysAgo)).toBe(true);
    });

    it("respects custom minIntervalMs", () => {
      const fiveMinAgo = Date.now() - 5 * 60 * 1000;
      expect(shouldShowSuggestion(fiveMinAgo, 10 * 60 * 1000)).toBe(false);
      expect(shouldShowSuggestion(fiveMinAgo, 1 * 60 * 1000)).toBe(true);
    });
  });

  describe("getDifficultyDisplayName", () => {
    it("returns correct display names", () => {
      expect(getDifficultyDisplayName("CASUAL")).toBe("Casual");
      expect(getDifficultyDisplayName("FOCUSED")).toBe("Focused");
      expect(getDifficultyDisplayName("INTENSE")).toBe("Intense");
    });
  });

  describe("getDifficultyXPMultiplier", () => {
    it("returns correct XP multipliers", () => {
      expect(getDifficultyXPMultiplier("CASUAL")).toBe(1);
      expect(getDifficultyXPMultiplier("FOCUSED")).toBe(2);
      expect(getDifficultyXPMultiplier("INTENSE")).toBe(3);
    });
  });
});
