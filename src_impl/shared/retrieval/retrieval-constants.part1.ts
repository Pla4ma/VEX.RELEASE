

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

export const MAX_METADATA_SIZE_BYTES = 1024;

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