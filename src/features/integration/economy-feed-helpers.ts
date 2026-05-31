import { eventBus } from '../../events/EventBus';
import * as Sentry from '@sentry/react-native';

export interface CurrencyTransaction {
  userId: string;
  currency: string;
  type: 'earn' | 'spend';
  amount: number;
  source: string;
  itemId?: string;
}

export interface ShopOwnership {
  userId: string;
  itemId: string;
  price: { currency: 'COINS' | 'GEMS' | 'SEASONAL'; amount: number };
}

export async function recordShopOwnership(ownership: ShopOwnership): Promise<void> {
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

export async function applyItemEffect(ownership: ShopOwnership): Promise<void> {
  switch (getShopItemType(ownership.itemId)) {
    case 'BOOST':
      eventBus.publish('progression:activate_boost', {
        userId: ownership.userId,
        boostType: 'XP',
        multiplier: 1.5,
        duration: 24 * 60 * 60 * 1000,
      });
      break;
    case 'SHIELD':
      eventBus.publish('streaks:add_shield', {
        userId: ownership.userId,
        shieldType: 'STREAK_PROTECTION',
        duration: 24 * 60 * 60 * 1000,
      });
      break;
    case 'THEME':
      eventBus.publish('cosmetics:unlock_theme', {
        userId: ownership.userId,
        themeId: ownership.itemId,
        source: 'SHOP_PURCHASE',
      });
      break;
  }
}

export async function checkSpendingMilestones(
  userId: string,
  currency: string,
  amount: number,
): Promise<void> {
  const key = `spending:${userId}:${currency}`;
  const current = await getCumulativeSpending(key);
  const newTotal = current + amount;
  await setCumulativeSpending(key, newTotal);
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

export async function getCumulativeSpending(key: string): Promise<number> {
  return 0;
}

export async function setCumulativeSpending(
  key: string,
  value: number,
): Promise<void> {
  Sentry.addBreadcrumb({
    category: 'economy-feed',
    message: 'Persisting cumulative spending',
    level: 'info',
    data: { key, value },
  });
}

export async function getEventBonusMultiplier(
  userId: string,
  eventId: string,
): Promise<number> {
  return 1.0;
}

export function isRareItem(itemId: string): boolean {
  const rarePrefixes = ['legendary_', 'mythic_', 'epic_'];
  return rarePrefixes.some((prefix) => itemId.startsWith(prefix));
}

export function getShopItemType(
  itemId: string,
): 'BOOST' | 'COSMETIC' | 'SHIELD' | 'THEME' {
  if (itemId.includes('boost')) {
    return 'BOOST';
  }
  if (itemId.includes('shield')) {
    return 'SHIELD';
  }
  if (itemId.includes('theme')) {
    return 'THEME';
  }
  return 'COSMETIC';
}
