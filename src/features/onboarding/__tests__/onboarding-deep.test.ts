/**
 * Deep Onboarding Tests
 * Covers: ProgressiveOnboarding state machine, onboarding-progress,
 * onboarding-gates, store-helpers edge cases, constants, repository class.
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));
jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));
jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
}));
jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));
jest.mock("react-native-mmkv", () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(() => null),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn(() => false),
    getNumber: jest.fn(() => undefined),
  })),
}));
jest.mock("../../../store", () => ({
  useAuthStore: { getState: jest.fn(() => ({ user: null })) },
}));
jest.mock("../../lane-engine/schemas", () => {
  const { z } = require("zod");
  const LaneSchema = z.string().nullable().optional();
  return { LaneSchema };
});

// ── Imports ────────────────────────────────────────────────────────────────

import {
  initializeOnboarding,
  getOnboardingState,
  advanceStep,
  skipToFirstSession,
  recordSession,
} from "../onboarding-state";

import {
  markFeatureIntroduced,
  getStepContent,
  getOnboardingProgress,
  shouldShowOnboarding,
  isFeatureAvailable,
  getAvailableFeatures,
  getNextFeatureUnlock,
} from "../onboarding-progress";

import {
  FEATURE_UNLOCK_GATES,
  STEP_CONTENT,
  STEP_ORDER,
} from "../onboarding-gates";

import {
  deriveMotivationProfile,
  isCompletionValidForUser,
  mergeOnboardingCompletion,
} from "../store-helpers";

import { ONBOARDING_GOALS } from "../constants";
import type { OnboardingState } from "../onboarding-types";

// ── Helpers ────────────────────────────────────────────────────────────────

function freshState(userId: string): OnboardingState {
  return initializeOnboarding(userId);
}

// ============================================================================
// onboarding-gates
// ============================================================================

describe("onboarding-gates", () => {
  describe("STEP_ORDER", () => {
    it("contains 7 steps in correct order", () => {
      expect(STEP_ORDER).toHaveLength(7);
      expect(STEP_ORDER[0]).toBe("WELCOME");
      expect(STEP_ORDER[1]).toBe("QUICK_START");
      expect(STEP_ORDER[2]).toBe("FIRST_SESSION");
      expect(STEP_ORDER[3]).toBe("POST_SESSION");
      expect(STEP_ORDER[4]).toBe("HOME_INTRO");
      expect(STEP_ORDER[5]).toBe("FEATURE_UNLOCK");
      expect(STEP_ORDER[6]).toBe("COMPLETE");
    });
  });

  describe("FEATURE_UNLOCK_GATES", () => {
    it("has 6 unlock gates", () => {
      expect(FEATURE_UNLOCK_GATES).toHaveLength(6);
    });

    it("each gate has required fields", () => {
      for (const gate of FEATURE_UNLOCK_GATES) {
        expect(gate.featureId).toBeTruthy();
        expect(gate.featureName).toBeTruthy();
        expect(gate.description).toBeTruthy();
        expect(gate.requiresSessions).toBeGreaterThan(0);
        expect(gate.icon).toBeTruthy();
      }
    });

    it("gates are ordered by increasing session requirement", () => {
      for (let i = 1; i < FEATURE_UNLOCK_GATES.length; i++) {
        expect(FEATURE_UNLOCK_GATES[i]!.requiresSessions).toBeGreaterThanOrEqual(
          FEATURE_UNLOCK_GATES[i - 1]!.requiresSessions,
        );
      }
    });

    it("clean_today_strip unlocks at 2 sessions", () => {
      const gate = FEATURE_UNLOCK_GATES.find(
        (g) => g.featureId === "clean_today_strip",
      );
      expect(gate).toBeDefined();
      expect(gate!.requiresSessions).toBe(2);
    });

    it("coach_evolution unlocks at 8 sessions", () => {
      const gate = FEATURE_UNLOCK_GATES.find(
        (g) => g.featureId === "coach_evolution",
      );
      expect(gate).toBeDefined();
      expect(gate!.requiresSessions).toBe(8);
    });
  });

  describe("STEP_CONTENT", () => {
    it("has content for every step in STEP_ORDER", () => {
      for (const step of STEP_ORDER) {
        expect(STEP_CONTENT[step]).toBeDefined();
        expect(STEP_CONTENT[step].title).toBeTruthy();
        expect(STEP_CONTENT[step].content).toBeTruthy();
        expect(STEP_CONTENT[step].primaryAction).toBeTruthy();
      }
    });

    it("WELCOME shows skip option", () => {
      expect(STEP_CONTENT.WELCOME.showSkip).toBe(true);
    });

    it("FIRST_SESSION does not show skip", () => {
      expect(STEP_CONTENT.FIRST_SESSION.showSkip).toBe(false);
    });

    it("each step content references its own step", () => {
      for (const step of STEP_ORDER) {
        expect(STEP_CONTENT[step].step).toBe(step);
      }
    });
  });
});

// ============================================================================
// onboarding-state (ProgressiveOnboarding)
// ============================================================================

describe("ProgressiveOnboarding state machine", () => {
  describe("initializeOnboarding", () => {
    it("creates state at WELCOME step with 0 sessions", () => {
      const state = freshState("user-1");
      expect(state.currentStep).toBe("WELCOME");
      expect(state.sessionsCompleted).toBe(0);
      expect(state.firstSessionAt).toBeNull();
      expect(state.completedAt).toBeNull();
      expect(state.skippedCustomization).toBe(false);
      expect(state.unlockedFeatures).toHaveLength(0);
    });

    it("sets userId correctly", () => {
      const state = freshState("user-abc");
      expect(state.userId).toBe("user-abc");
    });

    it("sets first feature unlock gate as nextFeatureUnlock", () => {
      const state = freshState("user-2");
      expect(state.nextFeatureUnlock).not.toBeNull();
      expect(state.nextFeatureUnlock!.featureId).toBe(
        FEATURE_UNLOCK_GATES[0]!.featureId,
      );
    });
  });

  describe("getOnboardingState", () => {
    it("returns null for unknown user", () => {
      expect(getOnboardingState("unknown-user")).toBeNull();
    });

    it("returns state for initialized user", () => {
      freshState("user-get");
      const state = getOnboardingState("user-get");
      expect(state).not.toBeNull();
      expect(state!.currentStep).toBe("WELCOME");
    });
  });

  describe("advanceStep", () => {
    it("advances from WELCOME to QUICK_START", () => {
      freshState("user-adv");
      const result = advanceStep("user-adv");
      expect(result!.currentStep).toBe("QUICK_START");
    });

    it("advances through all steps to COMPLETE", () => {
      freshState("user-full");
      for (let i = 0; i < STEP_ORDER.length - 1; i++) {
        advanceStep("user-full");
      }
      const state = getOnboardingState("user-full");
      expect(state!.currentStep).toBe("COMPLETE");
      expect(state!.completedAt).not.toBeNull();
    });

    it("returns null for unknown user", () => {
      expect(advanceStep("no-such-user")).toBeNull();
    });

    it("does not advance past COMPLETE", () => {
      freshState("user-end");
      for (let i = 0; i < STEP_ORDER.length + 3; i++) {
        advanceStep("user-end");
      }
      const state = getOnboardingState("user-end");
      expect(state!.currentStep).toBe("COMPLETE");
    });
  });

  describe("skipToFirstSession", () => {
    it("sets step to FIRST_SESSION and marks customization skipped", () => {
      freshState("user-skip");
      const result = skipToFirstSession("user-skip");
      expect(result!.currentStep).toBe("FIRST_SESSION");
      expect(result!.skippedCustomization).toBe(true);
    });

    it("returns null for unknown user", () => {
      expect(skipToFirstSession("no-such")).toBeNull();
    });
  });

  describe("recordSession", () => {
    it("increments session count", () => {
      freshState("user-sess");
      const result = recordSession("user-sess", 15);
      expect(result!.sessionsCompleted).toBe(1);
    });

    it("sets firstSessionAt on first session", () => {
      freshState("user-first");
      recordSession("user-first", 25);
      const state = getOnboardingState("user-first");
      expect(state!.firstSessionAt).not.toBeNull();
      expect(state!.currentStep).toBe("POST_SESSION");
    });

    it("does not overwrite firstSessionAt on subsequent sessions", () => {
      freshState("user-mult");
      recordSession("user-mult", 15);
      const first = getOnboardingState("user-mult")!.firstSessionAt;
      recordSession("user-mult", 25);
      const second = getOnboardingState("user-mult")!.firstSessionAt;
      expect(first).toBe(second);
    });

    it("unlocks features when session threshold met", () => {
      freshState("user-unlk");
      // clean_today_strip requires 2 sessions
      recordSession("user-unlk", 15);
      let state = getOnboardingState("user-unlk")!;
      expect(state.unlockedFeatures).toHaveLength(0);

      recordSession("user-unlk", 15);
      state = getOnboardingState("user-unlk")!;
      expect(state.unlockedFeatures.some((f) => f.featureId === "clean_today_strip")).toBe(true);
    });

    it("returns null for unknown user", () => {
      expect(recordSession("no-such", 15)).toBeNull();
    });

    it("sets nextFeatureUnlock after unlocking a feature", () => {
      freshState("user-nfu");
      // Unlock 2-session feature
      recordSession("user-nfu", 15);
      recordSession("user-nfu", 15);
      const state = getOnboardingState("user-nfu")!;
      expect(state.nextFeatureUnlock).not.toBeNull();
      expect(state.nextFeatureUnlock!.featureId).not.toBe("clean_today_strip");
    });
  });
});

// ============================================================================
// onboarding-progress
// ============================================================================

describe("onboarding-progress", () => {
  describe("markFeatureIntroduced", () => {
    it("marks a feature as introduced", () => {
      freshState("user-mfi");
      recordSession("user-mfi", 15);
      recordSession("user-mfi", 15);
      markFeatureIntroduced("user-mfi", "clean_today_strip");
      const state = getOnboardingState("user-mfi")!;
      const feature = state.unlockedFeatures.find(
        (f) => f.featureId === "clean_today_strip",
      );
      expect(feature!.introduced).toBe(true);
    });

    it("does nothing for unknown user", () => {
      expect(() =>
        markFeatureIntroduced("nobody", "clean_today_strip"),
      ).not.toThrow();
    });

    it("does nothing for unknown feature", () => {
      freshState("user-mfi2");
      markFeatureIntroduced("user-mfi2", "nonexistent");
      const state = getOnboardingState("user-mfi2")!;
      expect(state.unlockedFeatures).toHaveLength(0);
    });
  });

  describe("getStepContent", () => {
    it("returns default content for WELCOME step", () => {
      const state = freshState("user-gsc");
      const content = getStepContent(state);
      expect(content.step).toBe("WELCOME");
      expect(content.title).toBe("Welcome to VEX");
    });

    it("returns customized content for FEATURE_UNLOCK with unlocked features", () => {
      freshState("user-fuc");
      recordSession("user-fuc", 15);
      recordSession("user-fuc", 15);
      // After recordSession, we're at POST_SESSION (step 3).
      // Need to advance to FEATURE_UNLOCK (step 5): 2 advances.
      advanceStep("user-fuc"); // HOME_INTRO
      advanceStep("user-fuc"); // FEATURE_UNLOCK
      const state = getOnboardingState("user-fuc")!;
      expect(state.currentStep).toBe("FEATURE_UNLOCK");
      expect(state.unlockedFeatures.length).toBeGreaterThan(0);
      const content = getStepContent(state);
      expect(content.title).toContain("Unlocked");
    });
  });

  describe("getOnboardingProgress", () => {
    it("returns null for unknown user", () => {
      expect(getOnboardingProgress("nobody")).toBeNull();
    });

    it("returns correct progress for initial state", () => {
      freshState("user-prog");
      const progress = getOnboardingProgress("user-prog");
      expect(progress).not.toBeNull();
      expect(progress!.stepNumber).toBe(1);
      expect(progress!.totalSteps).toBe(STEP_ORDER.length);
      expect(progress!.currentStep).toBe("WELCOME");
    });

    it("calculates percent complete correctly", () => {
      freshState("user-pct");
      advanceStep("user-pct");
      const progress = getOnboardingProgress("user-pct");
      expect(progress!.stepNumber).toBe(2);
      expect(progress!.percentComplete).toBe(
        Math.round((2 / STEP_ORDER.length) * 100),
      );
    });

    it("includes sessionsToNextFeature when applicable", () => {
      freshState("user-stnf");
      const progress = getOnboardingProgress("user-stnf");
      expect(progress!.sessionsToNextFeature).toBe(
        FEATURE_UNLOCK_GATES[0]!.requiresSessions,
      );
    });
  });

  describe("shouldShowOnboarding", () => {
    it("returns true for new user", () => {
      expect(shouldShowOnboarding("new-user")).toBe(true);
    });

    it("returns false after completion", () => {
      freshState("user-done");
      // Advance to COMPLETE
      for (let i = 0; i < STEP_ORDER.length - 1; i++) {
        advanceStep("user-done");
      }
      expect(shouldShowOnboarding("user-done")).toBe(false);
    });

    it("returns true when unintroduced features exist", () => {
      freshState("user-unintro");
      recordSession("user-unintro", 15);
      recordSession("user-unintro", 15);
      expect(shouldShowOnboarding("user-unintro")).toBe(true);
    });
  });

  describe("isFeatureAvailable", () => {
    it("returns false for unknown user with no default", () => {
      expect(isFeatureAvailable("nobody", "clean_today_strip")).toBe(false);
    });

    it("returns default for unknown user when specified", () => {
      expect(isFeatureAvailable("nobody", "x", true)).toBe(true);
    });

    it("returns true for unlocked feature", () => {
      freshState("user-ifa");
      recordSession("user-ifa", 15);
      recordSession("user-ifa", 15);
      expect(
        isFeatureAvailable("user-ifa", "clean_today_strip"),
      ).toBe(true);
    });

    it("returns false for not-yet-unlocked feature", () => {
      freshState("user-ifa2");
      expect(
        isFeatureAvailable("user-ifa2", "coach_evolution"),
      ).toBe(false);
    });
  });

  describe("getAvailableFeatures", () => {
    it("returns empty array for unknown user", () => {
      expect(getAvailableFeatures("nobody")).toEqual([]);
    });

    it("returns unlocked features", () => {
      freshState("user-gaf");
      recordSession("user-gaf", 15);
      recordSession("user-gaf", 15);
      const features = getAvailableFeatures("user-gaf");
      expect(features.length).toBeGreaterThan(0);
    });
  });

  describe("getNextFeatureUnlock", () => {
    it("returns first gate for unknown user", () => {
      const next = getNextFeatureUnlock("nobody");
      expect(next).not.toBeNull();
      expect(next!.featureId).toBe(FEATURE_UNLOCK_GATES[0]!.featureId);
    });

    it("returns next gate after unlocking one", () => {
      freshState("user-gnfu");
      recordSession("user-gnfu", 15);
      recordSession("user-gnfu", 15);
      const next = getNextFeatureUnlock("user-gnfu");
      expect(next).not.toBeNull();
      expect(next!.featureId).not.toBe("clean_today_strip");
    });
  });
});

// ============================================================================
// constants
// ============================================================================

describe("ONBOARDING_GOALS", () => {
  it("has 4 goals", () => {
    expect(ONBOARDING_GOALS).toHaveLength(4);
  });

  it("each goal has id, label, description", () => {
    for (const goal of ONBOARDING_GOALS) {
      expect(goal.id).toBeTruthy();
      expect(goal.label).toBeTruthy();
      expect(goal.description).toBeTruthy();
    }
  });

  it("covers all FocusGoal types", () => {
    const ids = ONBOARDING_GOALS.map((g) => g.id);
    expect(ids).toContain("WORK");
    expect(ids).toContain("STUDY");
    expect(ids).toContain("CREATIVE");
    expect(ids).toContain("PERSONAL");
  });
});

// ============================================================================
// store-helpers extended
// ============================================================================

describe("store-helpers: deriveMotivationProfile", () => {
  it("returns explicit style when provided", () => {
    const profile = deriveMotivationProfile("WORK", "mentor", "FLAME", "intense");
    expect(profile.primary).toBe("intense");
    expect(profile.secondary).toEqual([]);
  });

  it("maps STUDY goal to study_focused primary", () => {
    const profile = deriveMotivationProfile("STUDY", null, null, null);
    expect(profile.primary).toBe("study_focused");
  });

  it("maps WORK goal to worker primary", () => {
    const profile = deriveMotivationProfile("WORK", null, null, null);
    expect(profile.primary).toBe("worker");
  });

  it("maps CREATIVE goal to creator primary", () => {
    const profile = deriveMotivationProfile("CREATIVE", null, null, null);
    expect(profile.primary).toBe("creator");
  });

  it("defaults to calm when no goal provided", () => {
    const profile = deriveMotivationProfile(null, null, null, null);
    expect(profile.primary).toBe("calm");
  });

  it("drill-sergeant persona adds intense to secondary", () => {
    const profile = deriveMotivationProfile("WORK", "drill-sergeant", null, null);
    expect(profile.secondary).toContain("intense");
  });

  it("cheerleader persona adds friendly to secondary", () => {
    const profile = deriveMotivationProfile("WORK", "cheerleader", null, null);
    expect(profile.secondary).toContain("friendly");
  });

  it("mentor persona adds coach_led to secondary", () => {
    const profile = deriveMotivationProfile("WORK", "mentor", null, null);
    expect(profile.secondary).toContain("coach_led");
  });

  it("FLAME element adds game_like and intense", () => {
    const profile = deriveMotivationProfile("WORK", null, "FLAME", null);
    expect(profile.secondary).toContain("game_like");
    expect(profile.secondary).toContain("intense");
  });

  it("WAVE element adds calm", () => {
    const profile = deriveMotivationProfile("WORK", null, "WAVE", null);
    expect(profile.secondary).toContain("calm");
  });

  it("TERRA element adds worker", () => {
    const profile = deriveMotivationProfile("WORK", null, "TERRA", null);
    expect(profile.secondary).toContain("worker");
  });

  it("ZEPHYR element adds friendly", () => {
    const profile = deriveMotivationProfile("WORK", null, "ZEPHYR", null);
    expect(profile.secondary).toContain("friendly");
  });

  it("VOID element adds intense and competitive", () => {
    const profile = deriveMotivationProfile("WORK", null, "VOID", null);
    expect(profile.secondary).toContain("intense");
    expect(profile.secondary).toContain("competitive");
  });

  it("LUMINA element adds study_focused", () => {
    const profile = deriveMotivationProfile("WORK", null, "LUMINA", null);
    expect(profile.secondary).toContain("study_focused");
  });

  it("null persona defaults to mentor", () => {
    const profile = deriveMotivationProfile("WORK", null, null, null);
    expect(profile.secondary).toContain("coach_led");
  });

  it("null element defaults to LUMINA", () => {
    const profile = deriveMotivationProfile("WORK", null, null, null);
    expect(profile.secondary).toContain("study_focused");
  });
});

describe("store-helpers: isCompletionValidForUser", () => {
  it("returns false when userId is null", () => {
    expect(
      isCompletionValidForUser(
        { isOnboarded: true, completedAt: Date.now(), completedForUserId: "u1" },
        null,
      ),
    ).toBe(false);
  });

  it("returns false when not onboarded", () => {
    expect(
      isCompletionValidForUser(
        { isOnboarded: false, completedAt: null, completedForUserId: null },
        "u1",
      ),
    ).toBe(false);
  });

  it("returns true when completion matches user", () => {
    expect(
      isCompletionValidForUser(
        { isOnboarded: true, completedAt: Date.now(), completedForUserId: "u1" },
        "u1",
      ),
    ).toBe(true);
  });

  it("returns false when completion is for different user", () => {
    expect(
      isCompletionValidForUser(
        { isOnboarded: true, completedAt: Date.now(), completedForUserId: "u1" },
        "u2",
      ),
    ).toBe(false);
  });
});

describe("store-helpers: mergeOnboardingCompletion", () => {
  it("sets completedForUserId to null when not onboarded", () => {
    const result = mergeOnboardingCompletion(false, null);
    expect(result.isOnboarded).toBe(false);
    expect(result.completedForUserId).toBeNull();
  });

  it("preserves isOnboarded and completedAt values", () => {
    const now = Date.now();
    const result = mergeOnboardingCompletion(true, now);
    expect(result.isOnboarded).toBe(true);
    expect(result.completedAt).toBe(now);
  });
});
