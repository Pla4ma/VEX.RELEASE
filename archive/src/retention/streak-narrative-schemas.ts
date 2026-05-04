/**
 * Streak Narrative Schemas
 * Zod validation for all narrative types
 */

import { z } from 'zod';

export const StreakBossSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  avatar: z.string(),
  description: z.string(),
  taunt: z.array(z.string()),
  defeatCry: z.array(z.string()),
  minStreakToUnlock: z.number().int().min(0),
  maxStreakFor: z.number().int().min(0),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE']),
});

export const StreakNarrativeSchema = z.object({
  currentBoss: StreakBossSchema,
  dailyTaunt: z.string(),
  currentChapter: z.string(),
  nextMilestone: z.object({
    day: z.number().int(),
    boss: StreakBossSchema,
    teaser: z.string(),
  }),
  personalStory: z.string(),
});

export const RiskWarningSchema = z.object({
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  headline: z.string(),
  story: z.string(),
  callToAction: z.string(),
});

export const BreakRecoverySchema = z.object({
  title: z.string(),
  story: z.string(),
  comebackBoss: StreakBossSchema,
  encouragement: z.string(),
  comebackQuest: z.string(),
});

export const StreakNarrativeInputSchema = z.object({
  streakDays: z.number().int().min(0),
  maxStreak: z.number().int().min(0),
  totalSessions: z.number().int().min(0),
  hoursSinceLastSession: z.number().min(0),
  comebackTokens: z.number().int().min(0),
});

// Export types
export type StreakBoss = z.infer<typeof StreakBossSchema>;
export type StreakNarrative = z.infer<typeof StreakNarrativeSchema>;
export type RiskWarning = z.infer<typeof RiskWarningSchema>;
export type BreakRecovery = z.infer<typeof BreakRecoverySchema>;
export type StreakNarrativeInput = z.infer<typeof StreakNarrativeInputSchema>;
