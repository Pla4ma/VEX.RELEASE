/**
 * Session Recommendation — Comprehensive Tests: Mission & Performance Based
 *
 * Covers: mission-based recommendations, performance-based recommendations.
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

import { SessionModeSchema } from "../schemas";
import { getMissionBasedRecommendation } from "../mission-based-recommendations";
import { getPerformanceBasedRecommendation } from "../performance-based-recommendations";

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
