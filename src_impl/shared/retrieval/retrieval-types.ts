/**
 * Retrieval Types - Server-Side Pinecone Integration
 *
 * These types define the contracts between:
 * - React Native app (client)
 * - Supabase Edge Functions / Trigger.dev jobs (backend)
 * - Pinecone API (external vector database)
 *
 * CRITICAL: No Pinecone API keys in this file. No client-side vector queries.
 */

import { z } from 'zod';

// ============================================================================
// Core Retrieval Request/Response Types
// ============================================================================

export const RetrievalQueryTypeSchema = z.enum([
  'FETCH_RELEVANT_SESSION_HISTORY',
  'FETCH_RELEVANT_USER_PATTERNS',
  'FETCH_COACH_MEMORY_CONTEXT',
  'FETCH_RECENT_REFLECTION_CONTEXT',
  'SEMANTIC_SEARCH_REFLECTIONS',
]);

export type RetrievalQueryType = z.infer<typeof RetrievalQueryTypeSchema>;

/**
 * Base retrieval request from client to backend
 * Backend validates this and constructs the actual Pinecone query
 */
export const RetrievalBaseRequestSchema = z.object({
  queryType: RetrievalQueryTypeSchema,
  userId: z.string().uuid(),
  // Context for what we're retrieving
  context: z.record(z.unknown()),
  // Optional filters
  filters: z.object({
    timeRange: z.object({
      from: z.number().optional(),
      to: z.number().optional(),
    }).optional(),
    categories: z.array(z.string()).optional(),
    minRelevanceScore: z.number().min(0).max(1).optional(),
  }).optional(),
  // Pagination
  limit: z.number().int().min(1).max(50).default(10),
  // Metadata for request
  metadata: z.object({
    timestamp: z.number(),
    appVersion: z.string().optional(),
    requestReason: z.string().optional(),
  }).optional(),
}).strict();

export type RetrievalBaseRequest = z.infer<typeof RetrievalBaseRequestSchema>;

/**
 * Retrieval response from backend to client
 * Contains curated, validated context - no raw Pinecone data
 */
export const RetrievalBaseResponseSchema = z.object({
  success: z.boolean(),
  queryType: RetrievalQueryTypeSchema,
  // The retrieved context (validated and curated)
  context: z.record(z.unknown()).nullable(),
  // Individual retrieved items (if applicable)
  items: z.array(z.record(z.unknown())).optional(),
  // Metadata about the retrieval
  metadata: z.object({
    processingTimeMs: z.number(),
    itemsFound: z.number(),
    relevanceScores: z.array(z.number()).optional(),
    namespace: z.string().optional(),
    cached: z.boolean().optional(),
  }),
  // Error info if failed
  error: z.object({
    code: z.string(),
    message: z.string(),
    fallbackUsed: z.boolean(),
  }).optional(),
}).strict();

export type RetrievalBaseResponse = z.infer<typeof RetrievalBaseResponseSchema>;

// ============================================================================
// Specific Retrieval Use Case Types
// ============================================================================

/**
 * Fetch Relevant Session History
 * Retrieve past sessions similar to current context for coaching personalization
 */
export const FetchRelevantSessionHistoryRequestSchema = z.object({
  queryType: z.literal('FETCH_RELEVANT_SESSION_HISTORY'),
  userId: z.string().uuid(),
  context: z.object({
    // Current session context (for similarity search)
    currentFocusTopic: z.string().optional(),
    currentDifficulty: z.number().optional(),
    timeOfDay: z.string().optional(), // 'morning' | 'afternoon' | 'evening'
    dayOfWeek: z.number().min(0).max(6).optional(),
    // What we want to retrieve
    lookbackDays: z.number().default(30),
    similarTo: z.enum(['current_context', 'high_quality', 'streak_saving']).default('current_context'),
  }),
  filters: z.object({
    minQuality: z.number().min(0).max(100).optional(),
    completedOnly: z.boolean().default(true),
  }).optional(),
  limit: z.number().int().min(1).max(20).default(5),
});

