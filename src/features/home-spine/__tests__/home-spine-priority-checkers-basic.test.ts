/**
 * Tests for home-spine priority-checkers-basic.ts
 * (checkStreakCritical, checkCompanionPromise, checkPromiseRecovery,
 *  checkStreakAtRisk, checkRecommendedSession, checkDefaultSession)
 */

import {
  checkStreakCritical,
  checkCompanionPromise,
  checkPromiseRecovery,
  checkStreakAtRisk,
  checkRecommendedSession,
  checkDefaultSession,
} from "../priority-checkers-basic";

import type { HomeContextSnapshot } from "../priority-schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const userId = "550e8400-e29b-41d4-a716-446655440000";

function makeSnapshot(
  overrides: Partial<HomeContextSnapshot> = {},
): HomeContextSnapshot {
  return {
    userId,
    timestamp: Date.now(),
    boss: { hasActiveEncounter: false, isFinalStrike: false },
    challenge: { isNearDone: false, progressPercent: 0 },
    coach: { hasIntervention: false },
    companionPromise: { kind: "hidden" },
    daily: { goalMinutes: 60, minutesFocused: 0, sessionsCompleted: 0 },
    onboarding: { firstSessionCompleted: false, isComplete: false },
    recommendation: { hasActive: false },
    streak: { currentDays: 0, isAtRisk: false, isComeback: false },
    studyPlan: { dueToday: false, hasActivePlan: false, itemsDue: 0 },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// priority-checkers-basic tests
// ---------------------------------------------------------------------------
describe("home-spine: priority-checkers-basic", () => {
  describe("checkStreakCritical", () => {
    it("returns null when streak is not at risk", () => {
      const snap = makeSnapshot({
        streak: { currentDays: 5, isAtRisk: false, isComeback: false },
      });
      expect(checkStreakCritical(snap)).toBeNull();
    });

    it("returns null when hoursRemaining > 2", () => {
      const snap = makeSnapshot({
        streak: { currentDays: 5, isAtRisk: true, hoursRemaining: 5, isComeback: false },
      });
      expect(checkStreakCritical(snap)).toBeNull();
    });

    it("returns STREAK_CRITICAL when at risk and <= 2 hours left", () => {
      const snap = makeSnapshot({
        streak: { currentDays: 10, isAtRisk: true, hoursRemaining: 1, isComeback: false },
      });
      const result = checkStreakCritical(snap);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("STREAK_CRITICAL");
      expect(result!.urgency).toBe(100);
    });
  });

  describe("checkCompanionPromise", () => {
    it("returns null when promise is not pending", () => {
      const snap = makeSnapshot({ companionPromise: { kind: "hidden" } });
      expect(checkCompanionPromise(snap)).toBeNull();
    });

    it("returns COMPANION_PROMISE when pending", () => {
      const snap = makeSnapshot({
        companionPromise: {
          kind: "pending",
          targetDurationMinutes: 20,
          targetMode: "FOCUS",
        },
      });
      const result = checkCompanionPromise(snap);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("COMPANION_PROMISE");
      expect(result!.urgency).toBe(95);
    });
  });

  describe("checkPromiseRecovery", () => {
    it("returns null when promise is not missed", () => {
      const snap = makeSnapshot({ companionPromise: { kind: "pending" } });
      expect(checkPromiseRecovery(snap)).toBeNull();
    });

    it("returns PROMISE_RECOVERY when missed", () => {
      const snap = makeSnapshot({ companionPromise: { kind: "missed" } });
      const result = checkPromiseRecovery(snap);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("PROMISE_RECOVERY");
      expect(result!.urgency).toBe(90);
    });
  });

  describe("checkStreakAtRisk", () => {
    it("returns null when not at risk", () => {
      const snap = makeSnapshot({
        streak: { currentDays: 5, isAtRisk: false, isComeback: false },
      });
      expect(checkStreakAtRisk(snap)).toBeNull();
    });

    it("returns STREAK_AT_RISK when at risk", () => {
      const snap = makeSnapshot({
        streak: { currentDays: 5, isAtRisk: true, isComeback: false },
      });
      const result = checkStreakAtRisk(snap);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("STREAK_AT_RISK");
    });
  });

  describe("checkRecommendedSession", () => {
    it("returns null when no active recommendation", () => {
      const snap = makeSnapshot({ recommendation: { hasActive: false } });
      expect(checkRecommendedSession(snap)).toBeNull();
    });

    it("returns RECOMMENDED_SESSION when active recommendation exists", () => {
      const snap = makeSnapshot({
        recommendation: {
          hasActive: true,
          id: "rec-1",
          suggestedDurationSeconds: 1500,
        },
      });
      const result = checkRecommendedSession(snap);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("RECOMMENDED_SESSION");
    });
  });

  describe("checkDefaultSession", () => {
    it("always returns a DEFAULT_SESSION priority", () => {
      const snap = makeSnapshot();
      const result = checkDefaultSession(snap);
      expect(result.type).toBe("DEFAULT_SESSION");
      expect(result.urgency).toBe(10);
    });

    it("returns 'Start First Session' CTA for new users", () => {
      const snap = makeSnapshot({
        onboarding: { firstSessionCompleted: false, isComplete: false },
      });
      const result = checkDefaultSession(snap);
      expect(result.cta.text).toBe("Start First Session");
    });

    it("returns 'Start Focus' CTA for returning users", () => {
      const snap = makeSnapshot({
        onboarding: { firstSessionCompleted: true, isComplete: true },
      });
      const result = checkDefaultSession(snap);
      expect(result.cta.text).toBe("Start Focus");
    });
  });
});
