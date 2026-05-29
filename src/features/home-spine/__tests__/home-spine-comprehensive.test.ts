/**
 * Comprehensive tests for the home-spine feature.
 *
 * Covers:
 *  - service.ts (buildHomeReturnReasonState, buildHomeSpineModel)
 *  - copy.ts (buildDisplayedReturnReason, buildPrimaryAction,
 *    buildProgressSignal, recommendationTitleMap)
 *  - priority-checkers-basic.ts (checkStreakCritical, checkCompanionPromise,
 *    checkPromiseRecovery, checkStreakAtRisk, checkRecommendedSession,
 *    checkDefaultSession)
 *  - priority-checkers-gated.ts (checkChallengeNearDone, checkBossActive)
 *  - priority-builders.ts (buildStakes, buildProgress, buildSecondaryActions)
 *  - priority-service.ts (rankHomePriorityCandidates, pickHomePrimaryPriority)
 *  - tomorrow-preview-candidates.ts (buildStreakMilestoneCandidate,
 *    buildBossCandidate, buildRivalCandidate)
 *  - tomorrow-preview-compute.ts (computeTomorrowPreview)
 *  - schemas (all Zod schemas)
 */

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
import { buildHomeReturnReasonState, buildHomeSpineModel } from "../service";

// ---------------------------------------------------------------------------
// Copy helpers
// ---------------------------------------------------------------------------
import {
  buildDisplayedReturnReason,
  buildPrimaryAction,
  buildProgressSignal,
  recommendationTitleMap,
} from "../copy";

// ---------------------------------------------------------------------------
// Priority checkers
// ---------------------------------------------------------------------------
import {
  checkStreakCritical,
  checkCompanionPromise,
  checkPromiseRecovery,
  checkStreakAtRisk,
  checkRecommendedSession,
  checkDefaultSession,
} from "../priority-checkers-basic";

import {
  checkChallengeNearDone,
  checkBossActive,
} from "../priority-checkers-gated";

// ---------------------------------------------------------------------------
// Priority builders
// ---------------------------------------------------------------------------
import {
  buildStakes,
  buildProgress,
  buildSecondaryActions,
} from "../priority-builders";

// ---------------------------------------------------------------------------
// Priority service
// ---------------------------------------------------------------------------
import {
  rankHomePriorityCandidates,
  pickHomePrimaryPriority,
} from "../priority-service";

// ---------------------------------------------------------------------------
// Tomorrow preview
// ---------------------------------------------------------------------------
import {
  buildStreakMilestoneCandidate,
  buildBossCandidate,
  buildRivalCandidate,
} from "../tomorrow-preview-candidates";

import { computeTomorrowPreview } from "../tomorrow-preview-compute";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
import {
  HomeActionIntentSchema,
  HomeHighlightSchema,
  HomeReturnReasonStateSchema,
  HomeCardSchema,
  HomeSpineModelSchema,
} from "../schemas";

import {
  HomePriorityTypeSchema,
  HomePriorityCTAActionSchema,
  HomePrimaryPrioritySchema,
  HomeStakesSchema,
  HomeProgressSchema,
  HomePrioritySchema,
} from "../priority-core-schemas";

import {
  TomorrowPreviewTypeSchema,
  TomorrowPreviewDataSchema,
} from "../tomorrow-preview-schemas";

import type { HomeContextSnapshot, HomePrimaryPriority } from "../priority-schemas";
import type { HomeReturnReasonState } from "../schemas";

// ---------------------------------------------------------------------------
// Mock the storage module used by computeTomorrowPreview → saveTomorrowPreview
// ---------------------------------------------------------------------------
jest.mock("../../../store/mmkv-storage", () => ({
  storage: {
    set: jest.fn(),
    getString: jest.fn(() => null),
    delete: jest.fn(),
  },
}));

jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

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

function makeReturnReason(
  overrides: Partial<HomeReturnReasonState> = {},
): HomeReturnReasonState {
  return {
    eyebrow: "Return reason",
    title: "Start focus",
    body: "Description",
    ctaLabel: "Start",
    intent: "start-session",
    source: "next-best-action",
    tone: "default",
    ...overrides,
  };
}

const nextBestAction = {
  title: "Start the next focus block",
  description: "One clean session today.",
  ctaLabel: "Start focus session",
};

