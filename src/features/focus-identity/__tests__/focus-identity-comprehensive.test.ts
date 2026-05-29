/**
 * Focus Identity Feature — Comprehensive Tests
 *
 * Covers: score-algorithm helpers, score-algorithm main, habit calculators,
 * session factors, focus-score calculators, focus-score config, schemas,
 * day-retention helpers
 */

// ─── score-algorithm helpers ──────────────────────────────────────────────────

import {
  FACTOR_WEIGHTS,
  FACTOR_LABELS,
  clampScore,
  getBand,
  getFactorExplanation,
  getGradeAdjustment,
  getModeAdjustment,
  getXpMultiplier,
} from "../score-algorithm.helpers";

// ─── score-algorithm main ─────────────────────────────────────────────────────

import { calculateFocusScoreUpdate } from "../score-algorithm.main";

// ─── habit calculators ────────────────────────────────────────────────────────

import {
  calculateConsistencyFactorForInput,
  calculateStreakStabilityFactorForInput,
} from "../habit-calculators";

// ─── session factors ──────────────────────────────────────────────────────────

import {
  calculateSessionQualityFactorForInput,
  calculateDiversityFactorForInput,
  calculateRecencyFactorForInput,
} from "../session-factors";

// ─── focus-score calculators ──────────────────────────────────────────────────

import {
  calculateFocusScore,
  getScoreBand,
  calculateScoreChange,
} from "../focus-score-calculators";

// ─── focus-score config ───────────────────────────────────────────────────────

import { FOCUS_SCORE_CONFIG, IDENTITY_STATEMENTS } from "../focus-score-config";

// ─── schemas ──────────────────────────────────────────────────────────────────

import {
  MIN_FOCUS_SCORE,
  MAX_FOCUS_SCORE,
  FocusScoreBandLabelSchema,
  FocusScoreFactorKeySchema,
  FocusScoreUpdateInputSchema,
  FocusScoreUpdateResultSchema,
  getFocusScoreFactorsWeightTotal,
} from "../schemas";

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

function makeUpdateInput(overrides: Record<string, unknown> = {}) {
  return {
    userId: "00000000-0000-4000-8000-000000000001",
    previousScore: 550,
    eventType: "session:completed" as const,
    grade: "A" as const,
    sessionMode: "standard" as const,
    occurredAt: "2025-06-01T12:00:00.000Z",
    signals: {
      consistency: 65,
      streakStability: 60,
      sessionQuality: 70,
      intentionalDifficulty: 55,
      recency: 60,
    },
    ...overrides,
  };
}

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

// ─────────────────────────────────────────────────────────────────────────────
// SCORE ALGORITHM HELPERS
// ─────────────────────────────────────────────────────────────────────────────

