import { z } from "zod";
import {
  CreateFocusSessionInputSchema,
  StartSessionInputSchema,
  CompleteReflectionInputSchema,
  StartRescueInputSchema,
  ScheduleFocusWindowInputSchema,
  CreateStudyBlockInputSchema,
  UpdateProjectThreadInputSchema,
  ReadMemorySummaryInputSchema,
  UpdateLaneOverrideInputSchema,
} from "./action-input-schemas";

export * from "./action-input-schemas";

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

export type FocusSessionConfigOutput = z.infer<
  typeof FocusSessionConfigOutputSchema
>;
