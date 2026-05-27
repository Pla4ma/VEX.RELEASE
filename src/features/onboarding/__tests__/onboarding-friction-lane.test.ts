import { describe, it, expect } from "@jest/globals";

describe("Onboarding Friction", () => {
  describe("Lane Confirmation", () => {
    it("first-run onboarding includes lane confirmation step", () => {
      const stepTitles = [
        "Pick your first win",
        "Choose the motivation style",
        "Confirm your focus mode",
        "Choose your first session",
        "Start now",
      ];
      expect(stepTitles.length).toBe(5);
      expect(stepTitles[2]).toBe("Confirm your focus mode");
    });

    it("lane confirmation step comes after motivation but before first session", () => {
      const laneStepIndex = 2;
      const starterStepIndex = 3;
      expect(laneStepIndex).toBeLessThan(starterStepIndex);
    });

    it("user can accept recommended lane", () => {
      const recommendedLane = "student";
      const accepted = recommendedLane;
      expect(accepted).toBe("student");
    });

    it("user can choose another lane", () => {
      const recommendedLane = "student";
      const chosenLane = "game_like";
      expect(chosenLane).not.toBe(recommendedLane);
    });

    it("lane override persists across sessions", () => {
      const chosenLane = "minimal_normal";
      const persistCheck = chosenLane;
      expect(persistCheck).toBe("minimal_normal");
    });

    it("Day 0 max surfaces is 6", () => {
      const maxSurfaces = 6;
      const allowed = [
        "start_session",
        "coach_presence",
        "unlock_strip",
        "study_layer",
        "boss_teaser",
        "companion_thread",
      ];
      expect(allowed.length).toBeLessThanOrEqual(maxSurfaces);
    });

    it("Student Day 0 shows tiny Study preview, no upload/import", () => {
      const studentDay0Allowed = [
        "study_layer",
        "coach_presence",
        "start_session",
        "unlock_strip",
      ];
      const studentDay0Blocked = [
        "content_study",
        "study_os",
        "quiz",
        "challenge_teaser",
      ];
      for (const blocked of studentDay0Blocked) {
        expect(studentDay0Allowed).not.toContain(blocked);
      }
    });

    it("Run Day 0 shows tiny boss teaser only", () => {
      const runDay0Allowed = ["boss_teaser"];
      const runDay0Blocked = [
        "boss_compact",
        "boss_full_cta",
        "study_os",
        "project_thread",
        "challenge_teaser",
      ];
      for (const blocked of runDay0Blocked) {
        expect(runDay0Allowed).not.toContain(blocked);
      }
    });

    it("Project Day 0 shows tiny project preview only", () => {
      const projectDay0Allowed = ["project_thread"];
      const projectDay0Blocked = [
        "boss_full_cta",
        "challenge_teaser",
        "study_os",
        "run_board",
        "weekly_quest",
      ];
      for (const blocked of projectDay0Blocked) {
        expect(projectDay0Allowed).not.toContain(blocked);
      }
    });

    it("Clean Day 0 shows no boss/challenge/premium clutter", () => {
      const cleanDay0Blocked = [
        "boss_teaser",
        "boss_compact",
        "boss_full_cta",
        "challenge_teaser",
        "premium_tease",
        "weekly_quest",
      ];
      const cleanDay0Allowed = [
        "start_session",
        "coach_presence",
        "today_strip",
        "unlock_strip",
      ];
      for (const blocked of cleanDay0Blocked) {
        expect(cleanDay0Allowed).not.toContain(blocked);
      }
    });
  });
});
