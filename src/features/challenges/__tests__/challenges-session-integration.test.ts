/**
 * Tests for Challenges — Session Integration Helpers
 */

import { describe, it, expect } from "@jest/globals";

import {
  calculateChallengeContribution,
  getChallengeCTA,
} from "../session-challenges-integration";

describe("Session Integration Helpers", () => {
  describe("calculateChallengeContribution", () => {
    it("returns contribution of 1 for daily and weekly", () => {
      const result = calculateChallengeContribution({
        durationSeconds: 1200,
        qualityScore: 85,
      });
      expect(result.dailyContribution).toBe(1);
      expect(result.weeklyContribution).toBe(1);
      expect(result.canCompleteDaily).toBe(true);
      expect(result.canCompleteWeekly).toBe(false);
    });
  });

  describe("getChallengeCTA", () => {
    it("returns 'Claim Rewards' when both completed", () => {
      const result = getChallengeCTA({
        dailyProgress: 1, dailyRequired: 1, dailyCompleted: true,
        weeklyProgress: 5, weeklyRequired: 5, weeklyCompleted: true,
      });
      expect(result.primaryCTA).toBe("Claim Rewards");
      expect(result.secondaryCTA).toBeNull();
    });

    it("returns weekly CTA when only daily is completed", () => {
      const result = getChallengeCTA({
        dailyProgress: 1, dailyRequired: 1, dailyCompleted: true,
        weeklyProgress: 2, weeklyRequired: 5, weeklyCompleted: false,
      });
      expect(result.primaryCTA).toBe("Complete Weekly Challenge");
      expect(result.secondaryCTA).toBe("Claim Daily Reward");
      expect(result.motivationMessage).toContain("3 more sessions");
    });

    it("returns daily CTA when only weekly is completed", () => {
      const result = getChallengeCTA({
        dailyProgress: 0, dailyRequired: 1, dailyCompleted: false,
        weeklyProgress: 5, weeklyRequired: 5, weeklyCompleted: true,
      });
      expect(result.primaryCTA).toBe("Complete Daily Challenge");
      expect(result.secondaryCTA).toBe("Claim Weekly Reward");
    });

    it("returns 'Start Focus Session' when neither completed", () => {
      const result = getChallengeCTA({
        dailyProgress: 0, dailyRequired: 1, dailyCompleted: false,
        weeklyProgress: 0, weeklyRequired: 5, weeklyCompleted: false,
      });
      expect(result.primaryCTA).toBe("Start Focus Session");
      expect(result.motivationMessage).toContain("1 daily");
      expect(result.motivationMessage).toContain("5 weekly");
    });

    it("uses singular 'session' when 1 remaining", () => {
      const result = getChallengeCTA({
        dailyProgress: 1, dailyRequired: 1, dailyCompleted: true,
        weeklyProgress: 4, weeklyRequired: 5, weeklyCompleted: false,
      });
      expect(result.motivationMessage).toContain("1 more session");
      expect(result.motivationMessage).not.toContain("sessions");
    });
  });
});