export type FetchRelevantSessionHistoryRequest = z.infer<typeof FetchRelevantSessionHistoryRequestSchema>;

export const FetchRelevantSessionHistoryResponseSchema = RetrievalBaseResponseSchema.extend({
  queryType: z.literal('FETCH_RELEVANT_SESSION_HISTORY'),
  context: z.object({
    relevantSessions: z.array(z.object({
      sessionId: z.string(),
      date: z.number(),
      duration: z.number(),
      quality: z.number(),
      topic: z.string().optional(),
      notes: z.string().optional(),
      similarityScore: z.number(),
    })),
    patterns: z.object({
      bestTimeOfDay: z.string().optional(),
      averageQuality: z.number().optional(),
      consistencyScore: z.number().optional(),
    }).optional(),
  }).nullable(),
});

export type FetchRelevantSessionHistoryResponse = z.infer<typeof FetchRelevantSessionHistoryResponseSchema>;

/**
 * Fetch Relevant User Patterns
 * Retrieve behavioral patterns for personalized coaching
 */
export const FetchRelevantUserPatternsRequestSchema = z.object({
  queryType: z.literal('FETCH_RELEVANT_USER_PATTERNS'),
  userId: z.string().uuid(),
  context: z.object({
    // What patterns we're interested in
    patternTypes: z.array(z.enum([
      'FOCUS_PATTERNS',
      'STREAK_BEHAVIOR',
      'DIFFICULTY_PREFERENCE',
      'TIME_OF_DAY_PREFERENCE',
      'CHALLENGE_ENGAGEMENT',
      'BOSS_INTERACTION',
    ])).default(['FOCUS_PATTERNS']),
    // Current context to match against
    currentState: z.string().optional(), // e.g., 'streak_at_risk'
    timeHorizon: z.enum(['recent', 'medium', 'all_time']).default('medium'),
  }),
  limit: z.number().int().min(1).max(10).default(5),
});

export type FetchRelevantUserPatternsRequest = z.infer<typeof FetchRelevantUserPatternsRequestSchema>;

export const FetchRelevantUserPatternsResponseSchema = RetrievalBaseResponseSchema.extend({
  queryType: z.literal('FETCH_RELEVANT_USER_PATTERNS'),
  context: z.object({
    patterns: z.array(z.object({
      patternType: z.string(),
      description: z.string(),
      confidence: z.number(),
      evidence: z.array(z.string()),
      formedAt: z.number(),
      lastObserved: z.number(),
    })),
    insights: z.array(z.string()),
  }).nullable(),
});

export type FetchRelevantUserPatternsResponse = z.infer<typeof FetchRelevantUserPatternsResponseSchema>;

/**
 * Fetch Coach Memory Context
 * Retrieve what the coach "remembers" about the user for continuity
 */
export const FetchCoachMemoryContextRequestSchema = z.object({
  queryType: z.literal('FETCH_COACH_MEMORY_CONTEXT'),
  userId: z.string().uuid(),
  context: z.object({
    // What aspect of coaching memory
    memoryTypes: z.array(z.enum([
      'RECENT_INTERACTIONS',
      'PERSONALIZED_INSIGHTS',
      'STREAK_HISTORY',
      'MILESTONE_MOMENTS',
      'COMEBACK_JOURNEYS',
      'CHALLENGE_OUTCOMES',
    ])).default(['RECENT_INTERACTIONS']),
    // For what purpose
    forCoachCategory: z.enum([
      'STREAK_RISK',
      'SESSION_SUGGESTION',
      'MILESTONE_HYPE',
      'COMEBACK_SUPPORT',
      'MOTIVATION_BOOST',
    ]).optional(),
  }),
  limit: z.number().int().min(1).max(15).default(5),
});

export type FetchCoachMemoryContextRequest = z.infer<typeof FetchCoachMemoryContextRequestSchema>;

