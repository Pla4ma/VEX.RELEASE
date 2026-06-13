import { z } from 'zod';

export const HomeUnlockPathInputSchema = z.object({
  completedSessions: z.number().int().min(0),
  currentStreak: z.number().int().min(0),
  todayFocusMinutes: z.number().int().min(0),
});

export const HomeUnlockPathItemSchema = z.object({
  body: z.string(),
  current: z.number().int().min(0),
  eyebrow: z.string(),
  isUnlocked: z.boolean(),
  requirement: z.number().int().min(1),
  reward: z.string(),
  title: z.string(),
});

export const HomeUnlockPathModelSchema = z.object({
  items: HomeUnlockPathItemSchema.array(),
  nextItem: HomeUnlockPathItemSchema,
  progressLabel: z.string(),
});

export type HomeUnlockPathInput = z.infer<typeof HomeUnlockPathInputSchema>;
export type HomeUnlockPathItem = z.infer<typeof HomeUnlockPathItemSchema>;
export type HomeUnlockPathModel = z.infer<typeof HomeUnlockPathModelSchema>;
