import {
  resolveInitialLane,
  resolveBehaviorLane,
  mergeLaneProfiles,
  shouldReconsiderLane,
  getLaneMechanicPolicy,
  getLanePresentationPolicy,
} from "./helpers";
import type { LaneProfile } from "./helpers";

describe("No direct lane inference", () => {
  describe("lane-engine is the single source of LaneProfile", () => {
    it("resolveInitialLane produces valid LaneProfile from raw signals", () => {
      const profile = resolveInitialLane({
        primaryGoal: "study",
        motivationStyle: "study_focused",
      });

      expect(profile).toHaveProperty("primaryLane");
      expect(profile).toHaveProperty("confidence");
      expect(profile).toHaveProperty("confidenceBand");
      expect(profile).toHaveProperty("source");
      expect(profile).toHaveProperty("traits");
      expect(profile).toHaveProperty("evidence");
      const requiredKeys: Array<keyof LaneProfile> = [
        "primaryLane",
        "secondaryLane",
        "confidence",
        "confidenceBand",
        "source",
        "evidence",
        "traits",
        "resolvedAt",
      ];
      for (const key of requiredKeys) {
        expect(profile).toHaveProperty(key);
      }
    });

    it("resolveBehaviorLane produces valid LaneProfile enriched with behavior signals", () => {
      const profile = resolveBehaviorLane({
        primaryGoal: "creative",
        motivationStyle: "coach_led",
        completedSessions: 5,
        deepCreativeUsageRatio: 0.5,
      });

      expect(profile.source).toBe("behavior");
      expect(profile.primaryLane).toBeDefined();
    });

    it("mergeLaneProfiles returns LaneProfile (onboarding wins at < 3 sessions)", () => {
      const onboarding = resolveInitialLane({
        primaryGoal: "study",
        motivationStyle: "study_focused",
      });
      const behavior = resolveBehaviorLane({
        primaryGoal: "study",
        motivationStyle: "game_like",
        completedSessions: 1,
      });

      const merged = mergeLaneProfiles({
        onboardingProfile: onboarding,
        behaviorProfile: behavior,
        completedSessions: 1,
      });

      expect(merged.primaryLane).toBe(onboarding.primaryLane);
      expect(merged.confidenceBand).toBe(onboarding.confidenceBand);
    });

    it("shouldReconsiderLane returns boolean from LaneProfile comparison", () => {
      const current = resolveInitialLane({
        primaryGoal: "study",
        motivationStyle: "study_focused",
      });
      const latest = resolveBehaviorLane({
        primaryGoal: "personal",
        motivationStyle: "calm",
        completedSessions: 5,
        bossDismissals: 3,
      });

      const result = shouldReconsiderLane({
        currentProfile: current,
        completedSessions: 5,
        latestProfile: latest,
      });

      expect(typeof result).toBe("boolean");
    });

    it("getLaneMechanicPolicy produces valid policy from LaneProfile", () => {
      const profile = resolveInitialLane({
        primaryGoal: "study",
        motivationStyle: "study_focused",
      });
      const policy = getLaneMechanicPolicy(profile);

      expect(policy.lane).toBe(profile.primaryLane);
      expect(policy.preferredMechanics.length).toBeGreaterThan(0);
      expect(policy.blockedMechanics.length).toBeGreaterThan(0);
    });

    it("getLanePresentationPolicy produces valid presentation from Lane", () => {
      const policy = getLanePresentationPolicy({
        lane: "student",
        reducedMotion: false,
      });

      expect(policy.lane).toBe("student");
      expect(policy.animation).toBeDefined();
      expect(policy.copyTone).toBeDefined();
      expect(policy.density).toBeDefined();
    });
  });
});
