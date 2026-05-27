import { z } from "zod";
import { SessionModeSchema } from "../../session/modes";
import { SessionCompletionGradeSchema } from "../session-completion/schemas";

export const DurationBucketSchema = z.enum(["10", "15", "25", "45", "60+"]);

export const PersonalBestKeySchema = z
  .object({
    userId: z.string().uuid(),
    sessionMode: SessionModeSchema,
    durationBucket: DurationBucketSchema,
  })
  .strict();

export const PersonalBestSchema = PersonalBestKeySchema.extend({
  id: z.string().uuid(),
  bestPurityScore: z.number().min(0).max(100),
  bestGrade: SessionCompletionGradeSchema,
  totalSessions: z.number().int().min(1),
  achievedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

export const PersonalBestComparisonSchema = z
  .object({
    current: PersonalBestSchema.nullable(),
    isNewRecord: z.boolean(),
    previousBest: z.number().min(0).max(100).nullable(),
    margin: z.number().nullable(),
  })
  .strict();

export const PersonalBestCandidateSchema = PersonalBestKeySchema.extend({
  bestPurityScore: z.number().min(0).max(100),
  bestGrade: SessionCompletionGradeSchema,
}).strict();

export const PersonalBestRowSchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    session_mode: SessionModeSchema,
    duration_bucket: DurationBucketSchema,
    best_purity_score: z.coerce.number().min(0).max(100),
    best_grade: SessionCompletionGradeSchema,
    total_sessions: z.number().int().min(1),
    achieved_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  })
  .strict();
