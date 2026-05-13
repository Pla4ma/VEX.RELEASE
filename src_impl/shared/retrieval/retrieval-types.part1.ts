import { z } from "zod";


export const RetrievalQueryTypeSchema = z.enum([
  'FETCH_RELEVANT_SESSION_HISTORY',
  'FETCH_RELEVANT_USER_PATTERNS',
  'FETCH_COACH_MEMORY_CONTEXT',
  'FETCH_RECENT_REFLECTION_CONTEXT',
  'SEMANTIC_SEARCH_REFLECTIONS',
]);

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