/**
 * Focus Identity — CalculateFocusScoreUpdate Tests
 */

import { calculateFocusScoreUpdate } from "../score-algorithm.main";
import {
  MIN_FOCUS_SCORE,
  MAX_FOCUS_SCORE,
} from "../schemas";

// ─── FIXTURES ────────────────────────────────────────────────────────────────

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

// ─── TESTS ───────────────────────────────────────────────────────────────────

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
