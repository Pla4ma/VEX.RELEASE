import { decideHomeSurfaces } from "../home-surface-decision";
import {
  featureAvailability,
  studyProfile,
  gameLikeProfile,
  baseStats,
} from "./product-journey-helpers";

describe("product journey — first-week phase gating", () => {
  it("hides boss when first-week boss intensity is hidden", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(2), bossChallengeEngagement: "high" },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
      firstWeekPhase: {
        bossIntensity: "hidden",
        premiumMoment: "hidden",
        allowedHomeSurfaces: [
          "start_session",
          "progress_proof",
          "coach_presence",
        ],
        spotlightSurface: "progress_proof",
        studyLayerLabel: "Growth Path",
      },
    });
    expect(surfaces.boss_compact).toBe("hidden");
    expect(surfaces.boss_teaser).toBe("hidden");
    expect(surfaces.boss_full_cta).toBe("blocked");
  });

  it("hides premium when first-week premium moment is hidden", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: {
        ...baseStats(6),
        premiumFeatureAttempts: ["weekly_intelligence"],
      },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
      firstWeekPhase: {
        bossIntensity: "subtle",
        premiumMoment: "none",
        allowedHomeSurfaces: [
          "start_session",
          "progress_proof",
          "coach_presence",
          "study_layer",
          "companion_continuity",
        ],
        spotlightSurface: "study_deep_work_path",
        studyLayerLabel: "Study OS",
      },
    });
    expect(surfaces.premium_tease).toBe("hidden");
  });

  it("enforces allowed surfaces only", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(3), bossChallengeEngagement: "medium" },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
      firstWeekPhase: {
        bossIntensity: "hidden",
        premiumMoment: "hidden",
        allowedHomeSurfaces: ["start_session", "progress_proof"],
        spotlightSurface: "progress_proof",
        studyLayerLabel: "Growth Path",
      },
    });
    expect(surfaces.companion_thread).toBe("hidden");
    expect(surfaces.study_layer).toBe("hidden");
  });
});

describe("product journey — feature degraded", () => {
  it("content study degraded hides upload CTA", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability: { ...featureAvailability, study: false },
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(3), studyUsageRatio: 0.5 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.study_layer).toBe("hidden");
  });

  it("premium degraded hides premium_tease regardless of user intent", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability: { ...featureAvailability, premium: false },
      personalizationProfile: studyProfile,
      behaviorStats: {
        ...baseStats(7),
        premiumFeatureAttempts: ["deep_coach_memory"],
      },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.premium_tease).toBe("hidden");
  });

  it("boss degraded shows fallback", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability: { ...featureAvailability, boss: false },
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(10), bossChallengeEngagement: "high" },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.boss_compact).toBe("hidden");
    expect(surfaces.boss_teaser).toBe("hidden");
    expect(surfaces.boss_full_cta).toBe("hidden");
  });
});
