/**
 * Economy <-> Seasons Integration
 *
 * Wires economy transactions to season progression.
 */

import { eventBus } from '../events';
import type { EventPayload } from '../events/EventTypes';
import * as seasonService from '../features/seasons/service';
import * as battlePassService from '../features/battle-pass/service';
import { getAnalyticsService } from '../analytics';
import { createDebugger } from '../utils/debug';

const analytics = getAnalyticsService();
const debug = createDebugger('integration:economy-seasons');

/**
 * Initialize economy-seasons integration
 */
export function initializeEconomySeasonsIntegration(): () => void {
  const unsubscribePurchase = eventBus.subscribe(
    'shop:purchase',
    async (event: EventPayload<'shop:purchase'>) => {
      await handlePurchase(event);
    }
  );

  const unsubscribePremium = eventBus.subscribe(
    'season:premium:purchased',
    async (event: EventPayload<'season:premium:purchased'>) => {
      await handlePremiumPurchase(event);
    }
  );

  const unsubscribeEarned = eventBus.subscribe(
    'economy:currency_added',
    async (event: EventPayload<'economy:currency_added'>) => {
      await handleCurrencyEarned(event);
    }
  );

  return () => {
    unsubscribePurchase();
    unsubscribePremium();
    unsubscribeEarned();
  };
}

/**
 * Handle purchase completion - check for season benefits
 */
async function handlePurchase(
  event: EventPayload<'shop:purchase'>
): Promise<void> {
  const { userId, itemId, price } = event;

  try {
    const activeSeason = await seasonService.getActiveSeason();
    if (!activeSeason) {return;}

    const userBattlePass = await battlePassService.getUserBattlePassSummary(
      userId,
      activeSeason.id
    );

    if (userBattlePass?.isPremium) {
      const xpBonus = Math.floor(price.amount / 10);

      if (xpBonus > 0) {
        await seasonService.advanceTier({
          userId,
          seasonId: activeSeason.id,
          xpAmount: xpBonus,
          source: 'PREMIUM_PURCHASE_BONUS',
        });

        analytics.track('premium_purchase_xp_bonus', {
          userId,
          seasonId: activeSeason.id,
          purchaseAmount: price.amount,
          xpBonus,
        });
      }
    }

    analytics.track('economy_purchase_with_season', {
      userId,
      seasonId: activeSeason.id,
      itemId,
      amount: price.amount,
      currency: price.currency,
      hasPremium: userBattlePass?.isPremium ?? false,
    });
  } catch (error) {
    debug.error('Failed to handle purchase', error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Handle premium purchase
 */
async function handlePremiumPurchase(
  event: EventPayload<'season:premium:purchased'>
): Promise<void> {
  const { userId, seasonId, gemsSpent } = event;

  try {
    const bonusXp = 500;
    await seasonService.advanceTier({
      userId,
      seasonId,
      xpAmount: bonusXp,
      source: 'PREMIUM_PURCHASE',
    });

    eventBus.publish('achievement:unlock', {
      userId,
      achievementId: 'premium_supporter',
    });

    analytics.track('season_premium_purchase_complete', {
      userId,
      seasonId,
      gemsSpent,
      bonusXp,
    });
  } catch (error) {
    debug.error('Failed to handle premium purchase:', error as Error);
    analytics.track('season_premium_purchase_failed', {
      userId,
      seasonId,
      gemsSpent,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Handle currency earned
 */
async function handleCurrencyEarned(
  event: EventPayload<'economy:currency_added'>
): Promise<void> {
  const { userId, currency, amount, source } = event;

  try {
    const activeSeason = await seasonService.getActiveSeason();
    if (!activeSeason) {return;}

    if (source.toUpperCase() === 'CHALLENGE') {
      eventBus.publish('seasons:challenge_progress', {
        userId,
        challengeId: 'currency_earned',
        progress: amount,
        completed: false,
      });
    }

    analytics.track('economy_earned_with_season_context', {
      userId,
      seasonId: activeSeason.id,
      currencyType: currency,
      amount,
      source,
    });
  } catch (error) {
    debug.error('Failed to handle currency earned:', error as Error);
  }
}

/**
 * Get season purchase statistics
 */
export async function getSeasonPurchaseStats(
  seasonId: string
): Promise<{
  totalRevenue: number;
  premiumConversions: number;
  averageSpend: number;
  topSpenders: string[];
}> {
  void seasonId;

  return {
    totalRevenue: 0,
    premiumConversions: 0,
    averageSpend: 0,
    topSpenders: [],
  };
}
