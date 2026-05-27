import { z } from "zod";
import { SessionModeSchema } from "../../session/modes";
import { SessionCompletionGradeSchema } from "../session-completion/schemas";

export const CompanionMemoryTypeSchema = z.enum([
  "first_session",
  "first_s_grade",
  "first_7_day_streak",
  "first_30_day_streak",
  "first_comeback",
  "first_deep_work",
  "first_clean_sprint",
  "boss_first_defeat",
  "companion_first_evolution",
  "companion_second_evolution",
  "contract_streak",
  "personal_best_broken",
  "hardest_comeback",
  "milestone_custom",
]);

export const CompanionMemorySchema = z
  .object({
    body: z.string().min(1).max(120),
    createdAt: z.string().datetime(),
    grade: SessionCompletionGradeSchema.nullable(),
    id: z.string().uuid(),
    purityScore: z.number().min(0).max(100).nullable(),
    sessionDate: z.string().date(),
    sessionId: z.string().uuid().nullable(),
    streakDay: z.number().int().min(0).nullable(),
    title: z.string().min(1).max(30),
    type: CompanionMemoryTypeSchema,
    userId: z.string().uuid(),
  })
  .strict();

export const CompanionMemoryCreateSchema = CompanionMemorySchema.omit({
  createdAt: true,
  id: true,
}).strict();

export const CompanionMemoryRowSchema = z
  .object({
    body: z.string().min(1).max(120),
    created_at: z.string().datetime(),
    grade: SessionCompletionGradeSchema.nullable(),
    id: z.string().uuid(),
    purity_score: z.coerce.number().min(0).max(100).nullable(),
    session_date: z.string().date(),
    session_id: z.string().uuid().nullable(),
    streak_day: z.number().int().min(0).nullable(),
    title: z.string().min(1).max(30),
    type: CompanionMemoryTypeSchema,
    user_id: z.string().uuid(),
  })
  .strict();

export const MemoryContextSchema = z
  .object({
    grade: SessionCompletionGradeSchema.nullable(),
    purityScore: z.number().min(0).max(100).nullable(),
    sessionDate: z.string().date(),
    sessionId: z.string().uuid().nullable(),
    streakDay: z.number().int().min(0).nullable(),
  })
  .strict();

export const MemorySessionInputSchema = z
  .object({
    actualDuration: z.number().int().min(0),
    createdAt: z.number().int().nonnegative(),
    focusPurityScore: z.number().min(0).max(100).optional(),
    sessionId: z.string().uuid(),
    sessionMode: SessionModeSchema,
  })
  .strict();

export const CheckSessionMemoriesInputSchema = z
  .object({
    grade: SessionCompletionGradeSchema,
    isPersonalBest: z.boolean(),
    session: MemorySessionInputSchema,
    sessionCount: z.number().int().min(1),
    streakDay: z.number().int().min(0),
    userId: z.string().uuid(),
  })
  .strict();
