/**
 * Rankings Analytics Events
 *
 * Comprehensive tracking for leaderboard and ranking engagement.
 */

import { eventBus } from '../../events';
import { type Leaderboard, type LeaderboardEntry, type SeasonSummary } from './schemas';

export const RankingsAnalytics = {
  // Leaderboard events
  leaderboardViewed: (
    userId: string,
    leaderboardType: string,
    scope: string,
    period: string,
    userRank?: number
  ) => {
    eventBus.publish('analytics:track', {
      event: 'leaderboard_viewed',
      properties: {
        user_id: userId,
        leaderboard_type: leaderboardType,
        scope,
        period,
        user_rank: userRank,
        timestamp: Date.now(),
      },
    });
  },

  leaderboardEntryViewed: (userId: string, targetUserId: string, rank: number) => {
    eventBus.publish('analytics:track', {
      event: 'leaderboard_entry_viewed',
      properties: {
        user_id: userId,
        target_user_id: targetUserId,
        target_rank: rank,
        timestamp: Date.now(),
      },
    });
  },

  // Rank change events
  rankChanged: (
    userId: string,
    category: string,
    oldRank: number,
    newRank: number,
    change: number
  ) => {
    eventBus.publish('analytics:track', {
      event: 'rank_changed',
      properties: {
        user_id: userId,
        category,
        old_rank: oldRank,
        new_rank: newRank,
        rank_change: change,
        is_improvement: change > 0,
        timestamp: Date.now(),
      },
    });
  },

  // Tier events
  tierAchieved: (userId: string, tierName: string, previousTier?: string) => {
    eventBus.publish('analytics:track', {
      event: 'tier_achieved',
      properties: {
        user_id: userId,
        tier_name: tierName,
        previous_tier: previousTier,
        is_promotion: previousTier ? isTierHigher(tierName, previousTier) : true,
        timestamp: Date.now(),
      },
    });
  },

  // Season events
  seasonSummaryViewed: (userId: string, seasonId: string, finalRank: number) => {
    eventBus.publish('analytics:track', {
      event: 'season_summary_viewed',
      properties: {
        user_id: userId,
        season_id: seasonId,
        final_rank: finalRank,
        timestamp: Date.now(),
      },
    });
  },

  seasonRewardClaimed: (
    userId: string,
    seasonId: string,
    rewardType: string,
    amount: number,
    autoClaimed: boolean
  ) => {
    eventBus.publish('analytics:track', {
      event: 'season_reward_claimed',
      properties: {
        user_id: userId,
        season_id: seasonId,
        reward_type: rewardType,
        amount,
        auto_claimed: autoClaimed,
        timestamp: Date.now(),
      },
    });
  },

  seasonShareCardGenerated: (userId: string, seasonId: string, rank: number) => {
    eventBus.publish('analytics:track', {
      event: 'season_share_card_generated',
      properties: {
        user_id: userId,
        season_id: seasonId,
        rank,
        timestamp: Date.now(),
      },
    });
  },

  // Competition events
  competitionJoined: (userId: string, competitionId: string, category: string) => {
    eventBus.publish('analytics:track', {
      event: 'competition_joined',
      properties: {
        user_id: userId,
        competition_id: competitionId,
        category,
        timestamp: Date.now(),
      },
    });
  },

  promotionSeriesStarted: (userId: string, fromTier: string, toTier: string) => {
    eventBus.publish('analytics:track', {
      event: 'promotion_series_started',
      properties: {
        user_id: userId,
        from_tier: fromTier,
        to_tier: toTier,
        timestamp: Date.now(),
      },
    });
  },

  promotionSeriesCompleted: (userId: string, success: boolean, wins: number, losses: number) => {
    eventBus.publish('analytics:track', {
      event: 'promotion_series_completed',
      properties: {
        user_id: userId,
        success,
        wins,
        losses,
        timestamp: Date.now(),
      },
    });
  },

  // Stats
  statsUpdated: (userId: string, stats: {
    globalRank: number | null;
    bestGlobalRank: number;
    categoryRankings: number;
  }) => {
    eventBus.publish('analytics:track', {
      event: 'ranking_stats_updated',
      properties: {
        user_id: userId,
        global_rank: stats.globalRank,
        best_global_rank: stats.bestGlobalRank,
        category_count: stats.categoryRankings,
        timestamp: Date.now(),
      },
    });
  },

  // Error events
  errorOccurred: (operation: string, errorCode: string, context: Record<string, unknown>) => {
    eventBus.publish('analytics:track', {
      event: 'rankings_error',
      properties: {
        operation,
        error_code: errorCode,
        ...context,
        timestamp: Date.now(),
      },
    });
  },
};

function isTierHigher(newTier: string, oldTier: string): boolean {
  const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Legend'];
  return tiers.indexOf(newTier) > tiers.indexOf(oldTier);
}