export const FetchCoachMemoryContextResponseSchema = RetrievalBaseResponseSchema.extend({
  queryType: z.literal('FETCH_COACH_MEMORY_CONTEXT'),
  context: z.object({
    memoryItems: z.array(z.object({
      type: z.string(),
      timestamp: z.number(),
      summary: z.string(),
      emotionalTone: z.enum(['positive', 'neutral', 'challenging']).optional(),
      relevanceScore: z.number(),
    })),
    continuityNotes: z.array(z.string()),
    suggestedApproach: z.string().optional(),
  }).nullable(),
});

export type FetchCoachMemoryContextResponse = z.infer<typeof FetchCoachMemoryContextResponseSchema>;

/**
 * Fetch Recent Reflection Context
 * Retrieve user's own reflections/notes for contextual coaching
 */
export const FetchRecentReflectionContextRequestSchema = z.object({
  queryType: z.literal('FETCH_RECENT_REFLECTION_CONTEXT'),
  userId: z.string().uuid(),
  context: z.object({
    // Time range
    lookbackDays: z.number().default(14),
    // What to look for
    themes: z.array(z.string()).optional(), // e.g., ['struggles', 'wins', 'goals']
    // Current context for similarity
    relatedTo: z.string().optional(),
  }),
  filters: z.object({
    hasContent: z.boolean().default(true),
    minLength: z.number().default(10),
  }).optional(),
  limit: z.number().int().min(1).max(10).default(3),
});

export type FetchRecentReflectionContextRequest = z.infer<typeof FetchRecentReflectionContextRequestSchema>;

export const FetchRecentReflectionContextResponseSchema = RetrievalBaseResponseSchema.extend({
  queryType: z.literal('FETCH_RECENT_REFLECTION_CONTEXT'),
  context: z.object({
    reflections: z.array(z.object({
      id: z.string(),
      timestamp: z.number(),
      content: z.string(),
      tags: z.array(z.string()),
      relatedToSession: z.string().optional(),
      emotionalTone: z.string().optional(),
    })),
    themes: z.array(z.object({
      theme: z.string(),
      frequency: z.number(),
      recentExamples: z.array(z.string()),
    })),
  }).nullable(),
});

export type FetchRecentReflectionContextResponse = z.infer<typeof FetchRecentReflectionContextResponseSchema>;

/**
 * Semantic Search Reflections (Future Use)
 * Search user's reflections by semantic meaning
 */
export const SemanticSearchReflectionsRequestSchema = z.object({
  queryType: z.literal('SEMANTIC_SEARCH_REFLECTIONS'),
  userId: z.string().uuid(),
  context: z.object({
    searchQuery: z.string(), // Natural language query
    searchIntent: z.enum([
      'find_similar_experiences',
      'find_lessons_learned',
      'find_motivational_moments',
      'find_challenges_faced',
    ]),
  }),
  filters: z.object({
    timeRange: z.object({
      from: z.number().optional(),
      to: z.number().optional(),
    }).optional(),
  }).optional(),
  limit: z.number().int().min(1).max(20).default(5),
});

export type SemanticSearchReflectionsRequest = z.infer<typeof SemanticSearchReflectionsRequestSchema>;

export const SemanticSearchReflectionsResponseSchema = RetrievalBaseResponseSchema.extend({
  queryType: z.literal('SEMANTIC_SEARCH_REFLECTIONS'),
  context: z.object({
    searchResults: z.array(z.object({
      id: z.string(),
      content: z.string(),
      timestamp: z.number(),
      relevanceScore: z.number(),
      matchedConcepts: z.array(z.string()),
    })),
    searchInterpretation: z.string(),
  }).nullable(),
});

export type SemanticSearchReflectionsResponse = z.infer<typeof SemanticSearchReflectionsResponseSchema>;

// ============================================================================
// Union Types for API Handling
// ============================================================================

