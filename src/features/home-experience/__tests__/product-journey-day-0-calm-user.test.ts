import {
  buildHomeExperienceModel,
  decideHomeSurfaces,
  featureAvailability,
  calmProfile,
  baseStats,
} from "./product-journey-helpers";

describe("product journey — Day 0 calm user", () => {
  const model = buildHomeExperienceModel({
    explicitMotivationStyle: "calm",
    totalCompletedSessions: 0,
  });

  it("has exactly one primary CTA", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    const primaries = Object.entries(surfaces).filter(
      ([, v]) => v === "primary",
    );
    expect(primaries).toHaveLength(1);
    expect(surfaces.start_session).toBe("primary");
  });

  it("no full boss route", () => {
    expect(model.mustNotRun).toContain("boss_query");
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.boss_compact).toBe("hidden");
    expect(surfaces.boss_full_cta).toBe("blocked");
    expect(surfaces.boss_teaser).toBe("hidden");
  });

  it("no premium hard sell", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.premium_tease).toBe("hidden");
  });

  it("no content upload unless selected", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: calmProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe("hidden");
  });

  it("no social/shop/economy", () => {
    const visible = Object.entries(
      decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: calmProfile,
        behaviorStats: baseStats(0),
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
      }),
    )
      .filter(([, v]) => v !== "hidden" && v !== "blocked")
      .map(([k, v]) => `${k}:${v}`);
    const hasForbidden = visible.some(
      (s) =>
        s.includes("shop") || s.includes("economy") || s.includes("social"),
    );
    expect(hasForbidden).toBe(false);
  });
});
