export interface RetryConfig {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
}

export interface VersionedEntity {
    id: string;
    version: number;
    updatedAt: number;
}

export interface BatchResult<TItem, TResult = TItem> {
    successful: TResult[];
    failed: Array<{ item: TItem; error: RepositoryError }>;
}

export type ConnectionState = 'online' | 'offline' | 'unknown';

export enum RepositoryErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    AUTH_ERROR = 'AUTH_ERROR',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    RATE_LIMIT = 'RATE_LIMIT',
    SERVER_ERROR = 'SERVER_ERROR',
    UNKNOWN = 'UNKNOWN'
}
