/**
 * Session Recommendation — Comprehensive Tests
 *
 * Covers: schemas, recommendation engine, mission/performance/time-based
 * recommendations, service functions, analytics, and hooks.
 * Focuses on edge cases and boundary conditions not covered by the main test.
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
import { sessionRecommendationKeys } from "../hooks";
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

// ═══════════════════════════════════════════════════════════════════════
// 2. MISSION-BASED RECOMMENDATIONS — full coverage
// ═══════════════════════════════════════════════════════════════════════

describe("getMissionBasedRecommendation", () => {
  it("handles empty string as default", () => {
    const rec = getMissionBasedRecommendation("");
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
  });

  it("handles arbitrary unknown mission type", () => {
    const rec = getMissionBasedRecommendation("something-random");
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.reason).toContain("Standard");
  });

  it("all known mission types return valid mode values", () => {
    const missionTypes = ["first-session", "streak-critical", "boss-fight", "comeback-quest", "daily-challenge"];
    for (const type of missionTypes) {
      const rec = getMissionBasedRecommendation(type);
      expect(SessionModeSchema.safeParse(rec.mode).success).toBe(true);
      expect(rec.duration).toBeGreaterThan(0);
      expect(rec.reason.length).toBeGreaterThan(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 3. PERFORMANCE-BASED RECOMMENDATIONS — edge cases
// ═══════════════════════════════════════════════════════════════════════

describe("getPerformanceBasedRecommendation", () => {
  it("clamps low-grade duration to 15 even with very short recent length", () => {
    const rec = getPerformanceBasedRecommendation(10, "F");
    expect(rec.duration).toBe(15); // max(15, 10-10) = max(15, 0) = 15
    expect(rec.mode).toBe("RECOVERY");
  });

  it("caps high-grade duration at 60", () => {
    const rec = getPerformanceBasedRecommendation(60, "A");
    expect(rec.duration).toBe(60); // min(60, 60+10) = 60
  });

  it("returns FOCUS mode for average grades B and C", () => {
    expect(getPerformanceBasedRecommendation(30, "B").mode).toBe("FOCUS");
    expect(getPerformanceBasedRecommendation(30, "C").mode).toBe("FOCUS");
  });

  it("handles grade D as low performance", () => {
    const rec = getPerformanceBasedRecommendation(40, "D");
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.duration).toBe(30); // max(15, 40-10)
  });

  it("all return types have valid SessionMode", () => {
    const cases = [
      [20, "A"], [30, "B"], [25, "C"], [30, "D"], [20, "F"], [50, "A+"],
    ] as const;
    for (const [len, grade] of cases) {
      const rec = getPerformanceBasedRecommendation(len, grade);
      expect(SessionModeSchema.safeParse(rec.mode).success).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 4. TIME-BASED RECOMMENDATIONS — complete hour coverage
// ═══════════════════════════════════════════════════════════════════════

describe("getTimeBasedRecommendation", () => {
  it("returns null for every hour 0-4", () => {
    for (let h = 0; h < 5; h++) {
      expect(getTimeBasedRecommendation(h)).toBeNull();
    }
  });

  it("returns non-null for every hour in early morning range (5-7)", () => {
    for (let h = 5; h < 8; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe("RECOVERY");
      expect(rec!.duration).toBe(15);
    }
  });

  it("returns null for hour 8", () => {
    expect(getTimeBasedRecommendation(8)).toBeNull();
  });

  it("returns FOCUS for every hour in peak range (9-10)", () => {
    for (let h = 9; h < 11; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe("FOCUS");
      expect(rec!.duration).toBe(45);
    }
  });

  it("returns null for hours 11-12", () => {
    expect(getTimeBasedRecommendation(11)).toBeNull();
    expect(getTimeBasedRecommendation(12)).toBeNull();
  });

  it("returns RECOVERY for every hour in afternoon range (13-14)", () => {
    for (let h = 13; h < 15; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe("RECOVERY");
      expect(rec!.duration).toBe(20);
    }
  });

  it("returns null for hours 15-18", () => {
    for (let h = 15; h < 19; h++) {
      expect(getTimeBasedRecommendation(h)).toBeNull();
    }
  });

  it("returns FOCUS for every hour in evening range (19-20)", () => {
    for (let h = 19; h < 21; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe("FOCUS");
      expect(rec!.duration).toBe(30);
    }
  });

  it("returns HABIT_BUILD for every hour in late night range (21-22)", () => {
    for (let h = 21; h < 23; h++) {
      const rec = getTimeBasedRecommendation(h);
      expect(rec).not.toBeNull();
      expect(rec!.mode).toBe("HABIT_BUILD");
      expect(rec!.duration).toBe(15);
    }
  });

  it("returns null for hour 23", () => {
    expect(getTimeBasedRecommendation(23)).toBeNull();
  });
});

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

// ═══════════════════════════════════════════════════════════════════════
// 9. ANALYTICS — all tracking functions
// ═══════════════════════════════════════════════════════════════════════

describe("Analytics tracking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("trackRecommendationPerformance computes correct duration accuracy", () => {
    const rec = makeRecommendation({ duration: 40, mode: "FOCUS" });
    trackRecommendationPerformance(rec, 20, "FOCUS", "B", true);

    const call = (Sentry.addBreadcrumb as jest.Mock).mock.calls[0][0];
    expect(call.data.durationAccuracy).toBe(0.5); // |40-20|/40
    expect(call.data.modeMatch).toBe(true);
  });

  it("trackRecommendationPerformance with exact match has 0 accuracy", () => {
    const rec = makeRecommendation({ duration: 25, mode: "FOCUS" });
    trackRecommendationPerformance(rec, 25, "FOCUS", "A", true);

    const call = (Sentry.addBreadcrumb as jest.Mock).mock.calls[0][0];
    expect(call.data.durationAccuracy).toBe(0);
  });

  it("trackRecommendationBlocked emits at warning level", () => {
    const rec = makeRecommendation({ isBlocked: true, blockReason: "Test" });
    trackRecommendationBlocked(rec, makeInput());

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ level: "warning" }),
    );
  });

  it("trackRecommendationDismissed works with no reason", () => {
    const rec = makeRecommendation();
    trackRecommendationDismissed(rec, makeInput());

    expect(eventBus.emit).toHaveBeenCalledWith(
      "session-recommendation:dismissed",
      expect.objectContaining({ dismissReason: undefined }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 10. HOOKS — query key factory
// ═══════════════════════════════════════════════════════════════════════

describe("sessionRecommendationKeys", () => {
  it("current key includes userId", () => {
    const key = sessionRecommendationKeys.current("abc");
    expect(key).toContain("current");
    expect(key).toContain("abc");
  });

  it("analytics key includes userId", () => {
    const key = sessionRecommendationKeys.analytics("xyz");
    expect(key).toContain("analytics");
    expect(key).toContain("xyz");
  });

  it("all keys start with base", () => {
    expect(sessionRecommendationKeys.all).toEqual(["session-recommendation"]);
    expect(sessionRecommendationKeys.current("a")[0]).toBe("session-recommendation");
    expect(sessionRecommendationKeys.analytics("a")[0]).toBe("session-recommendation");
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 11. INTEGRATION — full pipeline tests
// ═══════════════════════════════════════════════════════════════════════

describe("Full pipeline integration", () => {
  it("first-session input produces a valid, non-blocked recommendation", () => {
    const rec = generateSessionRecommendation(makeInput({ isFirstSession: true }));
    expect(rec.isBlocked).toBe(false);
    expect(rec.fallback).toBe(false);
    expect(isRecommendationValid(rec)).toBe(true);
    expect(rec.mode).toBe("RECOVERY");
  });

  it("active session input always blocks regardless of other params", () => {
    const rec = generateSessionRecommendation(
      makeInput({ hasActiveSession: true, isFirstSession: true, streakUrgency: "critical" }),
    );
    expect(rec.isBlocked).toBe(true);
    expect(rec.blockReason).toBe("Active session in progress");
  });

  it("default input with no time match produces a fallback recommendation", () => {
    const rec = generateSessionRecommendation(makeInput({ timeOfDay: 15 }));
    expect(rec.fallback).toBe(true);
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
  });
});
