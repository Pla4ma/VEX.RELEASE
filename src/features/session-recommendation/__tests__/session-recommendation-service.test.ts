/**
 * Session Recommendation — Service Functions & Integration Tests
 */

import {
  SessionRecommendationSchema,
  SessionRecommendationInputSchema,
} from "../schemas";
import type { SessionRecommendation, SessionRecommendationInput } from "../schemas";
import {
  generateSessionRecommendation,
  isRecommendationValid,
  getFallbackRecommendation,
} from "../service";

// ── Helpers ──────────────────────────────────────────────────────────

function makeInput(overrides: Partial<SessionRecommendationInput> = {}): SessionRecommendationInput {
  return SessionRecommendationInputSchema.parse({
    timeOfDay: 10,
    streakUrgency: "none",
    recoveryStatus: "none",
    isFirstSession: false,
    hasActiveSession: false,
    userId: "550e8400-e29b-41d4-a716-446655440000",
    ...overrides,
  });
}

function makeRecommendation(overrides: Partial<SessionRecommendation> = {}): SessionRecommendation {
  return SessionRecommendationSchema.parse({
    duration: 25,
    mode: "FOCUS",
    reason: "Test recommendation",
    fallback: false,
    inputs: makeInput(),
    confidence: 0.8,
    isBlocked: false,
    ...overrides,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// SERVICE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

describe("generateSessionRecommendation", () => {
  it("returns blocked recommendation when hasActiveSession is true", () => {
    const rec = generateSessionRecommendation(makeInput({ hasActiveSession: true }));
    expect(rec.isBlocked).toBe(true);
    expect(rec.blockReason).toBe("Active session in progress");
    expect(rec.mode).toBe("FOCUS");
    expect(rec.duration).toBe(25);
    expect(rec.fallback).toBe(true);
    expect(rec.confidence).toBe(1.0);
  });

  it("delegates to priority engine when no active session", () => {
    const rec = generateSessionRecommendation(makeInput({ isFirstSession: true }));
    expect(rec.isBlocked).toBe(false);
    expect(rec.duration).toBe(10);
    expect(rec.mode).toBe("RECOVERY");
  });

  it("includes parsed inputs in the result", () => {
    const input = makeInput({ userGoal: "Focus on calculus" });
    const rec = generateSessionRecommendation(input);
    expect(rec.inputs.userGoal).toBe("Focus on calculus");
    // userId, isFirstSession, hasActiveSession are not part of the
    // recommendation's embedded inputs schema (they are stripped by Zod)
    expect(rec.inputs.timeOfDay).toBe(input.timeOfDay);
    expect(rec.inputs.streakUrgency).toBe(input.streakUrgency);
  });

  it("throws on invalid input", () => {
    expect(() =>
      generateSessionRecommendation({
        ...makeInput(),
        timeOfDay: 99,
      } as SessionRecommendationInput),
    ).toThrow();
  });
});

describe("isRecommendationValid", () => {
  it("returns true for non-blocked recommendation with confidence > 0.5", () => {
    expect(isRecommendationValid(makeRecommendation({ confidence: 0.8 }))).toBe(true);
  });

  it("returns false for blocked recommendation", () => {
    expect(isRecommendationValid(makeRecommendation({ isBlocked: true }))).toBe(false);
  });

  it("returns false for low confidence recommendation", () => {
    expect(isRecommendationValid(makeRecommendation({ confidence: 0.5 }))).toBe(false);
  });

  it("returns false for zero confidence", () => {
    expect(isRecommendationValid(makeRecommendation({ confidence: 0 }))).toBe(false);
  });

  it("returns true at exact confidence boundary (0.5 exclusive)", () => {
    expect(isRecommendationValid(makeRecommendation({ confidence: 0.51 }))).toBe(true);
  });
});

describe("getFallbackRecommendation", () => {
  it("returns 25-min FOCUS with fallback flag", () => {
    const input = makeInput();
    const rec = getFallbackRecommendation(input);
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.fallback).toBe(true);
    expect(rec.confidence).toBe(0.6);
    expect(rec.isBlocked).toBe(false);
    expect(rec.reason).toContain("Default");
  });

  it("passes inputs through to the recommendation", () => {
    const input = makeInput({ userGoal: "Test goal" });
    const rec = getFallbackRecommendation(input);
    expect(rec.inputs.userGoal).toBe("Test goal");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// INTEGRATION: Engine + Service pipeline
// ═══════════════════════════════════════════════════════════════════════

describe("integration: full recommendation pipeline", () => {
  it("blocked recommendation is invalid", () => {
    const rec = generateSessionRecommendation(makeInput({ hasActiveSession: true }));
    expect(isRecommendationValid(rec)).toBe(false);
  });

  it("first-session recommendation is valid", () => {
    const rec = generateSessionRecommendation(makeInput({ isFirstSession: true }));
    expect(isRecommendationValid(rec)).toBe(true);
  });

  it("fallback recommendation from getFallbackRecommendation is valid", () => {
    const rec = getFallbackRecommendation(makeInput());
    expect(isRecommendationValid(rec)).toBe(true); // confidence 0.6 > 0.5
  });

  it("default engine recommendation is valid", () => {
    const rec = generateSessionRecommendation(makeInput({ timeOfDay: 12 }));
    // Default has confidence 0.7, fallback true, not blocked
    expect(isRecommendationValid(rec)).toBe(true);
  });

  it("mission-based recommendation flows through service correctly", () => {
    const rec = generateSessionRecommendation(
      makeInput({ dailyMissionType: "daily-challenge" }),
    );
    expect(rec.duration).toBe(30);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.isBlocked).toBe(false);
    expect(rec.inputs.dailyMissionType).toBe("daily-challenge");
  });
});
