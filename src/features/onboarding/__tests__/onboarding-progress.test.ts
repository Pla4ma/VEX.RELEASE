/**
 * Comprehensive Onboarding Feature Tests — Onboarding Progress
 */

import "./onboarding-mock-setup";

import {
  initializeOnboarding,
  getOnboardingState,
  advanceStep,
  recordSession,
} from "../onboarding-state";

import {
  getStepContent,
  getOnboardingProgress,
  shouldShowOnboarding,
  isFeatureAvailable,
  getAvailableFeatures,
  getNextFeatureUnlock,
} from "../onboarding-progress";

import {
  STEP_ORDER,
  FEATURE_UNLOCK_GATES,
} from "../onboarding-gates";

// ── Onboarding Progress ───────────────────────────────────────────────────────

describe("Onboarding Progress", () => {
  describe("getStepContent", () => {
    it("returns content for WELCOME step", () => {
      initializeOnboarding("progress-user-1");
      const state = getOnboardingState("progress-user-1")!;
      const content = getStepContent(state);
      expect(content.title).toBeDefined();
      expect(content.primaryAction).toBeDefined();
    });
  });

  describe("getOnboardingProgress", () => {
    it("returns null for unknown user", () => {
      expect(getOnboardingProgress("unknown")).toBeNull();
    });

    it("returns progress for known user", () => {
      initializeOnboarding("progress-user-2");
      const progress = getOnboardingProgress("progress-user-2");
      expect(progress).not.toBeNull();
      expect(progress!.totalSteps).toBe(STEP_ORDER.length);
      expect(progress!.percentComplete).toBeGreaterThan(0);
    });
  });

  describe("shouldShowOnboarding", () => {
    it("returns true for new user", () => {
      expect(shouldShowOnboarding("new-user")).toBe(true);
    });

    it("returns false for completed user", () => {
      initializeOnboarding("completed-user");
      for (let i = 0; i < 10; i++) advanceStep("completed-user");
      expect(shouldShowOnboarding("completed-user")).toBe(false);
    });
  });

  describe("isFeatureAvailable", () => {
    it("returns default for unknown user", () => {
      expect(isFeatureAvailable("unknown", "feature", true)).toBe(true);
      expect(isFeatureAvailable("unknown", "feature", false)).toBe(false);
    });

    it("returns false for locked feature", () => {
      initializeOnboarding("feature-user-1");
      expect(isFeatureAvailable("feature-user-1", "clean_today_strip")).toBe(
        false,
      );
    });

    it("returns true for unlocked feature", () => {
      initializeOnboarding("feature-user-2");
      recordSession("feature-user-2", 15);
      recordSession("feature-user-2", 15);
      expect(isFeatureAvailable("feature-user-2", "clean_today_strip")).toBe(
        true,
      );
    });
  });

  describe("getAvailableFeatures", () => {
    it("returns empty for unknown user", () => {
      expect(getAvailableFeatures("unknown")).toHaveLength(0);
    });

    it("returns features after sessions", () => {
      initializeOnboarding("avail-user");
      recordSession("avail-user", 15);
      recordSession("avail-user", 15);
      const features = getAvailableFeatures("avail-user");
      expect(features.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getNextFeatureUnlock", () => {
    it("returns first gate for unknown user", () => {
      const gate = getNextFeatureUnlock("unknown");
      expect(gate).not.toBeNull();
      expect(gate!.featureId).toBe(FEATURE_UNLOCK_GATES[0]!.featureId);
    });
  });
});
