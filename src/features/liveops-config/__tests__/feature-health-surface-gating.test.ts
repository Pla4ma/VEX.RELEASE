/**
 * TASK 4 — Feature Health Surface Gating tests
 *
 * Verifies degraded features block unsafe surfaces.
 */
import { decideHomeSurfaces } from "../../home-experience/home-surface-decision";

const featureAvailability = {
  boss: true,
  challenges: true,
  premium: true,
  study: true,
};
const studyProfile = {
  motivationStyle: "study_focused" as const,
  primaryGoal: "study" as const,
  gamificationIntensity: "medium" as const,
  studyLayerName: "Study OS",
  userStage: "new" as const,
};
const gameLikeProfile = {
  motivationStyle: "game_like" as const,
  primaryGoal: "work" as const,
  gamificationIntensity: "strong" as const,
  studyLayerName: "Deep Work Plan",
  userStage: "new" as const,
};
const workProfile = {
  motivationStyle: "coach_led" as const,
  primaryGoal: "work" as const,
  gamificationIntensity: "minimal" as const,
  studyLayerName: "Deep Work Plan",
  userStage: "new" as const,
};

function baseStats(overrides: Partial<ReturnType<typeof baseStats>> = {}) {
  return {
    totalCompletedSessions: 8,
    studyUsageRatio: 0.2,
    bossChallengeEngagement: "medium" as const,
    coachInteractions: 2,
    comebackSessions: 0,
    ignoredFeatures: [],
    premiumFeatureAttempts: [],
    completionStreak: 3,
    ...overrides,
  };
}

describe("FeatureHealth surface gating", () => {
  describe("Degraded Content Study hides upload CTA / study layer", () => {
    it("study_layer blocked when content_study is degraded", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({
          totalCompletedSessions: 5,
          studyUsageRatio: 0.5,
        }),
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: ["content_study"],
      });

      expect(
        map.study_layer === "hidden" || map.study_layer === "blocked",
      ).toBe(true);
    });

    it("study_layer visible when content_study is healthy", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({
          totalCompletedSessions: 5,
          studyUsageRatio: 0.5,
        }),
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: [],
      });

      expect(map.study_layer).toBe("spotlight");
    });
  });

  describe("Degraded AI Coach Advanced falls back to basic coach", () => {
    it("coach_presence downgraded when ai_coach_advanced is degraded", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: workProfile,
        behaviorStats: baseStats({ coachInteractions: 3 }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: true,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: ["ai_coach_advanced"],
      });

      expect(map.coach_presence).not.toBe("spotlight");
    });

    it("coach_presence can be spotlight when healthy", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: workProfile,
        behaviorStats: baseStats({ coachInteractions: 3 }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: true,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: [],
      });

      // coach_presence can be spotlight or tiny_tease depending on home surface algorithm
      expect(["spotlight", "tiny_tease", "compact"]).toContain(
        map.coach_presence,
      );
    });
  });

  describe("Degraded Premium hides purchasable plans", () => {
    it("premium_tease hidden when premium_paywall is degraded", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({
          totalCompletedSessions: 6,
          premiumFeatureAttempts: ["weekly_intelligence"],
        }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: ["premium_paywall"],
      });

      expect(map.premium_tease).toBe("hidden");
    });

    it("premium_tease visible when premium is healthy and user shows intent", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: baseStats({
          totalCompletedSessions: 6,
          premiumFeatureAttempts: ["weekly_intelligence"],
        }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        degradedFeatures: [],
      });

      expect(map.premium_tease).toBe("tiny_tease");
    });
  });

  describe("Degraded Boss blocks full boss route", () => {
    it("boss_full_cta blocked when boss_tab is degraded", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: baseStats({ bossChallengeEngagement: "high" }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
        degradedFeatures: ["boss_tab"],
      });

      expect(map.boss_full_cta).toBe("blocked");
    });

    it("boss_compact downgraded from spotlight when boss_tab is degraded", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: baseStats({ bossChallengeEngagement: "high" }),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
        degradedFeatures: ["boss_tab"],
      });

      expect(map.boss_compact).not.toBe("spotlight");
    });
  });
});
