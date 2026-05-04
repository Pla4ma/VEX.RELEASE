/**
 * Seasons Service Enhanced - Comprehensive Test Suite
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as service from '../service-enhanced';
import * as repository from '../repository';
import { eventBus } from '../../../events';
import type { Season, UserSeasonProgress } from '../schemas';

// ============================================================================
// Mock Dependencies
// ============================================================================

jest.mock('../repository');
jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
  },
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

// ============================================================================
// Test Data
// ============================================================================

const mockSeason: Season = {
  id: 'season-123',
  name: 'Test Season',
  description: 'A test season',
  theme: 'cyber',
  startAt: Date.now() - 1000,
  endAt: Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
  archivedAt: null,
  tierCount: 50,
  xpPerTier: 1000,
  premiumPriceGems: 499,
  isActive: true,
  createdAt: Date.now(),
};

const mockUserProgress: UserSeasonProgress = {
  id: 'progress-123',
  userId: 'user-123',
  seasonId: 'season-123',
  currentTier: 5,
  tierXp: 500,
  totalSeasonXp: 5500,
  isPremium: false,
  premiumPurchasedAt: null,
  claimedTiers: ['tier-1', 'tier-2', 'tier-3'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// ============================================================================
// Tests
// ============================================================================

describe('Seasons Service Enhanced', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Retry Logic', () => {
    it('should retry on network errors', async () => {
      const mockFetch = jest.spyOn(repository, 'fetchActiveSeason')
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValueOnce(mockSeason);

      const result = await service.getActiveSeasonWithRetry();

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockSeason);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockFetch = jest.spyOn(repository, 'fetchActiveSeason')
        .mockRejectedValue(new Error('Not found'));

      await expect(service.getActiveSeasonWithRetry()).rejects.toThrow('Not found');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      const mockFetch = jest.spyOn(repository, 'fetchActiveSeason')
        .mockRejectedValue(new Error('Network timeout'));

      await expect(service.getActiveSeasonWithRetry()).rejects.toThrow('Network timeout');
      expect(mockFetch).toHaveBeenCalledTimes(3); // CONFIG.MAX_RETRIES
    });
  });

  describe('Idempotency', () => {
    it('should return cached result for duplicate idempotency key', async () => {
      const mockProgress = { ...mockUserProgress, currentTier: 5, tierXp: 500 };

      jest.spyOn(repository, 'fetchUserSeasonProgress')
        .mockResolvedValue(mockProgress);
      jest.spyOn(repository, 'fetchSeasonById')
        .mockResolvedValue(mockSeason);
      jest.spyOn(repository, 'updateUserSeasonProgress')
        .mockResolvedValue({ ...mockProgress, tierXp: 1500, currentTier: 6 });

      const idempotencyKey = 'test-key-123';

      // First call
      const result1 = await service.advanceTierWithIdempotency({
        userId: 'user-123',
        seasonId: 'season-123',
        xpAmount: 1000,
        source: 'TEST',
        idempotencyKey,
      });

      // Second call with same key should return cached
      const result2 = await service.advanceTierWithIdempotency({
        userId: 'user-123',
        seasonId: 'season-123',
        xpAmount: 999, // Different amount should be ignored due to idempotency
        source: 'TEST',
        idempotencyKey,
      });

      expect(result1).toEqual(result2);
      expect(repository.updateUserSeasonProgress).toHaveBeenCalledTimes(1);
    });

    it('should process different idempotency keys separately', async () => {
      const mockProgress = { ...mockUserProgress, currentTier: 5, tierXp: 500 };

      jest.spyOn(repository, 'fetchUserSeasonProgress')
        .mockResolvedValue(mockProgress);
      jest.spyOn(repository, 'fetchSeasonById')
        .mockResolvedValue(mockSeason);
      jest.spyOn(repository, 'updateUserSeasonProgress')
        .mockResolvedValue({ ...mockProgress, tierXp: 1500, currentTier: 6 });

      await service.advanceTierWithIdempotency({
        userId: 'user-123',
        seasonId: 'season-123',
        xpAmount: 1000,
        source: 'TEST',
        idempotencyKey: 'key-1',
      });

      await service.advanceTierWithIdempotency({
        userId: 'user-123',
        seasonId: 'season-123',
        xpAmount: 1000,
        source: 'TEST',
        idempotencyKey: 'key-2',
      });

      expect(repository.updateUserSeasonProgress).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw SeasonNotFoundError for missing season', async () => {
      jest.spyOn(repository, 'fetchSeasonById')
        .mockResolvedValue(null);

      await expect(
        service.getOrCreateUserProgressWithConflictResolution('user-123', 'missing-season')
      ).rejects.toThrow('Season not found');
    });

    it('should throw SeasonNotActiveError for archived season', async () => {
      const archivedSeason = { ...mockSeason, archivedAt: Date.now() };

      jest.spyOn(repository, 'fetchUserSeasonProgress')
        .mockResolvedValue(mockUserProgress);
      jest.spyOn(repository, 'fetchSeasonById')
        .mockResolvedValue(archivedSeason);

      await expect(
        service.advanceTierWithIdempotency({
          userId: 'user-123',
          seasonId: 'season-123',
          xpAmount: 1000,
          source: 'TEST',
        })
      ).rejects.toThrow('Season not active');
    });

    it('should handle concurrent modification with conflict resolution', async () => {
      // First call creates, second call should fetch instead
      jest.spyOn(repository, 'fetchUserSeasonProgress')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUserProgress);

      jest.spyOn(repository, 'createUserSeasonProgress')
        .mockRejectedValueOnce({ code: '23505', message: 'unique constraint violation' });

      const result = await service.getOrCreateUserProgressWithConflictResolution(
        'user-123',
        'season-123'
      );

      expect(result).toEqual(mockUserProgress);
    });
  });

  describe('Tier Progression', () => {
    it('should calculate correct tier advancement', async () => {
      const progress: UserSeasonProgress = {
        ...mockUserProgress,
        currentTier: 3,
        tierXp: 800,
        totalSeasonXp: 3800,
      };

      jest.spyOn(repository, 'fetchUserSeasonProgress')
        .mockResolvedValue(progress);
      jest.spyOn(repository, 'fetchSeasonById')
        .mockResolvedValue(mockSeason);
      jest.spyOn(repository, 'updateUserSeasonProgress')
        .mockImplementation(async (_, __, updates) => ({
          ...progress,
          ...updates,
          id: 'progress-123',
          userId: 'user-123',
          seasonId: 'season-123',
          isPremium: false,
          premiumPurchasedAt: null,
          claimedTiers: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }) as UserSeasonProgress);

      const result = await service.advanceTierWithIdempotency({
        userId: 'user-123',
        seasonId: 'season-123',
        xpAmount: 1500,
        source: 'TEST',
      });

      expect(result.newTier).toBe(5); // 800 + 1500 = 2300 -> 2 tiers gained
      expect(result.tiersGained).toBe(2);
      expect(result.overflowXp).toBe(300);
    });

    it('should cap at max tier', async () => {
      const progress: UserSeasonProgress = {
        ...mockUserProgress,
        currentTier: 49,
        tierXp: 900,
        totalSeasonXp: 49900,
      };

      jest.spyOn(repository, 'fetchUserSeasonProgress')
        .mockResolvedValue(progress);
      jest.spyOn(repository, 'fetchSeasonById')
        .mockResolvedValue(mockSeason);
      jest.spyOn(repository, 'updateUserSeasonProgress')
        .mockImplementation(async (_, __, updates) => ({
          ...progress,
          ...updates,
          id: 'progress-123',
          userId: 'user-123',
          seasonId: 'season-123',
          isPremium: false,
          premiumPurchasedAt: null,
          claimedTiers: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }) as UserSeasonProgress);

      const result = await service.advanceTierWithIdempotency({
        userId: 'user-123',
        seasonId: 'season-123',
        xpAmount: 5000,
        source: 'TEST',
      });

      expect(result.newTier).toBe(50); // Max tier
      expect(result.overflowXp).toBe(0);
    });

    it('should emit events for each tier gained', async () => {
      const progress: UserSeasonProgress = {
        ...mockUserProgress,
        currentTier: 1,
        tierXp: 100,
        totalSeasonXp: 1100,
      };

      jest.spyOn(repository, 'fetchUserSeasonProgress')
        .mockResolvedValue(progress);
      jest.spyOn(repository, 'fetchSeasonById')
        .mockResolvedValue(mockSeason);
      jest.spyOn(repository, 'updateUserSeasonProgress')
        .mockImplementation(async (_, __, updates) => ({
          ...progress,
          ...updates,
          id: 'progress-123',
          userId: 'user-123',
          seasonId: 'season-123',
          isPremium: false,
          premiumPurchasedAt: null,
          claimedTiers: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }) as UserSeasonProgress);

      await service.advanceTierWithIdempotency({
        userId: 'user-123',
        seasonId: 'season-123',
        xpAmount: 3000, // Should gain 3 tiers
        source: 'TEST',
      });

      // Should emit 3 tier_unlocked events
      const publishCalls = (eventBus.publish as jest.Mock).mock.calls.filter(
        call => call[0] === 'season:tier_unlocked'
      );
      expect(publishCalls).toHaveLength(3);
    });
  });

  describe('Batch Tier Claims', () => {
    const mockClaimedProgress: UserSeasonProgress = {
      ...mockUserProgress,
      claimedTiers: [...mockUserProgress.claimedTiers, 'new-tier'],
    };

    it('should claim multiple tiers in batches', async () => {
      jest.spyOn(repository, 'markTierClaimed')
        .mockResolvedValue(mockClaimedProgress);

      const result = await service.batchClaimTiers(
        'user-123',
        'season-123',
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'FREE'
      );

      expect(result.claimed).toBe(10);
      expect(result.failed).toBe(0);
      expect(repository.markTierClaimed).toHaveBeenCalledTimes(10);
    });

    it('should handle partial failures gracefully', async () => {
      jest.spyOn(repository, 'markTierClaimed')
        .mockResolvedValueOnce(mockClaimedProgress)
        .mockResolvedValueOnce(mockClaimedProgress)
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValue(mockClaimedProgress);

      const result = await service.batchClaimTiers(
        'user-123',
        'season-123',
        [1, 2, 3, 4],
        'FREE'
      );

      expect(result.claimed).toBe(3);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it('should process in batches of 5', async () => {
      const mockMarkTierClaimed = jest.spyOn(repository, 'markTierClaimed')
        .mockResolvedValue(mockClaimedProgress);

      await service.batchClaimTiers(
        'user-123',
        'season-123',
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        'FREE'
      );

      // All 11 should be processed
      expect(mockMarkTierClaimed).toHaveBeenCalledTimes(11);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status when all checks pass', async () => {
      jest.spyOn(repository, 'fetchActiveSeason')
        .mockResolvedValue(mockSeason);

      const result = await service.checkSeasonSystemHealth();

      expect(result.status).toBe('healthy');
      expect(result.checks.every(c => c.status === 'pass')).toBe(true);
    });

    it('should return degraded status when some checks fail', async () => {
      jest.spyOn(repository, 'fetchActiveSeason')
        .mockRejectedValue(new Error('DB timeout'));

      const result = await service.checkSeasonSystemHealth();

      expect(result.status).toBe('degraded');
    });
  });
});
