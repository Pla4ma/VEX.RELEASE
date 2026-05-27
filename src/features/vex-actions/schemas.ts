import { z } from "zod";
import { LaneSchema } from "../lane-engine/schemas";
import { RescueReasonSchema } from "../rescue-mode/schemas";

// ============================================================================
// Action Names — enum of all agent-ready action boundaries
// ============================================================================

export const VexActionNameSchema = z.enum([
  "create_focus_session",
  "start_session",
  "complete_reflection",
  "start_rescue",
  "schedule_focus_window",
  "create_study_block",
  "update_project_thread",
  "read_memory_summary",
  "update_lane_override",
]);

export type VexActionName = z.infer<typeof VexActionNameSchema>;

// ============================================================================
// Action Status — unified result envelope for all actions
// ============================================================================

export const VexActionStatusSchema = z.enum([
  "success",
  "validation_error",
  "feature_blocked",
  "repository_error",
  "not_found",
  "permission_denied",
]);

export type VexActionStatus = z.infer<typeof VexActionStatusSchema>;

// ============================================================================
// Action Result Envelope — returned by every action wrapper
// ============================================================================

export const VexActionResultSchema = z
  .object({
    status: VexActionStatusSchema,
    errorMessage: z.string().nullable(),
    data: z.unknown().nullable(),
  })
  .strict();

export type VexActionResult<T = unknown> = {
  status: VexActionStatus;
  errorMessage: string | null;
  data: T | null;
};

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
// Per-Action Output Types (re-export from source features — thin wrappers)
// ============================================================================

export const FocusSessionConfigOutputSchema = z
  .object({
    category: z.string().nullable(),
    duration: z.number().int().positive(),
    metadata: z.record(z.unknown()),
    mode: z.string().min(1),
  })
  .strict();

export const ActionOutputSchemas = {
  create_focus_session: FocusSessionConfigOutputSchema,
  create_study_block: z.unknown(), // StudyPlan — circular, validated at call site
  start_rescue: z.unknown(), // RescuePlan — circular, validated at call site
} as const;

// ============================================================================
// FeatureAvailability check result
// ============================================================================

export const ActionFeatureCheckSchema = z
  .object({
    allowed: z.boolean(),
    reason: z.string().min(1),
  })
  .strict();

export type ActionFeatureCheck = z.infer<typeof ActionFeatureCheckSchema>;

// ============================================================================
// Infer types
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
export type FocusSessionConfigOutput = z.infer<
  typeof FocusSessionConfigOutputSchema
>;
