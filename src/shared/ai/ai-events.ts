export {
  AI_EVENT_CHANNELS,
  AIRequestStartedEventSchema,
  AIRequestCompletedEventSchema,
  AIRequestFailedEventSchema,
  AICacheHitEventSchema,
  AICacheMissEventSchema,
  AIFallbackUsedEventSchema,
  AICoachMessageGeneratedEventSchema,
  AISessionSummaryGeneratedEventSchema,
  AIComebackPromptGeneratedEventSchema,
  AIStreakNudgeGeneratedEventSchema,
  AIWeeklyReflectionGeneratedEventSchema,
  AIErrorLoggedEventSchema,
  type AIEventPayloadMap,
  type AIRequestStartedEvent,
  type AIRequestCompletedEvent,
  type AIRequestFailedEvent,
  type AICacheHitEvent,
  type AICacheMissEvent,
  type AIFallbackUsedEvent,
  type AICoachMessageGeneratedEvent,
  type AISessionSummaryGeneratedEvent,
  type AIComebackPromptGeneratedEvent,
  type AIStreakNudgeGeneratedEvent,
  type AIWeeklyReflectionGeneratedEvent,
  type AIErrorLoggedEvent,
} from "./ai-event-schemas";
import type {
  AIRequestStartedEvent,
  AIRequestCompletedEvent,
  AIRequestFailedEvent,
  AIFallbackUsedEvent,
  AICoachMessageGeneratedEvent,
  AIErrorLoggedEvent,
} from "./ai-event-schemas";
import {
  AIRequestStartedEventSchema,
  AIRequestCompletedEventSchema,
  AIRequestFailedEventSchema,
  AIFallbackUsedEventSchema,
  AICoachMessageGeneratedEventSchema,
  AIErrorLoggedEventSchema,
} from "./ai-event-schemas";

export function validateAIRequestStartedEvent(
  payload: unknown,
): AIRequestStartedEvent {
  return AIRequestStartedEventSchema.parse(payload);
}

export function validateAIRequestCompletedEvent(
  payload: unknown,
): AIRequestCompletedEvent {
  return AIRequestCompletedEventSchema.parse(payload);
}

export function validateAIRequestFailedEvent(
  payload: unknown,
): AIRequestFailedEvent {
  return AIRequestFailedEventSchema.parse(payload);
}

export function validateAIFallbackUsedEvent(
  payload: unknown,
): AIFallbackUsedEvent {
  return AIFallbackUsedEventSchema.parse(payload);
}

export function validateAICoachMessageGeneratedEvent(
  payload: unknown,
): AICoachMessageGeneratedEvent {
  return AICoachMessageGeneratedEventSchema.parse(payload);
}

export function validateAIErrorLoggedEvent(
  payload: unknown,
): AIErrorLoggedEvent {
  return AIErrorLoggedEventSchema.parse(payload);
}

export function createAIRequestStartedEvent(
  requestId: string,
  userId: string,
  requestType: string,
  contextHash: string,
): AIRequestStartedEvent {
  return {
    requestId,
    userId,
    requestType: requestType as AIRequestStartedEvent["requestType"],
    timestamp: Date.now(),
    contextHash,
  };
}

export function createAIRequestCompletedEvent(
  requestId: string,
  userId: string,
  requestType: string,
  processingTimeMs: number,
  contentLength: number,
  cached: boolean,
  promptTokens?: number,
  responseTokens?: number,
): AIRequestCompletedEvent {
  return {
    requestId,
    userId,
    requestType: requestType as AIRequestCompletedEvent["requestType"],
    timestamp: Date.now(),
    processingTimeMs,
    contentLength,
    cached,
    promptTokens,
    responseTokens,
  };
}

export function createAIRequestFailedEvent(
  requestId: string,
  userId: string,
  requestType: string,
  errorCode: string,
  errorMessage: string,
  retryable: boolean,
  fallbackUsed: boolean,
  processingTimeMs: number,
): AIRequestFailedEvent {
  return {
    requestId,
    userId,
    requestType: requestType as AIRequestFailedEvent["requestType"],
    timestamp: Date.now(),
    errorCode: errorCode as AIRequestFailedEvent["errorCode"],
    errorMessage,
    retryable,
    fallbackUsed,
    processingTimeMs,
  };
}

export function createAIFallbackUsedEvent(
  requestId: string,
  userId: string,
  requestType: string,
  fallbackReason: AIFallbackUsedEvent["fallbackReason"],
  fallbackSource: AIFallbackUsedEvent["fallbackSource"],
): AIFallbackUsedEvent {
  return {
    requestId,
    userId,
    requestType: requestType as AIFallbackUsedEvent["requestType"],
    timestamp: Date.now(),
    fallbackReason,
    fallbackSource,
  };
}

export function createAIErrorLoggedEvent(
  userId: string,
  errorCode: string,
  errorMessage: string,
  retryable: boolean,
  requestId?: string,
  requestType?: string,
  sentryEventId?: string,
  context?: Record<string, unknown>,
): AIErrorLoggedEvent {
  return {
    requestId,
    userId,
    requestType: requestType as AIErrorLoggedEvent["requestType"],
    timestamp: Date.now(),
    errorCode: errorCode as AIErrorLoggedEvent["errorCode"],
    errorMessage,
    retryable,
    sentryEventId,
    context,
  };
}
