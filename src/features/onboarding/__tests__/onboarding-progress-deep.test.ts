/**
 * Deep Onboarding Tests — onboarding-progress
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
  recordSession,
} from "../onboarding-state";

import {
  markFeatureIntroduced,
  getStepContent,
  getOnboardingProgress,
  shouldShowOnboarding,
} from "../onboarding-progress";

import {
  FEATURE_UNLOCK_GATES,
  STEP_ORDER,
} from "../onboarding-gates";

import type { OnboardingState } from "../onboarding-types";
// ── Helpers ────────────────────────────────────────────────────────────────

function freshState(userId: string): OnboardingState {
  return initializeOnboarding(userId);
}

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
});