// ---------------------------------------------------------------------------
// service.ts tests
// ---------------------------------------------------------------------------
describe("home-spine: service", () => {
  describe("buildHomeReturnReasonState", () => {
    it("prioritises primary recommendation when available", () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: null,
        canShowExpansionSystems: true,
        comebackMessage: null,
        nextBestAction,
        primaryRecommendation: {
          id: "rec-1",
          reasoning: "Best time to focus.",
          suggestedDifficulty: "NORMAL",
          suggestedDuration: 1500,
          type: "OPTIMAL_TIME",
        },
      });
      expect(result.source).toBe("coach");
      expect(result.intent).toBe("accept-coach-recommendation");
      expect(result.title).toBeTruthy();
    });

    it("falls back to comeback message when no recommendation", () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: null,
        canShowExpansionSystems: true,
        comebackMessage: "Welcome back!",
        nextBestAction,
        primaryRecommendation: null,
      });
      expect(result.source).toBe("comeback");
      expect(result.tone).toBe("warning");
    });

    it("falls back to study plan when no recommendation or comeback", () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: {
          completedTasks: 2,
          remainingMinutes: 30,
          title: "Week 1 Plan",
          totalTasks: 5,
        },
        canShowExpansionSystems: true,
        comebackMessage: null,
        nextBestAction,
        primaryRecommendation: null,
      });
      expect(result.source).toBe("study-plan");
      expect(result.intent).toBe("continue-study-plan");
    });

    it("skips study plan when canShowExpansionSystems is false", () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: {
          completedTasks: 2,
          remainingMinutes: 30,
          title: "Plan",
          totalTasks: 5,
        },
        canShowExpansionSystems: false,
        comebackMessage: null,
        nextBestAction,
        primaryRecommendation: null,
      });
      expect(result.source).toBe("next-best-action");
    });

    it("falls back to nextBestAction when nothing else matches", () => {
      const result = buildHomeReturnReasonState({
        activeStudyPlan: null,
        canShowExpansionSystems: true,
        comebackMessage: null,
        nextBestAction,
        primaryRecommendation: null,
      });
      expect(result.source).toBe("next-best-action");
      expect(result.title).toBe(nextBestAction.title);
    });
  });

  describe("buildHomeSpineModel", () => {
    it("returns a valid HomeSpineModel with all required fields", () => {
      const model = buildHomeSpineModel({
        currentStreak: 5,
        homeHighlight: null,
        isAtRisk: false,
        isFirstRun: false,
        level: 3,
        progressPercent: 45,
        progressXp: 1200,
        returnReason: makeReturnReason(),
        todayFocusMinutes: 30,
      });
      expect(model.primaryAction).toBeDefined();
      expect(model.progressSignal).toBeDefined();
      expect(model.returnReason).toBeDefined();
    });

    it("incorporates homeHighlight into returnReason", () => {
      const model = buildHomeSpineModel({
        currentStreak: 5,
        homeHighlight: {
          title: "Session complete!",
          message: "Great work today.",
          tone: "celebration",
        },
        isAtRisk: false,
        isFirstRun: false,
        level: 3,
        progressPercent: 50,
        progressXp: 1000,
        returnReason: makeReturnReason(),
        todayFocusMinutes: 25,
      });
      expect(model.returnReason.source).toBe("completion-highlight");
      expect(model.returnReason.title).toBe("Session complete!");
    });
  });
});

