import { z } from "zod";
import { AIRequestTypeSchema, AIErrorCodeSchema } from "./ai-types";


export const AI_EVENT_CHANNELS = {
  // Request lifecycle
  AI_REQUEST_STARTED: 'ai:requestStarted',
  AI_REQUEST_COMPLETED: 'ai:requestCompleted',
  AI_REQUEST_FAILED: 'ai:requestFailed',

  // Cache events
  AI_CACHE_HIT: 'ai:cacheHit',
  AI_CACHE_MISS: 'ai:cacheMiss',

  // Fallback events
  AI_FALLBACK_USED: 'ai:fallbackUsed',

  // Feature-specific events
  AI_COACH_MESSAGE_GENERATED: 'ai:coachMessageGenerated',
  AI_SESSION_SUMMARY_GENERATED: 'ai:sessionSummaryGenerated',
  AI_COMEBACK_PROMPT_GENERATED: 'ai:comebackPromptGenerated',
  AI_STREAK_NUDGE_GENERATED: 'ai:streakNudgeGenerated',
  AI_WEEKLY_REFLECTION_GENERATED: 'ai:weeklyReflectionGenerated',

  // Error events
  AI_ERROR_LOGGED: 'ai:errorLogged',
} as const;

export const AIRequestStartedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  requestType: AIRequestTypeSchema,
  timestamp: z.number(),
  // Hash of context for analytics (no raw context in events)
  contextHash: z.string(),
});

export const AIRequestCompletedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  requestType: AIRequestTypeSchema,
  timestamp: z.number(),
  processingTimeMs: z.number(),
  promptTokens: z.number().optional(),
  responseTokens: z.number().optional(),
  cached: z.boolean(),
  // Content length for analytics (no actual content)
  contentLength: z.number(),
});

export const AIRequestFailedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  requestType: AIRequestTypeSchema,
  timestamp: z.number(),
  errorCode: AIErrorCodeSchema,
  errorMessage: z.string(),
  retryable: z.boolean(),
  fallbackUsed: z.boolean(),
  processingTimeMs: z.number(),
});

export const AICacheHitEventSchema = z.object({
  cacheKey: z.string(),
  requestType: AIRequestTypeSchema,
  userId: z.string().uuid(),
  timestamp: z.number(),
  ageMs: z.number(), // How old was the cached entry
});

export const AICacheMissEventSchema = z.object({
  cacheKey: z.string(),
  requestType: AIRequestTypeSchema,
  userId: z.string().uuid(),
  timestamp: z.number(),
});

export const AIFallbackUsedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  requestType: AIRequestTypeSchema,
  timestamp: z.number(),
  fallbackReason: z.enum([
    'AI_UNAVAILABLE',
    'AI_ERROR',
    'TIMEOUT',
    'SAFETY_BLOCK',
    'VALIDATION_FAILED',
  ]),
  fallbackSource: z.enum([
    'TEMPLATE_LIBRARY',
    'RULED_GENERATION',
    'STATIC_FALLBACK',
  ]),
});

export const AICoachMessageGeneratedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  messageCategory: z.enum([
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
  timestamp: z.number(),
  processingTimeMs: z.number(),
  aiGenerated: z.boolean(), // Was this from Gemini or fallback?
  cacheHit: z.boolean(),
});

export const AISessionSummaryGeneratedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  period: z.enum(['daily', 'weekly', 'monthly']),
  timestamp: z.number(),
  processingTimeMs: z.number(),
  aiGenerated: z.boolean(),
  sessionsCount: z.number(),
});

export const AIComebackPromptGeneratedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  comebackDay: z.number(),
  timestamp: z.number(),
  processingTimeMs: z.number(),
  aiGenerated: z.boolean(),
});

export const AIStreakNudgeGeneratedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  timestamp: z.number(),
  processingTimeMs: z.number(),
  aiGenerated: z.boolean(),
  urgency: z.enum(['low', 'medium', 'high']),
});

export const AIWeeklyReflectionGeneratedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  weekNumber: z.number(),
  timestamp: z.number(),
  processingTimeMs: z.number(),
  aiGenerated: z.boolean(),
});

export const AIErrorLoggedEventSchema = z.object({
  requestId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  requestType: AIRequestTypeSchema.optional(),
  timestamp: z.number(),
  errorCode: AIErrorCodeSchema,
  errorMessage: z.string(),
  retryable: z.boolean(),
  sentryEventId: z.string().optional(),
  // Sanitized context (no PII)
  context: z.record(z.unknown()).optional(),
});