import {
  decideHomeSurfaces,
  getSpotlightSurface,
} from "../home-surface-decision";
import {
  featureAvailability,
  studyProfile,
  workProfile,
  gameLikeProfile,
  calmProfile,
  baseStats,
} from "./home-surface-decision.helpers";

describe("HomeSurfaceDecision", () => {
  describe("Spotlight selection by motivation style", () => {
    it("study-focused user gets study_layer spotlight on engaged", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: studyProfile,
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 5,
          studyUsageRatio: 0.7,
        },
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(getSpotlightSurface(map)).toBe("study_layer");
    });

    it("game-like user with high boss engagement gets boss_compact spotlight", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: gameLikeProfile,
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 8,
          bossChallengeEngagement: "high",
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: true,
        isFirstSession: false,
      });

      const spot = getSpotlightSurface(map);
      expect(spot === "boss_compact" || spot === "boss_teaser").toBe(true);
    });

    it("coach-led user with active recommendation gets coach_presence spotlight", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: workProfile,
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 4,
          coachInteractions: 2,
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: true,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(getSpotlightSurface(map)).toBe("coach_presence");
    });

    it("calm user does not get boss teaser in any form", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 10,
          bossChallengeEngagement: "high",
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(map.boss_teaser).toBe("hidden");
      expect(map.boss_compact).toBe("hidden");
      expect(map.boss_full_cta).toBe("blocked");
    });

    it("calm user with completion streak sees progress spotlight", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 7,
          completionStreak: 5,
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
      });

      expect(getSpotlightSurface(map)).toBe("progress_proof");
    });
  });
});
