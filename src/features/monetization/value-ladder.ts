/**
 * Value Ladder Service
 *
 * Manages the progressive premium offering structure.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('monetization:value-ladder');

// Value ladder tier
export type ValueTier = 'free' | 'plus' | 'pro' | 'elite';

// Tier configuration
export interface TierConfig {
  id: ValueTier;
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  highlight?: string;
  badge?: string;
  trialDays?: number;
}

// User's position on value ladder
export interface LadderPosition {
  currentTier: ValueTier;
  sessionsCompleted: number;
  daysActive: number;
  nextRecommendedTier: ValueTier;
  upgradeUrgency: 'low' | 'medium' | 'high';
  discountEligible: boolean;
  discountPercent?: number;
}

// Tier configurations
export const TIER_CONFIGS: Record<ValueTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    features: [
      '3 sessions per day',
      'Basic boss battles',
      'Streak tracking',
      'Global leaderboards',
    ],
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 4.99,
    period: 'month',
    features: [
      'Unlimited sessions',
      'Advanced analytics',
      'Custom themes',
      'Priority support',
      'No ads',
    ],
    highlight: 'Most Popular',
    badge: 'PLUS',
    trialDays: 7,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    period: 'month',
    features: [
      'Everything in Plus',
      'AI coach access',
      'Squad creation',
      'Advanced duels',
      'Premium chests',
      'Custom avatars',
    ],
    badge: 'PRO',
    trialDays: 14,
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: 19.99,
    period: 'month',
    features: [
      'Everything in Pro',
      'Exclusive boss raids',
      'Early access features',
      'VIP support',
      'Lifetime stats',
      'Custom badges',
    ],
    highlight: 'Best Value',
    badge: 'ELITE',
    trialDays: 14,
  },
};

// Calculate user's ladder position
export function calculateLadderPosition(
  currentTier: ValueTier,
  sessionsCompleted: number,
  daysActive: number,
  hasShownInterest: boolean
): LadderPosition {
  let nextTier: ValueTier = currentTier;
  let urgency: 'low' | 'medium' | 'high' = 'low';
  let discountEligible = false;
  let discountPercent: number | undefined;

  // Determine next recommended tier
  const tierOrder: ValueTier[] = ['free', 'plus', 'pro', 'elite'];
  const currentIndex = tierOrder.indexOf(currentTier);

  if (currentIndex < tierOrder.length - 1) {
    nextTier = tierOrder[currentIndex + 1];
  }

  // Calculate upgrade urgency
  if (currentTier === 'free') {
    if (sessionsCompleted >= 10 && daysActive >= 3) {
      urgency = 'medium';
    }
    if (sessionsCompleted >= 20 && daysActive >= 7) {
      urgency = 'high';
      discountEligible = true;
      discountPercent = 20;
    }
  }

  // High engagement = discount eligibility
  if (hasShownInterest && sessionsCompleted > 50) {
    discountEligible = true;
    discountPercent = 15;
  }

  return {
    currentTier,
    sessionsCompleted,
    daysActive,
    nextRecommendedTier: nextTier,
    upgradeUrgency: urgency,
    discountEligible,
    discountPercent,
  };
}

// Get upgrade message based on position
export function getUpgradeMessage(position: LadderPosition): string {
  if (position.upgradeUrgency === 'high') {
    return 'You are crushing it! Unlock your full potential with Premium.';
  }
  if (position.upgradeUrgency === 'medium') {
    return 'Ready to level up? Premium features await.';
  }
  if (position.discountEligible && position.discountPercent) {
    return `${position.discountPercent}% off Premium - Limited time offer!`;
  }

  const nextConfig = TIER_CONFIGS[position.nextRecommendedTier];
  return `Upgrade to ${nextConfig.name} for ${nextConfig.features[0].toLowerCase()}`;
}

// Get paywall timing recommendation
export function getPaywallTiming(
  sessionsCompleted: number,
  daysSinceLastPaywall: number,
  lastSessionQuality: number
): {
  shouldShow: boolean;
  delayMinutes: number;
  trigger: 'post_session' | 'streak_milestone' | 'boss_defeat' | 'none';
} {
  // Don't show too frequently
  if (daysSinceLastPaywall < 3) {
    return { shouldShow: false, delayMinutes: 0, trigger: 'none' };
  }

  // Show after quality session
  if (lastSessionQuality > 85 && sessionsCompleted >= 5) {
    return { shouldShow: true, delayMinutes: 2, trigger: 'post_session' };
  }

  // Show at streak milestones
  if (sessionsCompleted === 7 || sessionsCompleted === 14 || sessionsCompleted === 30) {
    return { shouldShow: true, delayMinutes: 0, trigger: 'streak_milestone' };
  }

  return { shouldShow: false, delayMinutes: 0, trigger: 'none' };
}

// Calculate discount for tier upgrade
export function calculateUpgradeDiscount(
  fromTier: ValueTier,
  toTier: ValueTier,
  daysActive: number
): {
  eligible: boolean;
  discountPercent: number;
  reason: string;
} {
  const tierValues = { free: 0, plus: 1, pro: 2, elite: 3 };
  const jump = tierValues[toTier] - tierValues[fromTier];

  // Big jumps get bigger discounts
  if (jump >= 2) {
    return {
      eligible: true,
      discountPercent: 25,
      reason: 'Big upgrade bonus',
    };
  }

  // Loyal users get discounts
  if (daysActive > 30) {
    return {
      eligible: true,
      discountPercent: 15,
      reason: 'Loyal user discount',
    };
  }

  return {
    eligible: false,
    discountPercent: 0,
    reason: '',
  };
}

// Format tier price with discount
export function formatTierPrice(
  tier: ValueTier,
  discountPercent?: number
): {
  fullPrice: string;
  discountedPrice: string;
  savings: string;
} {
  const config = TIER_CONFIGS[tier];
  const fullPrice = `$${config.price.toFixed(2)}`;

  if (!discountPercent || discountPercent === 0) {
    return {
      fullPrice,
      discountedPrice: fullPrice,
      savings: '',
    };
  }

  const discounted = config.price * (1 - discountPercent / 100);
  const savings = config.price - discounted;

  return {
    fullPrice,
    discountedPrice: `$${discounted.toFixed(2)}`,
    savings: `Save $${savings.toFixed(2)}`,
  };
}

// Get feature comparison for tier
export function getFeatureComparison(
  currentTier: ValueTier,
  targetTier: ValueTier
): {
  newFeatures: string[];
  upgradedFeatures: string[];
} {
  const currentFeatures = TIER_CONFIGS[currentTier].features;
  const targetFeatures = TIER_CONFIGS[targetTier].features;

  const newFeatures = targetFeatures.filter((f) => !currentFeatures.includes(f));
  const upgradedFeatures = targetFeatures.filter((f) =>
    currentFeatures.some((cf) => f.includes(cf.replace('Basic', '').replace('Limited', '').trim()))
  );

  return { newFeatures, upgradedFeatures };
}

// Track value ladder interaction
export async function trackLadderInteraction(
  userId: string,
  action: 'viewed' | 'dismissed' | 'selected_tier' | 'started_trial',
  tier?: ValueTier
): Promise<void> {
  debug.info('Value ladder interaction: user=%s action=%s tier=%s', userId, action, tier ?? 'none');

  // In production: analytics tracking
  // await analytics.logEvent('value_ladder_interaction', { userId, action, tier });
}
