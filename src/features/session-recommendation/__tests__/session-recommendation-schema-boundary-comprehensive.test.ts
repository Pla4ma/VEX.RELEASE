/**
 * Session Recommendation — Comprehensive Tests: Schema Boundary Tests
 *
 * Covers: schemas boundary conditions and edge cases.
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

import {
  SessionModeSchema,
  SessionRecommendationSchema,
  SessionRecommendationInputSchema,
} from "../schemas";
import type { SessionRecommendation, SessionRecommendationInput } from "../schemas";

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
// 1. SCHEMA BOUNDARY TESTS
// ═══════════════════════════════════════════════════════════════════════

describe("Schema boundary tests", () => {
  describe("SessionModeSchema", () => {
    it("accepts exactly 5 modes", () => {
      const modes = ["FOCUS", "RECOVERY", "STUDY", "BOSS_PREP", "HABIT_BUILD"];
      expect(modes).toHaveLength(5);
      for (const mode of modes) {
        expect(SessionModeSchema.parse(mode)).toBe(mode);
      }
    });

    it("rejects lowercase mode", () => {
      expect(() => SessionModeSchema.parse("focus")).toThrow();
    });
  });

  describe("SessionRecommendationInputSchema", () => {
    it("accepts timeOfDay at boundary 0", () => {
      expect(makeInput({ timeOfDay: 0 }).timeOfDay).toBe(0);
    });

    it("accepts timeOfDay at boundary 23", () => {
      expect(makeInput({ timeOfDay: 23 }).timeOfDay).toBe(23);
    });

    it("accepts all streak urgency values", () => {
      for (const urgency of ["none", "low", "medium", "high", "critical"]) {
        expect(makeInput({ streakUrgency: urgency as SessionRecommendationInput["streakUrgency"] }).streakUrgency).toBe(urgency);
      }
    });

    it("accepts all recovery status values", () => {
      for (const status of ["none", "needed", "urgent"]) {
        expect(makeInput({ recoveryStatus: status as SessionRecommendationInput["recoveryStatus"] }).recoveryStatus).toBe(status);
      }
    });

    it("accepts zero recentSessionLength", () => {
      expect(makeInput({ recentSessionLength: 0 }).recentSessionLength).toBe(0);
    });
  });

  describe("SessionRecommendationSchema", () => {
    it("accepts blocked recommendation", () => {
      const rec = makeRecommendation({ isBlocked: true, blockReason: "Active session" });
      expect(rec.isBlocked).toBe(true);
      expect(rec.blockReason).toBe("Active session");
    });

    it("accepts fallback recommendation", () => {
      const rec = makeRecommendation({ fallback: true });
      expect(rec.fallback).toBe(true);
    });
  });
});
