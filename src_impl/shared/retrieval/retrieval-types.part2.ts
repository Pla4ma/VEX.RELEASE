import { z } from "zod";


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

export const RetrievalRequestSchema = z.discriminatedUnion('queryType', [
  FetchRelevantSessionHistoryRequestSchema,
  FetchRelevantUserPatternsRequestSchema,
  FetchCoachMemoryContextRequestSchema,
  FetchRecentReflectionContextRequestSchema,
  SemanticSearchReflectionsRequestSchema,
]);

export const RetrievalResponseSchema = z.discriminatedUnion('queryType', [
  FetchRelevantSessionHistoryResponseSchema,
  FetchRelevantUserPatternsResponseSchema,
  FetchCoachMemoryContextResponseSchema,
  FetchRecentReflectionContextResponseSchema,
  SemanticSearchReflectionsResponseSchema,
]);

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