export const RetrievalRequestSchema = z.discriminatedUnion('queryType', [
  FetchRelevantSessionHistoryRequestSchema,
  FetchRelevantUserPatternsRequestSchema,
  FetchCoachMemoryContextRequestSchema,
  FetchRecentReflectionContextRequestSchema,
  SemanticSearchReflectionsRequestSchema,
]);

export type RetrievalRequest = z.infer<typeof RetrievalRequestSchema>;

export const RetrievalResponseSchema = z.discriminatedUnion('queryType', [
  FetchRelevantSessionHistoryResponseSchema,
  FetchRelevantUserPatternsResponseSchema,
  FetchCoachMemoryContextResponseSchema,
  FetchRecentReflectionContextResponseSchema,
  SemanticSearchReflectionsResponseSchema,
]);

export type RetrievalResponse = z.infer<typeof RetrievalResponseSchema>;

// ============================================================================
// Pinecone Backend Types (Not exposed to client)
// These types are used in Supabase Edge Functions or Trigger.dev jobs
// ============================================================================

/**
 * Pinecone Query Request (backend-only)
 */
export interface PineconeQueryRequest {
  namespace: string;
  vector: number[]; // Embedding vector
  topK: number;
  filter?: Record<string, unknown>;
  includeMetadata: boolean;
  includeValues: boolean;
}

/**
 * Pinecone Query Response (backend-only)
 */
export interface PineconeQueryResponse {
  matches: Array<{
    id: string;
    score: number;
    values?: number[];
    metadata: Record<string, unknown>;
  }>;
  namespace: string;
  usage?: {
    readUnits: number;
  };
}

/**
 * Pinecone Upsert Request (backend-only)
 */
export interface PineconeUpsertRequest {
  namespace: string;
  vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, unknown>;
  }>;
}

/**
 * Vector Record for storage
 */
export interface VectorRecord {
  id: string;
  vector: number[];
  metadata: VectorMetadata;
  namespace: string;
}

/**
 * Metadata for stored vectors
 */
export interface VectorMetadata {
  userId: string;
  type: 'session' | 'reflection' | 'pattern' | 'coach_interaction' | 'milestone';
  timestamp: number;
  content?: string; // Sanitized content
  tags?: string[];
  quality?: number;
  duration?: number;
  category?: string;
  // No PII in raw form - hashed or anonymized
}

// ============================================================================
// Error Types
// ============================================================================

export const RetrievalErrorCodeSchema = z.enum([
  'INVALID_REQUEST',
  'PINECONE_API_ERROR',
  'PINECONE_RATE_LIMIT',
  'PINECONE_NOT_FOUND',
  'PINECONE_TIMEOUT',
  'EMBEDDING_GENERATION_FAILED',
  'NO_RESULTS_FOUND',
  'RESULT_VALIDATION_FAILED',
  'INTERNAL_ERROR',
]);

export type RetrievalErrorCode = z.infer<typeof RetrievalErrorCodeSchema>;

export interface RetrievalError {
  code: RetrievalErrorCode;
  message: string;
  retryable: boolean;
  originalError?: unknown;
  context?: Record<string, unknown>;
}

// ============================================================================
// Embedding Types
// ============================================================================

export interface EmbeddingConfig {
  model: string;
  dimensions: number;
  maxInputLength: number;
}

export interface GeneratedEmbedding {
  vector: number[];
  model: string;
  inputTokens: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface RetrievalMetrics {
  queryType: RetrievalQueryType;
  processingTimeMs: number;
  pineconeLatencyMs: number;
  embeddingLatencyMs?: number;
  itemsFound: number;
  cacheHit: boolean;
  success: boolean;
  errorCode?: RetrievalErrorCode;
}

// ============================================================================
// Memory Management Types
// ============================================================================

export interface MemoryRetentionPolicy {
  type: string;
  maxAgeDays: number;
  maxItems: number;
  consolidationEnabled: boolean;
}

export interface MemoryConsolidationResult {
  consolidated: number;
  archived: number;
  deleted: number;
  newPatterns: number;
}
