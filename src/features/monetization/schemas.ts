import { z } from 'zod';

export const StreakShieldCopySchema = z.object({
  body: z.string().min(1),
  cta: z.string().min(1),
  headline: z.string().min(1),
  secondary: z.string().min(1),
}).strict();

export const StreakShieldRecordSchema = z.object({
  lastShownAt: z.number().int().nonnegative(),
  lastShownSessionId: z.string().min(1),
}).strict();

export const StreakShieldMomentInputSchema = z.object({
  finalScore: z.number().min(0).max(100),
  isPremium: z.boolean(),
  lastShownAt: z.number().int().nonnegative().nullable(),
  lastShownSessionId: z.string().min(1).nullable(),
  now: z.number().int().nonnegative(),
  paywallShownThisSession: z.boolean(),
  sessionId: z.string().min(1),
  streakDays: z.number().int().nonnegative(),
  userId: z.string().min(1),
}).strict();

export type StreakShieldCopy = z.infer<typeof StreakShieldCopySchema>;
export type StreakShieldMomentInput = z.infer<typeof StreakShieldMomentInputSchema>;
export type StreakShieldRecord = z.infer<typeof StreakShieldRecordSchema>;
