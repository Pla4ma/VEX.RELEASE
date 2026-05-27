import { z } from "zod";

export const CompletionStatusSchema = z.enum([
  "done",
  "partial",
  "not_done",
  "skipped",
]);
export const ReflectionStatusSchema = z.enum(["done", "partial", "not_done"]);

const trimmedTask = z.string().trim().min(3).max(80);

export const FocusContractSchema = z
  .object({
    id: z.string().uuid(),
    sessionId: z.string().uuid(),
    userId: z.string().uuid(),
    taskDescription: trimmedTask,
    completionStatus: CompletionStatusSchema.nullable(),
    reflectionAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
  })
  .strict();

export const FocusContractInputSchema = z
  .object({
    sessionId: z.string().uuid(),
    taskDescription: z.string().max(80).optional(),
  })
  .strict();

export const CreateFocusContractRepositoryInputSchema =
  FocusContractInputSchema.extend({
    userId: z.string().uuid(),
    taskDescription: trimmedTask,
  }).strict();

export const FocusContractReflectionInputSchema = z
  .object({
    contractId: z.string().uuid(),
    completionStatus: ReflectionStatusSchema,
  })
  .strict();

export const FocusContractRowSchema = z
  .object({
    id: z.string().uuid(),
    session_id: z.string().uuid(),
    user_id: z.string().uuid(),
    task_description: trimmedTask,
    completion_status: CompletionStatusSchema.nullable(),
    reflection_at: z.string().datetime().nullable(),
    created_at: z.string().datetime(),
  })
  .strict();
