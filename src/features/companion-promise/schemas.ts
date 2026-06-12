import { z } from 'zod';

export const PromiseTargetModeSchema = z.enum([
  'FOCUS',
  'RECOVERY',
  'STUDY',
  'BOSS_PREP',
  'HABIT_BUILD',
]);

export const CompanionPromiseStatusSchema = z.enum([
  'pending',
  'fulfilled',
  'missed',
  'replaced',
]);

export const CompanionPromiseSchema = z
  .object({
    createdAt: z.string().datetime(),
    fulfilledAt: z.string().datetime().nullable(),
    id: z.string().uuid(),
    missedAt: z.string().datetime().nullable(),
    sourceSessionId: z.string().uuid().nullable(),
    status: CompanionPromiseStatusSchema,
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    targetDurationMinutes: z.number().int().min(5),
    targetMode: PromiseTargetModeSchema,
    userId: z.string().min(1),
  })
  .strict();

export const CompanionPromiseHomeStateSchema = z.discriminatedUnion('kind', [
  z
    .object({ kind: z.literal('hidden'), showOfflineBanner: z.boolean() })
    .strict(),
  z
    .object({
      kind: z.literal('offline'),
      showOfflineBanner: z.literal(true),
    })
    .strict(),
  z
    .object({
      kind: z.literal('pending'),
      promise: CompanionPromiseSchema,
      showOfflineBanner: z.boolean(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('fulfilled'),
      promise: CompanionPromiseSchema,
      showOfflineBanner: z.boolean(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('missed'),
      promise: CompanionPromiseSchema,
      showOfflineBanner: z.boolean(),
    })
    .strict(),
]);

export const CompanionPromiseRepositoryRowSchema = z
  .object({
    created_at: z.string().datetime(),
    fulfilled_at: z.string().datetime().nullable(),
    id: z.string().uuid(),
    missed_at: z.string().datetime().nullable(),
    promised_for: z.string(),
    recommended_duration_minutes: z.number().int().min(1),
    recommended_mode: z.string().min(1),
    source_session_id: z.string().uuid().nullable(),
    status: z.string().min(1),
    target_date: z.string(),
    target_duration_minutes: z.number().int().min(1),
    target_mode: z.string().min(1),
    user_id: z.string().min(1),
  })
  .passthrough();

export const CreateCompanionPromiseInputSchema = z
  .object({
    createdAt: z.string().datetime(),
    sourceSessionId: z.string().uuid(),
    targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    targetDurationMinutes: z.number().int().min(5),
    targetMode: PromiseTargetModeSchema,
    userId: z.string().min(1),
  })
  .strict();

export const CompletedSessionPromiseInputSchema = z
  .object({
    completedAt: z.number().int(),
    durationMinutes: z.number().min(0),
    sessionId: z.string().uuid(),
    sessionMode: z.string().min(1),
    userId: z.string().min(1),
  })
  .strict();

export const CompanionPromiseLifecycleResultSchema = z
  .object({
    createdPromise: CompanionPromiseSchema.nullable(),
    fulfilledPromise: CompanionPromiseSchema.nullable(),
    missedPromise: CompanionPromiseSchema.nullable(),
  })
  .strict();

export type PromiseTargetMode = z.infer<typeof PromiseTargetModeSchema>;
export type CompanionPromiseStatus = z.infer<typeof CompanionPromiseStatusSchema>;
export type CompanionPromise = z.infer<typeof CompanionPromiseSchema>;
export type CompanionPromiseHomeState = z.infer<typeof CompanionPromiseHomeStateSchema>;
export type CompletedSessionPromiseInput = z.infer<typeof CompletedSessionPromiseInputSchema>;
export type CompanionPromiseLifecycleResult = z.infer<typeof CompanionPromiseLifecycleResultSchema>;
