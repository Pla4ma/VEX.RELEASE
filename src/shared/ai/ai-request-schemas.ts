import { z } from 'zod';

// Request schemas — each requestType has its own schema for the discriminated union.

export const GenerateCoachMessageRequestSchema = z.object({
  requestType: z.literal('GENERATE_COACH_MESSAGE'),
  userId: z.string().uuid(),
  context: z.object({
    category: z.enum([
      'STREAK_RISK',
      'SESSION_SUGGESTION',
      'MILESTONE_HYPE',
      'COMEBACK_SUPPORT',
      'POST_FAILURE',
      'PROGRESS_REMINDER',
      'DIFFICULTY_ADJUST',
      'CHALLENGE_PROMPT',
      'MOTIVATION_BOOST',
      'BREAK_SUGGESTION',
      'OVERLOAD_WARNING',
    ]),
    currentStreak: z.number().optional(),
    hoursSinceLastSession: z.number().optional(),
    currentLevel: z.number().optional(),
    recentSessionQuality: z.number().optional(),
    daysInactive: z.number().optional(),
    personaStyle: z
      .enum([
        'CHEERLEADER',
        'DRILL_SERGEANT',
        'FRIEND',
        'MENTOR',
        'RIVAL',
        'MINDFUL',
      ])
      .optional(),
  }),
  personaId: z.string().uuid().optional(),
});
export type GenerateCoachMessageRequest = z.infer<
  typeof GenerateCoachMessageRequestSchema
>;

export const GenerateSessionSummaryRequestSchema = z.object({
  requestType: z.literal('GENERATE_SESSION_SUMMARY'),
  userId: z.string().uuid(),
  context: z.object({
    sessionCount: z.number(),
    totalFocusMinutes: z.number(),
    averageSessionQuality: z.number(),
    streakDays: z.number(),
    xpEarned: z.number(),
    challengesCompleted: z.number(),
    bossDamageDealt: z.number().optional(),
    preferredTimeOfDay: z.string().optional(),
    consistencyScore: z.number().optional(),
  }),
});
export type GenerateSessionSummaryRequest = z.infer<
  typeof GenerateSessionSummaryRequestSchema
>;

export const GenerateComebackPromptRequestSchema = z.object({
  requestType: z.literal('GENERATE_COMEBACK_PROMPT'),
  userId: z.string().uuid(),
  context: z.object({
    previousStreak: z.number(),
    daysInactive: z.number(),
    comebackDay: z.number(),
    sessionsCompleted: z.number(),
    bonusMultiplier: z.number(),
    personaStyle: z
      .enum([
        'CHEERLEADER',
        'DRILL_SERGEANT',
        'FRIEND',
        'MENTOR',
        'RIVAL',
        'MINDFUL',
      ])
      .optional(),
  }),
});
export type GenerateComebackPromptRequest = z.infer<
  typeof GenerateComebackPromptRequestSchema
>;

export const GenerateStreakRiskNudgeRequestSchema = z.object({
  requestType: z.literal('GENERATE_STREAK_RISK_NUDGE'),
  userId: z.string().uuid(),
  context: z.object({
    currentStreak: z.number(),
    hoursRemaining: z.number(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
    lastSessionQuality: z.number().optional(),
    personaStyle: z
      .enum([
        'CHEERLEADER',
        'DRILL_SERGEANT',
        'FRIEND',
        'MENTOR',
        'RIVAL',
        'MINDFUL',
      ])
      .optional(),
  }),
});
export type GenerateStreakRiskNudgeRequest = z.infer<
  typeof GenerateStreakRiskNudgeRequestSchema
>;

export const GenerateWeeklyReflectionRequestSchema = z.object({
  requestType: z.literal('GENERATE_WEEKLY_REFLECTION'),
  userId: z.string().uuid(),
  context: z.object({
    weekNumber: z.number(),
    sessionsCompleted: z.number(),
    totalFocusMinutes: z.number(),
    averageSessionQuality: z.number(),
    streakAtStart: z.number(),
    streakAtEnd: z.number(),
    xpEarned: z.number(),
    levelUps: z.number(),
    challengesCompleted: z.number(),
    bossEncounters: z.number(),
    improvementAreas: z.array(z.string()).optional(),
    strengths: z.array(z.string()).optional(),
  }),
});
export type GenerateWeeklyReflectionRequest = z.infer<
  typeof GenerateWeeklyReflectionRequestSchema
>;
