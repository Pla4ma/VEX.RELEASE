/**
 * First Week Pacing Schemas
 *
 * Schemas for the first 7-session progression arc.
 */

import { z } from 'zod';

export const FirstWeekSessionSchema = z.enum([
  'SESSION_1',
  'SESSION_2', 
  'SESSION_3',
  'SESSION_4',
  'SESSION_5',
  'SESSION_6',
  'SESSION_7',
  'COMPLETED'
]);

export type FirstWeekSession = z.infer<typeof FirstWeekSessionSchema>;

export const FirstWeekProgressSchema = z.object({
  userId: z.string(),
  currentSession: FirstWeekSessionSchema,
  sessionsCompleted: z.number(),
  unlockedFeatures: z.array(z.string()),
  nextUnlock: z.string().nullable(),
  totalXpEarned: z.number(),
  levelProgress: z.number(),
  companionUnlocked: z.boolean(),
  streakExplained: z.boolean(),
  firstRewardEarned: z.boolean(),
  aiCoachUnlocked: z.boolean(),
  weeklyMilestoneEarned: z.boolean(),
  startedAt: z.number(),
  lastSessionAt: z.number().nullable(),
});

export type FirstWeekProgress = z.infer<typeof FirstWeekProgressSchema>;

export const SessionUnlockSchema = z.object({
  session: FirstWeekSessionSchema,
  unlockType: z.enum(['FEATURE', 'TUTORIAL', 'REWARD', 'INSIGHT']),
  title: z.string(),
  description: z.string(),
  actionRequired: z.boolean(),
  actionText: z.string().optional(),
  icon: z.string(),
  priority: z.number(),
});

export type SessionUnlock = z.infer<typeof SessionUnlockSchema>;

export const FirstWeekConfigSchema = z.object({
  sessionUnlocks: z.record(FirstWeekSessionSchema, z.array(SessionUnlockSchema)),
  xpRewards: z.record(FirstWeekSessionSchema, z.number()),
  companionReactions: z.record(FirstWeekSessionSchema, z.string()),
  tutorialSteps: z.record(FirstWeekSessionSchema, z.array(z.string())),
});

export type FirstWeekConfig = z.infer<typeof FirstWeekConfigSchema>;