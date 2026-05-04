/**
 * Retrieval Events - Server-Side Pinecone Integration
 *
 * Event definitions for retrieval/memory operations across the app.
 * Used for tracking, analytics, and cross-feature communication.
 *
 * CRITICAL: These events contain NO Pinecone API keys.
 * Vector queries happen server-side only.
 */

import { z } from 'zod';
import { RetrievalQueryTypeSchema, RetrievalErrorCodeSchema } from './retrieval-types';

// ============================================================================
// Event Channel Names
// ============================================================================

export const RETRIEVAL_EVENT_CHANNELS = {
  // Query lifecycle
  RETRIEVAL_STARTED: 'retrieval:started',
  RETRIEVAL_COMPLETED: 'retrieval:completed',
  RETRIEVAL_FAILED: 'retrieval:failed',

  // Cache events
  RETRIEVAL_CACHE_HIT: 'retrieval:cacheHit',
  RETRIEVAL_CACHE_MISS: 'retrieval:cacheMiss',

  // Fallback events
  RETRIEVAL_FALLBACK_USED: 'retrieval:fallbackUsed',

  // Specific retrieval events
  SESSION_HISTORY_RETRIEVED: 'retrieval:sessionHistoryRetrieved',
  USER_PATTERNS_RETRIEVED: 'retrieval:userPatternsRetrieved',
  COACH_MEMORY_RETRIEVED: 'retrieval:coachMemoryRetrieved',
  REFLECTION_CONTEXT_RETRIEVED: 'retrieval:reflectionContextRetrieved',

  // Storage events (when we write to Pinecone)
  MEMORY_STORED: 'retrieval:memoryStored',
  MEMORY_UPDATED: 'retrieval:memoryUpdated',
  MEMORY_CONSOLIDATED: 'retrieval:memoryConsolidated',

  // Error events
  RETRIEVAL_ERROR_LOGGED: 'retrieval:errorLogged',
} as const;

// ============================================================================
// Event Schemas
// ============================================================================

/**
 * Retrieval Started Event
 */
export const RetrievalStartedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  queryType: RetrievalQueryTypeSchema,
  timestamp: z.number(),
  namespace: z.string(),
  // Hash of context for analytics (no raw context in events)
  contextHash: z.string(),
  // What we're looking for
  expectedItems: z.number().optional(),
});

export type RetrievalStartedEvent = z.infer<typeof RetrievalStartedEventSchema>;

/**
 * Retrieval Completed Event
 */
export const RetrievalCompletedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  queryType: RetrievalQueryTypeSchema,
  timestamp: z.number(),
  processingTimeMs: z.number(),
  pineconeLatencyMs: z.number(),
  embeddingLatencyMs: z.number().optional(),
  itemsFound: z.number(),
  relevanceScores: z.array(z.number()).optional(),
  cached: z.boolean(),
  namespace: z.string(),
});

export type RetrievalCompletedEvent = z.infer<typeof RetrievalCompletedEventSchema>;

/**
 * Retrieval Failed Event
 */
export const RetrievalFailedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  queryType: RetrievalQueryTypeSchema,
  timestamp: z.number(),
  errorCode: RetrievalErrorCodeSchema,
  errorMessage: z.string(),
  retryable: z.boolean(),
  fallbackUsed: z.boolean(),
  processingTimeMs: z.number(),
  namespace: z.string(),
});

export type RetrievalFailedEvent = z.infer<typeof RetrievalFailedEventSchema>;

/**
 * Retrieval Cache Hit Event
 */
export const RetrievalCacheHitEventSchema = z.object({
  cacheKey: z.string(),
  queryType: RetrievalQueryTypeSchema,
  userId: z.string().uuid(),
  timestamp: z.number(),
  ageMs: z.number(),
});

export type RetrievalCacheHitEvent = z.infer<typeof RetrievalCacheHitEventSchema>;

/**
 * Retrieval Cache Miss Event
 */
export const RetrievalCacheMissEventSchema = z.object({
  cacheKey: z.string(),
  queryType: RetrievalQueryTypeSchema,
  userId: z.string().uuid(),
  timestamp: z.number(),
});

export type RetrievalCacheMissEvent = z.infer<typeof RetrievalCacheMissEventSchema>;

/**
 * Retrieval Fallback Used Event
 */
export const RetrievalFallbackUsedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  queryType: RetrievalQueryTypeSchema,
  timestamp: z.number(),
  fallbackReason: z.enum([
    'PINECONE_UNAVAILABLE',
    'PINECONE_ERROR',
    'TIMEOUT',
    'NO_RESULTS',
    'VALIDATION_FAILED',
  ]),
  fallbackSource: z.enum([
    'DATABASE_FALLBACK',
    'STATIC_FALLBACK',
    'RULED_GENERATION',
  ]),
});

