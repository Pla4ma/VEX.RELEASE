export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryableErrors: string[];
  circuitBreakerThreshold: number;
  circuitBreakerResetTime: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.3,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'STORAGE_UNAVAILABLE',
    'SYNC_CONFLICT',
    'RATE_LIMIT',
  ],
  circuitBreakerThreshold: 5,
  circuitBreakerResetTime: 60000,
};

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailure: number;
  nextAttempt: number;
}

export interface RetryContext {
  attempt: number;
  startTime: number;
  lastError?: Error;
  accumulatedDelay: number;
}
