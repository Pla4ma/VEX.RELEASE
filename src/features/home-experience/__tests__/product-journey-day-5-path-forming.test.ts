import {
  decideHomeSurfaces,
  getSpotlightSurface,
  featureAvailability,
  calmProfile,
  studyProfile,
  baseStats,
} from "./product-journey-helpers";

describe("product journey — Day 5 path forming", () => {
  it("study user gets study spotlight on Day 5", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(5), studyUsageRatio: 0.6 },
      hasActiveStudyPlan: true,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(getSpotlightSurface(surfaces)).toBe("study_layer");
  });

  it("no feature museum — at most limited visible surfaces", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: { ...baseStats(5), completionStreak: 3 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    const visible = Object.entries(surfaces)
      .filter(([, v]) => v !== "hidden" && v !== "blocked")
      .map(([k, v]) => `${k}:${v}`);
    expect(visible.length).toBeLessThan(8);
    expect(visible.every((v) => !v.includes("boss_full_cta"))).toBe(true);
  });

  it("unlock strip visible for new user (1-2 sessions)", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: studyProfile,
      behaviorStats: { ...baseStats(1), studyUsageRatio: 0.4 },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: false,
    });
    expect(surfaces.unlock_strip).toBe("secondary");
  });
});
