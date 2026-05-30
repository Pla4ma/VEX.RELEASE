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
  finalScore: z.number().int().min(0).default(0),
  modeBonus: z.number().int().min(0).default(0),
}).strict();

export type CompleteSessionRequest = z.infer<typeof CompleteSessionRequestSchema>;
