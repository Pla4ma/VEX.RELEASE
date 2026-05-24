import { z } from 'zod';
import { createDebugger } from '../../utils/debug';
import { TIERS, type TierId } from './tier-definitions';
import type { SubscriptionTier } from './PremiumTierSystem';

const debug = createDebugger('monetization:value-ladder');

export type ValueTier = SubscriptionTier;

export type { TierId };

export interface TierConfig {
  id: ValueTier;
  name: string;
  price: number;
  period: 'month' | 'year';
  monthlyEquivalent: number;
  features: string[];
  badge?: string;
  trialDays?: number;
}

export interface LadderPosition {
  currentTier: ValueTier;
  sessionsCompleted: number;
  daysActive: number;
  nextRecommendedTier: SubscriptionTier;
  upgradeUrgency: 'low' | 'medium' | 'high';
  discountEligible: boolean;
  discountPercent?: number;
}

const TIER_OUTPUT_SCHEMA = z.object({
  currentTier: z.enum(['free', 'premium']),
  sessionsCompleted: z.number().int().min(0),
  daysActive: z.number().int().min(0),
  nextRecommendedTier: z.enum(['free', 'premium']),
  upgradeUrgency: z.enum(['low', 'medium', 'high']),
  discountEligible: z.boolean(),
  discountPercent: z.number().min(0).max(100).optional(),
});

function buildTierConfig(id: ValueTier): TierConfig {
  const def = TIERS[id];
  return {
    id,
    name: def.name,
    price: def.monthlyPrice ?? 0,
    period: 'month',
    monthlyEquivalent: def.yearlyPrice ? def.yearlyPrice / 12 : (def.monthlyPrice ?? 0),
    features: def.featureStrings,
    badge: id === 'premium' ? 'PREMIUM' : undefined,
    trialDays: def.trialDays,
  };
}

export const TIER_CONFIGS: Record<ValueTier, TierConfig> = {
  free: buildTierConfig('free'),
  premium: buildTierConfig('premium'),
};

export function calculateLadderPosition(
  currentTier: ValueTier,
  sessionsCompleted: number,
  daysActive: number,
  hasShownInterest: boolean,
): LadderPosition {
  if (currentTier === 'premium') {
    return {
      currentTier,
      sessionsCompleted,
      daysActive,
      nextRecommendedTier: 'premium',
      upgradeUrgency: 'low',
      discountEligible: false,
    };
  }

  let urgency: 'low' | 'medium' | 'high' = 'low';
  let discountEligible = false;
  let discountPercent: number | undefined;

  if (sessionsCompleted >= 7 && daysActive >= 7) {
    urgency = 'medium';
  }
  if (sessionsCompleted >= 20 && daysActive >= 14) {
    urgency = 'high';
    discountEligible = true;
    discountPercent = 20;
  }
  if (hasShownInterest && sessionsCompleted >= 5) {
    discountEligible = true;
    discountPercent = 15;
  }

  return TIER_OUTPUT_SCHEMA.parse({
    currentTier,
    sessionsCompleted,
    daysActive,
    nextRecommendedTier: 'premium',
    upgradeUrgency: urgency,
    discountEligible,
    discountPercent,
  }) as LadderPosition;
}

export function getUpgradeMessage(position: LadderPosition): string {
  if (position.currentTier === 'premium') {
    return 'You are already on Premium.';
  }
  if (position.upgradeUrgency === 'high') {
    return 'Your rhythm is strong. VEX Pro turns that rhythm into a full execution system.';
  }
  if (position.upgradeUrgency === 'medium') {
    return 'You are building real momentum. Premium adds depth when you are ready.';
  }
  if (position.discountEligible && position.discountPercent) {
    return `${position.discountPercent}% off VEX Pro for early rhythm builders.`;
  }
  return 'Keep building your rhythm. Premium will be ready when you are.';
}

export function getPaywallTiming(
  sessionsCompleted: number,
  daysSinceLastPaywall: number,
  lastSessionQuality: number,
): { shouldShow: boolean; delayMinutes: number; trigger: 'post_session' | 'session_7' | 'none' } {
  if (daysSinceLastPaywall < 7) {
    return { shouldShow: false, delayMinutes: 0, trigger: 'none' };
  }
  if (lastSessionQuality > 85 && sessionsCompleted >= 5) {
    return { shouldShow: true, delayMinutes: 2, trigger: 'post_session' };
  }
  if (sessionsCompleted === 7) {
    return { shouldShow: true, delayMinutes: 0, trigger: 'session_7' };
  }
  return { shouldShow: false, delayMinutes: 0, trigger: 'none' };
}

export function calculateUpgradeDiscount(
  _fromTier: ValueTier,
  _toTier: ValueTier,
  daysActive: number,
): { eligible: boolean; discountPercent: number; reason: string } {
  if (daysActive >= 30) return { eligible: true, discountPercent: 15, reason: 'Consistent rhythm' };
  if (daysActive >= 14) return { eligible: true, discountPercent: 10, reason: 'Building momentum' };
  return { eligible: false, discountPercent: 0, reason: '' };
}

export function formatTierPrice(
  tier: ValueTier,
  discountPercent?: number,
): { fullPrice: string; discountedPrice: string; savings: string } {
  const config = TIER_CONFIGS[tier];
  const fullPrice = `$${config.price.toFixed(2)}`;
  if (!discountPercent || discountPercent === 0 || tier === 'free') {
    return { fullPrice, discountedPrice: fullPrice, savings: '' };
  }
  const discounted = config.price * (1 - discountPercent / 100);
  const savings = config.price - discounted;
  return {
    fullPrice,
    discountedPrice: `$${discounted.toFixed(2)}`,
    savings: `Save $${savings.toFixed(2)}`,
  };
}

export function getFeatureComparison(
  currentTier: ValueTier,
  targetTier: ValueTier,
): { newFeatures: string[]; upgradedFeatures: string[] } {
  const currentFeatures = TIER_CONFIGS[currentTier].features;
  const targetFeatures = TIER_CONFIGS[targetTier].features;
  const newFeatures = targetFeatures.filter((f) => !currentFeatures.includes(f));
  return { newFeatures, upgradedFeatures: [] };
}

export async function trackLadderInteraction(
  userId: string,
  action: 'viewed' | 'dismissed' | 'selected_tier' | 'started_trial',
  tier?: ValueTier,
): Promise<void> {
  debug.info('Value ladder interaction: user=%s action=%s tier=%s', userId, action, tier ?? 'none');
}
