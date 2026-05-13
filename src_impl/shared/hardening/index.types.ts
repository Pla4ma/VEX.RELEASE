export interface RetryConfig {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableErrors: string[];
    onRetry?: (attempt: number, error: Error) => void;
    onExhausted?: (error: Error) => void;
}

export interface CircuitBreakerConfig {
    failureThreshold: number;
    recoveryTimeoutMs: number;
    halfOpenMaxCalls: number;
    onStateChange?: (state: CircuitState) => void;
}

export interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

export interface HealthCheck {
    name: string;
    check: () => Promise<boolean>;
    critical: boolean;
}

export type CircuitState = 'closed' | 'open' | 'half-open';