export type RetrievalFallbackUsedEvent = z.infer<typeof RetrievalFallbackUsedEventSchema>;

/**
 * Session History Retrieved Event
 */
export const SessionHistoryRetrievedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  sessionsFound: z.number(),
  averageRelevanceScore: z.number().optional(),
  patternsIdentified: z.number(),
  pineconeUsed: z.boolean(),
});

export type SessionHistoryRetrievedEvent = z.infer<typeof SessionHistoryRetrievedEventSchema>;

/**
 * User Patterns Retrieved Event
 */
export const UserPatternsRetrievedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  patternsFound: z.number(),
  confidenceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
});

export type UserPatternsRetrievedEvent = z.infer<typeof UserPatternsRetrievedEventSchema>;

/**
 * Coach Memory Retrieved Event
 */
export const CoachMemoryRetrievedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  memoryItemsFound: z.number(),
  memoryTypes: z.array(z.string()),
  continuityScore: z.number().optional(), // How well memory connects to current context
});

export type CoachMemoryRetrievedEvent = z.infer<typeof CoachMemoryRetrievedEventSchema>;

/**
 * Reflection Context Retrieved Event
 */
export const ReflectionContextRetrievedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  reflectionsFound: z.number(),
  themesIdentified: z.number(),
});

export type ReflectionContextRetrievedEvent = z.infer<typeof ReflectionContextRetrievedEventSchema>;

/**
 * Memory Stored Event
 * Emitted when we write to Pinecone
 */
export const MemoryStoredEventSchema = z.object({
  memoryId: z.string(),
  userId: z.string().uuid(),
  memoryType: z.enum(['session', 'reflection', 'pattern', 'coach_interaction', 'milestone']),
  timestamp: z.number(),
  namespace: z.string(),
  vectorDimensions: z.number(),
  // No actual content in event - just metadata
  contentHash: z.string(),
  tags: z.array(z.string()).optional(),
});

export type MemoryStoredEvent = z.infer<typeof MemoryStoredEventSchema>;

/**
 * Memory Updated Event
 */
export const MemoryUpdatedEventSchema = z.object({
  memoryId: z.string(),
  userId: z.string().uuid(),
  memoryType: z.string(),
  timestamp: z.number(),
  updateType: z.enum(['metadata', 'vector', 'consolidation']),
  namespace: z.string(),
});

export type MemoryUpdatedEvent = z.infer<typeof MemoryUpdatedEventSchema>;

/**
 * Memory Consolidated Event
 * Emitted when old memories are merged into patterns
 */
export const MemoryConsolidatedEventSchema = z.object({
  consolidationId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  memoriesConsolidated: z.number(),
  patternsGenerated: z.number(),
  memoriesArchived: z.number(),
  namespace: z.string(),
});

export type MemoryConsolidatedEvent = z.infer<typeof MemoryConsolidatedEventSchema>;

/**
 * Retrieval Error Logged Event
 */
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

export type RetrievalErrorLoggedEvent = z.infer<typeof RetrievalErrorLoggedEventSchema>;

// ============================================================================
// Event Payload Map
// ============================================================================

export interface RetrievalEventPayloadMap {
  [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_STARTED]: RetrievalStartedEvent;
  [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_COMPLETED]: RetrievalCompletedEvent;
  [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_FAILED]: RetrievalFailedEvent;
  [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_CACHE_HIT]: RetrievalCacheHitEvent;
  [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_CACHE_MISS]: RetrievalCacheMissEvent;
  [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_FALLBACK_USED]: RetrievalFallbackUsedEvent;
  [RETRIEVAL_EVENT_CHANNELS.SESSION_HISTORY_RETRIEVED]: SessionHistoryRetrievedEvent;
  [RETRIEVAL_EVENT_CHANNELS.USER_PATTERNS_RETRIEVED]: UserPatternsRetrievedEvent;
  [RETRIEVAL_EVENT_CHANNELS.COACH_MEMORY_RETRIEVED]: CoachMemoryRetrievedEvent;
  [RETRIEVAL_EVENT_CHANNELS.REFLECTION_CONTEXT_RETRIEVED]: ReflectionContextRetrievedEvent;
  [RETRIEVAL_EVENT_CHANNELS.MEMORY_STORED]: MemoryStoredEvent;
  [RETRIEVAL_EVENT_CHANNELS.MEMORY_UPDATED]: MemoryUpdatedEvent;
  [RETRIEVAL_EVENT_CHANNELS.MEMORY_CONSOLIDATED]: MemoryConsolidatedEvent;
  [RETRIEVAL_EVENT_CHANNELS.RETRIEVAL_ERROR_LOGGED]: RetrievalErrorLoggedEvent;
}

// ============================================================================
// Validation Functions
// ============================================================================

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

// ============================================================================
// Event Factory Functions
// ============================================================================

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
