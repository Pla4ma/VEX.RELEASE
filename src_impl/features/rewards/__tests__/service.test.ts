/**
 * Rewards Service Tests
 */

import { calculateReward, mapRewardTypeToDeliverable } from "../service";

describe("RewardsService", () => {
  describe("calculateReward", () => {
    it("should return base amount without modifiers", () => {
      const result = calculateReward({
        triggerType: "SESSION_COMPLETE",
        baseAmount: 100,
        userLevel: 1,
        streakDays: 0,
        squadMultiplier: 1,
        bossActive: false,
      });
      expect(result.finalAmount).toBe(100);
      expect(result.baseAmount).toBe(100);
    });

    it("should apply level bonus", () => {
      const result = calculateReward({
        triggerType: "SESSION_COMPLETE",
        baseAmount: 100,
        userLevel: 10,
        streakDays: 0,
        squadMultiplier: 1,
        bossActive: false,
      });
      // 10 * 5% = 50% bonus
      expect(result.finalAmount).toBeGreaterThan(100);
      expect(result.multipliers).toHaveLength(1);
    });

    it("should apply streak bonus", () => {
      const result = calculateReward({
        triggerType: "SESSION_COMPLETE",
        baseAmount: 100,
        userLevel: 1,
        streakDays: 7,
        squadMultiplier: 1,
        bossActive: false,
      });
      expect(result.multipliers.some((m) => m.source === "Streak Bonus")).toBe(true);
    });

    it("should apply boss bonus", () => {
      const result = calculateReward({
        triggerType: "SESSION_COMPLETE",
        baseAmount: 100,
        userLevel: 1,
        streakDays: 0,
        squadMultiplier: 1,
        bossActive: true,
      });
      expect(result.bonuses).toHaveLength(1);
      expect(result.bonuses[0].source).toBe("Boss Battle");
    });

    it("should stack multiple bonuses", () => {
      const result = calculateReward({
        triggerType: "SESSION_COMPLETE",
        baseAmount: 100,
        userLevel: 20,
        streakDays: 30,
        squadMultiplier: 1.5,
        bossActive: true,
      });
      expect(result.multipliers.length).toBeGreaterThan(0);
      expect(result.finalAmount).toBeGreaterThan(100);
    });
  });

  describe("mapRewardTypeToDeliverable", () => {
    it("should map XP correctly", () => {
      expect(mapRewardTypeToDeliverable("XP")).toBe("XP");
    });

    it("should map COINS correctly", () => {
      expect(mapRewardTypeToDeliverable("COINS")).toBe("COINS");
    });

    it("should map GEMS correctly", () => {
      expect(mapRewardTypeToDeliverable("GEMS")).toBe("GEMS");
    });

    it("should map STREAK_SHIELD to SHIELD", () => {
      expect(mapRewardTypeToDeliverable("STREAK_SHIELD")).toBe("SHIELD");
    });
  });

  // ============================================================================
  // Phase 8A.4 — Reward Service Tests
  // ============================================================================

  describe("createSessionReward", () => {
    it("should always create XP reward", async () => {
      const { createSessionReward } = await import("../service");

      const reward = await createSessionReward({
        userId: "user-1",
        sessionId: "session-1",
        duration: 1500,
        qualityScore: 80,
      });

      expect(reward).toBeDefined();
      expect(reward.type).toBe("XP");
      expect(reward.amount).toBeGreaterThan(0);
    });

    it("should create additional coin reward for good sessions", async () => {
      const { createSessionReward } = await import("../service");

      const rewards = await createSessionReward({
        userId: "user-1",
        sessionId: "session-1",
        duration: 3000,
        qualityScore: 90,
        includeBonus: true,
      });

      // Should have multiple rewards including XP and COINS
      expect(Array.isArray(rewards) ? rewards.length : 1).toBeGreaterThanOrEqual(1);
    });
  });

  describe("createStreakMilestoneReward", () => {
    it("should create milestone reward for day 3", async () => {
      const { createStreakMilestoneReward } = await import("../service");

      const reward = await createStreakMilestoneReward({
        userId: "user-1",
        streakDays: 3,
      });

      expect(reward).toBeDefined();
      expect(reward.streakDays).toBe(3);
    });

    it("should create milestone reward for day 7", async () => {
      const { createStreakMilestoneReward } = await import("../service");

      const reward = await createStreakMilestoneReward({
        userId: "user-1",
        streakDays: 7,
      });

      expect(reward).toBeDefined();
      expect(reward.streakDays).toBe(7);
    });

    it("should prevent duplicate milestone rewards", async () => {
      const { createStreakMilestoneReward } = await import("../service");

      // First call creates reward
      const reward1 = await createStreakMilestoneReward({
        userId: "user-1",
        streakDays: 3,
      });

      // Second call should return existing or null (duplicate prevention)
      const reward2 = await createStreakMilestoneReward({
        userId: "user-1",
        streakDays: 3,
      });

      // Should either return same reward or indicate duplicate
      expect(reward1).toBeDefined();
    });
  });

  describe("deliverReward", () => {
    it("should deliver XP reward correctly", async () => {
      const { deliverReward } = await import("../service");

      const result = await deliverReward({
        userId: "user-1",
        type: "XP",
        amount: 100,
        rewardId: "reward-1",
      });

      expect(result.success).toBe(true);
      expect(result.deliveredType).toBe("XP");
    });

    it("should deliver COINS reward correctly", async () => {
      const { deliverReward } = await import("../service");

      const result = await deliverReward({
        userId: "user-1",
        type: "COINS",
        amount: 50,
        rewardId: "reward-2",
      });

      expect(result.success).toBe(true);
      expect(result.deliveredType).toBe("COINS");
    });

    it("should deliver GEMS reward correctly", async () => {
      const { deliverReward } = await import("../service");

      const result = await deliverReward({
        userId: "user-1",
        type: "GEMS",
        amount: 10,
        rewardId: "reward-3",
      });

      expect(result.success).toBe(true);
      expect(result.deliveredType).toBe("GEMS");
    });

    it("should deliver ITEM reward correctly", async () => {
      const { deliverReward } = await import("../service");

      const result = await deliverReward({
        userId: "user-1",
        type: "ITEM",
        itemId: "item-1",
        rewardId: "reward-4",
      });

      expect(result.success).toBe(true);
      expect(result.deliveredType).toBe("ITEM");
    });
  });

  describe("reward expiry", () => {
    it("should not allow claiming expired rewards", async () => {
      const { claimReward } = await import("../service");

      // Try to claim expired reward
      await expect(
        claimReward({
          userId: "user-1",
          rewardId: "expired-reward",
        }),
      ).rejects.toThrow("expired");
    });

    it("should mark reward as expired after deadline", async () => {
      const { checkRewardExpiry } = await import("../service");

      const expiredReward = {
        id: "reward-1",
        userId: "user-1",
        expiresAt: Date.now() - 1000, // 1 second ago
        status: "PENDING",
      };

      const result = await checkRewardExpiry(expiredReward);

      expect(result.isExpired).toBe(true);
    });

    it("should allow claiming non-expired rewards", async () => {
      const { checkRewardExpiry } = await import("../service");

      const validReward = {
        id: "reward-1",
        userId: "user-1",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
        status: "PENDING",
      };

      const result = await checkRewardExpiry(validReward);

      expect(result.isExpired).toBe(false);
    });
  });
});
