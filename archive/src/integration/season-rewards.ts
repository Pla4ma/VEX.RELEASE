/**
 * Season ↔ Rewards Integration
 *
 * Wires season progression to reward delivery.
 */

import { eventBus } from '../events';
import * as rewardsService from '../features/rewards/service';
import * as seasonService from '../features/seasons/service';
import * as battlePassService from '../features/battle-pass/service';
import { getAnalyticsService } from '../analytics';
import { createDebugger } from '../utils/debug';

const analytics = getAnalyticsService();
const debug = createDebugger('integration:season-rewards');

/**
 * Initialize season-rewards integration
 */
export function initializeSeasonRewardsIntegration(): () => void {
  // Listen for tier unlock events
  const unsubscribeTier = eventBus.subscribe(
    'season:tier_unlocked',
    async (event: { userId: string; seasonId: string; tier: number }) => {
      await handleTierUnlock(event.userId, event.seasonId, event.tier);
    }
  );

  // Listen for premium purchase
  const unsubscribePremium = eventBus.subscribe(
    'season:premium:purchased',
    async (event: { userId: string; seasonId: string; gemsDeducted?: number }) => {
      await handlePremiumPurchase(event.userId, event.seasonId, event.gemsDeducted ?? 0);
    }
  );

  // Listen for season end
  const unsubscribeSeasonEnd = eventBus.subscribe(
    'season:ended',
    async (event: { seasonId: string }) => {
      await handleSeasonEnd(event.seasonId);
    }
  );

  // Return cleanup function
  return () => {
    unsubscribeTier();
    unsubscribePremium();
    unsubscribeSeasonEnd();
  };
}

/**
 * Handle tier unlock - deliver rewards
 */
async function handleTierUnlock(
  userId: string,
  seasonId: string,
  tier: number
): Promise<void> {
  try {
    // Get tier rewards from battle pass
    const userBp = await battlePassService.getUserBattlePassSummary(userId, seasonId);
    if (!userBp) {return;}

    // Track analytics
    analytics.track('season_tier_unlocked', {
      userId,
      seasonId,
      tier,
      timestamp: Date.now(),
    });

    // Auto-deliver free track rewards
    const freeResult = await battlePassService.claimTier({
      userId,
      seasonId,
      tierNumber: tier,
      track: 'FREE',
    });

    if (freeResult.success) {
      analytics.track('season_reward_auto_delivered', {
        userId,
        seasonId,
        tier,
        track: 'FREE',
        rewardCount: freeResult.rewards.length,
      });
    }

    // If premium, also deliver premium rewards
    if (userBp.isPremium) {
      const premiumResult = await battlePassService.claimTier({
        userId,
        seasonId,
        tierNumber: tier,
        track: 'PREMIUM',
      });

      if (premiumResult.success) {
        analytics.track('season_premium_reward_auto_delivered', {
          userId,
          seasonId,
          tier,
          track: 'PREMIUM',
          rewardCount: premiumResult.rewards.length,
        });
      }
    }
  } catch (error) {
    debug.error('Failed to handle tier unlock rewards:', error as Error);
    analytics.track('season_reward_delivery_failed', {
      userId,
      seasonId,
      tier,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Handle premium purchase - deliver retroactive rewards
 */
async function handlePremiumPurchase(
  userId: string,
  seasonId: string,
  gemsDeducted: number
): Promise<void> {
  try {
    // Claim all premium tiers up to current tier
    const result = await battlePassService.claimAllAvailable(userId, seasonId);

    analytics.track('season_premium_retroactive_claim', {
      userId,
      seasonId,
      gemsDeducted,
      tiersClaimed: result.freeClaimed + result.premiumClaimed,
      rewardsCount: result.rewards.length,
    });

    // Track economy transaction
    eventBus.publish('economy:transaction', {
      userId,
      type: 'spend',
      amount: gemsDeducted,
      currency: 'GEMS',
      source: 'premium_purchase',
    });
  } catch (error) {
    debug.error('Failed to handle premium purchase:', error as Error);
    analytics.track('season_premium_retroactive_failed', {
      userId,
      seasonId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Handle season end - deliver final rewards
 */
async function handleSeasonEnd(seasonId: string): Promise<void> {
  try {
    // Get all users in season
    // This would typically be a batched operation
    analytics.track('season_ended', {
      seasonId,
      timestamp: Date.now(),
    });

    // Archive season data
    await seasonService.archiveSeason(seasonId);
  } catch (error) {
    debug.error('Failed to handle season end:', error as Error);
  }
}
