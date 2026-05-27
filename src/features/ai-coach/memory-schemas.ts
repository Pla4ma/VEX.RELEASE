import { z } from "zod";

export const MemoryTypeSchema = z.enum([
  "FIRST_S_GRADE",
  "LONGEST_SESSION",
  "BEST_STREAK",
  "FIRST_BOSS_DEFEATED",
  "FIRST_RIVAL_WIN",
  "LEVEL_UP",
  "STREAK_MILESTONE",
  "PERFECT_SESSION",
  "ONBOARDING_GOAL",
  "SESSION_COUNT_MILESTONE",
  "STUDY_PATTERN",
  "PREFERRED_TECHNIQUE",
  "FAILURE_MODE",
  "OPTIMAL_FOCUS_TIME",
  "DOCUMENT_MILESTONE",
]);

export const CoachMemoryRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: MemoryTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  occurred_at: z.string().datetime(),
  metadata: z.record(z.unknown()).default({}),
  referenced_count: z.number().int().min(0),
  last_referenced_at: z.string().datetime().nullable(),
  deleted_at: z.string().datetime().nullable().default(null),
  evidence_hash: z.string().nullable().default(null),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CoachMemorySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: MemoryTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  occurredAt: z.number().int().nonnegative(),
  metadata: z.record(z.unknown()),
  referencedCount: z.number().int().min(0),
  lastReferencedAt: z.number().int().nonnegative().nullable(),
  deletedAt: z.number().int().nonnegative().nullable(),
  evidenceHash: z.string().nullable(),
});

export const CreateCoachMemoryInputSchema = z.object({
  userId: z.string().uuid(),
  type: MemoryTypeSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  metadata: z.record(z.unknown()).default({}),
  evidenceHash: z.string().nullable().default(null),
});

export const RecommendationEvidenceSchema = z
  .object({
    memoryIds: z.array(z.string().uuid()).optional(),
    evidenceSummary: z.string().min(1).optional(),
    confidence: z.number().min(0).max(1).optional(),
    fallbackReason: z
      .enum(["cold_start", "insufficient_data", "user_override"])
      .optional(),
  })
  .strict();

export type MemoryType = z.infer<typeof MemoryTypeSchema>;
export type CoachMemoryRow = z.infer<typeof CoachMemoryRowSchema>;
export type CoachMemory = z.infer<typeof CoachMemorySchema>;
export type CreateCoachMemoryInput = z.infer<
  typeof CreateCoachMemoryInputSchema
>;
export type RecommendationEvidence = z.infer<
  typeof RecommendationEvidenceSchema
>;
