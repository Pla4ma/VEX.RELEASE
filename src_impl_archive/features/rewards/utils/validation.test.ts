/**
 * Rewards Validation Tests
 *
 * @phase 3 - Deepening: Validation tests
 */

import {
  validateChestReward,
  validateDailyLogin,
  validateLedgerBalance,
  ChestTierSchema,
  RewardItemSchema,
  type ChestReward,
  type ChestTier,
} from './validation';

describe('Rewards Validation', () => {
  describe('validateChestReward', () => {
    it('should validate a normal chest reward', () => {
      const reward: ChestReward = {
        chestId: 'chest-1',
        userId: 'user-1',
        tier: 'GOLD',
        items: [
          { id: 'item-1', type: 'COINS', amount: 100 },
          { id: 'item-2', type: 'XP', amount: 50 },
        ],
        totalValue: 150,
        openedAt: Date.now(),
      };

      const result = validateChestReward(reward, {
        recentChests: [],
        totalChestsOpened: 10,
        rareDropsInLast24h: 0,
      });

      expect(result.valid).toBe(true);
    });

    it('should detect value outside tier range', () => {
      const reward: ChestReward = {
        chestId: 'chest-1',
        userId: 'user-1',
        tier: 'WOOD',
        items: [{ id: 'item-1', type: 'COINS', amount: 1000 }],
        totalValue: 1000,
        openedAt: Date.now(),
      };

      const result = validateChestReward(reward, {
        recentChests: [],
        totalChestsOpened: 10,
        rareDropsInLast24h: 0,
      });

      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.type === 'VALUE_MISMATCH')).toBe(true);
    });

    it('should detect duplicate chest', () => {
      const now = Date.now();
      const reward: ChestReward = {
        chestId: 'chest-1',
        userId: 'user-1',
        tier: 'GOLD',
        items: [{ id: 'item-1', type: 'COINS', amount: 100 }],
        totalValue: 100,
        openedAt: now,
      };

      const result = validateChestReward(reward, {
        recentChests: [reward],
        totalChestsOpened: 11,
        rareDropsInLast24h: 0,
      });

      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.type === 'DUPLICATE')).toBe(true);
    });
  });

  describe('validateDailyLogin', () => {
    it('should validate first login of the day', () => {
      const result = validateDailyLogin(
        { userId: 'user-1', day: 1, claimedAt: Date.now(), expectedReward: { id: 'r1', type: 'COINS', amount: 100 } },
        { lastClaimDate: null, consecutiveDays: 0, totalClaims: 0 }
      );

      expect(result.valid).toBe(true);
    });
  });

  describe('validateLedgerBalance', () => {
    it('should validate correct balance', () => {
      const result = validateLedgerBalance('user-1', {
        transactions: [
          { type: 'EARN', amount: 100, timestamp: Date.now() },
          { type: 'EARN', amount: 50, timestamp: Date.now() },
          { type: 'SPEND', amount: 30, timestamp: Date.now() },
        ],
        currentBalance: 120,
      });

      expect(result.valid).toBe(true);
      expect(result.data?.discrepancy).toBe(0);
    });

    it('should detect balance discrepancy', () => {
      const result = validateLedgerBalance('user-1', {
        transactions: [
          { type: 'EARN', amount: 100, timestamp: Date.now() },
        ],
        currentBalance: 200,
      });

      expect(result.valid).toBe(false);
      expect(result.data?.discrepancy).toBe(100);
    });
  });

  describe('schemas', () => {
    it('should validate chest tier', () => {
      expect(ChestTierSchema.parse('GOLD')).toBe('GOLD');
      expect(() => ChestTierSchema.parse('INVALID' as ChestTier)).toThrow();
    });

    it('should validate reward item', () => {
      const validItem = { id: 'item-1', type: 'COINS', amount: 100 };
      expect(RewardItemSchema.parse(validItem)).toEqual(validItem);
    });
  });
});