describe("score-algorithm helpers", () => {
  test("FACTOR_WEIGHTS sum to 100", () => {
    const sum = Object.values(FACTOR_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  test("FACTOR_LABELS has a label for each factor key", () => {
    expect(Object.keys(FACTOR_LABELS)).toHaveLength(6);
    expect(FACTOR_LABELS.consistency).toBe("Consistency");
    expect(FACTOR_LABELS.streakStability).toBe("Streak stability");
    expect(FACTOR_LABELS.recency).toBe("Recency");
  });

  test("clampScore enforces MIN and MAX bounds", () => {
    expect(clampScore(100)).toBe(MIN_FOCUS_SCORE);
    expect(clampScore(900)).toBe(MAX_FOCUS_SCORE);
    expect(clampScore(550)).toBe(550);
  });

  test("getBand returns correct band labels for score ranges", () => {
    expect(getBand(850)).toBe("Legendary");
    expect(getBand(750)).toBe("Elite");
    expect(getBand(700)).toBe("Exceptional");
    expect(getBand(600)).toBe("Strong");
    expect(getBand(520)).toBe("Good");
    expect(getBand(450)).toBe("Fair");
    expect(getBand(350)).toBe("Building");
  });

  test("getFactorExplanation varies by score range", () => {
    expect(getFactorExplanation("consistency", 90)).toContain("strength");
    expect(getFactorExplanation("consistency", 65)).toContain("stable");
    expect(getFactorExplanation("consistency", 45)).toContain("neutral");
    expect(getFactorExplanation("consistency", 20)).toContain("dragging");
  });

  test("getGradeAdjustment returns positive for good grades and negative for abandoned", () => {
    const input = makeUpdateInput();
    expect(getGradeAdjustment({ ...input, grade: "S" })).toBe(14);
    expect(getGradeAdjustment({ ...input, grade: "A" })).toBe(9);
    expect(getGradeAdjustment({ ...input, grade: "B" })).toBe(4);
    expect(getGradeAdjustment({ ...input, grade: "C" })).toBe(-2);
    expect(getGradeAdjustment({ ...input, grade: "D" })).toBe(-8);
    expect(getGradeAdjustment({ ...input, eventType: "session:abandoned" })).toBe(-12);
  });

  test("getModeAdjustment returns positive for deep_work and capped for recovery with S grade", () => {
    const input = makeUpdateInput();
    expect(getModeAdjustment({ ...input, sessionMode: "deep_work" })).toBe(3);
    expect(getModeAdjustment({ ...input, sessionMode: "recovery", grade: "S" })).toBe(1);
    expect(getModeAdjustment({ ...input, sessionMode: "starter" })).toBe(2);
    expect(getModeAdjustment({ ...input, sessionMode: "standard" })).toBe(1);
  });

  test("getXpMultiplier varies by grade and caps for recovery mode", () => {
    const input = makeUpdateInput();
    expect(getXpMultiplier({ ...input, grade: "S" })).toBe(1.8);
    expect(getXpMultiplier({ ...input, grade: "D" })).toBe(0.75);
    expect(getXpMultiplier({ ...input, eventType: "session:abandoned" })).toBe(0.5);
    expect(getXpMultiplier({ ...input, sessionMode: "recovery", grade: "S" })).toBeLessThanOrEqual(1.05);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCORE ALGORITHM MAIN
// ─────────────────────────────────────────────────────────────────────────────

describe("calculateFocusScoreUpdate", () => {
  test("returns a valid result matching schema", () => {
    const result = calculateFocusScoreUpdate(makeUpdateInput());
    expect(result.userId).toBe("00000000-0000-4000-8000-000000000001");
    expect(result.newScore).toBeGreaterThanOrEqual(MIN_FOCUS_SCORE);
    expect(result.newScore).toBeLessThanOrEqual(MAX_FOCUS_SCORE);
    expect(result.band).toBeDefined();
    expect(result.factors.consistency.weightPercent).toBe(35);
    expect(result.userFacingReason).toBeTruthy();
    expect(result.focusScoreImpactRecommendation).toBeTruthy();
    expect(result.historyPoint).toBeDefined();
  });

  test("creates positive delta for S-grade session completion", () => {
    const result = calculateFocusScoreUpdate(
      makeUpdateInput({ grade: "S", eventType: "session:completed", sessionMode: "deep_work" }),
    );
    expect(result.delta).toBeGreaterThan(0);
  });

  test("creates negative delta for session abandoned", () => {
    const result = calculateFocusScoreUpdate(
      makeUpdateInput({ eventType: "session:abandoned" }),
    );
    expect(result.delta).toBeLessThan(0);
  });

  test("clamps score to [300, 850] range", () => {
    const lowResult = calculateFocusScoreUpdate(
      makeUpdateInput({
        previousScore: 301,
        grade: "D",
        signals: { consistency: 0, streakStability: 0, sessionQuality: 0, intentionalDifficulty: 0, recency: 0 },
      }),
    );
    expect(lowResult.newScore).toBe(MIN_FOCUS_SCORE);

    const highResult = calculateFocusScoreUpdate(
      makeUpdateInput({
        previousScore: 849,
        grade: "S",
        eventType: "session:completed",
        sessionMode: "deep_work",
        signals: { consistency: 100, streakStability: 100, sessionQuality: 100, intentionalDifficulty: 100, recency: 100 },
      }),
    );
    expect(highResult.newScore).toBe(MAX_FOCUS_SCORE);
  });

  test("comeback event adds bonus delta", () => {
    const normalResult = calculateFocusScoreUpdate(makeUpdateInput({ eventType: "session:completed" }));
    const comebackResult = calculateFocusScoreUpdate(makeUpdateInput({ eventType: "comeback:completed" }));
    expect(comebackResult.newScore).toBeGreaterThanOrEqual(normalResult.newScore);
  });

  test("recovery mode caps delta at 8", () => {
    const result = calculateFocusScoreUpdate(
      makeUpdateInput({
        sessionMode: "recovery",
        grade: "S",
        signals: { consistency: 100, streakStability: 100, sessionQuality: 100, intentionalDifficulty: 100, recency: 100 },
      }),
    );
    // The delta before clamping might be high, but recovery mode caps it
    expect(result.newScore - result.previousScore).toBeLessThanOrEqual(8 + 1); // +1 for rounding
  });

  test("xpQualityMultiplier reflects grade", () => {
    const sResult = calculateFocusScoreUpdate(makeUpdateInput({ grade: "S" }));
    const dResult = calculateFocusScoreUpdate(makeUpdateInput({ grade: "D" }));
    expect(sResult.xpQualityMultiplier).toBeGreaterThan(dResult.xpQualityMultiplier);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HABIT CALCULATORS
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// SESSION FACTORS
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS SCORE CALCULATORS (integration)
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// FOCUS SCORE CONFIG
// ─────────────────────────────────────────────────────────────────────────────

describe("FOCUS_SCORE_CONFIG", () => {
  test("has correct min/max/initial score", () => {
    expect(FOCUS_SCORE_CONFIG.MIN_SCORE).toBe(300);
    expect(FOCUS_SCORE_CONFIG.MAX_SCORE).toBe(850);
    expect(FOCUS_SCORE_CONFIG.INITIAL_SCORE).toBe(550);
  });

  test("BANDS are sorted from highest to lowest", () => {
    for (let i = 1; i < FOCUS_SCORE_CONFIG.BANDS.length; i++) {
      expect(FACTOR_WEIGHTS).toBeDefined(); // just using as a proxy
      expect(FOCUS_SCORE_CONFIG.BANDS[i]!.max).toBeLessThanOrEqual(
        FOCUS_SCORE_CONFIG.BANDS[i - 1]!.min,
      );
    }
  });

  test("FACTOR_WEIGHTS sum to 1.0", () => {
    const sum = Object.values(FOCUS_SCORE_CONFIG.FACTOR_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5);
  });

  test("SCORE_CHANGES has correct structure", () => {
    for (const [, config] of Object.entries(FOCUS_SCORE_CONFIG.SCORE_CHANGES)) {
      expect(typeof config.base).toBe("number");
      expect(typeof config.max).toBe("number");
    }
  });

  test("IDENTITY_STATEMENTS has entries for all bands", () => {
    for (const band of FOCUS_SCORE_CONFIG.BANDS) {
      expect(IDENTITY_STATEMENTS[band.label]).toBeDefined();
      expect(IDENTITY_STATEMENTS[band.label].length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

describe("focus-identity schemas", () => {
  test("MIN and MAX focus score constants are correct", () => {
    expect(MIN_FOCUS_SCORE).toBe(300);
    expect(MAX_FOCUS_SCORE).toBe(850);
  });

  test("FocusScoreBandLabelSchema accepts all valid band labels", () => {
    const labels = ["Legendary", "Elite", "Exceptional", "Strong", "Good", "Fair", "Building"];
    for (const label of labels) {
      expect(() => FocusScoreBandLabelSchema.parse(label)).not.toThrow();
    }
    expect(() => FocusScoreBandLabelSchema.parse("INVALID")).toThrow();
  });

  test("FocusScoreFactorKeySchema accepts all factor keys", () => {
    const keys = [
      "consistency", "streakStability", "sessionQuality",
      "intentionalDifficulty", "contractCompletion", "recency",
    ];
    for (const key of keys) {
      expect(() => FocusScoreFactorKeySchema.parse(key)).not.toThrow();
    }
  });

  test("FocusScoreUpdateInputSchema validates complete input", () => {
    const parsed = FocusScoreUpdateInputSchema.parse(makeUpdateInput());
    expect(parsed.userId).toBe("00000000-0000-4000-8000-000000000001");
    expect(parsed.previousScore).toBe(550);
  });

  test("FocusScoreUpdateInputSchema rejects missing required fields", () => {
    expect(() => FocusScoreUpdateInputSchema.parse({})).toThrow();
  });

  test("getFocusScoreFactorsWeightTotal sums weights correctly", () => {
    const factors = {
      consistency: { weightPercent: 35, score: 50, delta: 0, explanation: "test" },
      streakStability: { weightPercent: 25, score: 50, delta: 0, explanation: "test" },
      sessionQuality: { weightPercent: 20, score: 50, delta: 0, explanation: "test" },
      intentionalDifficulty: { weightPercent: 7, score: 50, delta: 0, explanation: "test" },
      contractCompletion: { weightPercent: 8, score: 50, delta: 0, explanation: "test" },
      recency: { weightPercent: 5, score: 50, delta: 0, explanation: "test" },
    };
    expect(getFocusScoreFactorsWeightTotal(factors)).toBe(100);
  });
});
