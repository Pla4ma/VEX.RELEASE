import { z } from 'https://esm.sh/zod@3.22.4';

export const CompleteSessionRequestSchema = z.object({
  sessionId: z.string().uuid(),
  idempotencyKey: z.string().min(1),
  durationSeconds: z.number().int().positive(),
  effectiveDurationSeconds: z.number().int().min(0),
  completionPercentage: z.number().int().min(0).max(100),
  focusQuality: z.number().int().min(0).max(100),
  interruptions: z.number().int().min(0).default(0),
  pauses: z.number().int().min(0).default(0),
  sessionMode: z.string().default('FLOW'),
  finalScore: z.number().int().min(0).max(10000).default(0),
  modeBonus: z.number().int().min(0).max(500).default(0),
}).strict();

export type CompleteSessionRequest = z.infer<typeof CompleteSessionRequestSchema>;

export const CompleteSessionResponseSchema = z.object({
  success: z.boolean(),
  duplicate: z.boolean(),
  xp_awarded: z.number().int(),
  coins_awarded: z.number().int(),
  gems_awarded: z.number().int(),
  streak_action: z.string(),
  new_streak: z.number().int(),
  bonuses: z.array(z.unknown()).default([]),
  xp_result: z.unknown().nullable(),
  processed_at: z.number().int(),
}).passthrough();

export type CompleteSessionResponse = z.infer<typeof CompleteSessionResponseSchema>;
