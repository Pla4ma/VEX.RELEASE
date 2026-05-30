/**
 * Session Recommendation — Comprehensive Tests: Engine & Service
 *
 * Covers: recommendation engine priority ordering, generateSessionRecommendation,
 * isRecommendationValid, getFallbackRecommendation.
 */

// ── Mocks (must come before imports that use them) ───────────────────

jest.mock("../../../store", () => ({
  useAuthStore: jest.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { id: "user-123" } }),
  ),
}));

jest.mock("../../../utils/haptics", () => ({
  triggerHaptic: jest.fn(),
}));

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
}));

jest.mock("../../../events", () => ({
  eventBus: { emit: jest.fn() },
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({ data: [], isPending: false, isError: false, error: null, refetch: jest.fn() })),
}));

// ── Imports ──────────────────────────────────────────────────────────

import { SessionRecommendationInputSchema, SessionRecommendationSchema } from "../schemas";
import type { SessionRecommendation, SessionRecommendationInput } from "../schemas";
import { getPriorityRecommendation } from "../recommendation-engine";
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
// 5. RECOMMENDATION ENGINE — priority ordering
// ═══════════════════════════════════════════════════════════════════════

describe("getPriorityRecommendation", () => {
  it("default recommendation has fallback=true", () => {
    const rec = getPriorityRecommendation(makeInput({ timeOfDay: 15 }));
    expect(rec.fallback).toBe(true);
    expect(rec.confidence).toBe(0.7);
  });

  it("first session has highest confidence after blocked", () => {
    const rec = getPriorityRecommendation(makeInput({ isFirstSession: true }));
    expect(rec.confidence).toBe(0.95);
    expect(rec.isBlocked).toBe(false);
  });

  it("streak critical has highest non-blocked confidence (0.98)", () => {
    const rec = getPriorityRecommendation(makeInput({ streakUrgency: "critical" }));
    expect(rec.confidence).toBe(0.98);
  });

  it("all priorities produce valid output", () => {
    const scenarios = [
      { isFirstSession: true },
      { streakUrgency: "critical" as const },
      { recoveryStatus: "urgent" as const },
      { dailyMissionType: "boss-fight" },
      { timeOfDay: 10 },
      { timeOfDay: 15, recentSessionLength: 30, recentGrade: "A" },
      { timeOfDay: 15 },
    ];

    for (const scenario of scenarios) {
      const rec = getPriorityRecommendation(makeInput(scenario));
      expect(rec.duration).toBeGreaterThan(0);
      expect(rec.reason.length).toBeGreaterThan(0);
      expect(typeof rec.fallback).toBe("boolean");
      expect(typeof rec.isBlocked).toBe("boolean");
      expect(rec.confidence).toBeGreaterThan(0);
      expect(rec.confidence).toBeLessThanOrEqual(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 6. SERVICE — generateSessionRecommendation
// ═══════════════════════════════════════════════════════════════════════

describe("generateSessionRecommendation", () => {
  it("blocked recommendation always has confidence 1.0", () => {
    const rec = generateSessionRecommendation(makeInput({ hasActiveSession: true }));
    expect(rec.confidence).toBe(1.0);
  });

  it("blocked recommendation has block reason", () => {
    const rec = generateSessionRecommendation(makeInput({ hasActiveSession: true }));
    expect(rec.blockReason).toBe("Active session in progress");
  });

  it("non-blocked recommendation includes parsed inputs", () => {
    const rec = generateSessionRecommendation(makeInput({ userGoal: "Focus" }));
    expect(rec.inputs).toBeDefined();
    expect(rec.inputs.timeOfDay).toBeDefined();
  });

  it("does not throw for valid input", () => {
    expect(() => generateSessionRecommendation(makeInput())).not.toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 7. SERVICE — isRecommendationValid
// ═══════════════════════════════════════════════════════════════════════

describe("isRecommendationValid", () => {
  it("blocked recommendation is always invalid", () => {
    expect(isRecommendationValid(makeRecommendation({ isBlocked: true, confidence: 0.99 }))).toBe(false);
  });

  it("confidence exactly at 0.5 is invalid (boundary)", () => {
    expect(isRecommendationValid(makeRecommendation({ confidence: 0.5 }))).toBe(false);
  });

  it("confidence 0.5001 is valid", () => {
    expect(isRecommendationValid(makeRecommendation({ confidence: 0.5001 }))).toBe(true);
  });

  it("confidence 1.0 is valid", () => {
    expect(isRecommendationValid(makeRecommendation({ confidence: 1.0 }))).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 8. SERVICE — getFallbackRecommendation
// ═══════════════════════════════════════════════════════════════════════

describe("getFallbackRecommendation", () => {
  it("is always valid", () => {
    const rec = getFallbackRecommendation(makeInput());
    expect(isRecommendationValid(rec)).toBe(true);
  });

  it("is always fallback=true", () => {
    const rec = getFallbackRecommendation(makeInput());
    expect(rec.fallback).toBe(true);
  });

  it("is never blocked", () => {
    const rec = getFallbackRecommendation(makeInput());
    expect(rec.isBlocked).toBe(false);
  });

  it("passes user input through", () => {
    const input = makeInput({ userGoal: "Learn TypeScript" });
    const rec = getFallbackRecommendation(input);
    expect(rec.inputs.userGoal).toBe("Learn TypeScript");
  });
});
