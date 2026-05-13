

export const QUERY_CONFIG = {
  FETCH_RELEVANT_SESSION_HISTORY: {
    topK: 5,
    minScore: 0.7,
    includeMetadata: true,
    includeValues: false,
  },
  FETCH_RELEVANT_USER_PATTERNS: {
    topK: 5,
    minScore: 0.75,
    includeMetadata: true,
    includeValues: false,
  },
  FETCH_COACH_MEMORY_CONTEXT: {
    topK: 10,
    minScore: 0.6,
    includeMetadata: true,
    includeValues: false,
  },
  FETCH_RECENT_REFLECTION_CONTEXT: {
    topK: 3,
    minScore: 0.65,
    includeMetadata: true,
    includeValues: false,
  },
  SEMANTIC_SEARCH_REFLECTIONS: {
    topK: 5,
    minScore: 0.7,
    includeMetadata: true,
    includeValues: false,
  },
} as const;

export const RETRIEVAL_TIMEOUTS = {
  DEFAULT: 5000, // 5 seconds
  SESSION_HISTORY: 8000,
  USER_PATTERNS: 5000,
  COACH_MEMORY: 5000,
  REFLECTION_CONTEXT: 5000,
  SEMANTIC_SEARCH: 10000,
} as const;

export const RETRY_CONFIG = {
  MAX_RETRIES: 2,
  INITIAL_DELAY_MS: 500,
  MAX_DELAY_MS: 2000,
  BACKOFF_MULTIPLIER: 2,
} as const;

export const CACHE_CONFIG = {
  ENABLED: true,

  // TTLs by query type
  TTL_MS: {
    FETCH_RELEVANT_SESSION_HISTORY: 5 * 60 * 1000, // 5 minutes
    FETCH_RELEVANT_USER_PATTERNS: 15 * 60 * 1000, // 15 minutes (patterns change slowly)
    FETCH_COACH_MEMORY_CONTEXT: 2 * 60 * 1000, // 2 minutes (recent interactions)
    FETCH_RECENT_REFLECTION_CONTEXT: 10 * 60 * 1000, // 10 minutes
    SEMANTIC_SEARCH_REFLECTIONS: 60 * 1000, // 1 minute (semantic queries are dynamic)
  },

  // Max entries per user per query type
  MAX_ENTRIES_PER_USER: {
    FETCH_RELEVANT_SESSION_HISTORY: 10,
    FETCH_RELEVANT_USER_PATTERNS: 5,
    FETCH_COACH_MEMORY_CONTEXT: 20,
    FETCH_RECENT_REFLECTION_CONTEXT: 5,
    SEMANTIC_SEARCH_REFLECTIONS: 3,
  },
} as const;

export const RETRIEVAL_FALLBACKS = {
  SESSION_HISTORY: {
    relevantSessions: [],
    patterns: {
      bestTimeOfDay: undefined,
      averageQuality: undefined,
      consistencyScore: undefined,
    },
    _fallbackNote: 'Session history temporarily unavailable. Using defaults.',
  },

  USER_PATTERNS: {
    patterns: [],
    insights: [
      'Your patterns are being analyzed. Check back later for personalized insights.',
    ],
    _fallbackNote: 'Pattern analysis temporarily unavailable.',
  },

  COACH_MEMORY: {
    memoryItems: [],
    continuityNotes: [
      'Welcome back! Your coaching history will be available shortly.',
    ],
    suggestedApproach: 'encouraging',
    _fallbackNote: 'Coach memory temporarily unavailable. Using fresh start approach.',
  },

  REFLECTION_CONTEXT: {
    reflections: [],
    themes: [],
    _fallbackNote: 'Reflection context temporarily unavailable.',
  },

  SEMANTIC_SEARCH: {
    searchResults: [],
    searchInterpretation: 'Search temporarily unavailable. Please try again later.',
    _fallbackNote: 'Semantic search temporarily unavailable.',
  },
} as const;

export const CLIENT_RETRIEVAL_FALLBACKS = {
  relevantSessions: [],
  patterns: {
    averageQuality: 75,
    consistencyScore: 0.7,
  },
  memoryItems: [],
  insights: ['Keep building your focus habits!'],
  reflections: [],
} as const;

export const PROHIBITED_METADATA_FIELDS = [
  'email',
  'name',
  'username',
  'phone',
  'address',
  'ipAddress',
  'deviceId',
  'rawLocation',
  'fullContent', // Use hash + reference instead
] as const;

export const CONTENT_SANITIZATION = {
  // Remove these patterns
  REMOVE_PATTERNS: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
  ],

  // Truncate to max length
  MAX_CONTENT_LENGTH: 2000,

  // Hash sensitive identifiers
  HASH_FIELDS: ['userId', 'sessionId'],
} as const;

export const PERFORMANCE_LIMITS = {
  // Max vectors per upsert batch
  MAX_UPSERT_BATCH_SIZE: 100,

  // Max vectors per user (soft limit for cleanup)
  MAX_VECTORS_PER_USER: 500,

  // Max queries per minute per user
  MAX_QUERIES_PER_MINUTE: 20,

  // Max concurrent queries per app
  MAX_CONCURRENT_QUERIES: 50,
} as const;