/**
 * Retrieval Constants - Server-Side Pinecone Integration
 *
 * Centralized configuration for vector retrieval operations.
 * No API keys here - they live in .env.server only.
 *
 * All Pinecone configuration is defined here for consistency.
 */

// ============================================================================
// Pinecone Configuration
// ============================================================================

/**
 * Pinecone index configuration
 * These match the index created in Pinecone console
 */
export const PINECONE_CONFIG = {
  // Index name from .env.server
  INDEX_NAME: 'vex-memory',

  // Vector dimensions (based on embedding model)
  // Using text-embedding-004: 768 dimensions
  DIMENSIONS: 768,

  // Metric for similarity search
  METRIC: 'cosine',

  // Cloud provider and region
  // Set based on your Pinecone setup
  CLOUD: 'aws',
  REGION: 'us-east-1',
} as const;

// ============================================================================
// Embedding Models
// ============================================================================

export const EMBEDDING_MODELS = {
  // Google's text embedding model (used with Gemini)
  GEMINI_EMBEDDING: {
    model: 'text-embedding-004',
    dimensions: 768,
    maxInputLength: 2048,
  },

  // Alternative: OpenAI (if needed later)
  OPENAI_ADA_002: {
    model: 'text-embedding-ada-002',
    dimensions: 1536,
    maxInputLength: 8192,
  },
} as const;

export const DEFAULT_EMBEDDING_MODEL = EMBEDDING_MODELS.GEMINI_EMBEDDING;

// ============================================================================
// Namespace Strategy
// ============================================================================

/**
 * Namespaces organize vectors by type and user
 *
 * Format: {userId}__{domain}
 * Example: "user-123__sessions"
 *
 * Benefits:
 * - Query by user + domain (faster, isolated)
 * - Query across all users in domain (for analytics)
 * - Easy cleanup per user
 */
export const NAMESPACE_PATTERNS = {
  // Per-user namespaces
  USER_SESSIONS: (userId: string) => `${userId}__sessions`,
  USER_REFLECTIONS: (userId: string) => `${userId}__reflections`,
  USER_PATTERNS: (userId: string) => `${userId}__patterns`,
  USER_COACH_MEMORY: (userId: string) => `${userId}__coach_memory`,
  USER_MILESTONES: (userId: string) => `${userId}__milestones`,

  // Global namespaces (for admin/analytics)
  GLOBAL_PATTERNS: 'global__patterns',
  GLOBAL_COACH_INSIGHTS: 'global__coach_insights',
} as const;

/**
 * Get namespace for a specific query type
 */
export function getNamespaceForQueryType(
  queryType: string,
  userId: string
): string {
  const namespaceMap: Record<string, (userId: string) => string> = {
    FETCH_RELEVANT_SESSION_HISTORY: NAMESPACE_PATTERNS.USER_SESSIONS,
    FETCH_RELEVANT_USER_PATTERNS: NAMESPACE_PATTERNS.USER_PATTERNS,
    FETCH_COACH_MEMORY_CONTEXT: NAMESPACE_PATTERNS.USER_COACH_MEMORY,
    FETCH_RECENT_REFLECTION_CONTEXT: NAMESPACE_PATTERNS.USER_REFLECTIONS,
    SEMANTIC_SEARCH_REFLECTIONS: NAMESPACE_PATTERNS.USER_REFLECTIONS,
  };

  const pattern = namespaceMap[queryType];
  return pattern ? pattern(userId) : `${userId}__general`;
}

// ============================================================================
// Metadata Strategy
// ============================================================================

/**
 * Metadata fields stored with each vector
 * Keep small - Pinecone charges by storage
 */
export const ALLOWED_METADATA_FIELDS = {
  // Required fields
  REQUIRED: ['userId', 'type', 'timestamp', 'contentHash'],

  // Optional session fields
  SESSION_FIELDS: [
    'duration',
    'quality',
    'completed',
    'focusTopic',
    'timeOfDay',
    'dayOfWeek',
    'streakDay',
    'difficulty',
  ],

  // Optional reflection fields
  REFLECTION_FIELDS: [
    'tags',
    'emotionalTone',
    'sessionId',
    'wordCount',
  ],

  // Optional pattern fields
  PATTERN_FIELDS: [
    'patternType',
    'confidence',
    'evidenceCount',
    'formedAt',
    'lastObserved',
  ],

  // Optional coach memory fields
  COACH_MEMORY_FIELDS: [
    'interactionType',
    'coachCategory',
    'userResponse',
    'effectivenessScore',
  ],

  // Optional milestone fields
  MILESTONE_FIELDS: [
    'milestoneType',
    'milestoneValue',
    'xpReward',
  ],
} as const;

