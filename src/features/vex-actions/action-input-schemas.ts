/**
 * VEX Action — Per-Action Input Schemas & Inferred Types
 */

import { z } from "zod";
import { LaneSchema } from "../lane-engine/schemas";
import { RescueReasonSchema } from "../rescue-mode/schemas";

// ============================================================================
// Per-Action Input Schemas
// ============================================================================

// 1. create_focus_session
export const CreateFocusSessionInputSchema = z
  .object({
    userId: z.string().min(1),
    durationMinutes: z.number().int().min(1).max(240),
    category: z.string().min(1).nullable().optional(),
  })
  .strict();

// 2. start_session
export const StartSessionInputSchema = z
  .object({
    userId: z.string().min(1),
    lane: LaneSchema,
    durationSeconds: z.number().int().min(60).max(10_800).nullable().optional(),
    isOffline: z.boolean().optional(),
    isRescue: z.boolean().optional(),
    subjectOrTask: z.string().min(1).max(200).nullable().optional(),
    deadlineSeconds: z.number().int().min(0).nullable().optional(),
    weakTopic: z.string().min(1).max(200).nullable().optional(),
    projectTitle: z.string().min(1).max(200).nullable().optional(),
  })
  .strict();

// 3. complete_reflection
export const CompleteReflectionInputSchema = z
  .object({
    userId: z.string().min(1),
    lane: LaneSchema,
    reflectionAnswer: z.string().min(1).max(500).nullable(),
    isComeback: z.boolean().optional(),
    summary: z
      .object({
        sessionId: z.string().min(1),
        effectiveDuration: z.number().int().min(0),
        completionPercentage: z.number().min(0).max(100),
        interruptions: z.number().int().min(0).optional(),
        sessionMode: z.string().nullable().optional(),
        status: z.string().min(1),
      })
      .strict(),
  })
  .strict();

// 4. start_rescue
export const StartRescueInputSchema = z
  .object({
    userId: z.string().min(1),
    lane: LaneSchema,
    reason: RescueReasonSchema,
    durationSeconds: z.number().int().min(60).max(3_600).optional(),
    taskDescription: z.string().min(1).max(120).optional(),
  })
  .strict();

// 5. schedule_focus_window
export const ScheduleFocusWindowInputSchema = z
  .object({
    userId: z.string().min(1),
    lane: LaneSchema,
    signal: z.string().min(1).max(200).nullable().optional(),
  })
  .strict();

// 6. create_study_block
export const CreateStudyBlockInputSchema = z
  .object({
    userId: z.string().min(1),
    title: z.string().min(1).max(200),
    objective: z.string().min(1).max(500),
    deadlineAt: z.number().int().min(0).nullable().optional(),
  })
  .strict();

// 7. update_project_thread
export const UpdateProjectThreadInputSchema = z
  .object({
    userId: z.string().min(1),
    threadId: z.string().min(1),
    lastSessionSummary: z.string().min(1).max(500),
    nextMove: z.string().min(1).max(200),
    blocker: z.string().min(1).max(200).nullable().optional(),
    handoffNote: z.string().min(1).max(500).nullable().optional(),
    openQuestion: z.string().min(1).max(200).nullable().optional(),
  })
  .strict();

// 8. read_memory_summary
export const ReadMemorySummaryInputSchema = z
  .object({
    userId: z.string().min(1),
    types: z.array(z.string().min(1)).optional(),
    minConfidence: z.number().min(0).max(1).optional(),
  })
  .strict();

// 9. update_lane_override
export const UpdateLaneOverrideInputSchema = z
  .object({
    userId: z.string().min(1),
    manualOverride: LaneSchema,
  })
  .strict();

// ============================================================================
// Inferred Input Types
// ============================================================================

export type CreateFocusSessionInput = z.infer<
  typeof CreateFocusSessionInputSchema
>;
export type StartSessionInput = z.infer<typeof StartSessionInputSchema>;
export type CompleteReflectionInput = z.infer<
  typeof CompleteReflectionInputSchema
>;
export type StartRescueInput = z.infer<typeof StartRescueInputSchema>;
export type ScheduleFocusWindowInput = z.infer<
  typeof ScheduleFocusWindowInputSchema
>;
export type CreateStudyBlockInput = z.infer<typeof CreateStudyBlockInputSchema>;
export type UpdateProjectThreadInput = z.infer<
  typeof UpdateProjectThreadInputSchema
>;
export type ReadMemorySummaryInput = z.infer<
  typeof ReadMemorySummaryInputSchema
>;
export type UpdateLaneOverrideInput = z.infer<
  typeof UpdateLaneOverrideInputSchema
>;
