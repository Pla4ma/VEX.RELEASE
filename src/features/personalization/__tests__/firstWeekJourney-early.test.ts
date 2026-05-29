/**
 * FirstWeekExperience — early journey tests (Day 0–5, Comeback)
 *
 * Verifies first-week arc stages and early user types.
 */
import { computeFirstWeekRuntime } from "../useFirstWeekExperienceRuntime";
import type { FirstWeekRuntimeInput } from "../useFirstWeekExperienceRuntime";

function baseInput(
  overrides: Partial<FirstWeekRuntimeInput> = {},
): FirstWeekRuntimeInput {
  return {
    completedSessions: 0,
    daysSinceOnboarding: 0,
    daysSinceLastSession: null,
    motivationStyle: "calm",
    primaryGoal: "focus",
    bossEngagement: "none",
    studyUsageRatio: 0,
    isPremium: false,
    featureAvailable: { boss: true, premium: true, social: false, study: true },
    ...overrides,
  };
}

describe("FirstWeekExperience — early journey", () => {
  describe("Day 0", () => {
    it("Day 0 calm user — Start First Session primary, boss hidden", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          motivationStyle: "calm",
          completedSessions: 0,
        }),
      );

      expect(result.currentDayStage).toBe("DAY_0_NOT_STARTED");
      expect(result.primaryCTA.label).toBe("Start first session");
      expect(result.bossIntensity).toBe("hidden");
      expect(result.premiumMoment).toBe("none");
      expect(result.spotlightSurface).toBe("none");
    });

    it("Day 0 study user — study focus, no premium", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          motivationStyle: "study_focused",
          primaryGoal: "study",
          completedSessions: 0,
          studyUsageRatio: 0,
        }),
      );

      expect(result.currentDayStage).toBe("DAY_0_NOT_STARTED");
      expect(result.primaryCTA.intent).toBe("CONTINUE_STUDY_PATH");
      expect(result.studyLayerLabel).toBe("Study OS");
      expect(result.premiumMoment).toBe("none");
    });

    it("Day 0 game-like user — boss teaser allowed in surfaces", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          motivationStyle: "game_like",
          completedSessions: 0,
          featureAvailable: {
            boss: true,
            premium: true,
            social: false,
            study: true,
          },
        }),
      );

      expect(result.currentDayStage).toBe("DAY_0_NOT_STARTED");
      expect(result.allowedHomeSurfaces).toContain("tiny_boss_teaser");
      expect(result.bossIntensity).toBe("tiny_tease");
    });
  });

  describe("Day 1 return", () => {
    it("Day 1 — progress proof + next session", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          completedSessions: 1,
          daysSinceOnboarding: 1,
          daysSinceLastSession: 0,
        }),
      );

      expect(result.currentDayStage).toBe("DAY_1_RETURN");
      expect(result.spotlightSurface).toBe("progress_proof");
      expect(result.primaryMessage).toBe(
        "One clean block is enough today.",
      );
    });
  });

  describe("Day 3 companion connection", () => {
    it("Day 3 — companion surfaces appear", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          motivationStyle: "friendly",
          completedSessions: 3,
          daysSinceOnboarding: 3,
          daysSinceLastSession: 0,
        }),
      );

      expect(result.currentDayStage).toBe("DAY_3_COMPANION_CONNECTION");
      expect(result.allowedHomeSurfaces).toContain("companion_continuity");
    });
  });

  describe("Day 5 path forming", () => {
    it("Day 5 — study path + soft premium tease", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          motivationStyle: "study_focused",
          primaryGoal: "study",
          completedSessions: 5,
          daysSinceOnboarding: 5,
          daysSinceLastSession: 0,
          studyUsageRatio: 0.4,
        }),
      );

      expect(result.currentDayStage).toBe("DAY_5_PATH_FORMING");
      expect(result.premiumMoment).toBe("soft_tease");
      expect(result.allowedHomeSurfaces).toContain("study_deep_work_path");
    });
  });

  describe("Comeback user", () => {
    it("missed several days — comeback state activated", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          completedSessions: 3,
          daysSinceOnboarding: 10,
          daysSinceLastSession: 5,
        }),
      );

      expect(result.comebackState).toBe("missed_week");
      expect(result.coachMessageType).toBe("comeback");
      expect(result.allowedHomeSurfaces).toContain("recovery_cta");
    });
  });
});
