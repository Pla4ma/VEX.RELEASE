import { eventBus } from '../../events';
import {
  TIERS,
  type TierId,
  type TierFeatureKey,
  hasFeature,
  getMaxActiveStudyPlans,
} from './tier-definitions';

export type SubscriptionTier = TierId;
export type { TierId, TierFeatureKey };

// ── Feature Gates ───────────────────────────────────────

export type PaywallContextType =
  | 'DEEP_COACH_MEMORY'
  | 'ADVANCED_STUDY_OS'
  | 'PROGRESS_INTELLIGENCE'
  | 'VISUAL_IDENTITY'
  | 'PREMIUM_SESSION_MODES'
  | 'RECOVERY_PLANNING'
  | 'STUDY_PLAN_LIMIT';

export interface FeatureGate {
  feature: TierFeatureKey | 'maxActiveStudyPlans';
  requiresPremium: boolean;
  paywallContext: PaywallContextType;
  fallbackMessage: string;
}

export const FEATURE_GATES: FeatureGate[] = [
  {
    feature: 'maxActiveStudyPlans',
    requiresPremium: true,
    paywallContext: 'STUDY_PLAN_LIMIT',
    fallbackMessage:
      'Free users can have 1 active study plan. Upgrade for unlimited.',
  },
  {
    feature: 'deepCoachMemory',
    requiresPremium: true,
    paywallContext: 'DEEP_COACH_MEMORY',
    fallbackMessage: 'Deep Coach Memory is a Premium feature.',
  },
  {
    feature: 'advancedStudyOS',
    requiresPremium: true,
    paywallContext: 'ADVANCED_STUDY_OS',
    fallbackMessage: 'Advanced Study / Deep Work is a Premium feature.',
  },
  {
    feature: 'progressIntelligence',
    requiresPremium: true,
    paywallContext: 'PROGRESS_INTELLIGENCE',
    fallbackMessage: 'Progress Intelligence is a Premium feature.',
  },
  {
    feature: 'visualIdentity',
    requiresPremium: true,
    paywallContext: 'VISUAL_IDENTITY',
    fallbackMessage: 'Visual Identity is a Premium feature.',
  },
  {
    feature: 'premiumSessionModes',
    requiresPremium: true,
    paywallContext: 'PREMIUM_SESSION_MODES',
    fallbackMessage: 'Premium Session Modes are a Premium feature.',
  },
  {
    feature: 'recoveryPlanning',
    requiresPremium: true,
    paywallContext: 'RECOVERY_PLANNING',
    fallbackMessage: 'Recovery Planning is a Premium feature.',
  },
];

// ── Functions ───────────────────────────────────────────

export { TIERS };
export { hasFeature as hasFeatureAccess };

export function canCreateStudyPlan(
  userTier: SubscriptionTier,
  currentPlanCount: number,
): boolean {
  return currentPlanCount < getMaxActiveStudyPlans(userTier);
}

export function getRemainingStudyPlanSlots(
  userTier: SubscriptionTier,
  currentPlanCount: number,
): number {
  const max = getMaxActiveStudyPlans(userTier);
  if (max === Infinity) {return Infinity;}
  return Math.max(0, max - currentPlanCount);
}

export function getFeatureGate(
  feature: TierFeatureKey | 'maxActiveStudyPlans',
): FeatureGate | null {
  return FEATURE_GATES.find((g) => g.feature === feature) ?? null;
}

export function shouldShowPaywall(
  userTier: SubscriptionTier,
  feature: TierFeatureKey | 'maxActiveStudyPlans',
): { show: boolean; context: PaywallContextType | null } {
  if (userTier === 'premium') {return { show: false, context: null };}
  const gate = getFeatureGate(feature);
  if (!gate) {return { show: false, context: null };}
  return { show: true, context: gate.paywallContext };
}

export {
  getPaywallContext,
  PAYWALL_CONTEXTS,
  type PaywallContextData,
} from './paywall-contexts';

// ── Subscription Management (persistent) ────────────────

import { subscriptionStore } from './subscription-store';

const { getSubscription, setSubscription } = subscriptionStore;

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  startedAt: number;
  expiresAt: number | null;
  isTrial: boolean;
  trialEndsAt: number | null;
  autoRenew: boolean;
  platform: 'ios' | 'android' | 'web';
}

export function setUserSubscription(sub: UserSubscription): void {
  setSubscription(sub);
  eventBus.publish('subscription:changed', {
    userId: sub.userId,
    tier: sub.tier,
    isTrial: sub.isTrial,
  });
}

export function getUserSubscription(userId: string): UserSubscription | null {
  return getSubscription(userId);
}

export function getUserTier(userId: string): SubscriptionTier {
  return getSubscription(userId)?.tier ?? 'free';
}

export function isPremium(userId: string): boolean {
  return getUserTier(userId) === 'premium';
}

export function isInTrial(userId: string): boolean {
  const sub = getSubscription(userId);
  if (!sub?.isTrial || !sub.trialEndsAt) {return false;}
  return Date.now() < sub.trialEndsAt;
}

export function getTrialDaysRemaining(userId: string): number {
  const sub = getSubscription(userId);
  if (!sub?.trialEndsAt) {return 0;}
  return Math.max(
    0,
    Math.ceil((sub.trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24)),
  );
}
