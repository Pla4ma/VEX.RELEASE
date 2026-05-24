import { z } from 'zod';

import type { ChestResult } from '../rewards/chest-engine';
import type { SessionSummary } from '../../session/types';

const PremiumChestTierSchema = z.enum(['common', 'rare', 'epic', 'legendary']);

export const PremiumCompletionRewardSchema = z
  .object({
    cosmeticLabel: z.string().min(1).nullable(),
    focusCredits: z.number().int().min(0),
    tier: PremiumChestTierSchema,
    title: z.string().min(1),
    xp: z.number().int().min(0),
  })
  .strict();

export type PremiumCompletionReward = z.infer<
  typeof PremiumCompletionRewardSchema
>;

const TIER_COPY: Record<z.infer<typeof PremiumChestTierSchema>, string> = {
  common: 'Focus chest opened',
  rare: 'Rare focus chest opened',
  epic: 'Epic focus chest opened',
  legendary: 'Legendary focus chest opened',
};

const COSMETIC_COPY: Record<z.infer<typeof PremiumChestTierSchema>, string | null> = {
  common: null,
  rare: 'Theme shard',
  epic: 'Premium focus aura',
  legendary: 'Legendary completion frame',
};

function getFocusCredits(chestResult: ChestResult | null, summary: SessionSummary): number {
  const baseXp = chestResult?.xpReward ?? summary.xpEarned ?? 0;
  return Math.max(0, Math.round(baseXp * 0.1));
}

export function buildPremiumCompletionReward(input: {
  chestResult: ChestResult | null;
  summary: SessionSummary;
}): PremiumCompletionReward {
  const tier = input.chestResult?.tier ?? 'common';

  return PremiumCompletionRewardSchema.parse({
    cosmeticLabel: input.chestResult?.bonusItemId ? COSMETIC_COPY[tier] : null,
    focusCredits: getFocusCredits(input.chestResult, input.summary),
    tier,
    title: TIER_COPY[tier],
    xp: input.chestResult?.xpReward ?? input.summary.xpEarned ?? 0,
  });
}