// ---------------------------------------------------------------------------
// copy.ts tests
// ---------------------------------------------------------------------------
describe("home-spine: copy", () => {
  describe("buildDisplayedReturnReason", () => {
    it("returns returnReason unchanged when homeHighlight is null", () => {
      const rr = makeReturnReason();
      const result = buildDisplayedReturnReason(null, rr);
      expect(result).toEqual(rr);
    });

    it("overrides title, body, tone, source when homeHighlight is present", () => {
      const result = buildDisplayedReturnReason(
        {
          title: "Victory!",
          message: "You crushed it.",
          tone: "celebration",
        },
        makeReturnReason(),
      );
      expect(result.title).toBe("Victory!");
      expect(result.body).toBe("You crushed it.");
      expect(result.tone).toBe("celebration");
      expect(result.source).toBe("completion-highlight");
    });
  });

  describe("buildPrimaryAction", () => {
    it("returns first-run copy when isFirstRun", () => {
      const result = buildPrimaryAction({
        currentStreak: 0,
        isAtRisk: false,
        isFirstRun: true,
      });
      expect(result.title).toContain("first");
      expect(result.ctaLabel).toContain("first");
    });

    it("returns at-risk copy when isAtRisk", () => {
      const result = buildPrimaryAction({
        currentStreak: 3,
        isAtRisk: true,
        isFirstRun: false,
      });
      expect(result.title).toContain("streak");
      expect(result.ctaLabel).toContain("Protect");
    });

    it("returns streak-positive copy when streak > 0", () => {
      const result = buildPrimaryAction({
        currentStreak: 5,
        isAtRisk: false,
        isFirstRun: false,
      });
      expect(result.body).toContain("Keep the loop easy");
    });

    it("returns zero-streak copy when streak is 0", () => {
      const result = buildPrimaryAction({
        currentStreak: 0,
        isAtRisk: false,
        isFirstRun: false,
      });
      expect(result.body).toContain("clean default");
    });
  });

  describe("buildProgressSignal", () => {
    it("returns first-run signal when isFirstRun", () => {
      const result = buildProgressSignal({
        isAtRisk: false,
        isFirstRun: true,
        level: 1,
        progressPercent: 0,
        progressXp: 0,
        todayFocusMinutes: 0,
      });
      expect(result.title).toContain("unlocks after session one");
    });

    it("returns 'already banked' when daily anchor reached", () => {
      const result = buildProgressSignal({
        isAtRisk: false,
        isFirstRun: false,
        level: 5,
        progressPercent: 100,
        progressXp: 2000,
        todayFocusMinutes: 120,
      });
      expect(result.title).toContain("already has a real focus win");
    });

    it("returns partial-progress signal when some focus done", () => {
      const result = buildProgressSignal({
        isAtRisk: false,
        isFirstRun: false,
        level: 3,
        progressPercent: 50,
        progressXp: 1000,
        todayFocusMinutes: 45,
      });
      expect(result.title).toContain("banked");
      expect(result.body).toContain("remain");
    });

    it("returns at-risk signal when no focus and at-risk", () => {
      const result = buildProgressSignal({
        isAtRisk: true,
        isFirstRun: false,
        level: 2,
        progressPercent: 0,
        progressXp: 500,
        todayFocusMinutes: 0,
      });
      expect(result.title).toContain("streak");
    });

    it("returns default anchor signal when no focus and not at-risk", () => {
      const result = buildProgressSignal({
        isAtRisk: false,
        isFirstRun: false,
        level: 1,
        progressPercent: 0,
        progressXp: 0,
        todayFocusMinutes: 0,
      });
      expect(result.title).toContain("anchor");
    });
  });

  describe("recommendationTitleMap", () => {
    it("has an entry for every recommendation type", () => {
      const types = [
        "OPTIMAL_TIME",
        "STREAK_PROTECTION",
        "COMEBACK_BUILDER",
        "DIFFICULTY_ADJUST",
        "CHALLENGE_SYNC",
        "BOSS_PREP",
        "HABIT_BUILDER",
        "ENERGY_BASED",
      ];
      for (const t of types) {
        expect(recommendationTitleMap[t as keyof typeof recommendationTitleMap]).toBeTruthy();
      }
    });
  });
});

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

