import { z } from 'zod';

export const HeadlineRewardSchema = z
  .object({
    body: z.string(),
    iconName: z.string().optional(),
    id: z.string(),
    priority: z.number(),
    title: z.string(),
    type: z.string().optional(),
    value: z.string().optional(),
  })
  .strict();

export type HeadlineReward = z.infer<typeof HeadlineRewardSchema>;

export const HeadlineRewardTypeSchema = z.enum([
  'xp',
  'streak',
  'grade',
  'proof',
  'unlock',
]);

export const HeadlineRewardConsequencesSchema = z
  .object({
    adaptivePayoff: z.string().nullable().optional(),
    boss: z
      .object({
        currentHealth: z.number().default(0),
        isEnabled: z.boolean().default(false),
      })
      .default({}),
    challenge: z
      .object({
        completedThisSession: z.boolean().default(false),
        isEnabled: z.boolean().default(false),
      })
      .default({}),
    companion: z
      .object({
        evolved: z.boolean().default(false),
      })
      .default({}),
    companionReaction: z.string().nullable().optional(),
    personalBest: z
      .object({
        isPersonalBest: z.boolean().default(false),
        purityScore: z.number().optional(),
      })
      .default({}),
    rewards: z.array(HeadlineRewardSchema).default([]),
    streak: z
      .object({
        currentDays: z.number().default(0),
        previousDays: z.number().default(0),
        streakSaved: z.boolean().default(false),
      })
      .default({}),
    summary: z
      .object({
        focusPurityScore: z.number().optional(),
        focusScoreBandChanged: z.boolean().optional(),
        focusScoreDelta: z.number().optional(),
        newLevel: z.number().default(1),
        previousLevel: z.number().default(1),
        xpEarned: z.number().default(0),
      })
      .default({}),
  })
  .passthrough();

export type HeadlineRewardType = z.infer<typeof HeadlineRewardTypeSchema>;
export type HeadlineRewardConsequences = z.infer<
  typeof HeadlineRewardConsequencesSchema
>;
