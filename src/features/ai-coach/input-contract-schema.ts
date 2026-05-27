import { z } from "zod";

export const CoachInputContractSchema = z.object({
  recentSessionGrades: z
    .array(
      z.object({
        sessionId: z.string().uuid(),
        grade: z.number().min(0).max(100),
        duration: z.number().min(60).max(7200),
        completedAt: z.number().int().positive(),
        difficulty: z.enum(["EASY", "NORMAL", "CHALLENGING", "PUSH"]),
      }),
    )
    .max(10),
  preferredSessionLengths: z.array(z.number().min(60).max(7200)).max(5),
  completionTimes: z.array(z.number().int().min(0).max(23)).max(7),
  streakState: z.object({
    currentStreak: z.number().int().min(0),
    streakAtRisk: z.boolean(),
    hoursSinceLastSession: z.number().min(0),
    streakRecord: z.number().int().min(0),
    missedDays: z.number().int().min(0).max(7),
  }),
  focusScoreFactors: z.object({
    currentScore: z.number().min(0).max(100),
    trend: z.enum(["improving", "stable", "declining"]),
    primaryFactors: z
      .array(
        z.enum(["consistency", "duration", "quality", "timing", "difficulty"]),
      )
      .max(3),
  }),
  missionHistory: z
    .array(
      z.object({
        missionId: z.string().uuid(),
        type: z.enum(["daily", "weekly", "milestone"]),
        completed: z.boolean(),
        completedAt: z.number().int().positive().optional(),
        difficulty: z.enum(["EASY", "NORMAL", "CHALLENGING"]),
      }),
    )
    .max(7),
  userGoalCategory: z.enum([
    "stress_reduction",
    "focus_improvement",
    "habit_building",
    "productivity",
    "meditation",
    "learning",
  ]),
  notificationPreferences: z.object({
    enabled: z.boolean(),
    quietHoursStart: z.number().int().min(0).max(23).default(22),
    quietHoursEnd: z.number().int().min(0).max(23).default(7),
    maxPerDay: z.number().int().min(0).max(10).default(2),
  }),
  premiumStatus: z.object({
    isActive: z.boolean(),
    tier: z.enum(["free", "premium", "premium_plus"]).default("free"),
    features: z.array(z.string()).default([]),
  }),
  timeContext: z.object({
    currentHour: z.number().int().min(0).max(23),
    dayOfWeek: z.number().int().min(0).max(6),
    isWeekend: z.boolean(),
    localTimezone: z.string().max(50),
  }),
});

export type CoachInputContract = z.infer<typeof CoachInputContractSchema>;