// ---------------------------------------------------------------------------
// priority-service tests
// ---------------------------------------------------------------------------
describe("home-spine: priority-service", () => {
  describe("rankHomePriorityCandidates", () => {
    it("returns at least DEFAULT_SESSION when no conditions match", () => {
      const snap = makeSnapshot();
      const ranked = rankHomePriorityCandidates(snap);
      expect(ranked.length).toBeGreaterThanOrEqual(1);
      expect(ranked.some((p) => p.type === "DEFAULT_SESSION")).toBe(true);
    });

    it("places STREAK_CRITICAL before DEFAULT_SESSION", () => {
      const snap = makeSnapshot({
        streak: { currentDays: 10, isAtRisk: true, hoursRemaining: 1, isComeback: false },
      });
      const ranked = rankHomePriorityCandidates(snap);
      const critIdx = ranked.findIndex((p) => p.type === "STREAK_CRITICAL");
      const defIdx = ranked.findIndex((p) => p.type === "DEFAULT_SESSION");
      expect(critIdx).toBeGreaterThanOrEqual(0);
      expect(defIdx).toBeGreaterThanOrEqual(0);
      expect(critIdx).toBeLessThan(defIdx);
    });
  });

  describe("pickHomePrimaryPriority", () => {
    it("returns the highest-priority candidate", () => {
      const snap = makeSnapshot({
        streak: { currentDays: 10, isAtRisk: true, hoursRemaining: 1, isComeback: false },
      });
      const picked = pickHomePrimaryPriority(snap);
      expect(picked.type).toBe("STREAK_CRITICAL");
    });

    it("returns DEFAULT_SESSION for a clean new-user snapshot", () => {
      const snap = makeSnapshot();
      const picked = pickHomePrimaryPriority(snap);
      expect(picked.type).toBe("DEFAULT_SESSION");
    });
  });
});

// ---------------------------------------------------------------------------
// tomorrow-preview-candidates tests
// ---------------------------------------------------------------------------
describe("home-spine: tomorrow-preview-candidates", () => {
  const baseInput = {
    userId,
    currentStreakDays: 5,
    streakWillContinue: true,
  };

  describe("buildStreakMilestoneCandidate", () => {
    it("returns null when streak will not continue", () => {
      const result = buildStreakMilestoneCandidate({
        ...baseInput,
        streakWillContinue: false,
      });
      expect(result).toBeNull();
    });

    it("returns null when tomorrow is not a milestone day", () => {
      // 5 + 1 = 6, not a milestone
      const result = buildStreakMilestoneCandidate({
        ...baseInput,
        currentStreakDays: 5,
      });
      expect(result).toBeNull();
    });

    it("returns a milestone candidate when tomorrow is day 7", () => {
      const result = buildStreakMilestoneCandidate({
        ...baseInput,
        currentStreakDays: 6,
      });
      expect(result).not.toBeNull();
      expect(result!.type).toBe("STREAK_MILESTONE");
      expect(result!.headline).toContain("7");
      expect(result!.priority).toBe(1);
    });

    it("returns milestone for day 30", () => {
      const result = buildStreakMilestoneCandidate({
        ...baseInput,
        currentStreakDays: 29,
      });
      expect(result).not.toBeNull();
      expect(result!.headline).toContain("30");
      expect(result!.metadata).toHaveProperty("badgeName", "Dragon");
    });
  });

  describe("buildBossCandidate", () => {
    it("returns null when no boss data", () => {
      expect(buildBossCandidate(baseInput)).toBeNull();
    });

    it("returns null when health >= 25%", () => {
      const result = buildBossCandidate({
        ...baseInput,
        bossData: { bossName: "Boss", healthPercent: 50, canDefeatTomorrow: false },
      });
      expect(result).toBeNull();
    });

    it("returns BOSS_NEAR_DEATH when health < 25%", () => {
      const result = buildBossCandidate({
        ...baseInput,
        bossData: { bossName: "Drake", healthPercent: 15, canDefeatTomorrow: true },
      });
      expect(result).not.toBeNull();
      expect(result!.type).toBe("BOSS_NEAR_DEATH");
      expect(result!.headline).toContain("Drake");
      expect(result!.priority).toBe(2);
    });

    it("uses different copy when canDefeatTomorrow is false", () => {
      const result = buildBossCandidate({
        ...baseInput,
        bossData: { bossName: "Drake", healthPercent: 10, canDefeatTomorrow: false },
      });
      expect(result!.headline).toContain("Almost Defeated");
    });
  });

  describe("buildRivalCandidate", () => {
    it("returns null when no rival data", () => {
      expect(buildRivalCandidate(baseInput)).toBeNull();
    });

    it("returns null when gapMinutes <= 0", () => {
      const result = buildRivalCandidate({
        ...baseInput,
        rivalData: { rivalName: "Alex", myMinutes: 100, theirMinutes: 80, gapMinutes: 0 },
      });
      expect(result).toBeNull();
    });

    it("returns RIVAL_GAP when there is a gap", () => {
      const result = buildRivalCandidate({
        ...baseInput,
        rivalData: { rivalName: "Alex", myMinutes: 50, theirMinutes: 80, gapMinutes: 30 },
      });
      expect(result).not.toBeNull();
      expect(result!.type).toBe("RIVAL_GAP");
      expect(result!.priority).toBe(3);
    });

    it("shows overtake headline when myMinutes + min(gap,30) exceeds theirs", () => {
      // willOvertake: myMinutes + Math.min(gapMinutes, 30) > theirMinutes
      // 70 + min(20, 30) = 90 > 80 → true
      const result = buildRivalCandidate({
        ...baseInput,
        rivalData: { rivalName: "Alex", myMinutes: 70, theirMinutes: 80, gapMinutes: 20 },
      });
      expect(result!.headline).toContain("Overtake");
    });
  });
});

