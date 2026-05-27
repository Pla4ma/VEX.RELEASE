/**
 * VEX Phase 17 — Journeys: Hidden systems (Category 10)
 */
import { describe, expect, it } from "@jest/globals";
import {
  FINAL_RELEASE_FEATURE_MAP,
  isFeatureHidden,
  isFeatureIncluded,
  getFeatureStatus,
} from "../../features/liveops-config/final-release-feature-map";
import { decideHomeSurfaces } from "../../features/home-experience/home-surface-decision";
import { buildLaneSessionBrief } from "../../features/session-start/service";
import type { Lane } from "../../features/lane-engine/types";
import { LaneSchema } from "../../features/lane-engine/schemas";

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

describe("Phase 17 — Hidden systems: Feature map", () => {
  const hidden = [
    "shop",
    "inventory",
    "battle_pass",
    "wagers",
    "squads",
    "rivals",
    "rankings",
    "economy_advanced",
    "economy_basic",
    "gems_prominent",
    "streak_insurance",
    "boss_bounties",
    "seasonal_features",
    "social_tab",
  ];

  hidden.forEach((f) => {
    it(`${f} is hidden in final release`, () => {
      expect(isFeatureHidden(f)).toBe(true);
    });
  });

  hidden.forEach((f) => {
    it(`${f} is not included`, () => {
      expect(isFeatureIncluded(f)).toBe(false);
    });
  });

  const included = [
    "focus_session",
    "progress_view",
    "home_tab",
    "ai_coach_basic",
    "content_study",
  ];
  included.forEach((f) => {
    it(`${f} is included`, () => {
      expect(isFeatureIncluded(f)).toBe(true);
    });
  });
});

describe("Phase 17 — Hidden systems: Progressive features", () => {
  it("boss_tab is progressive not hidden", () => {
    expect(isFeatureHidden("boss_tab")).toBe(false);
    expect(isFeatureIncluded("boss_tab")).toBe(false);
  });
  it("memory_console is progressive", () => {
    expect(isFeatureIncluded("memory_console")).toBe(false);
    expect(isFeatureHidden("memory_console")).toBe(false);
  });
  it("premium_paywall is progressive with minimum sessions", () => {
    expect(getFeatureStatus("premium_paywall")).toBe("progressive");
  });
});

describe("Phase 17 — Hidden systems: No economy surfaces in Day 0", () => {
  it("Day 0 surface keys exclude economy/social across all lanes", () => {
    const forbidden = [
      "shop",
      "economy",
      "social",
      "wallet",
      "wager",
      "ranking",
    ];
    ALL_LANES.forEach((lane) => {
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
      const keys = Object.keys(map);
      expect(keys.some((k) => forbidden.some((fp) => k.includes(fp)))).toBe(
        false,
      );
    });
  });
});

describe("Phase 17 — Hidden systems: No economy in session briefs", () => {
  it.each(ALL_LANES)("%s brief has no economy references", (lane) => {
    const json = JSON.stringify(
      buildLaneSessionBrief({ durationSeconds: 15 * 60, lane }),
    );
    expect(json).not.toMatch(
      /shop|inventory|wallet|battle.pass|wager|social|ranking/i,
    );
  });
});

describe("Phase 17 — Lane schema integrity", () => {
  it("LaneSchema has exactly 4 lanes", () => {
    expect(LaneSchema.options).toEqual([
      "student",
      "game_like",
      "deep_creative",
      "minimal_normal",
    ]);
  });

  it("all lanes produce valid rescue plans", () => {
    ALL_LANES.forEach((lane) => {
      const plan = (() => {
        const {
          createRescuePlan,
        } = require("../../features/rescue-mode/service");
        return createRescuePlan({ userId: "u1", lane, reason: "unclear" });
      })();
      expect(plan.durationSeconds).toBeGreaterThanOrEqual(5 * 60);
    });
  });
});
