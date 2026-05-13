import { z } from "zod";
import { createDebugger } from "../../utils/debug";


export function formatTierPrice(
  tier: ValueTier,
  discountPercent?: number,
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

export function getFeatureComparison(
  currentTier: ValueTier,
  targetTier: ValueTier,
): {
  newFeatures: string[];
  upgradedFeatures: string[];
} {
  const currentFeatures = TIER_CONFIGS[currentTier].features;
  const targetFeatures = TIER_CONFIGS[targetTier].features;

  const newFeatures = targetFeatures.filter((f) => !currentFeatures.includes(f));
  const upgradedFeatures = targetFeatures.filter((f) => currentFeatures.some((cf) => f.includes(cf.replace('Basic', '').replace('Limited', '').trim())));

  return { newFeatures, upgradedFeatures };
}

export async function trackLadderInteraction(userId: string, action: 'viewed' | 'dismissed' | 'selected_tier' | 'started_trial', tier?: ValueTier): Promise<void> {
  debug.info('Value ladder interaction: user=%s action=%s tier=%s', userId, action, tier ?? 'none');

  // In production: analytics tracking
  // await analytics.logEvent('value_ladder_interaction', { userId, action, tier });
}