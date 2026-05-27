import {
  buildHomeExperienceModel,
  decideHomeSurfaces,
  featureAvailability,
  gameLikeProfile,
  baseStats,
} from "./product-journey-helpers";

describe("product journey — Day 0 game-like user", () => {
  it("tiny boss teaser allowed on Day 0", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: { ...baseStats(0), bossChallengeEngagement: "low" },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.boss_compact).not.toBe("spotlight");
    expect(surfaces.boss_full_cta).not.toBe("spotlight");
  });

  it("no full boss route on Day 0", () => {
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: "game_like",
      totalCompletedSessions: 0,
    });
    expect(model.rpgBossPlacement).toContain("tiny visual");
  });
});
