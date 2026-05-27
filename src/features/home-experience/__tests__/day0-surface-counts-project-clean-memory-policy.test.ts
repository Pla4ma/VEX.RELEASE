import { decideHomeSurfaces } from "../home-surface-decision";
import { enforceDay0SurfacePolicy } from "../day0-surface-policy";
import {
  featureAvailability,
  baseStats,
  day0Map,
} from "./day0-surface-counts-helpers";

describe("Phase 3 — Day 0 lane surface counts", () => {
  describe("Project preview independence", () => {
    it("project_thread is hidden/blocked on Day 0 regardless of hasActiveStudyPlan", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: "coach_led",
          primaryGoal: "creative",
          gamificationIntensity: "medium",
          studyLayerName: "Study OS",
          userStage: "new",
        },
        behaviorStats: baseStats(),
        hasActiveStudyPlan: true,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: true,
        laneProfile: { primaryLane: "deep_creative" },
      });
      expect(map.project_thread).toMatch(/hidden|blocked/);
    });

    it("project_thread surfaces without requiring activeStudyPlan (after Day 0)", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: "coach_led",
          primaryGoal: "creative",
          gamificationIntensity: "medium",
          studyLayerName: "Study OS",
          userStage: "engaged",
        },
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 4,
          projectFocusUsageRatio: 0.6,
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: "deep_creative" },
      });
      expect(map.project_thread).not.toBe("hidden");
    });
  });

  describe("Clean Home (minimal_normal) zero clutter", () => {
    it("minimal_normal Day 0 has no boss teaser", () => {
      const map = day0Map({
        motivationStyle: "calm",
        gamificationIntensity: "minimal",
        laneProfile: { primaryLane: "minimal_normal" },
      });
      expect(map.boss_teaser).toBe("hidden");
      expect(map.boss_compact).toBe("hidden");
      expect(map.boss_full_cta).toBe("blocked");
    });

    it("minimal_normal Day 0 has no challenge clutter", () => {
      const map = day0Map({
        motivationStyle: "calm",
        gamificationIntensity: "minimal",
        laneProfile: { primaryLane: "minimal_normal" },
      });
      expect(map.challenge_teaser).toBe("hidden");
      expect(map.weekly_quest).toBe("hidden");
    });

    it("minimal_normal after Day 0 has today_strip, no boss/challenge clutter", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: "calm",
          primaryGoal: "personal",
          gamificationIntensity: "minimal",
          studyLayerName: "Growth Path",
          userStage: "engaged",
        },
        behaviorStats: { ...baseStats(), totalCompletedSessions: 5 },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: "minimal_normal" },
      });
      expect(map.today_strip).not.toBe("hidden");
      expect(map.boss_full_cta).toBe("blocked");
      expect(map.boss_compact).toBe("hidden");
      expect(map.challenge_teaser).toBe("hidden");
    });
  });

  describe("Memory insight gating", () => {
    it("memory_insight hidden when < 3 sessions", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: "coach_led",
          primaryGoal: "focus",
          gamificationIntensity: "medium",
          studyLayerName: "Study OS",
          userStage: "activating",
        },
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 2,
          coachInteractions: 2,
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: "student" },
      });
      expect(map.memory_insight).toBe("hidden");
    });

    it("memory_insight surfaces at >= 3 sessions with coach interactions", () => {
      const map = decideHomeSurfaces({
        featureAvailability,
        personalizationProfile: {
          motivationStyle: "coach_led",
          primaryGoal: "focus",
          gamificationIntensity: "medium",
          studyLayerName: "Study OS",
          userStage: "engaged",
        },
        behaviorStats: {
          ...baseStats(),
          totalCompletedSessions: 3,
          coachInteractions: 2,
        },
        hasActiveStudyPlan: false,
        hasActiveRecommendation: false,
        hasActiveBoss: false,
        isFirstSession: false,
        laneProfile: { primaryLane: "student" },
      });
      expect(map.memory_insight).toBe("tiny_tease");
    });
  });

  describe("Day 0 policy validation across lanes", () => {
    const lanes = [
      {
        name: "student",
        profile: {
          motivationStyle: "study_focused",
          primaryGoal: "study",
          laneProfile: { primaryLane: "student" },
        },
      },
      {
        name: "game_like",
        profile: {
          motivationStyle: "game_like",
          gamificationIntensity: "strong" as const,
          laneProfile: { primaryLane: "game_like" },
        },
      },
      {
        name: "deep_creative",
        profile: {
          motivationStyle: "coach_led",
          primaryGoal: "creative",
          laneProfile: { primaryLane: "deep_creative" },
        },
      },
      {
        name: "minimal_normal",
        profile: {
          motivationStyle: "calm",
          gamificationIntensity: "minimal" as const,
          laneProfile: { primaryLane: "minimal_normal" },
        },
      },
    ];

    lanes.forEach(({ name, profile }) => {
      it(`${name} Day 0 map passes enforceDay0SurfacePolicy`, () => {
        const map = day0Map(profile);
        const result = enforceDay0SurfacePolicy(map);
        expect(result.valid).toBe(true);
        expect(result.violations).toHaveLength(0);
      });
    });
  });
});
