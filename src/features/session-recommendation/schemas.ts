/**
 * Session Recommendation Schemas
 *
 * Defines the structure for session recommendations and inputs.
 */

import { z } from "zod";

export const SessionModeSchema = z.enum([
  "FOCUS",
  "RECOVERY",
  "STUDY",
  "BOSS_PREP",
  "HABIT_BUILD",
]);

export type SessionMode = z.infer<typeof SessionModeSchema>;

export const SessionRecommendationSchema = z.object({
  duration: z.number().int().min(5).max(720), // 5 minutes to 12 hours
  mode: SessionModeSchema,
  reason: z.string().min(1),
  fallback: z.boolean(),
  inputs: z.object({
    userGoal: z.string().optional(),
    recentSessionLength: z.number().int().min(0).optional(),
    recentGrade: z.string().optional(),
    timeOfDay: z.number().int().min(0).max(23).optional(),
    streakUrgency: z
      .enum(["none", "low", "medium", "high", "critical"])
      .optional(),
    recoveryStatus: z.enum(["none", "needed", "urgent"]).optional(),
    dailyMissionType: z.string().optional(),
  }),
  confidence: z.number().min(0).max(1),
  isBlocked: z.boolean(),
  blockReason: z.string().optional(),
});

export type SessionRecommendation = z.infer<typeof SessionRecommendationSchema>;

export const SessionRecommendationInputSchema = z.object({
  userGoal: z.string().optional(),
  recentSessionLength: z.number().int().min(0).optional(),
  recentGrade: z.string().optional(),
  timeOfDay: z.number().int().min(0).max(23),
  streakUrgency: z.enum(["none", "low", "medium", "high", "critical"]),
  recoveryStatus: z.enum(["none", "needed", "urgent"]),
  dailyMissionType: z.string().optional(),
  isFirstSession: z.boolean(),
  hasActiveSession: z.boolean(),
  userId: z.string().uuid(),
});

export type SessionRecommendationInput = z.infer<
  typeof SessionRecommendationInputSchema
>;
