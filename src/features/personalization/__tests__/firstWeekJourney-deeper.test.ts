/**
 * FirstWeekExperience — deeper journey + gating tests (Day 7, Premium, Boss, Study)
 *
 * Verifies late-week stages and feature-gating logic.
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

describe("FirstWeekExperience — deeper journey + gating", () => {
  describe("Day 7 deeper mode", () => {
    it("Day 7 — weekly insight + premium value moment", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          completedSessions: 7,
          daysSinceOnboarding: 7,
          daysSinceLastSession: 0,
          featureAvailable: {
            boss: true,
            premium: true,
            social: false,
            study: true,
          },
        }),
      );

      expect(result.currentDayStage).toBe("DAY_7_DEEPER_MODE");
      expect(result.premiumMoment).toBe("weekly_value");
    });
  });

  describe("Premium gating", () => {
    it("premium unavailable — premiumMoment is none", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          completedSessions: 7,
          daysSinceOnboarding: 7,
          featureAvailable: {
            boss: true,
            premium: false,
            social: false,
            study: true,
          },
        }),
      );

      expect(result.premiumMoment).toBe("none");
    });

    it("premium configured but not active — premium moment follows stage", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          completedSessions: 5,
          daysSinceOnboarding: 5,
          isPremium: false,
          featureAvailable: {
            boss: true,
            premium: true,
            social: false,
            study: true,
          },
        }),
      );

      expect(result.premiumMoment).toBe("soft_tease");
    });
  });

  describe("Boss gating", () => {
    it("boss unavailable — bossIntensity hidden", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          motivationStyle: "game_like",
          completedSessions: 5,
          featureAvailable: {
            boss: false,
            premium: true,
            social: false,
            study: true,
          },
        }),
      );

      expect(result.bossIntensity).toBe("hidden");
    });

    it("minimal user — boss stays hidden", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          motivationStyle: "calm",
          completedSessions: 5,
          featureAvailable: {
            boss: true,
            premium: true,
            social: false,
            study: true,
          },
        }),
      );

      expect(result.bossIntensity).toBe("hidden");
    });
  });

  describe("Content study gating", () => {
    it("study degraded — study surfaces may be limited", () => {
      const result = computeFirstWeekRuntime(
        baseInput({
          motivationStyle: "study_focused",
          completedSessions: 5,
          featureAvailable: {
            boss: true,
            premium: true,
            social: false,
            study: false,
          },
        }),
      );

      expect(result.currentDayStage).toBe("DAY_5_PATH_FORMING");
    });
  });
});
