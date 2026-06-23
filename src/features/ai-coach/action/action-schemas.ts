import { z } from 'zod';

export const VexActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('START_SESSION'),
    durationMinutes: z.number().int().min(5).max(180),
    mode: z.enum(['focus', 'study']),
  }),
  z.object({
    type: z.literal('RESCUE_STREAK'),
    urgency: z.enum(['low', 'medium', 'high']),
  }),
  z.object({
    type: z.literal('CONTINUE_STUDY_PLAN'),
    studyPackId: z.string().uuid(),
  }),
  z.object({
    type: z.literal('NO_ACTION'),
    reason: z.string().min(1).max(240),
  }),
]);

export const VexActionContextSchema = z.object({
  userId: z.string().uuid(),
  canStartSession: z.boolean(),
  canRescueStreak: z.boolean(),
  allowedStudyPackIds: z.array(z.string().uuid()),
});

export const VexActionCardSchema = z.object({
  action: VexActionSchema,
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(240),
  ctaLabel: z.string().min(1).max(40),
  requiresUserConfirmation: z.literal(true),
});

export const VexActionCompileResultSchema = z.object({
  card: VexActionCardSchema,
  blockedReasons: z.array(z.string().min(1)),
});

export type VexAction = z.infer<typeof VexActionSchema>;
export type VexActionContext = z.infer<typeof VexActionContextSchema>;
export type VexActionCard = z.infer<typeof VexActionCardSchema>;
export type VexActionCompileResult = z.infer<
  typeof VexActionCompileResultSchema
>;
