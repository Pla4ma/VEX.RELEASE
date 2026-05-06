/**
 * EarnPremiumSystem Tests
 *
 * Tests for the achievement-based premium trial system.
 * Verifies eligibility checking, reward claiming, and trial management.
 */

import { earnPremiumSystem, EarnPremiumAchievementType, EarnPremiumStatusSchema, CheckEligibilityInputSchema, checkEarnPremiumEligibility, claimEarnPremiumReward, hasUnclaimedPremiumRewards } from "../EarnPremiumSystem";

describe("EarnPremiumSystem", () => {
  const mockUserId = "550e8400-e29b-41d4-a716-446655440000";

  describe("checkAndUnlock", () => {
    it("creates initial status for new users with no achievements", () => {
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 0,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      });

      expect(status.userId).toBe(mockUserId);
      expect(status.rewards).toHaveLength(0);
      expect(status.hasActiveTrial).toBe(false);
      expect(status.totalTrialsClaimed).toBe(0);
    });

    it("unlocks streak 30-day reward when streak reaches 30", () => {
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      });

      expect(status.rewards).toHaveLength(1);
      expect(status.rewards[0]?.type).toBe(EarnPremiumAchievementType.STREAK_30_DAYS);
      expect(status.rewards[0]?.trialDays).toBe(7);
      expect(status.rewards[0]?.claimed).toBe(false);
      expect(status.rewards[0]?.unlockedAt).toBeGreaterThan(0);
    });

    it("does not duplicate streak reward if already unlocked", () => {
      const existingStatus = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      });

      const updatedStatus = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 35,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus,
      });

      expect(updatedStatus.rewards).toHaveLength(1);
    });

    it("unlocks all bosses defeated reward when all 6 bosses are defeated", () => {
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 0,
        defeatedBossIds: ["1", "2", "3", "4", "5", "6"],
        currentLevel: 1,
        existingStatus: null,
      });

      expect(status.rewards).toHaveLength(1);
      expect(status.rewards[0]?.type).toBe(EarnPremiumAchievementType.ALL_BOSSES_DEFEATED);
      expect(status.rewards[0]?.trialDays).toBe(7);
    });

    it("does not unlock boss reward if not all bosses defeated", () => {
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 0,
        defeatedBossIds: ["1", "2", "3", "4", "5"], // Missing boss 6
        currentLevel: 1,
        existingStatus: null,
      });

      expect(status.rewards).toHaveLength(0);
    });

    it("unlocks level 20 reward when user reaches level 20", () => {
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 0,
        defeatedBossIds: [],
        currentLevel: 20,
        existingStatus: null,
      });

      expect(status.rewards).toHaveLength(1);
      expect(status.rewards[0]?.type).toBe(EarnPremiumAchievementType.LEVEL_20);
      expect(status.rewards[0]?.trialDays).toBe(3);
    });

    it("does not unlock level reward if below level 20", () => {
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 0,
        defeatedBossIds: [],
        currentLevel: 19,
        existingStatus: null,
      });

      expect(status.rewards).toHaveLength(0);
    });

    it("can unlock multiple rewards simultaneously", () => {
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: ["1", "2", "3", "4", "5", "6"],
        currentLevel: 20,
        existingStatus: null,
      });

      expect(status.rewards).toHaveLength(3);
      const types = status.rewards.map((r) => r.type);
      expect(types).toContain(EarnPremiumAchievementType.STREAK_30_DAYS);
      expect(types).toContain(EarnPremiumAchievementType.ALL_BOSSES_DEFEATED);
      expect(types).toContain(EarnPremiumAchievementType.LEVEL_20);
    });

    it("validates input with Zod schema", () => {
      expect(() => {
        earnPremiumSystem.checkAndUnlock({
          userId: "invalid-uuid",
          streakDays: 30,
          defeatedBossIds: [],
          currentLevel: 1,
          existingStatus: null,
        } as any);
      }).toThrow();
    });
  });

  describe("claimReward", () => {
    it("successfully claims an unlocked reward", () => {
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      });

      const result = earnPremiumSystem.claimReward(status, EarnPremiumAchievementType.STREAK_30_DAYS);

      expect(result.success).toBe(true);
      expect(result.status.hasActiveTrial).toBe(true);
      expect(result.status.trialEndsAt).toBeGreaterThan(Date.now());
      expect(result.status.totalTrialsClaimed).toBe(1);

      const claimedReward = result.status.rewards.find((r) => r.type === EarnPremiumAchievementType.STREAK_30_DAYS);
      expect(claimedReward?.claimed).toBe(true);
      expect(claimedReward?.claimedAt).toBeGreaterThan(0);
    });

    it("fails to claim if reward not found", () => {
      const status = earnPremiumSystem.createInitialStatus(mockUserId);

      const result = earnPremiumSystem.claimReward(status, EarnPremiumAchievementType.STREAK_30_DAYS);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Reward not found or not yet unlocked");
    });

    it("fails to claim if reward already claimed", () => {
      let status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      });

      // First claim
      const firstResult = earnPremiumSystem.claimReward(status, EarnPremiumAchievementType.STREAK_30_DAYS);
      expect(firstResult.success).toBe(true);

      // Second claim attempt
      const secondResult = earnPremiumSystem.claimReward(firstResult.status, EarnPremiumAchievementType.STREAK_30_DAYS);
      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toBe("Reward already claimed");
    });

    it("correctly calculates trial end date (7 days)", () => {
      const beforeClaim = Date.now();
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      });

      const result = earnPremiumSystem.claimReward(status, EarnPremiumAchievementType.STREAK_30_DAYS);

      const expectedEndDate = beforeClaim + 7 * 24 * 60 * 60 * 1000;
      expect(result.status.trialEndsAt).toBeGreaterThanOrEqual(expectedEndDate - 1000);
      expect(result.status.trialEndsAt).toBeLessThanOrEqual(expectedEndDate + 1000);
    });

    it("correctly calculates trial end date (3 days for level 20)", () => {
      const beforeClaim = Date.now();
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 0,
        defeatedBossIds: [],
        currentLevel: 20,
        existingStatus: null,
      });

      const result = earnPremiumSystem.claimReward(status, EarnPremiumAchievementType.LEVEL_20);

      const expectedEndDate = beforeClaim + 3 * 24 * 60 * 60 * 1000;
      expect(result.status.trialEndsAt).toBeGreaterThanOrEqual(expectedEndDate - 1000);
      expect(result.status.trialEndsAt).toBeLessThanOrEqual(expectedEndDate + 1000);
    });
  });

  describe("getAvailableRewards", () => {
    it("returns only unlocked and unclaimed rewards", () => {
      let status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: ["1", "2", "3", "4", "5", "6"],
        currentLevel: 20,
        existingStatus: null,
      });

      expect(earnPremiumSystem.getAvailableRewards(status)).toHaveLength(3);

      // Claim one reward
      const claimResult = earnPremiumSystem.claimReward(status, EarnPremiumAchievementType.STREAK_30_DAYS);

      expect(earnPremiumSystem.getAvailableRewards(claimResult.status)).toHaveLength(2);
    });
  });

  describe("getTrialTimeRemaining", () => {
    it("returns 0 when no active trial", () => {
      const status = earnPremiumSystem.createInitialStatus(mockUserId);
      expect(earnPremiumSystem.getTrialTimeRemaining(status)).toBe(0);
    });

    it("returns remaining time for active trial", () => {
      let status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      });

      const claimResult = earnPremiumSystem.claimReward(status, EarnPremiumAchievementType.STREAK_30_DAYS);

      const remaining = earnPremiumSystem.getTrialTimeRemaining(claimResult.status);
      expect(remaining).toBeGreaterThan(6 * 24 * 60 * 60 * 1000); // More than 6 days
      expect(remaining).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000); // Max 7 days
    });
  });

  describe("formatTrialTimeRemaining", () => {
    it("formats days remaining correctly", () => {
      const status = earnPremiumSystem.createInitialStatus(mockUserId);
      status.hasActiveTrial = true;
      status.trialEndsAt = Date.now() + 5 * 24 * 60 * 60 * 1000; // 5 days

      expect(earnPremiumSystem.formatTrialTimeRemaining(status)).toBe("5 days left");
    });

    it("formats hours remaining when less than 1 day", () => {
      const status = earnPremiumSystem.createInitialStatus(mockUserId);
      status.hasActiveTrial = true;
      status.trialEndsAt = Date.now() + 6 * 60 * 60 * 1000; // 6 hours

      expect(earnPremiumSystem.formatTrialTimeRemaining(status)).toBe("6 hours left");
    });

    it("returns expired when no time remaining", () => {
      const status = earnPremiumSystem.createInitialStatus(mockUserId);
      status.hasActiveTrial = false;

      expect(earnPremiumSystem.formatTrialTimeRemaining(status)).toBe("Trial expired");
    });
  });

  describe("refreshTrialStatus", () => {
    it("expires trial when end date has passed", () => {
      const status = earnPremiumSystem.createInitialStatus(mockUserId);
      status.hasActiveTrial = true;
      status.trialEndsAt = Date.now() - 1000; // 1 second ago

      const refreshed = earnPremiumSystem.refreshTrialStatus(status);

      expect(refreshed.hasActiveTrial).toBe(false);
      expect(refreshed.trialEndsAt).toBeNull();
    });

    it("keeps trial active when end date is in future", () => {
      const status = earnPremiumSystem.createInitialStatus(mockUserId);
      status.hasActiveTrial = true;
      status.trialEndsAt = Date.now() + 24 * 60 * 60 * 1000; // 1 day from now

      const refreshed = earnPremiumSystem.refreshTrialStatus(status);

      expect(refreshed.hasActiveTrial).toBe(true);
      expect(refreshed.trialEndsAt).not.toBeNull();
    });
  });

  describe("convenience functions", () => {
    it("checkEarnPremiumEligibility creates correct initial status", () => {
      const status = checkEarnPremiumEligibility(mockUserId, 0, [], 1, null);
      expect(status.userId).toBe(mockUserId);
      expect(status.rewards).toHaveLength(0);
    });

    it("claimEarnPremiumReward returns correct result", () => {
      let status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      });

      const result = claimEarnPremiumReward(status, EarnPremiumAchievementType.STREAK_30_DAYS);
      expect(result.success).toBe(true);
    });

    it("hasUnclaimedPremiumRewards returns true when unclaimed rewards exist", () => {
      const status = earnPremiumSystem.checkAndUnlock({
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      });

      expect(hasUnclaimedPremiumRewards(status)).toBe(true);
    });

    it("hasUnclaimedPremiumRewards returns false when no unclaimed rewards", () => {
      const status = earnPremiumSystem.createInitialStatus(mockUserId);
      expect(hasUnclaimedPremiumRewards(status)).toBe(false);
    });
  });

  describe("schemas", () => {
    it("EarnPremiumStatusSchema validates correct status", () => {
      const validStatus = {
        userId: mockUserId,
        rewards: [],
        hasActiveTrial: false,
        trialEndsAt: null,
        totalTrialsClaimed: 0,
      };

      const result = EarnPremiumStatusSchema.safeParse(validStatus);
      expect(result.success).toBe(true);
    });

    it("CheckEligibilityInputSchema validates correct input", () => {
      const validInput = {
        userId: mockUserId,
        streakDays: 30,
        defeatedBossIds: ["1", "2", "3"],
        currentLevel: 20,
        existingStatus: null,
      };

      const result = CheckEligibilityInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("CheckEligibilityInputSchema rejects invalid UUID", () => {
      const invalidInput = {
        userId: "not-a-uuid",
        streakDays: 30,
        defeatedBossIds: [],
        currentLevel: 1,
        existingStatus: null,
      };

      const result = CheckEligibilityInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
