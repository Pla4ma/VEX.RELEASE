import { z } from 'zod';
import { mmkvStorage } from '../../store/mmkv-storage';
import type { UserSubscription } from './PremiumTierSystem';

const STORE_KEY = 'vex:subscriptions';

const UserSubscriptionSchema = z.object({
  userId: z.string(),
  tier: z.string(),
  startedAt: z.number(),
  expiresAt: z.number().nullable(),
  isTrial: z.boolean(),
  trialEndsAt: z.number().nullable(),
  autoRenew: z.boolean(),
  platform: z.enum(['ios', 'android', 'web']),
});

const SubscriptionMapSchema = z.record(z.string(), UserSubscriptionSchema);

function loadAll(): Record<string, UserSubscription> {
  try {
    const raw = mmkvStorage.getItem(STORE_KEY);
    if (!raw) {return {};}
    const parsed = SubscriptionMapSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as Record<string, UserSubscription>) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, UserSubscription>): void {
  mmkvStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function getSubscription(userId: string): UserSubscription | null {
  const all = loadAll();
  return all[userId] ?? null;
}

function setSubscription(sub: UserSubscription): void {
  const all = loadAll();
  all[sub.userId] = sub;
  saveAll(all);
}

export const subscriptionStore = {
  getSubscription,
  setSubscription,
};
