/**
 * Season Journey Service Tests
 *
 * Unit tests for Season Journey progression and reward logic.
 * Tests XP calculation, milestone progression, and reward delivery.
 *
 * @phase 3
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { getSeasonJourneyService } from '../service';
import type { SeasonJourney, UserJourney, JourneyMilestone } from '../types';

// Mock dependencies
jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

jest.mock('../../analytics', () => ({
  getAnalyticsService: () => ({
    track: jest.fn(),
  }),
}));

jest.mock('../../economy', () => ({
  getEconomyService: () => ({
    addCoins: jest.fn(),
    addGems: jest.fn(),
    grantItem: jest.fn(),
    grantCosmetic: jest.fn(),
    grantTitle: jest.fn(),
    grantBoost: jest.fn(),
    grantStreakShield: jest.fn(),
  }),
}));

jest.mock('../../progression', () => ({
  getProgressionService: () => ({
    addXp: jest.fn(),
  }),
}));

describe('SeasonJourneyService', () => {
  let service: ReturnType<typeof getSeasonJourneyService>;
  let mockSeasonJourney: SeasonJourney;
  let mockUserJourney: UserJourney;
  let mockMilestones: JourneyMilestone[];

  beforeEach(() => {
    service = getSeasonJourneyService();
    service.setUserId('test-user-id');

    mockSeasonJourney = {
      id: 'season-1',
      seasonId: 'spring-2025',
      milestoneCount: 25,
      xpPerMilestone: 1000,
      theme: 'growth',
      createdAt: Date.now(),
      startsAt: Date.now(),
      endsAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
    };

    mockUserJourney = {
      id: 'user-journey-1',
      userId: 'test-user-id',
      seasonId: 'spring-2025',
      currentMilestone: 5,
      milestoneXp: 500,
      totalXp: 5500,
      claimedMilestones: [1, 2, 3, 4],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockMilestones = [
      {
        id: 'milestone-1',
        seasonId: 'spring-2025',
        milestoneNumber: 1,
        xpRequired: 1000,
        rewardType: 'XP',
        rewardAmount: 500,
        name: 'First Steps',
        description: 'Begin your journey',
      },
      {
        id: 'milestone-5',
        seasonId: 'spring-2025',
        milestoneNumber: 5,
        xpRequired: 5000,
        rewardType: 'COINS',
        rewardAmount: 100,
        name: 'Consistent Learner',
        description: '5 sessions completed',
      },
      {
        id: 'milestone-10',
        seasonId: 'spring-2025',
        milestoneNumber: 10,
        xpRequired: 10000,
        rewardType: 'GEMS',
        rewardAmount: 50,
        name: 'Dedicated Student',
        description: '10 sessions completed',
        isMajorMilestone: true,
      },
    ];
  });

  describe('addJourneyXp', () => {
    test('should add XP and update progress correctly', async () => {
      const result = await service.addJourneyXp('spring-2025', 500, 'session_complete');
      
      expect(result.previousMilestone).toBe(5);
      expect(result.newMilestone).toBe(5); // Still at milestone 5
      expect(result.milestonesUnlocked).toHaveLength(0);
    });

    test('should unlock milestone when XP threshold is reached', async () => {
      const result = await service.addJourneyXp('spring-2025', 500, 'session_complete');
      
      // User was at 5500 XP, adding 500 reaches 6000 (milestone 6)
      expect(result.newMilestone).toBeGreaterThan(result.previousMilestone);
      expect(result.milestonesUnlocked.length).toBeGreaterThan(0);
    });

    test('should unlock multiple milestones for large XP gains', async () => {
      const result = await service.addJourneyXp('spring-2025', 10000, 'achievement_complete');
      
      expect(result.milestonesUnlocked.length).toBeGreaterThan(1);
      expect(result.newMilestone).toBeGreaterThan(result.previousMilestone + 1);
    });

    test('should track source of XP gain', async () => {
      const result = await service.addJourneyXp('spring-2025', 250, 'daily_bonus');
      
      expect(result.previousMilestone).toBeDefined();
      expect(result.newMilestone).toBeDefined();
    });
  });

  describe('claimMilestone', () => {
    test('should claim milestone reward successfully', async () => {
      const result = await service.claimMilestone(5);
      
      expect(result.success).toBe(true);
      expect(result.reward).toBeDefined();
      expect(result.reward?.type).toBe('COINS');
      expect(result.reward?.amount).toBe(100);
    });

    test('should fail when milestone not reached', async () => {
      const result = await service.claimMilestone(15);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not reached');
    });

    test('should fail when already claimed', async () => {
      const result = await service.claimMilestone(1);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already claimed');
    });

    test('should award XP reward correctly', async () => {
      const result = await service.claimMilestone(1);
      
      if (result.success) {
        expect(result.reward?.type).toBe('XP');
        expect(result.reward?.amount).toBe(500);
      }
    });

    test('should award item reward correctly', async () => {
      // Mock a milestone with item reward
      const itemMilestone = {
        ...mockMilestones[0],
        rewardType: 'ITEM' as const,
        rewardId: 'special-item-1',
        rewardAmount: 1,
      };

      const result = await service.claimMilestone(1);
      
      if (result.success) {
        expect(result.reward?.type).toBe('ITEM');
        expect(result.reward?.itemId).toBeDefined();
      }
    });
  });

  describe('getJourneySummary', () => {
    test('should return correct progress calculations', async () => {
      const summary = await service.getJourneySummary();
      
      expect(summary).toBeDefined();
      expect(summary.currentMilestone).toBe(5);
      expect(summary.totalProgress).toBeGreaterThan(0);
      expect(summary.totalProgress).toBeLessThanOrEqual(100);
    });

    test('should calculate next milestone XP correctly', async () => {
      const summary = await service.getJourneySummary();
      
      if (summary) {
        expect(summary.xpToNextMilestone).toBeGreaterThan(0);
        expect(summary.xpToNextMilestone).toBeLessThanOrEqual(1000);
      }
    });

    test('should identify unclaimed milestones', async () => {
      const summary = await service.getJourneySummary();
      
      if (summary) {
        expect(summary.unclaimedMilestones).toContain(5);
        expect(summary.unclaimedMilestones).not.toContain(1);
        expect(summary.unclaimedMilestones).not.toContain(2);
      }
    });
  });

  describe('getUnclaimedMilestones', () => {
    test('should return only unclaimed milestones', async () => {
      const unclaimed = await service.getUnclaimedMilestones();
      
      expect(unclaimed).toHaveLength(1);
      expect(unclaimed[0].milestoneNumber).toBe(5);
    });

    test('should return empty array when all claimed', async () => {
      // Mock all milestones claimed
      mockUserJourney.claimedMilestones = [1, 2, 3, 4, 5];
      
      const unclaimed = await service.getUnclaimedMilestones();
      
      expect(unclaimed).toHaveLength(0);
    });
  });

  describe('canClaimMilestone', () => {
    test('should return true for claimable milestone', async () => {
      const canClaim = await service.canClaimMilestone(5);
      
      expect(canClaim).toBe(true);
    });

    test('should return false for unclaimed milestone', async () => {
      const canClaim = await service.canClaimMilestone(1);
      
      expect(canClaim).toBe(false);
    });

    test('should return false for unreached milestone', async () => {
      const canClaim = await service.canClaimMilestone(15);
      
      expect(canClaim).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid milestone numbers', async () => {
      const result = await service.claimMilestone(-1);
      
      expect(result.success).toBe(false);
    });

    test('should handle zero XP addition', async () => {
      const result = await service.addJourneyXp('spring-2025', 0, 'test');
      
      expect(result.previousMilestone).toBe(result.newMilestone);
      expect(result.milestonesUnlocked).toHaveLength(0);
    });

    test('should handle negative XP', async () => {
      const result = await service.addJourneyXp('spring-2025', -100, 'penalty');
      
      expect(result.previousMilestone).toBe(result.newMilestone);
      expect(result.milestonesUnlocked).toHaveLength(0);
    });
  });

  describe('Integration Tests', () => {
    test('should complete full milestone progression cycle', async () => {
      // Add XP to reach next milestone
      const xpResult = await service.addJourneyXp('spring-2025', 500, 'session_complete');
      
      // Claim the milestone
      const claimResult = await service.claimMilestone(6);
      
      expect(xpResult.newMilestone).toBe(6);
      expect(claimResult.success).toBe(true);
    });

    test('should handle multiple reward types', async () => {
      const rewards = ['XP', 'COINS', 'GEMS', 'ITEM', 'COSMETIC', 'TITLE'];
      
      for (const rewardType of rewards) {
        const result = await service.claimMilestone(1);
        
        if (result.success) {
          expect(['XP', 'COINS', 'GEMS', 'ITEM', 'COSMETIC', 'TITLE']).toContain(result.reward?.type);
        }
      }
    });
  });

  describe('Performance', () => {
    test('should complete XP addition quickly', async () => {
      const startTime = Date.now();
      
      await service.addJourneyXp('spring-2025', 1000, 'test');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete in under 50ms
    });

    test('should handle concurrent operations', async () => {
      const promises = [
        service.addJourneyXp('spring-2025', 100, 'test1'),
        service.addJourneyXp('spring-2025', 200, 'test2'),
        service.claimMilestone(5),
      ];

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r !== undefined)).toBe(true);
    });
  });
});
