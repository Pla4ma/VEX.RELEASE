/**
 * VEX Phase 17 — Journeys: Premium timing (Category 9)
 */
import { describe, expect, it } from "@jest/globals";
import {
  resolvePremiumTiming,
  EARLY_HIDDEN_THRESHOLD,
} from "../../features/monetization/premium-timing";
import { decideHomeSurfaces } from "../../features/home-experience/home-surface-decision";
import type { Lane } from "../../features/lane-engine/types";

const ALL_LANES: Lane[] = [
  "student",
  "game_like",
  "deep_creative",
  "minimal_normal",
];
const featureAvailability = {
  boss: true,
  challenges: true,
  premium: true,
  study: true,
};
type SurfaceInput = Parameters<typeof decideHomeSurfaces>[0];
type PersonalizationProfile = NonNullable<
  SurfaceInput["personalizationProfile"]
>;

function buildPersonalizationProfile(lane: Lane): PersonalizationProfile {
  return {
    motivationStyle:
      lane === "student"
        ? "study_focused"
        : lane === "game_like"
          ? "game_like"
          : lane === "deep_creative"
            ? "coach_led"
            : "calm",
    primaryGoal:
      lane === "student"
        ? "study"
        : lane === "game_like"
          ? "work"
          : lane === "deep_creative"
            ? "creative"
            : "personal",
    gamificationIntensity:
      lane === "minimal_normal"
        ? "minimal"
        : lane === "game_like"
          ? "strong"
          : "medium",
    studyLayerName: "Growth Path",
    userStage: "new",
  };
}

describe("Phase 17 — Premium: No Day 0 hard sell", () => {
  it("hidden_early for 0 completed sessions", () => {
    const r = resolvePremiumTiming({
      completedSessions: 0,
      revenueCatHealthy: true,
      billingConfigured: true,
    });
    expect(r.tier).toBe("hidden_early");
    expect(r.canShowPaywall).toBe(false);
    expect(r.canTeaseEntries).toBe(false);
    expect(r.canRenderPremiumCTA).toBe(false);
  });

  it("hidden_early for all sessions < EARLY_HIDDEN_THRESHOLD", () => {
    for (let i = 0; i < EARLY_HIDDEN_THRESHOLD; i++) {
      expect(
        resolvePremiumTiming({
          completedSessions: i,
          revenueCatHealthy: true,
          billingConfigured: true,
        }).tier,
      ).toBe("hidden_early");
    }
  });
});

describe("Phase 17 — Premium: Hidden if RevenueCat unhealthy", () => {
  it("blocked_unhealthy when RevenueCat is down", () => {
    const r = resolvePremiumTiming({
      completedSessions: 50,
      revenueCatHealthy: false,
      billingConfigured: true,
    });
    expect(r.tier).toBe("blocked_unhealthy");
    expect(r.canShowPaywall).toBe(false);
    expect(r.canTeaseEntries).toBe(false);
  });

  it("blocked_unhealthy even with high session count", () => {
    const r = resolvePremiumTiming({
      completedSessions: 100,
      revenueCatHealthy: false,
      billingConfigured: true,
    });
    expect(r.tier).toBe("blocked_unhealthy");
    expect(r.reason).toMatch(/RevenueCat|billing|unhealthy|unavailable/i);
  });

  it("blocked_unhealthy when billing not configured", () => {
    const r = resolvePremiumTiming({
      completedSessions: 50,
      revenueCatHealthy: true,
      billingConfigured: false,
    });
    expect(r.tier).toBe("blocked_unhealthy");
  });
});

describe("Phase 17 — Premium: Durable value copy only", () => {
  it("premium reason does not contain economy terms", () => {
    const r = resolvePremiumTiming({
      completedSessions: 40,
      revenueCatHealthy: true,
      billingConfigured: true,
    });
    expect(r.reason).not.toMatch(
      /coin|gem|shop|inventory|chest|loot|battle|streak save|pay to win|xp boost/i,
    );
  });
});

describe("Phase 17 — Premium: premium_tease blocked on Day 0", () => {
  it.each(ALL_LANES)("%s Day 0 premium_tease hidden", (lane) => {
    const map = decideHomeSurfaces({
      featureAvailability,
      personalizationProfile: buildPersonalizationProfile(lane),
      behaviorStats: {
        totalCompletedSessions: 0,
        studyUsageRatio: 0,
        bossChallengeEngagement: "none",
        coachInteractions: 0,
        comebackSessions: 0,
        ignoredFeatures: [],
        premiumFeatureAttempts: [],
        completionStreak: 0,
      },
      hasActiveStudyPlan: false,
      hasActiveRecommendation: false,
      hasActiveBoss: false,
      isFirstSession: true,
      laneProfile: { primaryLane: lane },
    });
    expect(map.premium_tease).toBe("hidden");
  });
});
