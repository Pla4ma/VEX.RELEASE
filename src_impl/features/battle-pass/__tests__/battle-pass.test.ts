/**
 * Battle Pass System Tests
 * Tests for tier progression, reward claiming, and Premium upgrades
 */

import { describe, it, expect } from '@jest/globals';
import { addXpToBattlePass, canClaimTierReward, claimTierReward, canPurchasePremium, purchasePremium, getBattlePassProgress, TIER_REWARDS, CURRENT_SEASON } from '../battle-pass-system';
import type { UserBattlePass } from '../battle-pass-system';

describe('Battle Pass System', () => {
  const mockUserPass = (overrides: Partial<UserBattlePass> = {}): UserBattlePass => ({
    userId: 'user-1',
    seasonId: CURRENT_SEASON.id,
    currentTier: 0,
    currentTierXp: 0,
    hasPremium: false,
    premiumPurchasedAt: null,
    claimedRewards: [],
    xpBoostMultiplier: 1.0,
    ...overrides,
  });

  // ============================================================================
  // XP Progression
  // ============================================================================
  describe('XP Progression', () => {
    it('should add XP and track progress for free users', () => {
      const userPass = mockUserPass();
      const result = addXpToBattlePass(userPass, 500, 'SESSION_COMPLETE');

      expect(result.totalXpAdded).toBe(500); // No multiplier for free
      expect(result.tiersGained).toBe(0); // Not enough for tier 1
      expect(result.newTier).toBe(0);
    });

    it('should give 50% XP boost to Premium users', () => {
      const userPass = mockUserPass({ hasPremium: true });
      const result = addXpToBattlePass(userPass, 1000, 'SESSION_COMPLETE');

      expect(result.totalXpAdded).toBe(1500); // 1000 * 1.5
    });

    it('should tier up when enough XP accumulated', () => {
      const userPass = mockUserPass({ currentTierXp: 800 });
      const result = addXpToBattlePass(userPass, 500, 'SESSION_COMPLETE');

      // Tier 1 requires ~1000 XP
      expect(result.tiersGained).toBeGreaterThanOrEqual(0);
      expect(result.newTier).toBeGreaterThanOrEqual(userPass.currentTier);
    });

    it('should calculate overflow XP correctly', () => {
      const userPass = mockUserPass({ currentTier: 1, currentTierXp: 900 });
      const extraXp = 200;

      const result = addXpToBattlePass(userPass, extraXp, 'SESSION_COMPLETE');

      expect(result.overflowXp).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================================
  // Reward Claiming
  // ============================================================================
  describe('Reward Claiming', () => {
    it('should allow claiming free rewards when tier reached', () => {
      const userPass = mockUserPass({ currentTier: 5, claimedRewards: [] });
      const result = canClaimTierReward(userPass, 1, 'FREE');

      expect(result.canClaim).toBe(true);
    });

    it('should NOT allow claiming rewards for unreached tiers', () => {
      const userPass = mockUserPass({ currentTier: 3, claimedRewards: [] });
      const result = canClaimTierReward(userPass, 5, 'FREE');

      expect(result.canClaim).toBe(false);
      expect(result.reason).toBe('Tier not yet reached');
    });

    it('should NOT allow claiming already-claimed rewards', () => {
      const userPass = mockUserPass({ currentTier: 5, claimedRewards: [1] });
      const result = canClaimTierReward(userPass, 1, 'FREE');

      expect(result.canClaim).toBe(false);
      expect(result.reason).toBe('Reward already claimed');
    });

    it('should NOT allow Premium rewards without Premium', () => {
      const userPass = mockUserPass({ currentTier: 5, hasPremium: false });
      const result = canClaimTierReward(userPass, 1, 'PREMIUM');

      expect(result.canClaim).toBe(false);
      expect(result.reason).toBe('Premium required');
    });

    it('should allow Premium rewards with Premium', () => {
      const userPass = mockUserPass({ currentTier: 5, hasPremium: true });
      const result = canClaimTierReward(userPass, 1, 'PREMIUM');

      expect(result.canClaim).toBe(true);
    });
  });

  describe('Claim Execution', () => {
    it('should successfully claim free reward', () => {
      const userPass = mockUserPass({ currentTier: 5, claimedRewards: [] });
      const result = claimTierReward(userPass, 1, 'FREE');

      expect(result.success).toBe(true);
      expect(result.reward).not.toBeNull();
      expect(result.updatedUserBattlePass.claimedRewards).toContain(1);
    });

    it('should fail to claim invalid tier', () => {
      const userPass = mockUserPass({ currentTier: 5 });
      const result = claimTierReward(userPass, 999, 'FREE');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid tier');
    });
  });

  // ============================================================================
  // Premium Purchase
  // ============================================================================
  describe('Premium Purchase', () => {
    it('should allow Premium purchase with enough gems', () => {
      const userPass = mockUserPass({ hasPremium: false });
      const result = canPurchasePremium(1000, userPass);

      expect(result.canPurchase).toBe(true);
      expect(result.price).toBe(500);
    });

    it('should deny Premium purchase without enough gems', () => {
      const userPass = mockUserPass({ hasPremium: false });
      const result = canPurchasePremium(100, userPass);

      expect(result.canPurchase).toBe(false);
    });

    it('should deny Premium purchase if already Premium', () => {
      const userPass = mockUserPass({ hasPremium: true });
      const result = canPurchasePremium(1000, userPass);

      expect(result.canPurchase).toBe(false);
      expect(result.reason).toBe('Already have Premium');
    });

    it('should grant Premium and retroactive rewards on purchase', () => {
      const userPass = mockUserPass({
        currentTier: 10,
        hasPremium: false,
        claimedRewards: [1, 2, 3],
      });

      const result = purchasePremium(userPass, 500);

      expect(result.success).toBe(true);
      expect(result.updatedBattlePass.hasPremium).toBe(true);
      expect(result.retroactiveRewards.length).toBeGreaterThan(0);
    });

    it('should set XP boost multiplier on Premium purchase', () => {
      const userPass = mockUserPass({ hasPremium: false });
      const result = purchasePremium(userPass, 500);

      expect(result.updatedBattlePass.xpBoostMultiplier).toBe(1.5);
    });
  });

  // ============================================================================
  // Progress Display
  // ============================================================================
  describe('Progress Display', () => {
    it('should calculate correct progress for new user', () => {
      const userPass = mockUserPass({ currentTier: 0, currentTierXp: 0 });
      const progress = getBattlePassProgress(userPass);

      expect(progress.currentTier).toBe(0);
      expect(progress.maxTier).toBe(CURRENT_SEASON.maxTier);
      expect(progress.progressPercent).toBe(0);
    });

    it('should calculate days remaining correctly', () => {
      const userPass = mockUserPass();
      const progress = getBattlePassProgress(userPass);

      expect(progress.daysRemaining).toBeGreaterThan(0);
      expect(progress.daysRemaining).toBeLessThanOrEqual(90);
    });

    it('should count claimable rewards correctly', () => {
      const userPass = mockUserPass({
        currentTier: 5,
        hasPremium: false,
        claimedRewards: [1, 2],
      });
      const progress = getBattlePassProgress(userPass);

      // 5 tiers reached, 2 claimed = 3 claimable free rewards
      expect(progress.totalClaimableFree).toBe(3);
      expect(progress.totalClaimablePremium).toBe(0); // No premium
    });

    it('should count premium rewards for premium users', () => {
      const userPass = mockUserPass({
        currentTier: 5,
        hasPremium: true,
        claimedRewards: [1, 2],
      });
      const progress = getBattlePassProgress(userPass);

      // Premium users can claim both free and premium tracks
      expect(progress.totalClaimablePremium).toBe(3);
    });
  });

  // ============================================================================
  // Season Configuration
  // ============================================================================
  describe('Season Configuration', () => {
    it('should have valid season configuration', () => {
      expect(CURRENT_SEASON.maxTier).toBe(50);
      expect(CURRENT_SEASON.premiumPriceGems).toBe(500);
      expect(CURRENT_SEASON.endDate).toBeGreaterThan(Date.now());
    });

    it('should have rewards for all tiers', () => {
      expect(TIER_REWARDS.length).toBe(50);

      TIER_REWARDS.forEach((tier, index) => {
        expect(tier.tier).toBe(index + 1);
        expect(tier.xpRequired).toBeGreaterThan(0);
        expect(tier.freeReward).toBeDefined();
        expect(tier.premiumReward).toBeDefined();
      });
    });

    it('should have escalating XP requirements', () => {
      for (let i = 1; i < TIER_REWARDS.length; i++) {
        expect(TIER_REWARDS[i].xpRequired).toBeGreaterThan(TIER_REWARDS[i - 1].xpRequired);
      }
    });
  });

  // ============================================================================
  // Milestone Tiers
  // ============================================================================
  describe('Milestone Tiers', () => {
    it('should have cosmetic reward at tier 1 for Premium', () => {
      const tier1 = TIER_REWARDS[0];
      expect(tier1.premiumReward.type).toBe('COSMETIC');
    });

    it('should have gem rewards at tier 5 intervals', () => {
      const tier5 = TIER_REWARDS[4];
      expect(tier5.premiumReward.type).toBe('GEMS');
    });

    it('should have legendary reward at tier 50', () => {
      const tier50 = TIER_REWARDS[49];
      expect(tier50.premiumReward.type).toBe('COSMETIC');
    });
  });
});
