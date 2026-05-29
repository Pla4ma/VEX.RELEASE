import { z } from "zod";

import {
  MotivationStyleSchema,
  PrimaryGoalSchema,
  SessionModeSchema,
} from "../personalization/core-schemas";

export const LaneSchema = z.enum([
  "student",
  "game_like",
  "deep_creative",
  "minimal_normal",
]);

export const LANE_USER_FACING_NAMES: Record<
  z.infer<typeof LaneSchema>,
  string
> = {
  student: "Study",
  game_like: "Run",
  deep_creative: "Project",
  minimal_normal: "Clean",
};

export const LANE_CONFIRMATION_COPY: Record<
  z.infer<typeof LaneSchema>,
  string
> = {
  student: "VEX thinks Study Mode fits you best. You can change this anytime.",
  game_like:
    "VEX thinks Run Mode will keep you moving. You can change this anytime.",
  deep_creative:
    "VEX thinks Project Mode fits your deep work. You can change this anytime.",
  minimal_normal:
    "VEX thinks Clean Mode fits you best. You can change this anytime.",
};

export const LaneSourceSchema = z.enum([
  "onboarding",
  "behavior",
  "manual_override",
  "fallback",
]);

export const LaneConfidenceSchema = z.enum(["low", "medium", "high"]);

export const LaneEvidenceSourceSchema = z.enum([
  "onboarding_goal",
  "motivation_style",
  "session_mode",
  "surface_signal",
  "run_engagement",
  "study_usage",
  "creative_usage",
  "manual_override",
]);

export const LaneEvidenceSchema = z
  .object({
    source: LaneEvidenceSourceSchema,
    value: z.string(),
    weight: z.number().min(0).max(1),
    observedAt: z.number().int().min(0),
  })
  .strict();

export const LaneTraitsSchema = z
  .object({
    needsStructure: z.number().min(0).max(1),
    wantsPlay: z.number().min(0).max(1),
    needsContinuity: z.number().min(0).max(1),
    wantsQuiet: z.number().min(0).max(1),
  })
  .strict();

export const LaneMechanicSchema = z.enum([
  "study_os",
  "deadline_risk",
  "review_queue",
  "recall_prompts",
  "study_streak",
  "tutor_coach",
  "focus_run",
  "personal_blocker",
  "focus_modifiers",
  "momentum_proofs",
  "companion_party_member",
  "optional_party_mode",
  "project_thread",
  "next_move",
  "flow_window",
  "creative_warmup",
  "continuity_memory",
  "today_strip",
  "clean_session",
  "quiet_progress",
  "short_coach",
  "low_notifications",
  "shop",
  "gems",
  "wagers",
  "broad_social",
  "blocker_full_cta",
  "trading",
  "paid_saves",
  "generic_leaderboards",
  "loud_combat_default",
  "study_exam_copy",
  "economy",
  "generic_streak_panic",
  "challenge_spam",
  "xp_first_ui",
  "companion_chores",
]);

export const LaneMechanicPolicySchema = z
  .object({
    lane: LaneSchema,
    preferredMechanics: z.array(LaneMechanicSchema),
    blockedMechanics: z.array(LaneMechanicSchema),
  })
  .strict();

export const LaneProfileSchema = z
  .object({
    primaryLane: LaneSchema,
    secondaryLane: LaneSchema.nullable(),
    confidence: z.number().min(0).max(1),
    confidenceBand: LaneConfidenceSchema,
    source: LaneSourceSchema,
    evidence: z.array(LaneEvidenceSchema),
    traits: LaneTraitsSchema,
    resolvedAt: z.number().int().min(0),
  })
  .strict();

export const ResolveInitialLaneInputSchema = z
  .object({
    primaryGoal: PrimaryGoalSchema.nullable().optional(),
    motivationStyle: MotivationStyleSchema.nullable().optional(),
    sessionMode: SessionModeSchema.nullable().optional(),
    manualOverride: LaneSchema.nullable().optional(),
    observedAt: z.number().int().min(0).optional(),
  })
  .strict();

export const ResolveBehaviorLaneInputSchema =
  ResolveInitialLaneInputSchema.extend({
    completedSessions: z.number().int().min(0),
    studyUsageRatio: z.number().min(0).max(1).optional().default(0),
    deepCreativeUsageRatio: z.number().min(0).max(1).optional().default(0),
    bossEngagement: z
      .enum(["none", "low", "medium", "high"])
      .optional()
      .default("none"),
    bossDismissals: z.number().int().min(0).optional().default(0),
    challengeClicks: z.number().int().min(0).optional().default(0),
    notificationDismissals: z.number().int().min(0).optional().default(0),
  }).strict();

export const MergeLaneProfilesInputSchema = z
  .object({
    onboardingProfile: LaneProfileSchema,
    behaviorProfile: LaneProfileSchema,
    completedSessions: z.number().int().min(0),
  })
  .strict();

export const LaneReconsiderationInputSchema = z
  .object({
    currentProfile: LaneProfileSchema,
    completedSessions: z.number().int().min(0),
    latestProfile: LaneProfileSchema,
  })
  .strict();

export const LaneConfirmationSchema = z
  .object({
    recommendedLane: LaneSchema,
    userFacingName: z.string().min(1),
    reason: z.string().min(1),
    confidence: z.number().min(0).max(1),
    canChangeLater: z.literal(true),
  })
  .strict();

export const CompletionEvidenceInputSchema = z.object({
  lane: LaneSchema,
  sessionMode: z.string().nullable().optional(),
  completionPercentage: z.number().min(0).max(100),
  interruptions: z.number().int().min(0),
  grade: z.string().min(1),
});

export type CompletionEvidenceInput = z.infer<
  typeof CompletionEvidenceInputSchema
>;
