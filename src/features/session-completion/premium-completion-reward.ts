/**
 * DEPRECATED — VEX Phase 6 (economy deactivation).
 *
 * Premium chest/economy language was part of the archived economy_advanced system.
 * This file remains for type reference only. Do not import in new code.
 * Final release completion screens use XP/level/streak/progress only.
 */

import { z } from 'zod';

import type { ChestResult } from '../rewards/chest-engine';
import type { SessionSummary } from '../../session/types';

export const PremiumCompletionRewardSchema = z
  .object({
    cta: z.string().min(1),
    description: z.string().min(1),
    focusCredits: z.number().int().nonnegative(),
    tier: z.string().min(1),
    title: z.string().min(1),
    xp: z.number().int().nonnegative(),
  })
  .strict();

export type PremiumCompletionReward = z.infer<
  typeof PremiumCompletionRewardSchema
>;

export function buildPremiumCompletionReward(input: {
  chestResult: ChestResult | null;
  summary: SessionSummary;
}): PremiumCompletionReward {
  const xp = input.chestResult?.xpReward ?? input.summary.xpEarned ?? 0;
  const strongSession = xp >= 100;

  return PremiumCompletionRewardSchema.parse({
    cta: strongSession ? 'Generate next study path' : 'Save to Coach Memory',
    description: strongSession
      ? 'Turn this strong session into a sharper next study or deep work path.'
      : 'Keep this rhythm available for future Coach Memory when premium is live.',
    focusCredits: Math.floor(xp / 10),
    tier: input.chestResult?.tier ?? 'standard',
    title: strongSession
      ? 'Unlock deeper weekly insight'
      : 'Save this rhythm to Coach Memory',
    xp,
  });
}
