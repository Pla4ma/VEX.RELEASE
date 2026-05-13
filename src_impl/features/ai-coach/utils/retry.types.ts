/**
 * Retry Utilities - Production-grade retry logic
 *
 * Exponential backoff, jitter, circuit breaker pattern
 */
export interface RetryConfig {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    jitterFactor: number;
    retryableErrors: string[];
    onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeoutMs: number;
    halfOpenMaxCalls: number;
}