/**
 * Maximum metadata size (in bytes)
 * Pinecone recommends keeping metadata small
 */
export const MAX_METADATA_SIZE_BYTES = 1024; // 1KB

/**
 * Content hashing strategy
 * Store hash of content, not full content
 */
export function generateContentHash(content: string): string {
  // Simple hash for demo - use proper hashing in production
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// ============================================================================
// Retention & Memory Management
// ============================================================================

/**
 * Memory retention policies by type
 * Older memories are consolidated or archived
 */
export const MEMORY_RETENTION_POLICIES = {
  SESSIONS: {
    maxAgeDays: 90,
    maxItems: 100,
    consolidationEnabled: true,
    consolidationAfterDays: 30,
  },
  REFLECTIONS: {
    maxAgeDays: 180,
    maxItems: 50,
    consolidationEnabled: true,
    consolidationAfterDays: 60,
  },
  PATTERNS: {
    maxAgeDays: 365,
    maxItems: 20,
    consolidationEnabled: false, // Patterns are already consolidated
    consolidationAfterDays: null,
  },
  COACH_MEMORY: {
    maxAgeDays: 30,
    maxItems: 50,
    consolidationEnabled: true,
    consolidationAfterDays: 14,
  },
  MILESTONES: {
    maxAgeDays: 730, // 2 years
    maxItems: 100,
    consolidationEnabled: false, // Keep all milestones
    consolidationAfterDays: null,
  },
} as const;

/**
 * Consolidation rules
 * When old memories are merged into patterns
 */
export const CONSOLIDATION_RULES = {
  // Minimum memories to form a pattern
  MIN_MEMORIES_FOR_PATTERN: 3,

  // Minimum confidence to keep a pattern
  MIN_PATTERN_CONFIDENCE: 0.7,

  // Time window for pattern detection
  PATTERN_DETECTION_WINDOW_DAYS: 14,

  // What to consolidate
  CONSOLIDATABLE_TYPES: ['sessions', 'reflections', 'coach_interactions'],

  // What NOT to consolidate (keep individual)
  NON_CONSOLIDATABLE_TYPES: ['milestones', 'achievements'],
} as const;

// ============================================================================
// Query Configuration
// ============================================================================

/**
 * Default query parameters by use case
 */
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

// ============================================================================
// Timeout and Retry Configuration
// ============================================================================

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

// ============================================================================
// Cache Configuration
// ============================================================================

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

// ============================================================================
// Fallback Data
// ============================================================================

/**
 * Fallback content when Pinecone is unavailable
 * These provide basic context without vector search
 */
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

/**
 * Client-side fallback (used when backend retrieval fails)
 */
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

// ============================================================================
// Privacy & Security Rules
// ============================================================================

/**
 * Fields that must NEVER be stored in Pinecone metadata
 * Store in Supabase instead, reference by ID
 */
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

/**
 * Sanitization rules for content before embedding
 */
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

// ============================================================================
// Performance Limits
// ============================================================================

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

// ============================================================================
// Feature Flags
// ============================================================================

export const RETRIEVAL_FEATURE_FLAGS = {
  PINECONE_ENABLED: 'pinecone_enabled',
  PINECONE_CACHE_ENABLED: 'pinecone_cache_enabled',
  MEMORY_CONSOLIDATION_ENABLED: 'memory_consolidation_enabled',
  SEMANTIC_SEARCH_ENABLED: 'semantic_search_enabled',
} as const;

// ============================================================================
// Relevance Score Thresholds
// ============================================================================

export const RELEVANCE_THRESHOLDS = {
  EXCELLENT: 0.85,
  GOOD: 0.7,
  MODERATE: 0.55,
  POOR: 0.4,
} as const;

/**
 * Interpret relevance score for user-facing features
 */
export function interpretRelevanceScore(score: number): string {
  if (score >= RELEVANCE_THRESHOLDS.EXCELLENT) {return 'highly_relevant';}
  if (score >= RELEVANCE_THRESHOLDS.GOOD) {return 'relevant';}
  if (score >= RELEVANCE_THRESHOLDS.MODERATE) {return 'somewhat_relevant';}
  return 'low_relevance';
}
