/**
 * Focus Identity — Focus Score Calculators Tests (integration)
 */

import {
  calculateFocusScore,
  getScoreBand,
  calculateScoreChange,
} from "../focus-score-calculators";
import { FOCUS_SCORE_CONFIG } from "../focus-score-config";
import {
  MIN_FOCUS_SCORE,
  MAX_FOCUS_SCORE,
} from "../schemas";

// ─── FIXTURES ────────────────────────────────────────────────────────────────

function makeScoreInput(overrides: Record<string, unknown> = {}) {
  return {
    sessionsLast30Days: 20,
    targetSessionsPerWeek: 5,
    missedDaysLast30Days: 3,
    currentStreak: 10,
    longestStreak: 30,
    streakHistory: [
      { start: Date.now() - 30 * 86400000, end: Date.now() - 1 * 86400000, length: 29 },
    ],
    sessionDetails: [
      { focusPurity: 85, grade: "A", duration: 45, wasAbandoned: false, mode: "deep_work", startTime: "2025-05-28T09:00:00Z", context: "home" },
      { focusPurity: 90, grade: "S", duration: 60, wasAbandoned: false, mode: "standard", startTime: "2025-05-27T14:00:00Z", context: "office" },
      { focusPurity: 75, grade: "B", duration: 30, wasAbandoned: false, mode: "recovery", startTime: "2025-05-26T19:00:00Z", context: "home" },
    ],
    daysSinceLastSession: 0,
    last7DaySessions: 5,
    last30DaySessions: 20,
    scoreHistory: Array.from({ length: 14 }, (_, i) => ({
      date: `2025-05-${15 + i}`,
      score: 540 + i * 2,
    })),
    ...overrides,
  };
}

// ─── TESTS ───────────────────────────────────────────────────────────────────

describe("calculateFocusScore", () => {
  test("returns score within [300, 850] range", () => {
    const result = calculateFocusScore(makeScoreInput());
    expect(result.score).toBeGreaterThanOrEqual(MIN_FOCUS_SCORE);
    expect(result.score).toBeLessThanOrEqual(MAX_FOCUS_SCORE);
    expect(result.factors).toBeDefined();
  });

  test("returns higher score for better input data", () => {
    const excellent = calculateFocusScore(
      makeScoreInput({
        sessionsLast30Days: 30,
        missedDaysLast30Days: 0,
        currentStreak: 60,
        daysSinceLastSession: 0,
      }),
    );
    const poor = calculateFocusScore(
      makeScoreInput({
        sessionsLast30Days: 2,
        missedDaysLast30Days: 20,
        currentStreak: 0,
        daysSinceLastSession: 10,
      }),
    );
    expect(excellent.score).toBeGreaterThan(poor.score);
  });
});

describe("getScoreBand", () => {
  test("returns correct band for various scores", () => {
    expect(getScoreBand(850).label).toBe("Legendary");
    expect(getScoreBand(550).label).toBe("Good");
    expect(getScoreBand(300).label).toBe("Building");
  });

  test("always returns a band (no undefined)", () => {
    for (const score of [300, 400, 500, 600, 700, 800, 850]) {
      const band = getScoreBand(score);
      expect(band).toBeDefined();
      expect(band.label).toBeTruthy();
    }
  });
});

describe("calculateScoreChange", () => {
  test("SESSION_COMPLETE returns positive change", () => {
    const change = calculateScoreChange("SESSION_COMPLETE", {});
    expect(change).toBeGreaterThan(0);
  });

  test("STREAK_BREAK returns negative change", () => {
    const change = calculateScoreChange("STREAK_BREAK", {});
    expect(change).toBeLessThan(0);
  });

  test("grade S/A gives bonus to positive changes", () => {
    const baseChange = calculateScoreChange("SESSION_COMPLETE", {});
    const sChange = calculateScoreChange("SESSION_COMPLETE", { sessionGrade: "S" });
    expect(sChange).toBeGreaterThan(baseChange);
  });

  test("recovery multiplier increases positive changes", () => {
    const base = calculateScoreChange("SESSION_COMPLETE", {});
    const recovery = calculateScoreChange("SESSION_COMPLETE", { isInRecovery: true });
    expect(recovery).toBeGreaterThan(base);
  });

  test("change is clamped to max range", () => {
    const change = calculateScoreChange("PERFECT_SESSION", { streakLength: 100, sessionGrade: "S" });
    expect(change).toBeLessThanOrEqual(FOCUS_SCORE_CONFIG.SCORE_CHANGES.PERFECT_SESSION.max);
  });
});
