import { z } from 'zod';

export const PersonalBossBlockSchema = z.object({
  id: z.string(),
  label: z.string(),
  unlockAfterSessions: z.number().int().min(0),
  motivationStyle: z.enum(['calm', 'study', 'game_like', 'intense']).optional(),
});

export type PersonalBossBlock = z.infer<typeof PersonalBossBlockSchema>;

export type BossVisibility = 'hidden' | 'teaser' | 'subtle' | 'visible';

/** Non-economy completion impact signal — XP/progress only, no coins/gems. */
export interface PersonalBossCompletionSignal {
  bossId: string;
  xpAwarded: number;
  defeated: boolean;
}