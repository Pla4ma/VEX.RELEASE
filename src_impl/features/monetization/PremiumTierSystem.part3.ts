import { eventBus } from "../../events";


export function getUserSubscription(userId: string): UserSubscription | null {
  return subscriptionStore.get(userId) || null;
}

export function getUserTier(userId: string): SubscriptionTier {
  const sub = subscriptionStore.get(userId);
  return sub?.tier || 'FREE';
}

export function isPremium(userId: string): boolean {
  return getUserTier(userId) === 'PREMIUM';
}

export function isInTrial(userId: string): boolean {
  const sub = subscriptionStore.get(userId);
  if (!sub) {
    return false;
  }
  if (!sub.isTrial || !sub.trialEndsAt) {
    return false;
  }
  return Date.now() < sub.trialEndsAt;
}

export function getTrialDaysRemaining(userId: string): number {
  const sub = subscriptionStore.get(userId);
  if (!sub?.trialEndsAt) {
    return 0;
  }
  const msRemaining = sub.trialEndsAt - Date.now();
  return Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
}