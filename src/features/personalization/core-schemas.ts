import { z } from "zod";

export const PrimaryGoalSchema = z.enum([
  "focus",
  "study",
  "work",
  "creative",
  "personal",
  "learning",
]);

export const MotivationStyleSchema = z.enum([
  "calm",
  "friendly",
  "coach_led",
  "game_like",
  "intense",
  "study_focused",
]);

export const PreferredToneSchema = z.enum([
  "soft",
  "direct",
  "warm",
  "strategic",
]);
export const GamificationIntensitySchema = z.enum([
  "minimal",
  "medium",
  "strong",
]);
export const CoachModeSchema = z.enum([
  "mentor",
  "tactical",
  "study_tutor",
  "reflection",
  "game_guide",
]);

export const StudyLayerNameSchema = z.enum([
  "Study OS",
  "Deep Work Plan",
  "Learning OS",
  "Project Focus Path",
  "Growth Path",
]);

export const BossIntensitySchema = z.enum([
  "subtle",
  "standard",
  "game-like",
  "intense",
]);
export const SessionModeSchema = z.enum([
  "FOCUS",
  "STUDY",
  "DEEP_WORK",
  "SPRINT",
  "CREATIVE",
  "RECOVERY",
]);
export const UserStageSchema = z.enum([
  "new",
  "activating",
  "engaged",
  "power",
]);

export const HomeSectionSchema = z.enum([
  "coach_line",
  "primary_session",
  "progress_signal",
  "study_layer",
  "companion_thread",
  "boss_teaser",
  "boss_compact",
  "boss_full_cta",
  "premium_tease",
]);

export const CompletionStepSchema = z.enum([
  "core_saved",
  "coach_companion_reflection",
  "streak_progress",
  "study_progress",
  "boss_effect",
  "quiet_xp",
  "next_action",
]);

export const VexSystemToDisableSchema = z.enum([
  "shop",
  "inventory",
  "premium_currency",
  "battle_pass",
  "wagers",
  "rivals",
  "squads",
  "leaderboards",
  "advanced_economy",
]);

export const FeatureAvailabilitySnapshotSchema = z
  .object({
    boss: z.boolean(),
    challenges: z.boolean(),
    premium: z.boolean(),
    study: z.boolean(),
  })
  .strict();

export const BehaviorStatsSchema = z
  .object({
    abandonedSessionDurations: z.array(z.number().int().min(1)),
    bossChallengeEngagement: z.enum(["none", "low", "medium", "high"]),
    coachInteractions: z.number().int().min(0),
    comebackSessions: z.number().int().min(0),
    completedSessionDurations: z.array(z.number().int().min(1)),
    completionStreak: z.number().int().min(0),
    ignoredFeatures: z.array(z.string().min(1)),
    mostSuccessfulTimeOfDay: z.string().min(1).nullable(),
    preferredSessionMode: SessionModeSchema.nullable(),
    premiumFeatureAttempts: z.array(z.string().min(1)),
    studyUsageRatio: z.number().min(0).max(1),
    totalCompletedSessions: z.number().int().min(0),
  })
  .strict();

export const VexPersonalizationProfileSchema = z
  .object({
    primaryGoal: PrimaryGoalSchema,
    motivationStyle: MotivationStyleSchema,
    preferredTone: PreferredToneSchema,
    gamificationIntensity: GamificationIntensitySchema,
    coachMode: CoachModeSchema,
    studyLayerName: StudyLayerNameSchema,
    defaultSessionDuration: z.number().int().min(5),
    defaultSessionMode: SessionModeSchema,
    userStage: UserStageSchema,
  })
  .strict();

export type BehaviorStats = z.infer<typeof BehaviorStatsSchema>;
export type BossIntensity = z.infer<typeof BossIntensitySchema>;
export type CompletionStep = z.infer<typeof CompletionStepSchema>;
export type FeatureAvailabilitySnapshot = z.infer<
  typeof FeatureAvailabilitySnapshotSchema
>;
export type GamificationIntensity = z.infer<typeof GamificationIntensitySchema>;
export type HomeSection = z.infer<typeof HomeSectionSchema>;
export type MotivationStyle = z.infer<typeof MotivationStyleSchema>;
export type PreferredTone = z.infer<typeof PreferredToneSchema>;
export type PrimaryGoal = z.infer<typeof PrimaryGoalSchema>;
export type StudyLayerName = z.infer<typeof StudyLayerNameSchema>;
export type VexPersonalizationProfile = z.infer<
  typeof VexPersonalizationProfileSchema
>;
export type VexSystemToDisable = z.infer<typeof VexSystemToDisableSchema>;
