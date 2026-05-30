/**
 * Tests for home-spine priority-builders.ts
 * (buildStakes, buildProgress, buildSecondaryActions)
 */

import {
  buildStakes,
  buildProgress,
  buildSecondaryActions,
} from "../priority-builders";

import type { HomeContextSnapshot, HomePrimaryPriority } from "../priority-schemas";

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
// priority-builders tests
// ---------------------------------------------------------------------------
describe("home-spine: priority-builders", () => {
  describe("buildStakes", () => {
    it("returns STREAK_CRITICAL stakes", () => {
      const snap = makeSnapshot({ streak: { currentDays: 7, isAtRisk: true, isComeback: false } });
      const pri: HomePrimaryPriority = {
        type: "STREAK_CRITICAL",
        urgency: 100,
        reason: "test",
        cta: { action: "OPEN_SESSION_SETUP", text: "Save" },
      };
      const stakes = buildStakes(pri, snap);
      expect(stakes.atRisk).toBeTruthy();
      expect(stakes.what).toContain("7-day streak");
    });

    it("returns COMPANION_PROMISE stakes", () => {
      const snap = makeSnapshot();
      const pri: HomePrimaryPriority = {
        type: "COMPANION_PROMISE",
        urgency: 95,
        reason: "test",
        cta: { action: "OPEN_SESSION_SETUP", text: "Keep" },
      };
      const stakes = buildStakes(pri, snap);
      expect(stakes.what).toBe("Companion promise");
    });

    it("returns DEFAULT_SESSION stakes", () => {
      const snap = makeSnapshot();
      const pri: HomePrimaryPriority = {
        type: "DEFAULT_SESSION",
        urgency: 10,
        reason: "test",
        cta: { action: "OPEN_SESSION_SETUP", text: "Start" },
      };
      const stakes = buildStakes(pri, snap);
      expect(stakes.what).toBe("Focus session");
    });

    it("returns BOSS_ACTIVE stakes", () => {
      const snap = makeSnapshot();
      const pri: HomePrimaryPriority = {
        type: "BOSS_ACTIVE",
        urgency: 50,
        reason: "test",
        cta: { action: "OPEN_BOSS", text: "Fight" },
      };
      const stakes = buildStakes(pri, snap);
      expect(stakes.potentialGain).toContain("boss progress");
    });

    it("returns CHALLENGE_NEAR_DONE stakes", () => {
      const snap = makeSnapshot({
        challenge: { isNearDone: true, progressPercent: 80, title: "Daily Sprint" },
      });
      const pri: HomePrimaryPriority = {
        type: "CHALLENGE_NEAR_DONE",
        urgency: 60,
        reason: "test",
        cta: { action: "OPEN_CHALLENGES", text: "Start" },
      };
      const stakes = buildStakes(pri, snap);
      expect(stakes.what).toBe("Daily Sprint");
    });
  });

  describe("buildProgress", () => {
    it("maps snapshot daily and streak to HomeProgress", () => {
      const snap = makeSnapshot({
        daily: { goalMinutes: 60, minutesFocused: 30, sessionsCompleted: 2 },
        streak: { currentDays: 5, isAtRisk: false, isComeback: false },
      });
      const progress = buildProgress(snap);
      expect(progress.dailyGoalMinutes).toBe(60);
      expect(progress.todayMinutes).toBe(30);
      expect(progress.streakDays).toBe(5);
    });
  });

  describe("buildSecondaryActions", () => {
    it("returns empty array for single priority", () => {
      const actions = buildSecondaryActions([
        {
          type: "DEFAULT_SESSION",
          urgency: 10,
          reason: "test",
          cta: { action: "OPEN_SESSION_SETUP", text: "Start" },
        },
      ]);
      expect(actions).toHaveLength(0);
    });

    it("maps known types to secondary actions", () => {
      const actions = buildSecondaryActions([
        {
          type: "STREAK_CRITICAL",
          urgency: 100,
          reason: "test",
          cta: { action: "OPEN_SESSION_SETUP", text: "Save" },
        },
        {
          type: "COMPANION_PROMISE",
          urgency: 95,
          reason: "test",
          cta: { action: "OPEN_SESSION_SETUP", text: "Keep" },
        },
        {
          type: "RECOMMENDED_SESSION",
          urgency: 70,
          reason: "test",
          cta: { action: "OPEN_SESSION_SETUP", text: "Start" },
        },
      ]);
      expect(actions.length).toBeGreaterThanOrEqual(2);
      expect(actions[0].type).toBe("promise");
      expect(actions[1].type).toBe("recommendation");
    });

    it("caps at 3 secondary actions", () => {
      const many: HomePrimaryPriority[] = Array.from({ length: 6 }, (_, i) => ({
        type: "STREAK_AT_RISK" as const,
        urgency: 85 - i,
        reason: "test",
        cta: { action: "OPEN_SESSION_SETUP" as const, text: "Protect" },
      }));
      const actions = buildSecondaryActions(many);
      expect(actions).toHaveLength(3);
    });
  });
});
