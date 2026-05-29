import { z } from "zod";
import type { CoachPresenceMotivationStyle } from "./schemas";

const LatestSessionSchema = z
  .object({
    durationMinutes: z.number().int().min(0),
    focusPurityScore: z.number().min(0).max(100),
    mode: z.string().min(1),
    isComeback: z.boolean(),
  })
  .strict();

const CoachPresenceContextSchema = z
  .object({
    motivationStyle: z.enum([
      "CALM",
      "FRIENDLY",
      "STUDY_FOCUSED",
      "GAME_LIKE",
      "COACH_LED",
      "INTENSE",
    ]),
    primaryGoal: z.enum([
      "focus",
      "study",
      "work",
      "creative",
      "personal",
      "learning",
    ]),
    firstWeekStage: z.string().min(1).nullable(),
    latestSession: LatestSessionSchema.nullable(),
    memoryConfidence: z.enum(["none", "weak", "medium", "strong"]),
    sessionMode: z.enum([
      "inactive",
      "active_focus",
      "active_paused",
      "active_risk",
      "completed",
    ]),
    comebackState: z
      .enum([
        "none",
        "missed_1_day",
        "missed_2_3_days",
        "missed_week",
        "returning_after_long_gap",
      ])
      .nullable(),
    studyLayerLabel: z.string().min(1).nullable(),
    bossIntensity: z
      .enum([
        "hidden",
        "subtle",
        "tiny_tease",
        "visible",
        "standard",
        "game-like",
        "intense",
      ])
      .nullable(),
    completionContext: z
      .enum([
        "first_session",
        "comeback",
        "streak_recovery",
        "high_focus",
        "low_energy",
        "study",
        "short",
        "long",
        "normal",
      ])
      .nullable(),
    premiumMoment: z
      .enum([
        "none",
        "soft_tease",
        "weekly_value",
        "hidden",
        "session_value",
        "advanced_study",
        "weekly_intelligence",
        "custom_identity",
      ])
      .nullable(),
    aiAvailable: z.boolean(),
  })
  .strict();

const CoachPresenceMessageOutputSchema = z
  .object({
    message: z.string().min(1).max(96),
    tone: z.enum(["calm", "warm", "direct", "playful", "sharp", "studious"]),
    visualMood: z.enum([
      "steady",
      "focused",
      "celebrating",
      "recovering",
      "ready",
    ]),
    safeIntent: z.enum([
      "START_SESSION",
      "START_STUDY_SESSION",
      "REVIEW_PROGRESS",
      "TAKE_BREAK",
      "CONTINUE_PLAN",
      "REFLECT",
    ]),
    optionalActionLabel: z.string().min(1).max(32).nullable(),
    shouldShow: z.boolean(),
    displayMode: z.enum([
      "quiet",
      "welcome",
      "reflection",
      "pattern",
      "intervention",
    ]),
    behaviorAdaptation: z.string().max(120).nullable(),
  })
  .strict();

export type CoachPresenceContext = z.infer<typeof CoachPresenceContextSchema>;
export type CoachPresenceMessageOutput = z.infer<
  typeof CoachPresenceMessageOutputSchema
>;

export const TONE_MAP: Record<
  CoachPresenceMotivationStyle,
  CoachPresenceMessageOutput["tone"]
> = {
  CALM: "calm",
  FRIENDLY: "warm",
  COACH_LED: "direct",
  GAME_LIKE: "playful",
  INTENSE: "sharp",
  STUDY_FOCUSED: "studious",
};

export const MOOD_MAP: Record<
  CoachPresenceMotivationStyle,
  CoachPresenceMessageOutput["visualMood"]
> = {
  CALM: "steady",
  FRIENDLY: "focused",
  COACH_LED: "ready",
  GAME_LIKE: "celebrating",
  INTENSE: "ready",
  STUDY_FOCUSED: "steady",
};

export { CoachPresenceContextSchema, CoachPresenceMessageOutputSchema };
