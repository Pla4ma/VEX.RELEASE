/**
 * Comprehensive Onboarding Feature Tests — Onboarding State Machine
 */

import "./onboarding-mock-setup";

import {
  initializeOnboarding,
  getOnboardingState,
  advanceStep,
  skipToFirstSession,
  recordSession,
} from "../onboarding-state";

// ── Onboarding State Machine ──────────────────────────────────────────────────

describe("Onboarding State Machine", () => {
  beforeEach(() => {
    // Reset in-memory state by re-initializing
  });

  describe("initializeOnboarding", () => {
    it("creates initial state for user", () => {
      const state = initializeOnboarding("user-1");
      expect(state.userId).toBe("user-1");
      expect(state.currentStep).toBe("WELCOME");
      expect(state.sessionsCompleted).toBe(0);
      expect(state.completedAt).toBeNull();
      expect(state.unlockedFeatures).toHaveLength(0);
      expect(state.skippedCustomization).toBe(false);
    });
  });

  describe("getOnboardingState", () => {
    it("returns null for unknown user", () => {
      expect(getOnboardingState("unknown-user")).toBeNull();
    });

    it("returns state for known user", () => {
      initializeOnboarding("user-2");
      const state = getOnboardingState("user-2");
      expect(state).not.toBeNull();
      expect(state!.userId).toBe("user-2");
    });
  });

  describe("advanceStep", () => {
    it("advances from WELCOME to QUICK_START", () => {
      initializeOnboarding("user-3");
      const state = advanceStep("user-3");
      expect(state).not.toBeNull();
      expect(state!.currentStep).toBe("QUICK_START");
    });

    it("returns null for unknown user", () => {
      expect(advanceStep("unknown")).toBeNull();
    });

    it("sets completedAt when reaching COMPLETE", () => {
      initializeOnboarding("user-4");
      // Advance through all steps
      for (let i = 0; i < 10; i++) {
        advanceStep("user-4");
      }
      const state = getOnboardingState("user-4");
      expect(state!.currentStep).toBe("COMPLETE");
      expect(state!.completedAt).not.toBeNull();
    });
  });

  describe("skipToFirstSession", () => {
    it("sets skippedCustomization and moves to FIRST_SESSION", () => {
      initializeOnboarding("user-5");
      const state = skipToFirstSession("user-5");
      expect(state).not.toBeNull();
      expect(state!.skippedCustomization).toBe(true);
      expect(state!.currentStep).toBe("FIRST_SESSION");
    });

    it("returns null for unknown user", () => {
      expect(skipToFirstSession("unknown")).toBeNull();
    });
  });

  describe("recordSession", () => {
    it("increments session count", () => {
      initializeOnboarding("user-6");
      const state = recordSession("user-6", 15);
      expect(state).not.toBeNull();
      expect(state!.sessionsCompleted).toBe(1);
    });

    it("sets firstSessionAt on first session", () => {
      initializeOnboarding("user-7");
      const state = recordSession("user-7", 15);
      expect(state!.firstSessionAt).not.toBeNull();
      expect(state!.currentStep).toBe("POST_SESSION");
    });

    it("does not overwrite firstSessionAt on subsequent sessions", () => {
      initializeOnboarding("user-8");
      recordSession("user-8", 15);
      const firstTime = getOnboardingState("user-8")!.firstSessionAt;
      recordSession("user-8", 25);
      expect(getOnboardingState("user-8")!.firstSessionAt).toBe(firstTime);
    });

    it("unlocks features when session threshold is met", () => {
      initializeOnboarding("user-9");
      // Today Strip requires 2 sessions
      recordSession("user-9", 15);
      recordSession("user-9", 15);
      const state = getOnboardingState("user-9");
      expect(state!.unlockedFeatures.length).toBeGreaterThanOrEqual(1);
    });

    it("returns null for unknown user", () => {
      expect(recordSession("unknown", 15)).toBeNull();
    });
  });
});
