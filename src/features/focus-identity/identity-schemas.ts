import { z } from "zod";

export const FocusScoreFactorsSchema = z.object({
  consistency: z.object({
    score: z.number().min(0).max(100),
    sessionsLast30Days: z.number(),
    targetSessionsPerWeek: z.number(),
    actualConsistency: z.number().min(0).max(1),
    missedDaysLast30Days: z.number(),
  }),
  streakStability: z.object({
    score: z.number().min(0).max(100),
    currentStreak: z.number(),
    longestStreak: z.number(),
    averageStreakLength: z.number(),
    totalStreaksStarted: z.number(),
    streakBreakFrequency: z.number(),
  }),
  sessionQuality: z.object({
    score: z.number().min(0).max(100),
    averageFocusPurity: z.number().min(0).max(100),
    averageGrade: z.enum(["S", "A", "B", "C", "D"]),
    perfectSessionsCount: z.number(),
    averageSessionDuration: z.number(),
  }),
  diversity: z.object({
    score: z.number().min(0).max(100),
    uniqueSessionModes: z.number(),
    uniqueTimeSlots: z.number(),
    uniqueDaysOfWeek: z.number(),
    weekendSessions: z.number(),
    contextVariety: z.number(),
  }),
  recency: z.object({
    score: z.number().min(0).max(100),
    daysSinceLastSession: z.number(),
    last7DayActivity: z.number(),
    last30DayActivity: z.number(),
    trendDirection: z.enum(["UP", "STABLE", "DOWN", "CONCERNING"]),
    velocity: z.number(),
  }),
});

export const FocusIdentityProfileSchema = z.object({
  userId: z.string(),
  currentScore: z.number().min(300).max(850),
  previousScore: z.number(),
  scoreHistory: z.array(
    z.object({ date: z.string(), score: z.number(), reason: z.string() }),
  ),
  percentileRank: z.number().min(0).max(100),
  band: z.object({
    min: z.number(),
    max: z.number(),
    label: z.string(),
    title: z.string(),
    color: z.string(),
    percentile: z.number(),
  }),
  factors: FocusScoreFactorsSchema,
  identityStatement: z.string(),
  streakInCurrentBand: z.number(),
  totalScoreCalculations: z.number(),
  firstScoreDate: z.string(),
  isInRecovery: z.boolean(),
  recoveryStartDate: z.string().nullable(),
  recoveryProgress: z.number().min(0).max(100),
  preLapseScore: z.number().nullable(),
  topStrength: z.enum([
    "consistency",
    "streakStability",
    "sessionQuality",
    "diversity",
    "recency",
  ]),
  topWeakness: z.enum([
    "consistency",
    "streakStability",
    "sessionQuality",
    "diversity",
    "recency",
  ]),
  recommendedActions: z.array(z.string()),
  monthlyReport: z
    .object({
      month: z.string(),
      startingScore: z.number(),
      endingScore: z.number(),
      change: z.number(),
      sessionsCompleted: z.number(),
      grade: z.enum(["A+", "A", "B+", "B", "C", "D"]),
      highlight: z.string(),
    })
    .nullable(),
  updatedAt: z.number(),
});
