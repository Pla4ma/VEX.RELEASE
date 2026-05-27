import { z } from "zod";
import { LaneSchema } from "./schemas";

export const LaneDensitySchema = z.enum(["low", "medium", "medium_high"]);
export const LaneAnimationPolicySchema = z.enum([
  "none",
  "minimal",
  "low_medium",
  "medium_high",
]);
export const LaneCopyToneSchema = z.enum([
  "precise_supportive",
  "strategic_energetic",
  "reflective_continuity",
  "concise_factual",
]);

export const LanePresentationPolicySchema = z
  .object({
    animation: LaneAnimationPolicySchema,
    copyTone: LaneCopyToneSchema,
    density: LaneDensitySchema,
    emptyStateCta: z.string().min(1),
    errorStateHint: z.string().min(1),
    icon: z.string().min(1),
    lane: LaneSchema,
    loadingState: z.enum([
      "study_plan_skeleton",
      "run_board_skeleton",
      "project_thread_skeleton",
      "today_strip_skeleton",
    ]),
    shouldRenderSkeleton: z.boolean().default(true),
    visualFeeling: z.enum([
      "academic_command_center",
      "focused_roguelite_overlay",
      "studio_workbench",
      "quiet_planner",
    ]),
  })
  .strict();
