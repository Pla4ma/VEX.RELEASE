/**
 * Economy Cross-System Integration
 * Wires economy to progression, events, challenges, and shop ownership
 */

import { eventBus } from '../../events/EventBus';
import * as Sentry from '@sentry/react-native';

interface CurrencyTransaction {
  userId: string;
  currency: string;
  type: 'earn' | 'spend';
  amount: number;
  source: string;
  itemId?: string;
}

interface ShopOwnership {
  userId: string;
  itemId: string;
  price: { currency: 'COINS' | 'GEMS' | 'SEASONAL'; amount: number };
}

/**
 * Initialize economy cross-system integration
 */
export function initializeEconomyFeedIntegration(): () => void {
  const handlers: Array<() => void> = [];

  // Handle currency transactions
  handlers.push(
    eventBus.subscribe('economy:transaction', async (event: CurrencyTransaction) => {
      if (!event || !event.userId) {return;}

      try {
        // 1. Track in analytics
        Sentry.addBreadcrumb({
          category: 'economy:transaction',
          message: `${event.currency} ${event.type}: ${Math.abs(event.amount)}`,
          data: {
            userId: event.userId,
            type: event.currency,
            amount: event.amount,
            source: event.source,
          },
          level: 'info',
        });

        // 2. Update season challenge progress
        if (event.amount > 0) {
          eventBus.publish('seasons:challenge_progress', {
            userId: event.userId,
            challengeId: 'currency_earned',
            progress: event.amount,
            completed: false,
          });
        }

        // 3. Check for spending milestones
        if (event.amount < 0) {
          checkSpendingMilestones(event.userId, event.currency, Math.abs(event.amount));
        }

        // 4. Update progression if XP currency
        if (event.currency === 'XP' && event.amount > 0) {
          eventBus.publish('progression:add_xp', {
            userId: event.userId,
            amount: event.amount,
            source: event.source,
          });
        }

        // 5. Social feed for large transactions
        if (Math.abs(event.amount) >= 1000) {
          eventBus.publish('social:activity', {
            userId: event.userId,
            activityType: event.amount > 0 ? 'BIG_EARN' : 'BIG_SPEND',
            visibility: 'FRIENDS',
            data: {
              currency: event.currency,
              amount: Math.abs(event.amount),
            },
          });
        }

      } catch (error) {
        Sentry.captureException(error, {
          tags: { operation: 'economy:transaction' },
          extra: {
            userId: event.userId,
            currency: event.currency,
            amount: event.amount,
            type: event.type,
            source: event.source,
          },
        });
      }
    })
  );

  // Handle shop purchases
  handlers.push(
    eventBus.subscribe('economy:purchase', async (event: ShopOwnership) => {
      if (!event || !event.userId) {return;}

      try {
        // 1. Record ownership
        await recordShopOwnership(event);

        // 2. Update challenges
        eventBus.publish('seasons:challenge_progress', {
          userId: event.userId,
          challengeId: 'shop_purchase',
          progress: 1,
          completed: false,
        });

        // 3. Apply immediate effects
        await applyItemEffect(event);

        // 4. Social activity for rare items
        if (isRareItem(event.itemId)) {
          eventBus.publish('social:activity', {
            userId: event.userId,
            activityType: 'RARE_ITEM_ACQUIRED',
            visibility: 'PUBLIC',
            data: {
              itemId: event.itemId,
              itemType: getShopItemType(event.itemId),
            },
          });
        }

        Sentry.addBreadcrumb({
          category: 'economy:purchase',
          message: `Shop purchase: ${event.itemId}`,
          data: {
            userId: event.userId,
            itemId: event.itemId,
            priceAmount: event.price.amount,
            currency: event.price.currency,
          },
          level: 'info',
        });

      } catch (error) {
        Sentry.captureException(error, {
          tags: { operation: 'economy:purchase' },
          extra: {
            userId: event.userId,
            itemId: event.itemId,
            priceAmount: event.price.amount,
            currency: event.price.currency,
          },
        });
      }
    })
  );

  // Handle event rewards
  handlers.push(
    eventBus.subscribe('events:reward_earned', async (event) => {
      if (!event || !event.userId) {return;}

      // Grant event rewards with bonus multiplier
      const bonusMultiplier = await getEventBonusMultiplier(event.userId, event.eventId);

      if (bonusMultiplier > 1) {
        const rewardType = event.rewardType === 'XP' ? 'COINS' : event.rewardType as 'COINS' | 'GEMS' | 'SEASONAL';
        eventBus.publish('economy:add_currency', {
          userId: event.userId,
          type: rewardType,
          amount: Math.floor(event.amount * bonusMultiplier),
          source: 'EVENT_BONUS',
        });
      }
    })
  );

  return () => handlers.forEach(unsub => unsub());
}

