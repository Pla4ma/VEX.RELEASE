/**
 * Tests for home-spine priority-checkers-gated.ts
 * (checkChallengeNearDone, checkBossActive)
 */

import {
  checkChallengeNearDone,
  checkBossActive,
} from "../priority-checkers-gated";

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
// priority-checkers-gated tests
// ---------------------------------------------------------------------------
describe("home-spine: priority-checkers-gated", () => {
  describe("checkChallengeNearDone", () => {
    it("returns null when challenge is not near done", () => {
      const snap = makeSnapshot({
        challenge: { isNearDone: false, progressPercent: 30 },
      });
      expect(checkChallengeNearDone(snap)).toBeNull();
    });

    it("returns CHALLENGE_NEAR_DONE when near done and features unlocked", () => {
      const snap = makeSnapshot({
        challenge: { isNearDone: true, progressPercent: 85, title: "Daily Focus" },
      });
      const result = checkChallengeNearDone(snap);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("CHALLENGE_NEAR_DONE");
      expect(result!.urgency).toBe(60);
    });

    it("returns null when challenges feature is locked", () => {
      const snap = makeSnapshot({
        challenge: { isNearDone: true, progressPercent: 90 },
      });
      const lockedAccess = {
        challenges: {
          key: "challenges",
          isUnlocked: false,
          isVisible: false,
          lockedDescription: "",
          recommendedUnlockMoment: "",
          unlockReason: "",
          releaseState: "locked" as const,
          isDegraded: false,
        },
      };
      expect(checkChallengeNearDone(snap, lockedAccess as any)).toBeNull();
    });

    it("returns null when surfaceMap hides both challenge surfaces", () => {
      const snap = makeSnapshot({
        challenge: { isNearDone: true, progressPercent: 80 },
      });
      const productContext = {
        surfaceMap: {
          challenge_teaser: "hidden" as const,
          weekly_quest: "blocked" as const,
        },
      };
      expect(checkChallengeNearDone(snap, undefined, productContext as any)).toBeNull();
    });
  });

  describe("checkBossActive", () => {
    it("returns null when no active encounter", () => {
      const snap = makeSnapshot({
        boss: { hasActiveEncounter: false, isFinalStrike: false },
      });
      expect(checkBossActive(snap)).toBeNull();
    });

    it("returns BOSS_ACTIVE when encounter is active and features unlocked", () => {
      const snap = makeSnapshot({
        boss: { hasActiveEncounter: true, isFinalStrike: false, healthRemaining: 500, maxHealth: 1000 },
      });
      const result = checkBossActive(snap);
      expect(result).not.toBeNull();
      expect(result!.type).toBe("BOSS_ACTIVE");
    });

    it("returns null when boss_tab feature is locked", () => {
      const snap = makeSnapshot({
        boss: { hasActiveEncounter: true, isFinalStrike: false },
      });
      const lockedAccess = {
        boss_tab: {
          key: "boss_tab",
          isUnlocked: false,
          isVisible: false,
          lockedDescription: "",
          recommendedUnlockMoment: "",
          unlockReason: "",
          releaseState: "locked" as const,
          isDegraded: false,
        },
      };
      expect(checkBossActive(snap, lockedAccess as any)).toBeNull();
    });

    it("returns null when firstWeekExperience hides boss", () => {
      const snap = makeSnapshot({
        boss: { hasActiveEncounter: true, isFinalStrike: false },
      });
      const pc = {
        firstWeekExperience: { bossIntensity: "hidden" as const },
        totalCompletedSessions: 5,
      };
      expect(checkBossActive(snap, undefined, pc as any)).toBeNull();
    });

    it("returns null when totalCompletedSessions is 0", () => {
      const snap = makeSnapshot({
        boss: { hasActiveEncounter: true, isFinalStrike: false },
      });
      const pc = { totalCompletedSessions: 0 };
      expect(checkBossActive(snap, undefined, pc as any)).toBeNull();
    });

    it("returns null when surfaceMap hides boss surfaces", () => {
      const snap = makeSnapshot({
        boss: { hasActiveEncounter: true, isFinalStrike: false },
      });
      const pc = {
        totalCompletedSessions: 3,
        surfaceMap: {
          boss_compact: "hidden" as const,
          boss_full_cta: "blocked" as const,
        },
      };
      expect(checkBossActive(snap, undefined, pc as any)).toBeNull();
    });
  });
});
