import { z } from 'zod';

export const HeadlineRewardTypeSchema = z.enum([
  'streak_saved',
  'streak_milestone',
  'companion_evolved',
  'boss_defeated',
  'level_up',
  'challenge_complete',
  'personal_best',
  'comeback_complete',
  'contract_done',
  'xp_earned',
]);

export const HeadlineRewardSchema = z
  .object({
    type: HeadlineRewardTypeSchema,
    title: z.string().min(1),
    body: z.string().min(1),
    iconName: z.string().min(1),
    value: z.string().min(1),
  })
  .strict();

export const HeadlineRewardConsequencesSchema = z
  .object({
    boss: z
      .object({
        currentHealth: z.number(),
        isEnabled: z.boolean(),
      })
      .optional(),
    challenge: z
      .object({
        completedThisSession: z.boolean(),
        isEnabled: z.boolean(),
      })
      .optional(),
    comeback: z.object({ isComplete: z.boolean() }).optional(),
    companion: z.object({ evolved: z.boolean() }).optional(),
    contract: z.object({ status: z.enum(['done', 'partial', 'not_done', 'skipped']).nullable() }).optional(),
    personalBest: z.object({ isPersonalBest: z.boolean(), purityScore: z.number().optional() }).optional(),
    streak: z
      .object({
        currentDays: z.number().int().min(0),
        previousDays: z.number().int().min(0),
        streakSaved: z.boolean(),
      })
      .optional(),
    summary: z.object({
      coinsEarned: z.number().default(0),
      focusScoreBandChanged: z.boolean().optional(),
      focusScoreDelta: z.number().int().optional(),
      focusPurityScore: z.number().optional(),
      gemsEarned: z.number().default(0),
      newLevel: z.number().int().min(1),
      previousLevel: z.number().int().min(1),
      sessionMode: z.string().min(1),
      xpEarned: z.number(),
    }).passthrough(),
  })
  .strict();
