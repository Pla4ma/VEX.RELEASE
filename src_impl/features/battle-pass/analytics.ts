/**
 * Battle Pass Analytics
 *
 * Tracking and analytics for battle pass engagement and monetization.
 */

import { getAnalyticsService } from '../../analytics';
import type { UserBattlePass, BattlePassTier } from './types';

const analytics = getAnalyticsService();

// ============================================================================
// Battle Pass Event Tracking
// ============================================================================

/**
 * Track battle pass view
 */
export function trackBattlePassView(
  userId: string,
  seasonId: string,
  currentTier: number,
  isPremium: boolean
): void {
  analytics.track('battle_pass_viewed', {
    userId,
    seasonId,
    currentTier,
    isPremium,
    timestamp: Date.now(),
  });
}

/**
 * Track tier claim
 */
export function trackTierClaimed(
  userId: string,
  seasonId: string,
  tierNumber: number,
  track: 'FREE' | 'PREMIUM',
  rewardType: string | null,
  rewardAmount: number | null
): void {
  analytics.track('battle_pass_tier_claimed', {
    userId,
    seasonId,
    tierNumber,
    track,
    rewardType,
    rewardAmount,
    timestamp: Date.now(),
  });
}

/**
 * Track premium purchase
 */
export function trackPremiumPurchase(
  userId: string,
  seasonId: string,
  gemsSpent: number,
  paymentMethod: 'GEMS' | 'REAL_MONEY',
  previousTiersClaimed: number
): void {
  analytics.track('battle_pass_premium_purchased', {
    userId,
    seasonId,
    gemsSpent,
    paymentMethod,
    previousTiersClaimed,
    timestamp: Date.now(),
  });
}

/**
 * Track XP gain
 */
export function trackXpGained(
  userId: string,
  seasonId: string,
  amount: number,
  source: string,
  tiersUnlocked: number
): void {
  analytics.track('battle_pass_xp_gained', {
    userId,
    seasonId,
    amount,
    source,
    tiersUnlocked,
    timestamp: Date.now(),
  });
}

/**
 * Track milestone reached
 */
export function trackMilestoneReached(
  userId: string,
  seasonId: string,
  tierNumber: number,
  isMajorMilestone: boolean
): void {
  analytics.track('battle_pass_milestone_reached', {
    userId,
    seasonId,
    tierNumber,
    isMajorMilestone,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Battle Pass Metrics
// ============================================================================

/**
 * Calculate battle pass engagement metrics
 */
export function calculateEngagementMetrics(
  userProgress: UserBattlePass[],
  tiers: BattlePassTier[]
): {
  totalUsers: number;
  premiumUsers: number;
  premiumConversionRate: number;
  averageTier: number;
  averageProgress: number;
} {
  const totalUsers = userProgress.length;
  const premiumUsers = userProgress.filter((up) => up.isPremium).length;
  const averageTier =
    totalUsers > 0
      ? userProgress.reduce((sum, up) => sum + up.currentTier, 0) / totalUsers
      : 0;

  const maxXp = tiers.reduce((sum, t) => sum + t.xpRequired, 0);
  const averageProgress =
    totalUsers > 0
      ? userProgress.reduce((sum, up) => sum + up.totalXp, 0) / totalUsers / maxXp
      : 0;

  return {
    totalUsers,
    premiumUsers,
    premiumConversionRate: totalUsers > 0 ? premiumUsers / totalUsers : 0,
    averageTier,
    averageProgress,
  };
}

/**
 * Calculate monetization metrics
 */
export function calculateMonetizationMetrics(
  purchases: Array<{
    userId: string;
    gemsSpent: number;
    paymentMethod: 'GEMS' | 'REAL_MONEY';
    purchasedAt: number;
  }>
): {
  totalPurchases: number;
  totalGemsSpent: number;
  realMoneyPurchases: number;
  averageGemsSpent: number;
} {
  const totalPurchases = purchases.length;
  const totalGemsSpent = purchases.reduce((sum, p) => sum + p.gemsSpent, 0);
  const realMoneyPurchases = purchases.filter(
    (p) => p.paymentMethod === 'REAL_MONEY'
  ).length;

  return {
    totalPurchases,
    totalGemsSpent,
    realMoneyPurchases,
    averageGemsSpent: totalPurchases > 0 ? totalGemsSpent / totalPurchases : 0,
  };
}

// ============================================================================
// Battle Pass Health Check
// ============================================================================

/**
 * Check battle pass system health
 */
export async function checkBattlePassHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
  metrics: {
    activePasses: number;
    premiumRate: number;
    claimRate: number;
  };
}> {
  const issues: string[] = [];

  // This would integrate with actual data in production
  const metrics = {
    activePasses: 0,
    premiumRate: 0,
    claimRate: 0,
  };

  const status = issues.length === 0 ? 'healthy' : issues.length < 3 ? 'degraded' : 'unhealthy';

  return { status, issues, metrics };
}