// ============================================================================
// Helper Functions
// ============================================================================

async function recordShopOwnership(ownership: ShopOwnership): Promise<void> {
  // Persist to shop ownership table
  // This would be implemented via repository call
  Sentry.addBreadcrumb({
    category: 'economy-feed',
    message: `Recording shop ownership for ${ownership.itemId}`,
    level: 'info',
    data: {
      userId: ownership.userId,
      itemId: ownership.itemId,
      itemType: getShopItemType(ownership.itemId),
      currency: ownership.price.currency,
      price: ownership.price.amount,
    },
  });
}

async function applyItemEffect(ownership: ShopOwnership): Promise<void> {
  switch (getShopItemType(ownership.itemId)) {
    case 'BOOST':
      // Activate XP boost
      eventBus.publish('progression:activate_boost', {
        userId: ownership.userId,
        boostType: 'XP',
        multiplier: 1.5,
        duration: 24 * 60 * 60 * 1000, // 24 hours in ms
      });
      break;
    case 'SHIELD':
      // Add streak shield
      eventBus.publish('streaks:add_shield', {
        userId: ownership.userId,
        shieldType: 'STREAK_PROTECTION',
        duration: 24 * 60 * 60 * 1000, // 24 hours
      });
      break;
    case 'THEME':
      // Unlock theme
      eventBus.publish('cosmetics:unlock_theme', {
        userId: ownership.userId,
        themeId: ownership.itemId,
        source: 'SHOP_PURCHASE',
      });
      break;
  }
}

async function checkSpendingMilestones(userId: string, currency: string, amount: number): Promise<void> {
  // Track cumulative spending for milestones
  const key = `spending:${userId}:${currency}`;
  const current = await getCumulativeSpending(key);
  const newTotal = current + amount;
  await setCumulativeSpending(key, newTotal);

  // Check milestone thresholds
  const milestones = [100, 500, 1000, 5000, 10000];
  for (const milestone of milestones) {
    if (current < milestone && newTotal >= milestone) {
      eventBus.publish('milestones:spending_reached', {
        userId,
        currency,
        milestoneId: `${currency}-${milestone}`,
        milestone: String(milestone),
        totalSpent: newTotal,
      });
    }
  }
}

async function getCumulativeSpending(key: string): Promise<number> {
  // Would fetch from cache/persistence
  return 0;
}

async function setCumulativeSpending(key: string, value: number): Promise<void> {
  // Would persist to cache/persistence
  Sentry.addBreadcrumb({
    category: 'economy-feed',
    message: 'Persisting cumulative spending',
    level: 'info',
    data: {
      key,
      value,
    },
  });
}

async function getEventBonusMultiplier(userId: string, eventId: string): Promise<number> {
  // Check if user has event pass or VIP status
  // Return bonus multiplier (1.0 = no bonus, 2.0 = double rewards)
  return 1.0;
}

function isRareItem(itemId: string): boolean {
  const rarePrefixes = ['legendary_', 'mythic_', 'epic_'];
  return rarePrefixes.some(prefix => itemId.startsWith(prefix));
}

function getShopItemType(itemId: string): 'BOOST' | 'COSMETIC' | 'SHIELD' | 'THEME' {
  if (itemId.includes('boost')) {return 'BOOST';}
  if (itemId.includes('shield')) {return 'SHIELD';}
  if (itemId.includes('theme')) {return 'THEME';}
  return 'COSMETIC';
}
