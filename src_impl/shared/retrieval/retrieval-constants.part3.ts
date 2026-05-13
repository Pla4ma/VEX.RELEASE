

export const RETRIEVAL_FEATURE_FLAGS = {
  PINECONE_ENABLED: 'pinecone_enabled',
  PINECONE_CACHE_ENABLED: 'pinecone_cache_enabled',
  MEMORY_CONSOLIDATION_ENABLED: 'memory_consolidation_enabled',
  SEMANTIC_SEARCH_ENABLED: 'semantic_search_enabled',
} as const;

export const RELEVANCE_THRESHOLDS = {
  EXCELLENT: 0.85,
  GOOD: 0.7,
  MODERATE: 0.55,
  POOR: 0.4,
} as const;

export function interpretRelevanceScore(score: number): string {
  if (score >= RELEVANCE_THRESHOLDS.EXCELLENT) {return 'highly_relevant';}
  if (score >= RELEVANCE_THRESHOLDS.GOOD) {return 'relevant';}
  if (score >= RELEVANCE_THRESHOLDS.MODERATE) {return 'somewhat_relevant';}
  return 'low_relevance';
}