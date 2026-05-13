import { z } from "zod";
import { RetrievalQueryTypeSchema, RetrievalErrorCodeSchema } from "./retrieval-types";


export const RetrievalErrorLoggedEventSchema = z.object({
  queryId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  queryType: RetrievalQueryTypeSchema.optional(),
  timestamp: z.number(),
  errorCode: RetrievalErrorCodeSchema,
  errorMessage: z.string(),
  retryable: z.boolean(),
  sentryEventId: z.string().optional(),
  context: z.record(z.unknown()).optional(),
});

export function validateRetrievalStartedEvent(payload: unknown): RetrievalStartedEvent {
  return RetrievalStartedEventSchema.parse(payload);
}

export function validateRetrievalCompletedEvent(payload: unknown): RetrievalCompletedEvent {
  return RetrievalCompletedEventSchema.parse(payload);
}

export function validateRetrievalFailedEvent(payload: unknown): RetrievalFailedEvent {
  return RetrievalFailedEventSchema.parse(payload);
}

export function validateRetrievalFallbackUsedEvent(payload: unknown): RetrievalFallbackUsedEvent {
  return RetrievalFallbackUsedEventSchema.parse(payload);
}

export function validateMemoryStoredEvent(payload: unknown): MemoryStoredEvent {
  return MemoryStoredEventSchema.parse(payload);
}

export function validateRetrievalErrorLoggedEvent(payload: unknown): RetrievalErrorLoggedEvent {
  return RetrievalErrorLoggedEventSchema.parse(payload);
}

export function createRetrievalStartedEvent(
  queryId: string,
  userId: string,
  queryType: string,
  namespace: string,
  contextHash: string,
  expectedItems?: number
): RetrievalStartedEvent {
  return {
    queryId,
    userId,
    queryType: queryType as RetrievalStartedEvent['queryType'],
    timestamp: Date.now(),
    namespace,
    contextHash,
    expectedItems,
  };
}

export function createRetrievalCompletedEvent(
  queryId: string,
  userId: string,
  queryType: string,
  processingTimeMs: number,
  pineconeLatencyMs: number,
  itemsFound: number,
  namespace: string,
  embeddingLatencyMs?: number,
  relevanceScores?: number[],
  cached?: boolean
): RetrievalCompletedEvent {
  return {
    queryId,
    userId,
    queryType: queryType as RetrievalCompletedEvent['queryType'],
    timestamp: Date.now(),
    processingTimeMs,
    pineconeLatencyMs,
    embeddingLatencyMs,
    itemsFound,
    relevanceScores,
    cached: cached ?? false,
    namespace,
  };
}

export function createRetrievalFailedEvent(
  queryId: string,
  userId: string,
  queryType: string,
  errorCode: string,
  errorMessage: string,
  retryable: boolean,
  fallbackUsed: boolean,
  processingTimeMs: number,
  namespace: string
): RetrievalFailedEvent {
  return {
    queryId,
    userId,
    queryType: queryType as RetrievalFailedEvent['queryType'],
    timestamp: Date.now(),
    errorCode: errorCode as RetrievalFailedEvent['errorCode'],
    errorMessage,
    retryable,
    fallbackUsed,
    processingTimeMs,
    namespace,
  };
}

export function createRetrievalFallbackUsedEvent(
  queryId: string,
  userId: string,
  queryType: string,
  fallbackReason: RetrievalFallbackUsedEvent['fallbackReason'],
  fallbackSource: RetrievalFallbackUsedEvent['fallbackSource']
): RetrievalFallbackUsedEvent {
  return {
    queryId,
    userId,
    queryType: queryType as RetrievalFallbackUsedEvent['queryType'],
    timestamp: Date.now(),
    fallbackReason,
    fallbackSource,
  };
}

export function createMemoryStoredEvent(
  memoryId: string,
  userId: string,
  memoryType: string,
  namespace: string,
  vectorDimensions: number,
  contentHash: string,
  tags?: string[]
): MemoryStoredEvent {
  return {
    memoryId,
    userId,
    memoryType: memoryType as MemoryStoredEvent['memoryType'],
    timestamp: Date.now(),
    namespace,
    vectorDimensions,
    contentHash,
    tags,
  };
}

export function createRetrievalErrorLoggedEvent(
  userId: string,
  errorCode: string,
  errorMessage: string,
  retryable: boolean,
  queryId?: string,
  queryType?: string,
  sentryEventId?: string,
  context?: Record<string, unknown>
): RetrievalErrorLoggedEvent {
  return {
    queryId,
    userId,
    queryType: queryType as RetrievalErrorLoggedEvent['queryType'],
    timestamp: Date.now(),
    errorCode: errorCode as RetrievalErrorLoggedEvent['errorCode'],
    errorMessage,
    retryable,
    sentryEventId,
    context,
  };
}