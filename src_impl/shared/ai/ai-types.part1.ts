import { z } from "zod";


export const AIRequestTypeSchema = z.enum([
  'GENERATE_COACH_MESSAGE',
  'GENERATE_SESSION_SUMMARY',
  'GENERATE_COMEBACK_PROMPT',
  'GENERATE_STREAK_RISK_NUDGE',
  'GENERATE_WEEKLY_REFLECTION',
  'GENERATE_PERSONALIZED_TIP',
]);

export const AIBaseRequestSchema = z.object({
  requestType: AIRequestTypeSchema,
  userId: z.string().uuid(),
  // Context data - validated by backend, never contains PII in raw form
  context: z.record(z.unknown()),
  // Optional persona override
  personaId: z.string().uuid().optional(),
  // Request metadata
  metadata: z.object({
    timestamp: z.number(),
    appVersion: z.string().optional(),
    platform: z.enum(['ios', 'android']).optional(),
  }).optional(),
}).strict();

export const AIBaseResponseSchema = z.object({
  success: z.boolean(),
  requestType: AIRequestTypeSchema,
  // The generated content - validated and sanitized
  content: z.string().max(2000).nullable(),
  // Structured data if applicable (for complex responses)
  structuredData: z.record(z.unknown()).optional(),
  // Metadata about the generation
  metadata: z.object({
    model: z.string(),
    processingTimeMs: z.number(),
    promptTokens: z.number().optional(),
    responseTokens: z.number().optional(),
    cached: z.boolean().optional(),
  }),
  // Error info if failed
  error: z.object({
    code: z.string(),
    message: z.string(),
    retryable: z.boolean(),
  }).optional(),
}).strict();

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
    // Contextual data (validated, no PII)
    currentStreak: z.number().optional(),
    hoursSinceLastSession: z.number().optional(),
    currentLevel: z.number().optional(),
    recentSessionQuality: z.number().optional(),
    daysInactive: z.number().optional(),
    personaStyle: z.enum(['CHEERLEADER', 'DRILL_SERGEANT', 'FRIEND', 'MENTOR', 'RIVAL', 'MINDFUL']).optional(),
  }),
  personaId: z.string().uuid().optional(),
});

export const GenerateCoachMessageResponseSchema = AIBaseResponseSchema.extend({
  requestType: z.literal('GENERATE_COACH_MESSAGE'),
  content: z.string().max(1000),
  structuredData: z.object({
    message: z.string(),
    emoji: z.string().optional(),
    urgency: z.enum(['low', 'medium', 'high']).optional(),
    suggestedAction: z.string().optional(),
  }).optional(),
});

export const GenerateSessionSummaryRequestSchema = z.object({
  requestType: z.literal('GENERATE_SESSION_SUMMARY'),
  userId: z.string().uuid(),
  context: z.object({
    sessionCount: z.number(),
    totalFocusMinutes: z.number(),
    averageQuality: z.number(),
    streakDays: z.number(),
    xpEarned: z.number(),
    challengesCompleted: z.number(),
    bossDamageDealt: z.number().optional(),
    // Pattern data (anonymized)
    preferredTimeOfDay: z.string().optional(),
    consistencyScore: z.number().optional(),
  }),
});

export const GenerateSessionSummaryResponseSchema = AIBaseResponseSchema.extend({
  requestType: z.literal('GENERATE_SESSION_SUMMARY'),
  content: z.string().max(1500),
  structuredData: z.object({
    headline: z.string(),
    highlights: z.array(z.string()),
    encouragement: z.string(),
    nextGoal: z.string().optional(),
  }),
});

export const GenerateComebackPromptRequestSchema = z.object({
  requestType: z.literal('GENERATE_COMEBACK_PROMPT'),
  userId: z.string().uuid(),
  context: z.object({
    previousStreak: z.number(),
    daysInactive: z.number(),
    comebackDay: z.number(), // 1, 2, or 3
    sessionsCompleted: z.number(),
    bonusMultiplier: z.number(),
    personaStyle: z.enum(['CHEERLEADER', 'DRILL_SERGEANT', 'FRIEND', 'MENTOR', 'RIVAL', 'MINDFUL']).optional(),
  }),
});

export const GenerateComebackPromptResponseSchema = AIBaseResponseSchema.extend({
  requestType: z.literal('GENERATE_COMEBACK_PROMPT'),
  content: z.string().max(800),
  structuredData: z.object({
    message: z.string(),
    progressPercent: z.number(),
    encouragement: z.string(),
  }),
});

export const GenerateStreakRiskNudgeRequestSchema = z.object({
  requestType: z.literal('GENERATE_STREAK_RISK_NUDGE'),
  userId: z.string().uuid(),
  context: z.object({
    currentStreak: z.number(),
    hoursRemaining: z.number(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
    lastSessionQuality: z.number().optional(),
    personaStyle: z.enum(['CHEERLEADER', 'DRILL_SERGEANT', 'FRIEND', 'MENTOR', 'RIVAL', 'MINDFUL']).optional(),
  }),
});

export const GenerateStreakRiskNudgeResponseSchema = AIBaseResponseSchema.extend({
  requestType: z.literal('GENERATE_STREAK_RISK_NUDGE'),
  content: z.string().max(600),
  structuredData: z.object({
    urgencyMessage: z.string(),
    streakCount: z.number(),
    suggestedDuration: z.number(), // minutes
    emoji: z.string(),
  }),
});

export const GenerateWeeklyReflectionRequestSchema = z.object({
  requestType: z.literal('GENERATE_WEEKLY_REFLECTION'),
  userId: z.string().uuid(),
  context: z.object({
    weekNumber: z.number(),
    sessionsCompleted: z.number(),
    totalFocusHours: z.number(),
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