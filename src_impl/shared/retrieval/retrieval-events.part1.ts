import { z } from "zod";
import { RetrievalQueryTypeSchema, RetrievalErrorCodeSchema } from "./retrieval-types";


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

export const RetrievalCacheHitEventSchema = z.object({
  cacheKey: z.string(),
  queryType: RetrievalQueryTypeSchema,
  userId: z.string().uuid(),
  timestamp: z.number(),
  ageMs: z.number(),
});

export const RetrievalCacheMissEventSchema = z.object({
  cacheKey: z.string(),
  queryType: RetrievalQueryTypeSchema,
  userId: z.string().uuid(),
  timestamp: z.number(),
});

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

export const SessionHistoryRetrievedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  sessionsFound: z.number(),
  averageRelevanceScore: z.number().optional(),
  patternsIdentified: z.number(),
  pineconeUsed: z.boolean(),
});

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

export const CoachMemoryRetrievedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  memoryItemsFound: z.number(),
  memoryTypes: z.array(z.string()),
  continuityScore: z.number().optional(), // How well memory connects to current context
});

export const ReflectionContextRetrievedEventSchema = z.object({
  queryId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  reflectionsFound: z.number(),
  themesIdentified: z.number(),
});

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

export const MemoryUpdatedEventSchema = z.object({
  memoryId: z.string(),
  userId: z.string().uuid(),
  memoryType: z.string(),
  timestamp: z.number(),
  updateType: z.enum(['metadata', 'vector', 'consolidation']),
  namespace: z.string(),
});

export const MemoryConsolidatedEventSchema = z.object({
  consolidationId: z.string().uuid(),
  userId: z.string().uuid(),
  timestamp: z.number(),
  memoriesConsolidated: z.number(),
  patternsGenerated: z.number(),
  memoriesArchived: z.number(),
  namespace: z.string(),
});