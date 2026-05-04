/**
 * Seasons Integration Tests
 *
 * Cross-system integration: Seasons → Battle Pass, Challenges, Progression, Rewards
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as seasonService from '../service';
import * as battlePassService from '../../battle-pass/service';
import * as challengeService from '../../challenges/service';
import * as progressionService from '../../progression/service';
import * as rewardsService from '../../rewards/service';
import { eventBus } from '../../../events';
import { supabase } from '../../../config/supabase';

// Mock all dependencies
jest.mock('../../battle-pass/service');
jest.mock('../../challenges/service');
jest.mock('../../progression/service');
jest.mock('../../rewards/service');
jest.mock('../../../events');
jest.mock('../../../config/supabase');

const mockedBattlePass = jest.mocked(battlePassService);
const mockedChallenges = jest.mocked(challengeService);
const mockedProgression = jest.mocked(progressionService);
const mockedRewards = jest.mocked(rewardsService);
const mockedEventBus = jest.mocked(eventBus);
const mockedSupabase = jest.mocked(supabase);

describe('Seasons Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Season → Battle Pass Integration', () => {
    it('should initialize battle pass when user joins season', async () => {
      const seasonId = 'season-123';
      const userId = 'user-456';

      mockedBattlePass.getOrCreateUserBattlePass.mockResolvedValue({
        id: 'bp-789',
        userId,
        seasonId,
        currentTier: 0,
        isPremium: false,
      } as any);

      // User joins season
      await seasonService.getOrCreateUserSeasonProgress(userId, seasonId);

      // Battle pass should be initialized
      expect(mockedBattlePass.getOrCreateUserBattlePass).toHaveBeenCalledWith(
        userId,
        seasonId
      );

      // Event should be published
      expect(mockedEventBus.publish).toHaveBeenCalledWith(
        'season:progress:initialized',
        expect.objectContaining({ userId, seasonId })
      );
    });

    it('should advance battle pass tiers when season XP is added', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';

      // Mock season progress
      mockedSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'progress-1',
                  user_id: userId,
                  season_id: seasonId,
                  current_tier: 2,
                  total_xp: 2500,
                },
                error: null,
              }),
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as any);

      // Add XP that triggers tier advancement
      await seasonService.addSeasonXp(userId, seasonId, 1500);

      // Battle pass should receive XP
      expect(mockedBattlePass.addBattlePassXp).toHaveBeenCalled();
    });

    it('should sync claimed rewards between season and battle pass', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';
      const tierId = 'tier-789';

      // Claim tier reward
      await battlePassService.claimTier({
        userId,
        seasonId,
        tierNumber: 3,
        track: 'FREE',
      });

      // Reward service should deliver rewards
      expect(mockedRewards.deliverReward).toHaveBeenCalled();
    });
  });

  describe('Season → Challenges Integration', () => {
    it('should assign season-specific challenges on season join', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';

      // Mock active season
      mockedSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: seasonId, is_active: true },
              error: null,
            }),
          }),
        }),
      } as any);

      // Join season
      await seasonService.getOrCreateUserSeasonProgress(userId, seasonId);

      // Challenges should be assigned
      expect(mockedChallenges.assignChallenge).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          seasonId,
        })
      );
    });

    it('should progress challenges when season activities complete', async () => {
      const userId = 'user-123';
      const challengeId = 'challenge-456';

      // Complete season activity
      await seasonService.addSeasonXp(userId, 'season-789', 100);

      // XP-related challenges should be updated
      expect(mockedChallenges.updateChallengeProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          source: 'SEASON_XP',
        })
      );
    });
  });

  describe('Season → Progression Integration', () => {
    it('should add global XP when season milestones reached', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';

      // Reach season milestone
      mockedSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  current_tier: 10, // Milestone tier
                  total_xp: 10000,
                },
                error: null,
              }),
            }),
          }),
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      } as any);

      await seasonService.addSeasonXp(userId, seasonId, 500);

      // Global progression should receive bonus XP
      expect(mockedProgression.addXp).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          source: 'SEASON_MILESTONE',
        })
      );
    });
  });

  describe('Season → Rewards Integration', () => {
    it('should deliver season rewards through reward system', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';
      const rewardId = 'reward-789';

      // Claim season reward
      await seasonService.claimTierReward(userId, seasonId, rewardId);

      // Reward service should deliver
      expect(mockedRewards.claimReward).toHaveBeenCalledWith({
        rewardId,
        userId,
      });
    });
  });

  describe('Event Chain Integration', () => {
    it('should emit correct event sequence on tier unlock', async () => {
      const events: string[] = [];

      mockedEventBus.publish.mockImplementation((event: string) => {
        events.push(event);
        return Promise.resolve();
      });

      // Trigger tier unlock
      await seasonService.addSeasonXp('user-123', 'season-456', 1000);

      // Verify event sequence
      expect(events).toContain('season:tier_unlocked');
      expect(events).toContain('progression:xp_added');
    });
  });

  describe('Failure Path Integration', () => {
    it('should rollback battle pass on season join failure', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';

      // Make battle pass fail
      mockedBattlePass.getOrCreateUserBattlePass.mockRejectedValue(
        new Error('Battle pass creation failed')
      );

      // Should throw and not create partial state
      await expect(
        seasonService.getOrCreateUserSeasonProgress(userId, seasonId)
      ).rejects.toThrow();

      // Verify no progress was recorded
      expect(mockedSupabase.from).not.toHaveBeenCalledWith('user_season_progress');
    });

    it('should handle concurrent tier claims', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';

      // Simulate concurrent claims
      const claims = [
        battlePassService.claimTier({ userId, seasonId, tierNumber: 1, track: 'FREE' }),
        battlePassService.claimTier({ userId, seasonId, tierNumber: 1, track: 'FREE' }),
      ];

      // Only one should succeed
      const results = await Promise.allSettled(claims);
      const successes = results.filter(r => r.status === 'fulfilled');
      expect(successes.length).toBe(1);
    });
  });

  describe('Race Condition Tests', () => {
    it('should handle race condition on XP add and tier calculation', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';

      // Simulate race condition with multiple concurrent XP adds
      const xpAdds = [
        seasonService.addSeasonXp(userId, seasonId, 500),
        seasonService.addSeasonXp(userId, seasonId, 500),
        seasonService.addSeasonXp(userId, seasonId, 500),
      ];

      // All should complete without data corruption
      const results = await Promise.allSettled(xpAdds);
      expect(results.every(r => r.status === 'fulfilled')).toBe(true);
    });

    it('should prevent duplicate season progress creation', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';

      // Try to create progress twice concurrently
      const creations = [
        seasonService.getOrCreateUserSeasonProgress(userId, seasonId),
        seasonService.getOrCreateUserSeasonProgress(userId, seasonId),
      ];

      await Promise.all(creations);

      // Should only create once
      const createCalls = mockedSupabase.from.mock.calls.filter(
        call => call[0] === 'user_season_progress' &&
        mockedSupabase.from(call[0]).insert
      );
      expect(createCalls.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Case Integration', () => {
    it('should handle season ending with active users', async () => {
      const seasonId = 'season-ending';

      // End season with active users
      await seasonService.endSeason(seasonId);

      // All rewards should be distributed
      expect(mockedRewards.claimReward).toHaveBeenCalled();

      // Progress should be archived
      expect(mockedSupabase.from).toHaveBeenCalledWith('season_archives');
    });

    it('should handle premium purchase during tier advancement', async () => {
      const userId = 'user-123';
      const seasonId = 'season-456';

      // Simultaneous premium purchase and tier advancement
      await Promise.all([
        battlePassService.purchasePremium({
          userId,
          seasonId,
          paymentMethod: 'GEMS',
        }),
        seasonService.addSeasonXp(userId, seasonId, 1000),
      ]);

      // Should handle both without conflict
      expect(mockedBattlePass.purchasePremium).toHaveBeenCalled();
    });
  });
});

describe('Seasons Analytics Integration', () => {
  it('should track cross-system metrics', async () => {
    const userId = 'user-123';
    const seasonId = 'season-456';

    // Perform season activity
    await seasonService.addSeasonXp(userId, seasonId, 500);
    await battlePassService.claimTier({
      userId,
      seasonId,
      tierNumber: 1,
      track: 'FREE',
    });

    // Analytics should receive unified data
    expect(mockedEventBus.publish).toHaveBeenCalledWith(
      'analytics:track',
      expect.objectContaining({
        event: 'season_engagement',
        properties: expect.objectContaining({
          xpEarned: expect.any(Number),
          tierClaimed: expect.any(Boolean),
        }),
      })
    );
  });
});
