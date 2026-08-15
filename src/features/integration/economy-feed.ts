import { eventBus } from '../../events/EventBus';
import * as Sentry from '@sentry/react-native';
import type { CurrencyTransaction, ShopOwnership } from './economy-feed-helpers';
import {
  recordShopOwnership,
  applyItemEffect,
  checkSpendingMilestones,
  getEventBonusMultiplier,
  isRareItem,
  getShopItemType,
} from './economy-feed-helpers';

export type { CurrencyTransaction, ShopOwnership };

export function initializeEconomyFeedIntegration(): () => void {
  const handlers: Array<() => void> = [];
  handlers.push(
    eventBus.subscribe(
      'economy:transaction',
      async (event: CurrencyTransaction) => {
        if (!event || !event.userId) {
          return;
        }
        try {
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
          if (event.amount > 0) {
            eventBus.publish('seasons:challenge_progress', {
              userId: event.userId,
              challengeId: 'currency_earned',
              progress: event.amount,
              completed: false,
            });
          }
          if (event.amount < 0) {
            checkSpendingMilestones(
              event.userId,
              event.currency,
              Math.abs(event.amount),
            );
          }
          if (event.currency === 'XP' && event.amount > 0) {
            eventBus.publish('progression:add_xp', {
              userId: event.userId,
              amount: event.amount,
              source: event.source,
            });
          }
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
      },
    ),
  );
  handlers.push(
    eventBus.subscribe('economy:purchase', async (event: ShopOwnership) => {
      if (!event || !event.userId) {
        return;
      }
      try {
        await recordShopOwnership(event);
        eventBus.publish('seasons:challenge_progress', {
          userId: event.userId,
          challengeId: 'shop_purchase',
          progress: 1,
          completed: false,
        });
        await applyItemEffect(event);
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
    }),
  );
  handlers.push(
    eventBus.subscribe('events:reward_earned', async (event) => {
      if (!event || !event.userId) {
        return;
      }
      const bonusMultiplier = await getEventBonusMultiplier(
        event.userId,
        event.eventId,
      );
      if (bonusMultiplier > 1) {
        const rewardType =
          event.rewardType === 'XP'
            ? 'COINS'
            : (event.rewardType as 'COINS' | 'GEMS' | 'SEASONAL');
        eventBus.publish('economy:add_currency', {
          userId: event.userId,
          type: rewardType,
          amount: Math.floor(event.amount * bonusMultiplier),
          source: 'EVENT_BONUS',
        });
      }
    }),
  );
  return () => handlers.forEach((unsub) => unsub());
}
