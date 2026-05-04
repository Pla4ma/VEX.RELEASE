/**
 * Rankings Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as service from '../service';
import * as repository from '../repository';
import { RankingsAnalytics } from '../analytics';
import { withRankingsRetry } from '../retry';

vi.mock('../repository');
vi.mock('../analytics');
vi.mock('../../events', () => ({
  eventBus: { publish: vi.fn() },
}));

describe('Rankings Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLeaderboard', () => {
    it('should fetch leaderboard with entries', async () => {
      const input = {
        type: 'XP' as const,
        scope: 'GLOBAL' as const,
        period: 'WEEKLY' as const,
        limit: 50,
      };

      vi.mocked(repository.fetchLeaderboard).mockResolvedValue({
        id: 'leaderboard-123',
        type: 'XP',
        scope: 'GLOBAL',
        period: 'WEEKLY',
        totalParticipants: 1000,
      } as any);

      vi.mocked(repository.fetchLeaderboardEntries).mockResolvedValue([
        { id: 'entry-1', userId: 'user-1', rank: 1, value: 5000 },
        { id: 'entry-2', userId: 'user-2', rank: 2, value: 4500 },
      ] as any);

      const leaderboard = await service.getLeaderboard(input);

      expect(leaderboard.type).toBe('XP');
      expect(leaderboard.entries).toHaveLength(2);
      expect(RankingsAnalytics.leaderboardViewed).toHaveBeenCalled();
    });

    it('should handle empty leaderboard', async () => {
      vi.mocked(repository.fetchLeaderboard).mockResolvedValue({
        id: 'leaderboard-123',
        type: 'XP',
        scope: 'GLOBAL',
        period: 'WEEKLY',
        totalParticipants: 0,
      } as any);

      vi.mocked(repository.fetchLeaderboardEntries).mockResolvedValue([]);

      const leaderboard = await service.getLeaderboard({
        type: 'XP',
        scope: 'GLOBAL',
        period: 'WEEKLY',
      });

      expect(leaderboard.entries).toHaveLength(0);
    });
  });

  describe('getUserRank', () => {
    it('should return user rank', async () => {
      vi.mocked(repository.fetchUserRank).mockResolvedValue({
        id: 'entry-1',
        userId: 'user-1',
        rank: 42,
        value: 3500,
      } as any);

      const rank = await service.getUserRank({
        userId: 'user-1',
        type: 'XP',
        scope: 'GLOBAL',
      });

      expect(rank?.rank).toBe(42);
    });

    it('should return null for unranked user', async () => {
      vi.mocked(repository.fetchUserRank).mockResolvedValue(null);

      const rank = await service.getUserRank({
        userId: 'user-1',
        type: 'XP',
        scope: 'GLOBAL',
      });

      expect(rank).toBeNull();
    });
  });

  describe('getUserTier', () => {
    it('should return correct tier for rating', async () => {
      vi.mocked(repository.fetchRankTierByRating).mockResolvedValue({
        name: 'Gold',
        minRating: 1400,
        maxRating: 1599,
        level: 3,
        color: '#FFD700',
        iconUrl: '/icons/gold.png',
        badgeUrl: '/badges/gold.png',
        rewards: [],
      } as any);

      const tier = await service.getUserTier({ userId: 'user-1', rating: 1500 });

      expect(tier.name).toBe('Gold');
    });
  });

  describe('updateLeaderboardEntry', () => {
    it('should update entry and track rank change', async () => {
      vi.mocked(repository.fetchUserRank).mockResolvedValue({
        rank: 50,
        previousRank: 55,
      } as any);

      vi.mocked(repository.updateLeaderboardEntry).mockResolvedValue({
        id: 'entry-1',
        rank: 48,
        previousRank: 50,
        rankChange: 2,
      } as any);

      const entry = await service.updateLeaderboardEntry({
        userId: 'user-1',
        leaderboardId: 'leaderboard-123',
        value: 6000,
      });

      expect(entry.rankChange).toBeGreaterThan(0);
      expect(RankingsAnalytics.rankChanged).toHaveBeenCalled();
    });
  });

  describe('generateSeasonSummary', () => {
    it('should generate summary with rewards', async () => {
      const userId = 'user-1';
      const seasonId = 'season-2024-1';

      vi.mocked(repository.fetchSeasonData).mockResolvedValue({
        id: seasonId,
        name: 'Season 1',
      } as any);

      vi.mocked(repository.fetchUserRankHistory).mockResolvedValue([
        { rank: 100, timestamp: Date.now() - 86400000 },
        { rank: 50, timestamp: Date.now() },
      ] as any);

      vi.mocked(repository.createSeasonSummary).mockResolvedValue({
        userId,
        seasonId,
        finalRank: 50,
        finalTier: 'Gold',
        totalParticipants: 1000,
        percentile: 95,
        xpGained: 50000,
        sessionsCompleted: 100,
        totalFocusTime: 360000,
        streakHigh: 30,
        duelsWon: 20,
        duelsPlayed: 30,
        rewardsEarned: [
          { type: 'TIER', name: 'Gold Tier', value: 'Gold' },
          { type: 'CURRENCY', name: 'Coins', value: 5000 },
        ],
        totalRewardValue: 5000,
      } as any);

      const summary = await service.generateSeasonSummary(userId, seasonId);

      expect(summary.finalRank).toBe(50);
      expect(summary.rewardsEarned).toHaveLength(2);
      expect(RankingsAnalytics.seasonSummaryViewed).toHaveBeenCalled();
    });
  });

  describe('claimSeasonReward', () => {
    it('should claim unclaimed reward', async () => {
      vi.mocked(repository.fetchSeasonSummary).mockResolvedValue({
        id: 'summary-1',
        rewardsEarned: [
          { type: 'CURRENCY', name: 'Coins', value: 1000, claimed: false },
        ],
      } as any);

      vi.mocked(repository.updateSeasonSummaryRewards).mockResolvedValue(undefined);

      const result = await service.claimSeasonReward('user-1', 'summary-1', 0);

      expect(result.claimed).toBe(true);
      expect(RankingsAnalytics.seasonRewardClaimed).toHaveBeenCalled();
    });

    it('should reject already claimed reward', async () => {
      vi.mocked(repository.fetchSeasonSummary).mockResolvedValue({
        id: 'summary-1',
        rewardsEarned: [
          { type: 'CURRENCY', name: 'Coins', value: 1000, claimed: true },
        ],
      } as any);

      await expect(
        service.claimSeasonReward('user-1', 'summary-1', 0)
      ).rejects.toThrow('already claimed');
    });
  });

  describe('getRankTiers', () => {
    it('should return all rank tiers', async () => {
      const tiers = [
        { name: 'Bronze', level: 1, minRating: 0 },
        { name: 'Silver', level: 2, minRating: 1200 },
        { name: 'Gold', level: 3, minRating: 1400 },
      ];

      vi.mocked(repository.fetchRankTiers).mockResolvedValue(tiers as any);

      const result = await service.getRankTiers();

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('Bronze');
    });
  });

  describe('retry logic', () => {
    it('should retry leaderboard operations', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 2) {throw new Error('Database timeout');}
        return { id: 'entry-1' };
      };

      const result = await withRankingsRetry(operation, 'leaderboard-update', {
        maxAttempts: 3,
        baseDelayMs: 10,
      });

      expect(result.id).toBe('entry-1');
      expect(attempts).toBe(2);
    });
  });
});