// ---------------------------------------------------------------------------
// tomorrow-preview-compute tests
// ---------------------------------------------------------------------------
describe("home-spine: tomorrow-preview-compute", () => {
  const baseInput = {
    userId,
    currentStreakDays: 5,
    streakWillContinue: true,
  };

  it("returns GENERIC fallback when no candidates match", () => {
    const result = computeTomorrowPreview(baseInput);
    expect(result.type).toBe("GENERIC");
    expect(result.headline).toBeTruthy();
  });

  it("returns GENERIC with streak copy when streakWillContinue is true", () => {
    const result = computeTomorrowPreview({
      ...baseInput,
      streakWillContinue: true,
    });
    expect(result.headline).toContain("Streak");
  });

  it("returns GENERIC with fresh-start copy when streakWillContinue is false", () => {
    const result = computeTomorrowPreview({
      ...baseInput,
      streakWillContinue: false,
    });
    expect(result.headline).toContain("New Day");
  });

  it("picks highest-priority (lowest number) candidate", () => {
    const result = computeTomorrowPreview({
      ...baseInput,
      currentStreakDays: 6, // tomorrow = day 7, milestone
      bossData: { bossName: "Drake", healthPercent: 10, canDefeatTomorrow: true },
    });
    // STREAK_MILESTONE has priority 1, BOSS_NEAR_DEATH has priority 2
    expect(result.type).toBe("STREAK_MILESTONE");
  });

  it("picks boss when no milestone but boss is near death", () => {
    const result = computeTomorrowPreview({
      ...baseInput,
      currentStreakDays: 3, // tomorrow = day 4, not a milestone
      bossData: { bossName: "Drake", healthPercent: 10, canDefeatTomorrow: false },
    });
    expect(result.type).toBe("BOSS_NEAR_DEATH");
  });
});

