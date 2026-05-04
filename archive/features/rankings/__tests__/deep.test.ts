/**
 * Deep Rankings Tests
 *
 * Leaderboard edge cases, anomaly detection, season transitions.
 */

import { describe, it, expect } from 'vitest';
import * as leaderboard from '../leaderboard';

describe('Rankings Deep Tests', () => {
  describe('Leaderboard Edge Cases', () => {
    it('should handle single entry leaderboard', () => {
      const entries = [{ userId: 'user-1', value: 100 }];
      const ranked = leaderboard.calculateCompetitionRanking(entries);

      expect(ranked).toHaveLength(1);
      expect(ranked[0].rank).toBe(1);
    });

    it('should handle all tied scores', () => {
      const entries = [
        { userId: 'user-1', value: 100 },
        { userId: 'user-2', value: 100 },
        { userId: 'user-3', value: 100 },
      ];
      const ranked = leaderboard.calculateCompetitionRanking(entries);

      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(1);
      expect(ranked[2].rank).toBe(1);
    });

    it('should handle alternating ranks (1,2,2,3 pattern)', () => {
      const entries = [
        { userId: 'user-1', value: 100 },
        { userId: 'user-2', value: 90 },
        { userId: 'user-3', value: 90 },
        { userId: 'user-4', value: 80 },
      ];
      const ranked = leaderboard.calculateCompetitionRanking(entries);

      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].rank).toBe(2);
      expect(ranked[3].rank).toBe(4); // Skips 3
    });

    it('should calculate percentile correctly at boundaries', () => {
      expect(leaderboard.calculatePercentile(1, 100)).toBe(99);
      expect(leaderboard.calculatePercentile(50, 100)).toBe(50);
      expect(leaderboard.calculatePercentile(100, 100)).toBe(0);
    });

    it('should handle zero entries gracefully', () => {
      const stats = leaderboard.calculateLeaderboardStats([]);

      expect(stats.totalParticipants).toBe(0);
      expect(stats.averageValue).toBe(0);
      expect(stats.giniCoefficient).toBe(0);
    });

    it('should detect statistical outliers', () => {
      const entries = [
        { userId: 'user-1', value: 100, displayValue: '100' },
        { userId: 'user-2', value: 110, displayValue: '110' },
        { userId: 'user-3', value: 105, displayValue: '105' },
        { userId: 'user-4', value: 1000, displayValue: '1000' }, // Outlier
      ];

      const anomalies = leaderboard.detectAnomalies(entries);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].userId).toBe('user-4');
      expect(anomalies[0].severity).toBe('HIGH');
    });

    it('should detect improvement spikes from history', () => {
      const entries = [
        { userId: 'user-1', value: 500, displayValue: '500' },
      ];
      const history = new Map([
        ['user-1', [50, 55, 60]], // Recent avg: 55
      ]);

      const anomalies = leaderboard.detectAnomalies(entries, history);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].anomalyType).toBe('IMPROVEMENT_SPIKE');
    });
  });

  describe('Season Transition', () => {
    it('should calculate season rewards at tier boundaries', () => {
      const rewards = leaderboard.calculateSeasonRewards(95, 100, 'Diamond', 50);

      // 95th percentile in Diamond should get legendary rewards
      const hasLegendary = rewards.some(r => r.rarity === 'LEGENDARY');
      expect(hasLegendary).toBe(true);
    });

    it('should calculate rewards for bottom performers', () => {
      const rewards = leaderboard.calculateSeasonRewards(1000, 1000, 'Bronze', -20);

      // Should still get participation reward
      expect(rewards.length).toBeGreaterThan(0);
      expect(rewards[0].type).toBe('CURRENCY');
    });
  });

  describe('Pagination', () => {
    it('should return correct cursors for pagination', () => {
      const entries = Array.from({ length: 50 }, (_, i) => ({
        userId: `user-${i}`,
        value: 1000 - i,
        displayValue: `${1000 - i}`,
      }));

      const page1 = leaderboard.paginateLeaderboard(entries, undefined, 20);
      expect(page1.entries).toHaveLength(20);
      expect(page1.hasMore).toBe(true);
      expect(page1.nextCursor).toBeDefined();

      const page2 = leaderboard.paginateLeaderboard(
        entries,
        page1.nextCursor,
        20
      );
      expect(page2.entries).toHaveLength(20);
      expect(page2.previousCursor).toBeDefined();
    });

    it('should handle cursor near end of list', () => {
      const entries = Array.from({ length: 25 }, (_, i) => ({
        userId: `user-${i}`,
        value: 100 - i,
        displayValue: `${100 - i}`,
      }));

      const result = leaderboard.paginateLeaderboard(
        entries,
        { rank: 20, userId: 'user-19' },
        10
      );

      expect(result.entries.length).toBeLessThanOrEqual(6);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('Rank Changes', () => {
    it('should calculate positive rank change (moved up)', () => {
      const current = [
        { id: '1', userId: 'user-1', rank: 5, value: 100, displayValue: '100', previousRank: null, rankChange: 0, valueChange: 0 },
      ];
      const previous = new Map([
        ['user-1', { id: '1', userId: 'user-1', rank: 10, value: 90, displayValue: '90', previousRank: null, rankChange: 0, valueChange: 0 }],
      ]);

      const updated = leaderboard.calculateRankChanges(current, previous);

      expect(updated[0].rankChange).toBe(5); // Moved up 5 positions
      expect(updated[0].valueChange).toBe(10);
    });

    it('should handle new entrants (no previous rank)', () => {
      const current = [
        { id: '1', userId: 'user-new', rank: 3, value: 150, displayValue: '150', previousRank: null, rankChange: 0, valueChange: 0 },
      ];
      const previous = new Map();

      const updated = leaderboard.calculateRankChanges(current, previous);

      expect(updated[0].previousRank).toBeNull();
      expect(updated[0].rankChange).toBe(0);
      expect(updated[0].valueChange).toBe(150);
    });
  });

  describe('Nearby Ranks', () => {
    it('should get entries near user rank', () => {
      const entries = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        userId: `user-${i}`,
        rank: i + 1,
        value: 1000 - i,
        displayValue: `${1000 - i}`,
        previousRank: null,
        rankChange: 0,
        valueChange: 0,
      }));

      const nearby = leaderboard.getNearbyRanks(entries, 'user-50', 10);

      expect(nearby.userEntry).toBeDefined();
      expect(nearby.userEntry?.rank).toBe(51);
      expect(nearby.above).toHaveLength(5);
      expect(nearby.below).toHaveLength(5);
      expect(nearby.hasMoreAbove).toBe(true);
      expect(nearby.hasMoreBelow).toBe(true);
    });

    it('should handle user at top of leaderboard', () => {
      const entries = [
        { id: '1', userId: 'user-1', rank: 1, value: 100, displayValue: '100', previousRank: null, rankChange: 0, valueChange: 0 },
        { id: '2', userId: 'user-2', rank: 2, value: 90, displayValue: '90', previousRank: null, rankChange: 0, valueChange: 0 },
      ];

      const nearby = leaderboard.getNearbyRanks(entries, 'user-1', 5);

      expect(nearby.above).toHaveLength(0);
      expect(nearby.hasMoreAbove).toBe(false);
    });
  });
});
