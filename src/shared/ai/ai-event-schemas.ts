import { z } from 'zod';
import { AIRequestTypeSchema, AIErrorCodeSchema } from './ai-types';

export const AI_EVENT_CHANNELS = {
  AI_REQUEST_STARTED: 'ai:requestStarted',
  AI_REQUEST_COMPLETED: 'ai:requestCompleted',
  AI_REQUEST_FAILED: 'ai:requestFailed',
  AI_CACHE_HIT: 'ai:cacheHit',
  AI_CACHE_MISS: 'ai:cacheMiss',
  AI_FALLBACK_USED: 'ai:fallbackUsed',
  AI_COACH_MESSAGE_GENERATED: 'ai:coachMessageGenerated',
  AI_SESSION_SUMMARY_GENERATED: 'ai:sessionSummaryGenerated',
  AI_COMEBACK_PROMPT_GENERATED: 'ai:comebackPromptGenerated',
  AI_STREAK_NUDGE_GENERATED: 'ai:streakNudgeGenerated',
  AI_WEEKLY_REFLECTION_GENERATED: 'ai:weeklyReflectionGenerated',
  AI_ERROR_LOGGED: 'ai:errorLogged',
} as const;

export const AIRequestStartedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  requestType: AIRequestTypeSchema,
  timestamp: z.number(),
  contextHash: z.string(),
});
export type AIRequestStartedEvent = z.infer<typeof AIRequestStartedEventSchema>;

export const AIRequestCompletedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  requestType: AIRequestTypeSchema,
  timestamp: z.number(),
  processingTimeMs: z.number(),
  promptTokens: z.number().optional(),
  responseTokens: z.number().optional(),
  cached: z.boolean(),
  contentLength: z.number(),
});
export type AIRequestCompletedEvent = z.infer<
  typeof AIRequestCompletedEventSchema
>;

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
export type AIRequestFailedEvent = z.infer<typeof AIRequestFailedEventSchema>;

export const AICacheHitEventSchema = z.object({
  cacheKey: z.string(),
  requestType: AIRequestTypeSchema,
  userId: z.string().uuid(),
  timestamp: z.number(),
  ageMs: z.number(),
});
export type AICacheHitEvent = z.infer<typeof AICacheHitEventSchema>;

export const AICacheMissEventSchema = z.object({
  cacheKey: z.string(),
  requestType: AIRequestTypeSchema,
  userId: z.string().uuid(),
  timestamp: z.number(),
});
export type AICacheMissEvent = z.infer<typeof AICacheMissEventSchema>;

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
export type AIFallbackUsedEvent = z.infer<typeof AIFallbackUsedEventSchema>;

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
  aiGenerated: z.boolean(),
  cacheHit: z.boolean(),
});
export type AICoachMessageGeneratedEvent = z.infer<
  typeof AICoachMessageGeneratedEventSchema
>;

export const AISessionSummaryGeneratedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  period: z.enum(['daily', 'weekly', 'monthly']),
  timestamp: z.number(),
  processingTimeMs: z.number(),
  aiGenerated: z.boolean(),
  sessionsCount: z.number(),
});
export type AISessionSummaryGeneratedEvent = z.infer<
  typeof AISessionSummaryGeneratedEventSchema
>;

export const AIComebackPromptGeneratedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  comebackDay: z.number(),
  timestamp: z.number(),
  processingTimeMs: z.number(),
  aiGenerated: z.boolean(),
});
export type AIComebackPromptGeneratedEvent = z.infer<
  typeof AIComebackPromptGeneratedEventSchema
>;

export const AIStreakNudgeGeneratedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  timestamp: z.number(),
  processingTimeMs: z.number(),
  aiGenerated: z.boolean(),
  urgency: z.enum(['low', 'medium', 'high']),
});
export type AIStreakNudgeGeneratedEvent = z.infer<
  typeof AIStreakNudgeGeneratedEventSchema
>;

export const AIWeeklyReflectionGeneratedEventSchema = z.object({
  requestId: z.string().uuid(),
  userId: z.string().uuid(),
  weekNumber: z.number(),
  timestamp: z.number(),
  processingTimeMs: z.number(),
  aiGenerated: z.boolean(),
});
export type AIWeeklyReflectionGeneratedEvent = z.infer<
  typeof AIWeeklyReflectionGeneratedEventSchema
>;

export const AIErrorLoggedEventSchema = z.object({
  requestId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  requestType: AIRequestTypeSchema.optional(),
  timestamp: z.number(),
  errorCode: AIErrorCodeSchema,
  errorMessage: z.string(),
  retryable: z.boolean(),
  sentryEventId: z.string().optional(),
  context: z.record(z.unknown()).optional(),
});
export type AIErrorLoggedEvent = z.infer<typeof AIErrorLoggedEventSchema>;

export interface AIEventPayloadMap {
  [AI_EVENT_CHANNELS.AI_REQUEST_STARTED]: AIRequestStartedEvent;
  [AI_EVENT_CHANNELS.AI_REQUEST_COMPLETED]: AIRequestCompletedEvent;
  [AI_EVENT_CHANNELS.AI_REQUEST_FAILED]: AIRequestFailedEvent;
  [AI_EVENT_CHANNELS.AI_CACHE_HIT]: AICacheHitEvent;
  [AI_EVENT_CHANNELS.AI_CACHE_MISS]: AICacheMissEvent;
  [AI_EVENT_CHANNELS.AI_FALLBACK_USED]: AIFallbackUsedEvent;
  [AI_EVENT_CHANNELS.AI_COACH_MESSAGE_GENERATED]: AICoachMessageGeneratedEvent;
  [AI_EVENT_CHANNELS.AI_SESSION_SUMMARY_GENERATED]: AISessionSummaryGeneratedEvent;
  [AI_EVENT_CHANNELS.AI_COMEBACK_PROMPT_GENERATED]: AIComebackPromptGeneratedEvent;
  [AI_EVENT_CHANNELS.AI_STREAK_NUDGE_GENERATED]: AIStreakNudgeGeneratedEvent;
  [AI_EVENT_CHANNELS.AI_WEEKLY_REFLECTION_GENERATED]: AIWeeklyReflectionGeneratedEvent;
  [AI_EVENT_CHANNELS.AI_ERROR_LOGGED]: AIErrorLoggedEvent;
}
