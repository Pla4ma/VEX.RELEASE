/**
 * Pinecone Query Request (backend-only)
 */
export interface PineconeQueryRequest {
    namespace: string;
    vector: number[];
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
    content?: string;
    tags?: string[];
    quality?: number;
    duration?: number;
    category?: string;
}

export interface RetrievalError {
    code: RetrievalErrorCode;
    message: string;
    retryable: boolean;
    originalError?: unknown;
    context?: Record<string, unknown>;
}

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

export type RetrievalQueryType = z.infer<typeof RetrievalQueryTypeSchema>;
export type RetrievalBaseRequest = z.infer<typeof RetrievalBaseRequestSchema>;
export type RetrievalBaseResponse = z.infer<typeof RetrievalBaseResponseSchema>;
export type FetchRelevantSessionHistoryRequest = z.infer<typeof FetchRelevantSessionHistoryRequestSchema>;
export type FetchRelevantSessionHistoryResponse = z.infer<typeof FetchRelevantSessionHistoryResponseSchema>;
export type FetchRelevantUserPatternsRequest = z.infer<typeof FetchRelevantUserPatternsRequestSchema>;
export type FetchRelevantUserPatternsResponse = z.infer<typeof FetchRelevantUserPatternsResponseSchema>;
export type FetchCoachMemoryContextRequest = z.infer<typeof FetchCoachMemoryContextRequestSchema>;
export type FetchCoachMemoryContextResponse = z.infer<typeof FetchCoachMemoryContextResponseSchema>;
export type FetchRecentReflectionContextRequest = z.infer<typeof FetchRecentReflectionContextRequestSchema>;
export type FetchRecentReflectionContextResponse = z.infer<typeof FetchRecentReflectionContextResponseSchema>;
export type SemanticSearchReflectionsRequest = z.infer<typeof SemanticSearchReflectionsRequestSchema>;
export type SemanticSearchReflectionsResponse = z.infer<typeof SemanticSearchReflectionsResponseSchema>;
export type RetrievalRequest = z.infer<typeof RetrievalRequestSchema>;
export type RetrievalResponse = z.infer<typeof RetrievalResponseSchema>;
export type RetrievalErrorCode = z.infer<typeof RetrievalErrorCodeSchema>;
