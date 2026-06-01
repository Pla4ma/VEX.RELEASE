import { z } from 'zod';

import type { MasteryChallenge, MasteryState } from './types';

export const TECHNIQUE_KEYS = [
  'durationMastery',
  'purityMastery',
  'consistencyMastery',
  'comebackMastery',
  'bossMastery',
] as const;

export const rankSchema = z.enum([
  'APPRENTICE',
  'ADEPT',
  'EXPERT',
  'MASTER',
  'GRANDMASTER',
]);

export const challengeSchema: z.ZodType<MasteryChallenge> = z.object({
  id: z.string(),
  technique: z.enum(TECHNIQUE_KEYS),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ELITE']),
  target: z.number(),
  current: z.number(),
  unit: z.string(),
  masteryPoints: z.number(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CLAIMED']),
  completedAt: z.number().nullable(),
});

export const masteryStateSchema: z.ZodType<MasteryState> = z.object({
  userId: z.string().min(1),
  totalMasteryPoints: z.number().min(0),
  rank: rankSchema,
  techniques: z.object({
    durationMastery: z.number().min(0).max(25),
    purityMastery: z.number().min(0).max(25),
    consistencyMastery: z.number().min(0).max(25),
    comebackMastery: z.number().min(0).max(25),
    bossMastery: z.number().min(0).max(25),
  }),
  activeChallenges: z.array(challengeSchema),
  unlockedFeatures: z.array(z.string()),
  updatedAt: z.number(),
});
