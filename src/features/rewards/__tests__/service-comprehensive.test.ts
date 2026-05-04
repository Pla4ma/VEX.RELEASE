/**
 * Comprehensive Rewards Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateReward,
  createReward,
  claimReward,
  getPendingRewards,
  getRewardStats,
  mapRewardTypeToDeliverable,
  processExpiredRewards,
} from '../service';
import * as repository from '../repository';
import { eventBus } from '../../../events';

vi.mock('../repository');
vi.mock('../../../events', () => ({
  eventBus: {
    publish: vi.fn(),
  },
}));

describe('Rewards Service - Comprehensive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Reward Calculation Tests
  // ============================================================================

  describe('calculateReward', () => {
    it('should calculate base amount without modifiers', () => {
      const result = calculateReward({
        triggerType: 'SESSION_COMPLETE',
        baseAmount: 100,
        userLevel: 1,
        streakDays: 0,
        squadMultiplier: 1,
        bossActive: false,
      });

      expect(result.finalAmount).toBe(100);
      expect(result.baseAmount).toBe(100);
      expect(result.multipliers).toHaveLength(0);
    });

    it('should apply level bonus', () => {
      const result = calculateReward({
        triggerType: 'SESSION_COMPLETE',
        baseAmount: 100,
        userLevel: 10,
        streakDays: 0,
        squadMultiplier: 1,
        bossActive: false,
      });

      // 10 * 5% = 50% bonus
      expect(result.finalAmount).toBe(150);
      expect(result.multipliers).toHaveLength(1);
      expect(result.multipliers[0].source).toBe('Level Bonus');
    });

    it('should apply streak bonus', () => {
      const result = calculateReward({
        triggerType: 'SESSION_COMPLETE',
        baseAmount: 100,
        userLevel: 1,
        streakDays: 7,
        squadMultiplier: 1,
        bossActive: false,
      });

      expect(result.multipliers.some(m => m.source === 'Streak Bonus')).toBe(true);
    });

    it('should scale streak bonus with days', () => {
      const weekStreak = calculateReward({
        triggerType: 'SESSION_COMPLETE',
        baseAmount: 100,
        userLevel: 1,
        streakDays: 7,
        squadMultiplier: 1,
        bossActive: false,
      });

      const monthStreak = calculateReward({
        triggerType: 'SESSION_COMPLETE',
        baseAmount: 100,
        userLevel: 1,
        streakDays: 30,
        squadMultiplier: 1,
        bossActive: false,
      });

      expect(monthStreak.finalAmount).toBeGreaterThan(weekStreak.finalAmount);
    });

    it('should apply squad bonus', () => {
      const result = calculateReward({
        triggerType: 'SESSION_COMPLETE',
        baseAmount: 100,
        userLevel: 1,
        streakDays: 0,
        squadMultiplier: 1.5,
        bossActive: false,
      });

      expect(result.multipliers.some(m => m.source === 'Squad Bonus')).toBe(true);
    });

    it('should apply boss bonus', () => {
      const result = calculateReward({
        triggerType: 'SESSION_COMPLETE',
        baseAmount: 100,
        userLevel: 1,
        streakDays: 0,
        squadMultiplier: 1,
        bossActive: true,
      });

      expect(result.bonuses).toHaveLength(1);
      expect(result.bonuses[0].source).toBe('Boss Battle');
    });

    it('should stack multiple bonuses', () => {
      const result = calculateReward({
        triggerType: 'SESSION_COMPLETE',
        baseAmount: 100,
        userLevel: 20,
        streakDays: 30,
        squadMultiplier: 1.5,
        bossActive: true,
      });

      expect(result.multipliers.length).toBeGreaterThan(0);
      expect(result.bonuses.length).toBeGreaterThan(0);
      expect(result.finalAmount).toBeGreaterThan(300); // Significantly boosted
    });

    it('should floor final amount', () => {
      const result = calculateReward({
        triggerType: 'SESSION_COMPLETE',
        baseAmount: 1,
        userLevel: 1,
        streakDays: 0,
        squadMultiplier: 1.1, // Would make 1.1
        bossActive: false,
      });

      expect(Number.isInteger(result.finalAmount)).toBe(true);
    });
  });

  // ============================================================================
  // Reward Creation Tests
  // ============================================================================

  describe('createReward', () => {
    it('should create reward with calculated amount', async () => {
      vi.mocked(repository.checkDuplicateReward).mockResolvedValue(false);
      vi.mocked(repository.createReward).mockResolvedValue({
        id: 'reward-1',
        userId: 'user-1',
        type: 'XP',
        amount: 150,
        status: 'PENDING',
        triggerType: 'SESSION_COMPLETE',
      } as any);
      vi.mocked(repository.recordLedgerEntry).mockResolvedValue({} as any);

      const result = await createReward({
        userId: 'user-1',
        type: 'XP',
        amount: 150,
        triggerType: 'SESSION_COMPLETE',
      });

      expect(result.id).toBe('reward-1');
      expect(repository.recordLedgerEntry).toHaveBeenCalled();
    });

    it('should prevent duplicate rewards', async () => {
      vi.mocked(repository.checkDuplicateReward).mockResolvedValue(true);

      await expect(createReward({
        userId: 'user-1',
        type: 'XP',
        amount: 100,
        triggerType: 'SESSION_COMPLETE',
        triggerId: 'session-1',
      })).rejects.toThrow('Duplicate reward');
    });

    it('should allow duplicates if explicitly allowed', async () => {
      vi.mocked(repository.checkDuplicateReward).mockResolvedValue(false);
      vi.mocked(repository.createReward).mockResolvedValue({
        id: 'reward-1',
        status: 'PENDING',
      } as any);
      vi.mocked(repository.recordLedgerEntry).mockResolvedValue({} as any);

      // Daily login rewards are allowed to duplicate (daily)
      const result = await createReward({
        userId: 'user-1',
        type: 'COINS',
        amount: 10,
        triggerType: 'DAILY_LOGIN',
      });

      expect(result).toBeDefined();
    });
  });

  // ============================================================================
  // Reward Claiming Tests
  // ============================================================================

  describe('claimReward', () => {
    it('should claim pending reward', async () => {
      vi.mocked(repository.fetchReward).mockResolvedValue({
        id: 'reward-1',
        userId: 'user-1',
        type: 'XP',
        amount: 100,
        status: 'PENDING',
        expiresAt: null,
      } as any);
      vi.mocked(repository.markRewardClaimed).mockResolvedValue({} as any);
      vi.mocked(repository.recordLedgerEntry).mockResolvedValue({} as any);

      const result = await claimReward({
        rewardId: 'reward-1',
        userId: 'user-1',
      });

      expect(result.success).toBe(true);
      expect(result.deliverables).toHaveLength(1);
      expect(eventBus.publish).toHaveBeenCalledWith('reward:claimed', expect.any(Object));
    });

    it('should reject claim for wrong user', async () => {
      vi.mocked(repository.fetchReward).mockResolvedValue({
        id: 'reward-1',
        userId: 'user-2',
        type: 'XP',
        amount: 100,
        status: 'PENDING',
      } as any);

      await expect(claimReward({
        rewardId: 'reward-1',
        userId: 'user-1',
      })).rejects.toThrow('Unauthorized');
    });

    it('should reject claim for non-pending reward', async () => {
      vi.mocked(repository.fetchReward).mockResolvedValue({
        id: 'reward-1',
        userId: 'user-1',
        type: 'XP',
        amount: 100,
        status: 'CLAIMED',
      } as any);

      await expect(claimReward({
        rewardId: 'reward-1',
        userId: 'user-1',
      })).rejects.toThrow('CLAIMED');
    });

    it('should reject expired reward', async () => {
      vi.mocked(repository.fetchReward).mockResolvedValue({
        id: 'reward-1',
        userId: 'user-1',
        type: 'XP',
        amount: 100,
        status: 'PENDING',
        expiresAt: Date.now() - 1000,
      } as any);
      vi.mocked(repository.markRewardExpired).mockResolvedValue({} as any);

      await expect(claimReward({
        rewardId: 'reward-1',
        userId: 'user-1',
      })).rejects.toThrow('expired');
    });

    it('should handle partial delivery failure', async () => {
      vi.mocked(repository.fetchReward).mockResolvedValue({
        id: 'reward-1',
        userId: 'user-1',
        type: 'ITEM',
        amount: 1,
        status: 'PENDING',
        expiresAt: null,
      } as any);
      vi.mocked(repository.markRewardFailed).mockResolvedValue({} as any);
      vi.mocked(repository.recordLedgerEntry).mockResolvedValue({} as any);

      const result = await claimReward({
        rewardId: 'reward-1',
        userId: 'user-1',
      });

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Reward Type Mapping Tests
  // ============================================================================

  describe('mapRewardTypeToDeliverable', () => {
    it('should map XP correctly', () => {
      expect(mapRewardTypeToDeliverable('XP')).toBe('XP');
    });

    it('should map COINS correctly', () => {
      expect(mapRewardTypeToDeliverable('COINS')).toBe('COINS');
    });

    it('should map GEMS correctly', () => {
      expect(mapRewardTypeToDeliverable('GEMS')).toBe('GEMS');
    });

    it('should map STREAK_SHIELD to SHIELD', () => {
      expect(mapRewardTypeToDeliverable('STREAK_SHIELD')).toBe('SHIELD');
    });

    it('should default to XP for unknown types', () => {
      expect(mapRewardTypeToDeliverable('UNKNOWN')).toBe('XP');
    });
  });

  // ============================================================================
  // Stats Tests
  // ============================================================================

  describe('getRewardStats', () => {
    it('should calculate correct stats', async () => {
      vi.mocked(repository.fetchRewards).mockResolvedValue([
        { id: '1', userId: 'user-1', type: 'XP', amount: 100, status: 'CLAIMED' },
        { id: '2', userId: 'user-1', type: 'XP', amount: 50, status: 'CLAIMED' },
        { id: '3', userId: 'user-1', type: 'COINS', amount: 200, status: 'CLAIMED' },
        { id: '4', userId: 'user-1', type: 'GEMS', amount: 10, status: 'PENDING' },
        { id: '5', userId: 'user-1', type: 'XP', amount: 75, status: 'PENDING' },
      ] as any);

      const stats = await getRewardStats('user-1');

      expect(stats.totalRewards).toBe(5);
      expect(stats.pendingRewards).toBe(2);
      expect(stats.claimedRewards).toBe(3);
      expect(stats.totalXp).toBe(150);
      expect(stats.totalCoins).toBe(200);
      expect(stats.totalGems).toBe(0); // Pending not counted
    });

    it('should handle empty rewards', async () => {
      vi.mocked(repository.fetchRewards).mockResolvedValue([]);

      const stats = await getRewardStats('user-1');

      expect(stats.totalRewards).toBe(0);
      expect(stats.totalXp).toBe(0);
    });
  });

  // ============================================================================
  // Expired Rewards Tests
  // ============================================================================

  describe('processExpiredRewards', () => {
    it('should mark expired rewards', async () => {
      vi.mocked(repository.fetchExpiredRewards).mockResolvedValue([
        { id: '1', status: 'PENDING' },
        { id: '2', status: 'PENDING' },
      ] as any);
      vi.mocked(repository.markRewardExpired).mockResolvedValue({} as any);
      vi.mocked(repository.recordLedgerEntry).mockResolvedValue({} as any);

      const count = await processExpiredRewards();

      expect(count).toBe(2);
      expect(repository.markRewardExpired).toHaveBeenCalledTimes(2);
      expect(repository.recordLedgerEntry).toHaveBeenCalledTimes(2);
    });

    it('should handle no expired rewards', async () => {
      vi.mocked(repository.fetchExpiredRewards).mockResolvedValue([]);

      const count = await processExpiredRewards();

      expect(count).toBe(0);
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('should emit events on reward claim', async () => {
      vi.mocked(repository.fetchReward).mockResolvedValue({
        id: 'reward-1',
        userId: 'user-1',
        type: 'XP',
        amount: 100,
        status: 'PENDING',
        expiresAt: null,
      } as any);
      vi.mocked(repository.markRewardClaimed).mockResolvedValue({} as any);
      vi.mocked(repository.recordLedgerEntry).mockResolvedValue({} as any);

      await claimReward({
        rewardId: 'reward-1',
        userId: 'user-1',
      });

      expect(eventBus.publish).toHaveBeenCalledWith('progression:add_xp', {
        userId: 'user-1',
        amount: 100,
        source: 'REWARD',
      });
    });

    it('should emit economy events for currency', async () => {
      vi.mocked(repository.fetchReward).mockResolvedValue({
        id: 'reward-1',
        userId: 'user-1',
        type: 'COINS',
        amount: 100,
        status: 'PENDING',
        expiresAt: null,
      } as any);
      vi.mocked(repository.markRewardClaimed).mockResolvedValue({} as any);
      vi.mocked(repository.recordLedgerEntry).mockResolvedValue({} as any);

      await claimReward({
        rewardId: 'reward-1',
        userId: 'user-1',
      });

      expect(eventBus.publish).toHaveBeenCalledWith('economy:add_currency', {
        userId: 'user-1',
        type: 'COINS',
        amount: 100,
        source: 'REWARD',
      });
    });
  });
});
