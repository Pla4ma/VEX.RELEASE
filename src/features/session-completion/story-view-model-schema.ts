import { z } from "zod";

import { HeadlineRewardSchema } from "./headline-reward.schemas";

const StoryBeatSchema = z
  .object({
    accessibilityLabel: z.string().min(1),
    body: z.string().min(1),
    companionLine: z.string().min(1).nullable(),
    id: z.string().min(1),
    kind: z.enum([
      "result",
      "grade",
      "meaning",
      "companion",
      "personal_best",
      "tomorrow",
    ]),
    metric: z
      .object({ label: z.string().min(1), value: z.string().min(1) })
      .nullable(),
    title: z.string().min(1),
  })
  .strict();

const StoryRouteParamsSchema = z
  .object({
    presetMode: z.enum([
      "LIGHT_FOCUS",
      "DEEP_WORK",
      "SPRINT",
      "CREATIVE",
      "STUDY",
    ]),
    recommendationId: z.string().min(1),
    suggestedDifficulty: z.enum(["EASY", "NORMAL", "CHALLENGING", "PUSH"]),
    suggestedDurationSeconds: z.number().int().min(60),
  })
  .strict();

export const PostSessionStoryViewModelSchema = z
  .object({
    beats: z.array(StoryBeatSchema).min(5),
    companionReaction: z.object({ reactionId: z.string().nullable() }).strict(),
    companionMemory: z
      .object({
        memoryId: z.string().uuid(),
        title: z.string(),
        type: z.string(),
      })
      .nullable(),
    companionPromise: z
      .object({
        status: z.enum(["pending", "fulfilled", "missed", "replaced"]),
        targetDate: z.string(),
        targetDurationMinutes: z.number().int().min(5),
        targetMode: z.string().min(1),
      })
      .nullable(),
    dailyMission: z
      .object({
        missionId: z.string().nullable(),
        progressDelta: z.number(),
        status: z.string(),
      })
      .strict(),
    degradedWarnings: z.array(z.string()),
    focusScoreDeltaCard: z
      .object({ delta: z.number().int(), label: z.string() })
      .strict(),
    gradeCard: z
      .object({
        grade: z.string(),
        label: z.string(),
        score: z.number().min(0).max(100),
      })
      .strict(),
    headline: HeadlineRewardSchema,
    nextActionCta: z
      .object({
        label: z.string().min(1),
        reason: z.string().min(1),
        route: z.enum(["Home", "SessionSetup"]),
        routeParams: StoryRouteParamsSchema.nullable(),
      })
      .strict(),
    pendingSync: z.boolean(),
    personalBestProof: z
      .object({
        achievedAt: z.string().datetime(),
        durationBucket: z.string().min(1),
        mode: z.string().min(1),
        newValue: z.number().min(0).max(100),
        oldValue: z.number().min(0).max(100).nullable(),
      })
      .nullable(),
    personalization: z
      .object({
        laneProfileConfidence: z.number().min(0).max(1),
        memoryCandidateCount: z.number().int().min(0),
        reflectionQuestion: z.string(),
        unlockKey: z.string(),
        userFacingTitle: z.string(),
      })
      .nullable(),
    rewardReveal: z.object({ rewardIds: z.array(z.string()) }).strict(),
    sessionId: z.string().uuid(),
    streakState: z
      .object({
        action: z.string(),
        newDays: z.number().int().min(0),
        previousDays: z.number().int().min(0),
      })
      .strict(),
    xpProgress: z.object({ xpDelta: z.number().int() }).strict(),
  })
  .strict();

export type PostSessionStoryViewModel = z.infer<
  typeof PostSessionStoryViewModelSchema
>;
