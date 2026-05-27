import { decideHomeSurfaces } from "../home-surface-decision";
import {
  featureAvailability,
  calmProfile,
  gameLikeProfile,
  baseStats,
} from "./product-journey-helpers";

describe("product journey — Day 0 learning user", () => {
  const learningProfile = {
    motivationStyle: "study_focused" as const,
    primaryGoal: "learning" as const,
    gamificationIntensity: "medium" as const,
    studyLayerName: "Learning OS",
    userStage: "new" as const,
  };

  it("gets study_layer as Learning cue on Day 0", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: learningProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe("tiny_tease");
  });

  it("first session remains primary for learning user", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: learningProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.start_session).toBe("primary");
  });
});

describe("product journey — Day 0 non-study user gets no study clutter", () => {
  it("calm user has study_layer hidden on Day 0", () => {
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

  it("game-like work user has study_layer hidden on Day 0", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: gameLikeProfile,
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe("hidden");
  });

  it("coach-led user has study_layer hidden on Day 0", () => {
    const surfaces = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: {
        motivationStyle: "coach_led" as const,
        primaryGoal: "work" as const,
        gamificationIntensity: "minimal" as const,
        studyLayerName: "Deep Work Plan",
        userStage: "new" as const,
      },
      behaviorStats: baseStats(0),
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
    });
    expect(surfaces.study_layer).toBe("hidden");
  });
});

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
    const { buildHomeExperienceModel } = require("../service");
    const model = buildHomeExperienceModel({
      explicitMotivationStyle: "game_like",
      totalCompletedSessions: 0,
    });
    expect(model.rpgBossPlacement).toContain("tiny visual");
  });
});
