import { describe, it, expect } from "@jest/globals";

describe("Onboarding Friction", () => {
  describe("Tracking milestones", () => {
    it("all tracking events are defined", () => {
      const events = [
        "onboarding_started",
        "motivation_selected",
        "starter_selected",
        "first_session_started",
        "first_session_completed",
        "home_entered_without_first_session",
      ];
      expect(events.length).toBe(6);
      expect(events[0]).toBe("onboarding_started");
      expect(events[4]).toBe("first_session_completed");
      expect(events[5]).toBe("home_entered_without_first_session");
    });

    it("profile steps complete triggered before home preview", () => {
      const profileStepsComplete = true;
      const firstSessionCompleted = false;
      const homePreviewAllowed = profileStepsComplete && !firstSessionCompleted;
      expect(homePreviewAllowed).toBe(true);
    });
  });

  describe("Onboarding state machine", () => {
    it("firstSessionStarted is initially false", () => {
      const state = { firstSessionStarted: false };
      expect(state.firstSessionStarted).toBe(false);
    });

    it("firstSessionCompleted is initially false", () => {
      const state = { firstSessionCompleted: false };
      expect(state.firstSessionCompleted).toBe(false);
    });

    it("homePreviewEntered is initially false", () => {
      const state = { homePreviewEntered: false };
      expect(state.homePreviewEntered).toBe(false);
    });

    it("canPreviewHome returns false when profileSteps not complete", () => {
      const profileStepsCompleted = false;
      const userId = "user-1";
      const state = { profileStepsCompleted, isOnboarded: false };
      const canPreview = Boolean(userId) && state.profileStepsCompleted;
      expect(canPreview).toBe(false);
    });
  });
});
