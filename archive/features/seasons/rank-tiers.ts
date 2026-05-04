/**
 * Rank Tier Configuration
 *
 * PHASE 14.2 - Ranked tier system for competitive meta
 * Tiers based on weekly focus minutes percentile within current season
 *
 * @phase 14.2
 */

import type { RankTier, RankTierConfig, UserRankInfo } from './types';

/**
 * Tier configurations with visual properties
 */
export const RANK_TIERS: Record<RankTier, RankTierConfig> = {
  BRONZE: {
    tier: 'BRONZE',
    name: 'Bronze',
    color: '#CD7F32',
    borderColor: '#8B4513',
    minPercentile: 0,
    maxPercentile: 50,
    icon: '🥉',
  },
  SILVER: {
    tier: 'SILVER',
    name: 'Silver',
    color: '#C0C0C0',
    borderColor: '#A0A0A0',
    minPercentile: 50,
    maxPercentile: 75,
    icon: '🥈',
  },
  GOLD: {
    tier: 'GOLD',
    name: 'Gold',
    color: '#FFD700',
    borderColor: '#DAA520',
    glowColor: '#FFD70040',
    minPercentile: 75,
    maxPercentile: 90,
    icon: '🥇',
  },
  PLATINUM: {
    tier: 'PLATINUM',
    name: 'Platinum',
    color: '#E5E4E2',
    borderColor: '#B0B0B0',
    glowColor: '#E5E4E240',
    minPercentile: 90,
    maxPercentile: 95,
    icon: '⭐',
  },
  DIAMOND: {
    tier: 'DIAMOND',
    name: 'Diamond',
    color: '#B9F2FF',
    borderColor: '#87CEEB',
    glowColor: '#B9F2FF60',
    minPercentile: 95,
    maxPercentile: 99,
    icon: '💎',
  },
  LEGEND: {
    tier: 'LEGEND',
    name: 'Legend',
    color: '#FFD700',
    borderColor: '#FFA500',
    glowColor: '#FFD70080',
    minPercentile: 99,
    maxPercentile: 100,
    icon: '👑',
  },
};

/**
 * Get tier for a given percentile rank
 */
export function getTierFromPercentile(percentile: number): RankTier {
  for (const tier of Object.values(RANK_TIERS)) {
    if (percentile >= tier.minPercentile && percentile < tier.maxPercentile) {
      return tier.tier;
    }
  }
  return 'LEGEND'; // Top 1%
}

/**
 * Get tier configuration
 */
export function getTierConfig(tier: RankTier): RankTierConfig {
  return RANK_TIERS[tier];
}

/**
 * Calculate user's rank info based on weekly focus minutes
 */
export function calculateUserRank(
  weeklyFocusMinutes: number,
  allUsersWeeklyMinutes: number[]
): UserRankInfo {
  // Sort descending (higher minutes = better rank)
  const sorted = [...allUsersWeeklyMinutes].sort((a, b) => b - a);
  const rankPosition = sorted.findIndex((m) => m <= weeklyFocusMinutes) + 1;
  const totalParticipants = sorted.length;

  // Calculate percentile (0-100, higher is better)
  const percentile = totalParticipants > 0
    ? ((totalParticipants - rankPosition) / totalParticipants) * 100
    : 0;

  const tier = getTierFromPercentile(percentile);
  const tierConfig = getTierConfig(tier);

  // Calculate sessions needed for next tier (estimate: 25 min per session)
  const nextTier = Object.values(RANK_TIERS).find((t) => t.minPercentile > percentile);
  const sessionsToNextTier = nextTier
    ? Math.ceil(
        ((nextTier.minPercentile / 100) * totalParticipants - (totalParticipants - rankPosition)) *
        25 // avg session minutes
      )
    : null;

  return {
    tier,
    percentile: Math.round(percentile * 10) / 10,
    weeklyFocusMinutes,
    rankPosition,
    totalParticipants,
    sessionsToNextTier,
  };
}

/**
 * Get tier up/down notification message
 */
export function getTierChangeMessage(
  oldTier: RankTier,
  newTier: RankTier
): { title: string; body: string } | null {
  if (oldTier === newTier) {return null;}

  const tierConfig = getTierConfig(newTier);

  if (isTierHigher(newTier, oldTier)) {
    // Tier up
    return {
      title: `You reached ${tierConfig.name} tier!`,
      body: `Top ${tierConfig.maxPercentile}% of VEX users this week. Keep the focus!`,
    };
  } else {
    // Tier down
    return {
      title: `You dropped to ${tierConfig.name} tier`,
      body: 'Complete a few more focus sessions to climb back up!',
    };
  }
}

/**
 * Check if new tier is higher than old tier
 */
function isTierHigher(newTier: RankTier, oldTier: RankTier): boolean {
  const order: RankTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGEND'];
  return order.indexOf(newTier) > order.indexOf(oldTier);
}

/**
 * Format weekly rank report message
 */
export function formatWeeklyRankReport(rankInfo: UserRankInfo): {
  title: string;
  body: string;
} {
  const tierConfig = getTierConfig(rankInfo.tier);

  let body = `You're in ${tierConfig.name.toUpperCase()} tier this week — top ${Math.round(rankInfo.percentile)}% of VEX users.`;

  if (rankInfo.sessionsToNextTier) {
    body += ` About ${rankInfo.sessionsToNextTier} more sessions to reach the next tier.`;
  }

  return {
    title: `Weekly Rank Update: ${tierConfig.icon} ${tierConfig.name}`,
    body,
  };
}
