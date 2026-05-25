import { z } from 'zod';

import type { SessionSummary } from '../../session/types';

export const PremiumCompletionRewardSchema = z
  .object({
    cta: z.string().min(1),
    description: z.string().min(1),
    focusCredits: z.number().int().nonnegative(),
    title: z.string().min(1),
    xp: z.number().int().nonnegative(),
  })
  .strict();

export type PremiumCompletionReward = z.infer<
  typeof PremiumCompletionRewardSchema
>;

export function buildPremiumCompletionReward(
  summary: SessionSummary,
): PremiumCompletionReward {
  const xp = summary.xpEarned ?? 0;
  const strongSession = xp >= 100;

  return PremiumCompletionRewardSchema.parse({
    cta: strongSession ? 'Generate next study path' : 'Save to Coach Memory',
    description: strongSession
      ? 'Turn this strong session into a sharper next study or deep work path.'
      : 'Keep this rhythm available for Coach Memory. Premium adds memory and intelligence after the core habit is proven.',
    focusCredits: Math.floor(xp / 10),
    title: strongSession
      ? 'Unlock deeper weekly insight'
      : 'Save this rhythm to Coach Memory',
    xp,
  });
}