// ---------------------------------------------------------------------------
// Schema validation tests
// ---------------------------------------------------------------------------
describe("home-spine: schemas", () => {
  describe("HomeActionIntentSchema", () => {
    it("validates all known intents", () => {
      expect(HomeActionIntentSchema.safeParse("start-session").success).toBe(true);
      expect(HomeActionIntentSchema.safeParse("accept-coach-recommendation").success).toBe(true);
      expect(HomeActionIntentSchema.safeParse("continue-study-plan").success).toBe(true);
      expect(HomeActionIntentSchema.safeParse("invalid-intent").success).toBe(false);
    });
  });

  describe("HomeHighlightSchema", () => {
    it("validates a complete highlight", () => {
      const result = HomeHighlightSchema.safeParse({
        title: "Great job",
        message: "You did it",
        tone: "celebration",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty title", () => {
      const result = HomeHighlightSchema.safeParse({
        title: "",
        message: "msg",
        tone: "info",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid tone", () => {
      const result = HomeHighlightSchema.safeParse({
        title: "t",
        message: "m",
        tone: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("HomeReturnReasonStateSchema", () => {
    it("validates a complete return reason", () => {
      const result = HomeReturnReasonStateSchema.safeParse({
        eyebrow: "Return reason",
        title: "Focus",
        body: "Do it",
        ctaLabel: "Start",
        intent: "start-session",
        source: "next-best-action",
        tone: "default",
      });
      expect(result.success).toBe(true);
    });

    it("validates with optional fields", () => {
      const result = HomeReturnReasonStateSchema.safeParse({
        eyebrow: "Return reason",
        title: "Focus",
        body: "Do it",
        ctaLabel: "Start",
        intent: "start-session",
        source: "coach",
        tone: "default",
        recommendationId: "rec-1",
        suggestedDifficulty: "NORMAL",
        suggestedDurationSeconds: 1500,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("HomeCardSchema", () => {
    it("validates a complete card", () => {
      const result = HomeCardSchema.safeParse({
        eyebrow: "Primary",
        title: "Start",
        body: "Do it now",
        ctaLabel: "Go",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("HomeSpineModelSchema", () => {
    it("validates a complete model", () => {
      const card = { eyebrow: "e", title: "t", body: "b", ctaLabel: "c" };
      const result = HomeSpineModelSchema.safeParse({
        primaryAction: card,
        progressSignal: card,
        returnReason: {
          eyebrow: "Return reason",
          title: "Focus",
          body: "Do it",
          ctaLabel: "Start",
          intent: "start-session",
          source: "next-best-action",
          tone: "default",
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Priority schemas", () => {
    it("HomePriorityTypeSchema validates all priority types", () => {
      const types = [
        "STREAK_CRITICAL",
        "COMPANION_PROMISE",
        "PROMISE_RECOVERY",
        "STREAK_AT_RISK",
        "RECOMMENDED_SESSION",
        "CHALLENGE_NEAR_DONE",
        "BOSS_ACTIVE",
        "DEFAULT_SESSION",
      ];
      for (const t of types) {
        expect(HomePriorityTypeSchema.safeParse(t).success).toBe(true);
      }
      expect(HomePriorityTypeSchema.safeParse("INVALID").success).toBe(false);
    });

    it("HomePriorityCTAActionSchema validates all actions", () => {
      expect(HomePriorityCTAActionSchema.safeParse("OPEN_BOSS").success).toBe(true);
      expect(HomePriorityCTAActionSchema.safeParse("OPEN_CHALLENGES").success).toBe(true);
      expect(HomePriorityCTAActionSchema.safeParse("OPEN_SESSION_SETUP").success).toBe(true);
    });

    it("HomePrimaryPrioritySchema validates a complete priority", () => {
      const result = HomePrimaryPrioritySchema.safeParse({
        type: "STREAK_CRITICAL",
        urgency: 100,
        reason: "test",
        cta: { action: "OPEN_SESSION_SETUP", text: "Save" },
      });
      expect(result.success).toBe(true);
    });

    it("HomeProgressSchema validates correctly", () => {
      const result = HomeProgressSchema.safeParse({
        dailyGoalMinutes: 60,
        streakDays: 5,
        todayMinutes: 30,
      });
      expect(result.success).toBe(true);
    });

    it("HomeStakesSchema validates correctly", () => {
      const result = HomeStakesSchema.safeParse({
        what: "Focus session",
        potentialGain: "XP",
      });
      expect(result.success).toBe(true);
    });

    it("HomePrioritySchema validates a full priority object", () => {
      const result = HomePrioritySchema.safeParse({
        primary: {
          type: "DEFAULT_SESSION",
          urgency: 10,
          reason: "test",
          cta: { action: "OPEN_SESSION_SETUP", text: "Start" },
        },
        progress: { dailyGoalMinutes: 60, streakDays: 0, todayMinutes: 0 },
        secondary: [],
        stakes: { what: "Focus" },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Tomorrow preview schemas", () => {
    it("TomorrowPreviewTypeSchema validates all types", () => {
      const types = [
        "STREAK_MILESTONE",
        "BOSS_NEAR_DEATH",
        "RIVAL_GAP",
        "POWER_HOUR",
        "CHALLENGE_RESET",
        "GENERIC",
      ];
      for (const t of types) {
        expect(TomorrowPreviewTypeSchema.safeParse(t).success).toBe(true);
      }
    });

    it("TomorrowPreviewDataSchema validates a complete preview", () => {
      const result = TomorrowPreviewDataSchema.safeParse({
        type: "GENERIC",
        emoji: "✨",
        headline: "New Day",
        subtext: "Fresh start",
        priority: 6,
      });
      expect(result.success).toBe(true);
    });

    it("TomorrowPreviewDataSchema rejects empty headline", () => {
      const result = TomorrowPreviewDataSchema.safeParse({
        type: "GENERIC",
        emoji: "✨",
        headline: "",
        subtext: "text",
        priority: 6,
      });
      expect(result.success).toBe(false);
    });
  });
});
