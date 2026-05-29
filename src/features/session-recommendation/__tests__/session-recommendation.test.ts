/**
 * Session Recommendation — Comprehensive Tests
 *
 * Covers: schemas, recommendation engine, mission/performance/time-based
 * recommendations, service, analytics, and hooks.
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
import { getMissionBasedRecommendation } from "../mission-based-recommendations";
import { getPerformanceBasedRecommendation } from "../performance-based-recommendations";
import { getTimeBasedRecommendation } from "../time-based-recommendations";
import { getPriorityRecommendation } from "../recommendation-engine";
import {
  generateSessionRecommendation,
  isRecommendationValid,
  getFallbackRecommendation,
} from "../service";
import {
  trackRecommendationGenerated,
  trackRecommendationAccepted,
  trackRecommendationDismissed,
  trackRecommendationBlocked,
  trackRecommendationPerformance,
} from "../analytics";
import { useSessionRecommendationActions, sessionRecommendationKeys } from "../hooks";
import Sentry from "@sentry/react-native";
import { eventBus } from "../../../events";

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
// 1. SCHEMA VALIDATION
// ═══════════════════════════════════════════════════════════════════════

describe("SessionModeSchema", () => {
  it("accepts all valid modes", () => {
    const modes = ["FOCUS", "RECOVERY", "STUDY", "BOSS_PREP", "HABIT_BUILD"];
    for (const mode of modes) {
      expect(SessionModeSchema.parse(mode)).toBe(mode);
    }
  });

  it("rejects invalid mode", () => {
    expect(() => SessionModeSchema.parse("INVALID")).toThrow();
  });
});

describe("SessionRecommendationInputSchema", () => {
  it("accepts valid input with all required fields", () => {
    const input = makeInput();
    expect(input.timeOfDay).toBe(10);
    expect(input.streakUrgency).toBe("none");
    expect(input.recoveryStatus).toBe("none");
    expect(input.isFirstSession).toBe(false);
    expect(input.hasActiveSession).toBe(false);
  });

  it("rejects timeOfDay outside 0-23", () => {
    expect(() => makeInput({ timeOfDay: 24 })).toThrow();
    expect(() => makeInput({ timeOfDay: -1 })).toThrow();
  });

  it("rejects invalid streakUrgency value", () => {
    expect(() => makeInput({ streakUrgency: "extreme" as "none" })).toThrow();
  });

  it("rejects invalid recoveryStatus value", () => {
    expect(() => makeInput({ recoveryStatus: "maybe" as "none" })).toThrow();
  });

  it("rejects invalid UUID for userId", () => {
    expect(() => makeInput({ userId: "not-a-uuid" })).toThrow();
  });

  it("accepts optional fields when provided", () => {
    const input = makeInput({
      userGoal: "Study math",
      recentSessionLength: 30,
      recentGrade: "A",
      dailyMissionType: "boss-fight",
    });
    expect(input.userGoal).toBe("Study math");
    expect(input.recentSessionLength).toBe(30);
    expect(input.recentGrade).toBe("A");
    expect(input.dailyMissionType).toBe("boss-fight");
  });
});

describe("SessionRecommendationSchema", () => {
  it("accepts valid recommendation", () => {
    const rec = makeRecommendation();
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.confidence).toBe(0.8);
  });

  it("rejects duration below 5", () => {
    expect(() => makeRecommendation({ duration: 4 })).toThrow();
  });

  it("rejects duration above 720", () => {
    expect(() => makeRecommendation({ duration: 721 })).toThrow();
  });

  it("rejects empty reason", () => {
    expect(() => makeRecommendation({ reason: "" })).toThrow();
  });

  it("rejects confidence above 1", () => {
    expect(() => makeRecommendation({ confidence: 1.1 })).toThrow();
  });

  it("rejects confidence below 0", () => {
    expect(() => makeRecommendation({ confidence: -0.1 })).toThrow();
  });

  it("accepts boundary duration values", () => {
    expect(makeRecommendation({ duration: 5 }).duration).toBe(5);
    expect(makeRecommendation({ duration: 720 }).duration).toBe(720);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 2. MISSION-BASED RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════

describe("getMissionBasedRecommendation", () => {
  it("returns 10-min RECOVERY for first-session", () => {
    const rec = getMissionBasedRecommendation("first-session");
    expect(rec.duration).toBe(10);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.reason).toContain("10-minute");
  });

  it("returns 15-min RECOVERY for streak-critical", () => {
    const rec = getMissionBasedRecommendation("streak-critical");
    expect(rec.duration).toBe(15);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.reason).toContain("streak");
  });

  it("returns 45-min BOSS_PREP for boss-fight", () => {
    const rec = getMissionBasedRecommendation("boss-fight");
    expect(rec.duration).toBe(45);
    expect(rec.mode).toBe("BOSS_PREP");
    expect(rec.reason).toContain("Boss battle");
  });

  it("returns 20-min RECOVERY for comeback-quest", () => {
    const rec = getMissionBasedRecommendation("comeback-quest");
    expect(rec.duration).toBe(20);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.reason).toContain("Comeback");
  });

  it("returns 30-min FOCUS for daily-challenge", () => {
    const rec = getMissionBasedRecommendation("daily-challenge");
    expect(rec.duration).toBe(30);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.reason).toContain("Challenge");
  });

  it("returns 25-min FOCUS default for unknown mission type", () => {
    const rec = getMissionBasedRecommendation("unknown-mission");
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.reason).toContain("Standard");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 3. PERFORMANCE-BASED RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════

describe("getPerformanceBasedRecommendation", () => {
  it("recommends shorter RECOVERY session for grade D", () => {
    const rec = getPerformanceBasedRecommendation(30, "D");
    expect(rec.duration).toBe(20); // max(15, 30-10)
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.reason).toContain("Recovery");
  });

  it("recommends shorter RECOVERY session for grade F", () => {
    const rec = getPerformanceBasedRecommendation(30, "F");
    expect(rec.duration).toBe(20); // max(15, 30-10)
    expect(rec.mode).toBe("RECOVERY");
  });

  it("clamps low-grade duration to minimum 15", () => {
    const rec = getPerformanceBasedRecommendation(20, "D");
    expect(rec.duration).toBe(15); // max(15, 20-10)
  });

  it("recommends longer FOCUS session for grade A", () => {
    const rec = getPerformanceBasedRecommendation(30, "A");
    expect(rec.duration).toBe(40); // min(60, 30+10)
    expect(rec.mode).toBe("FOCUS");
    expect(rec.reason).toContain("Build on success");
  });

  it("recommends longer FOCUS session for grade A+", () => {
    const rec = getPerformanceBasedRecommendation(50, "A+");
    expect(rec.duration).toBe(60); // min(60, 50+10)
    expect(rec.mode).toBe("FOCUS");
  });

  it("caps high-grade duration at maximum 60", () => {
    const rec = getPerformanceBasedRecommendation(55, "A");
    expect(rec.duration).toBe(60); // min(60, 55+10)
  });

  it("maintains same duration for average grade (B)", () => {
    const rec = getPerformanceBasedRecommendation(30, "B");
    expect(rec.duration).toBe(30);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.reason).toContain("Maintain");
  });

  it("maintains same duration for grade C", () => {
    const rec = getPerformanceBasedRecommendation(25, "C");
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 4. TIME-BASED RECOMMENDATIONS
// ═══════════════════════════════════════════════════════════════════════

describe("getTimeBasedRecommendation", () => {
  it("returns 15-min RECOVERY for early morning (5-7)", () => {
    const rec = getTimeBasedRecommendation(6);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(15);
    expect(rec!.mode).toBe("RECOVERY");
    expect(rec!.reason).toContain("Morning");
  });

  it("returns 45-min FOCUS for peak hours (9-10)", () => {
    const rec = getTimeBasedRecommendation(10);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(45);
    expect(rec!.mode).toBe("FOCUS");
    expect(rec!.reason).toContain("Peak");
  });

  it("returns 20-min RECOVERY for afternoon slump (13-14)", () => {
    const rec = getTimeBasedRecommendation(14);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(20);
    expect(rec!.mode).toBe("RECOVERY");
    expect(rec!.reason).toContain("Afternoon");
  });

  it("returns 30-min FOCUS for evening (19-20)", () => {
    const rec = getTimeBasedRecommendation(20);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(30);
    expect(rec!.mode).toBe("FOCUS");
    expect(rec!.reason).toContain("Evening");
  });

  it("returns 15-min HABIT_BUILD for late night (21-22)", () => {
    const rec = getTimeBasedRecommendation(22);
    expect(rec).not.toBeNull();
    expect(rec!.duration).toBe(15);
    expect(rec!.mode).toBe("HABIT_BUILD");
    expect(rec!.reason).toContain("habit");
  });

  it("returns null for hours with no specific recommendation", () => {
    expect(getTimeBasedRecommendation(0)).toBeNull();
    expect(getTimeBasedRecommendation(3)).toBeNull();
    expect(getTimeBasedRecommendation(12)).toBeNull();
    expect(getTimeBasedRecommendation(16)).toBeNull();
    expect(getTimeBasedRecommendation(23)).toBeNull();
  });

  it("handles boundary hours correctly", () => {
    // 5 is start of morning range
    expect(getTimeBasedRecommendation(5)).not.toBeNull();
    expect(getTimeBasedRecommendation(5)!.mode).toBe("RECOVERY");

    // 8 is not in any range
    expect(getTimeBasedRecommendation(8)).toBeNull();

    // 11 is not in peak range (9-10)
    expect(getTimeBasedRecommendation(11)).toBeNull();

    // 21 is start of late night
    expect(getTimeBasedRecommendation(21)).not.toBeNull();
    expect(getTimeBasedRecommendation(21)!.mode).toBe("HABIT_BUILD");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 5. RECOMMENDATION ENGINE (Priority Rules)
// ═══════════════════════════════════════════════════════════════════════

describe("getPriorityRecommendation", () => {
  it("Priority 1: returns 10-min RECOVERY for first session", () => {
    const rec = getPriorityRecommendation(makeInput({ isFirstSession: true }));
    expect(rec.duration).toBe(10);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.confidence).toBe(0.95);
    expect(rec.fallback).toBe(false);
    expect(rec.isBlocked).toBe(false);
    expect(rec.reason).toContain("habit");
  });

  it("Priority 2: returns 15-min RECOVERY for critical streak", () => {
    const rec = getPriorityRecommendation(makeInput({ streakUrgency: "critical" }));
    expect(rec.duration).toBe(15);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.confidence).toBe(0.98);
    expect(rec.reason).toContain("streak");
  });

  it("Priority 2: first session takes precedence over critical streak", () => {
    const rec = getPriorityRecommendation(
      makeInput({ isFirstSession: true, streakUrgency: "critical" }),
    );
    expect(rec.duration).toBe(10); // first session wins
    expect(rec.confidence).toBe(0.95);
  });

  it("Priority 3: returns 20-min RECOVERY for urgent recovery", () => {
    const rec = getPriorityRecommendation(makeInput({ recoveryStatus: "urgent" }));
    expect(rec.duration).toBe(20);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.confidence).toBe(0.9);
    expect(rec.reason).toContain("recovery");
  });

  it("Priority 2 (streak) takes precedence over Priority 3 (recovery)", () => {
    const rec = getPriorityRecommendation(
      makeInput({ streakUrgency: "critical", recoveryStatus: "urgent" }),
    );
    expect(rec.duration).toBe(15); // streak critical wins
    expect(rec.confidence).toBe(0.98);
  });

  it("Priority 4: uses mission-based recommendation when dailyMissionType set", () => {
    const rec = getPriorityRecommendation(
      makeInput({ dailyMissionType: "boss-fight" }),
    );
    expect(rec.duration).toBe(45);
    expect(rec.mode).toBe("BOSS_PREP");
    expect(rec.confidence).toBe(0.85);
    expect(rec.fallback).toBe(false);
  });

  it("Priority 5: uses time-based recommendation during peak hours", () => {
    const rec = getPriorityRecommendation(makeInput({ timeOfDay: 10 }));
    expect(rec.duration).toBe(45);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.confidence).toBe(0.8);
  });

  it("Priority 6: uses performance-based recommendation when grade + length available", () => {
    const rec = getPriorityRecommendation(
      makeInput({
        timeOfDay: 12, // no time recommendation
        recentSessionLength: 30,
        recentGrade: "A",
      }),
    );
    expect(rec.duration).toBe(40); // min(60, 30+10)
    expect(rec.mode).toBe("FOCUS");
    expect(rec.confidence).toBe(0.75);
  });

  it("Priority 7: returns default 25-min FOCUS when no conditions match", () => {
    const rec = getPriorityRecommendation(
      makeInput({
        timeOfDay: 12, // no time recommendation
      }),
    );
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.confidence).toBe(0.7);
    expect(rec.fallback).toBe(true);
    expect(rec.reason).toContain("balanced");
  });

  it("non-critical streak urgency does not trigger streak priority", () => {
    const rec = getPriorityRecommendation(
      makeInput({ streakUrgency: "high", timeOfDay: 12 }),
    );
    // Should NOT get the streak-critical recommendation
    expect(rec.confidence).not.toBe(0.98);
  });

  it("non-urgent recovery status does not trigger recovery priority", () => {
    const rec = getPriorityRecommendation(
      makeInput({ recoveryStatus: "needed", timeOfDay: 12 }),
    );
    // Should NOT get the urgent recovery recommendation
    expect(rec.duration).not.toBe(20);
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 6. SERVICE FUNCTIONS
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
// 7. ANALYTICS TRACKING
// ═══════════════════════════════════════════════════════════════════════

describe("trackRecommendationGenerated", () => {
  it("adds Sentry breadcrumb with recommendation data", () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationGenerated(rec, input);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "session-recommendation",
        level: "info",
        data: expect.objectContaining({
          duration: 25,
          mode: "FOCUS",
          confidence: 0.8,
        }),
      }),
    );
  });

  it("emits session-recommendation:generated event", () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationGenerated(rec, input);

    expect(eventBus.emit).toHaveBeenCalledWith(
      "session-recommendation:generated",
      expect.objectContaining({
        duration: 25,
        mode: "FOCUS",
        confidence: 0.8,
        isFallback: false,
      }),
    );
  });
});

describe("trackRecommendationAccepted", () => {
  it("adds Sentry breadcrumb for accepted recommendation", () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationAccepted(rec, input);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "session-recommendation",
        message: expect.stringContaining("accepted"),
        level: "info",
      }),
    );
  });

  it("emits session-recommendation:accepted event", () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationAccepted(rec, input);

    expect(eventBus.emit).toHaveBeenCalledWith(
      "session-recommendation:accepted",
      expect.objectContaining({
        duration: 25,
        mode: "FOCUS",
      }),
    );
  });
});

describe("trackRecommendationDismissed", () => {
  it("adds Sentry breadcrumb with optional dismiss reason", () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationDismissed(rec, input, "too long");

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "session-recommendation",
        message: expect.stringContaining("dismissed"),
        data: expect.objectContaining({ dismissReason: "too long" }),
      }),
    );
  });

  it("emits dismissed event with reason", () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationDismissed(rec, input, "not now");

    expect(eventBus.emit).toHaveBeenCalledWith(
      "session-recommendation:dismissed",
      expect.objectContaining({
        dismissReason: "not now",
        duration: 25,
      }),
    );
  });

  it("works without a dismiss reason", () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationDismissed(rec, input);

    expect(eventBus.emit).toHaveBeenCalledWith(
      "session-recommendation:dismissed",
      expect.objectContaining({
        dismissReason: undefined,
      }),
    );
  });
});

describe("trackRecommendationBlocked", () => {
  it("adds Sentry breadcrumb at warning level", () => {
    const rec = makeRecommendation({ isBlocked: true, blockReason: "Active session" });
    const input = makeInput({ hasActiveSession: true });
    trackRecommendationBlocked(rec, input);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "session-recommendation",
        level: "warning",
        data: expect.objectContaining({ blockReason: "Active session" }),
      }),
    );
  });

  it("emits blocked event", () => {
    const rec = makeRecommendation({ isBlocked: true, blockReason: "Session active" });
    const input = makeInput();
    trackRecommendationBlocked(rec, input);

    expect(eventBus.emit).toHaveBeenCalledWith(
      "session-recommendation:blocked",
      expect.objectContaining({
        blockReason: "Session active",
      }),
    );
  });
});

describe("trackRecommendationPerformance", () => {
  it("tracks completed session with matching mode", () => {
    const rec = makeRecommendation({ duration: 25, mode: "FOCUS" });
    trackRecommendationPerformance(rec, 25, "FOCUS", "A", true);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recommendedDuration: 25,
          actualDuration: 25,
          modeMatch: true,
          sessionCompleted: true,
          durationAccuracy: 0,
        }),
      }),
    );
  });

  it("tracks incomplete session with mismatched mode", () => {
    const rec = makeRecommendation({ duration: 30, mode: "FOCUS" });
    trackRecommendationPerformance(rec, 15, "RECOVERY", "D", false);

    const call = (Sentry.addBreadcrumb as jest.Mock).mock.calls[0][0];
    expect(call.data.modeMatch).toBe(false);
    expect(call.data.sessionCompleted).toBe(false);
    expect(call.data.durationAccuracy).toBe(0.5); // |30-15|/30
  });

  it("emits performance event with accuracy data", () => {
    const rec = makeRecommendation({ duration: 20, mode: "RECOVERY" });
    trackRecommendationPerformance(rec, 25, "RECOVERY", "B", true);

    expect(eventBus.emit).toHaveBeenCalledWith(
      "session-recommendation:performance",
      expect.objectContaining({
        recommendedDuration: 20,
        actualDuration: 25,
        durationAccuracy: 0.25, // |20-25|/20
        modeMatch: true,
        sessionCompleted: true,
      }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 8. HOOKS
// ═══════════════════════════════════════════════════════════════════════

describe("sessionRecommendationKeys", () => {
  it("has correct base key", () => {
    expect(sessionRecommendationKeys.all).toEqual(["session-recommendation"]);
  });

  it("generates current key for userId", () => {
    const key = sessionRecommendationKeys.current("user-123");
    expect(key).toEqual(["session-recommendation", "current", "user-123"]);
  });

  it("generates analytics key for userId", () => {
    const key = sessionRecommendationKeys.analytics("user-456");
    expect(key).toEqual(["session-recommendation", "analytics", "user-456"]);
  });
});

describe("useSessionRecommendationActions", () => {
  it("exports startRecommendedSession and dismissRecommendation", () => {
    // Verify the module exports the expected hook
    expect(typeof useSessionRecommendationActions).toBe("function");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 9. INTEGRATION: Engine + Service pipeline
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
