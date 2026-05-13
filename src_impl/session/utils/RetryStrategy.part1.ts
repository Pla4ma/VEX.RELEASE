import { createDebugger } from "../../utils/debug";


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

export class RetryStrategy {
  private config: RetryConfig;
  private circuitBreaker: Map<string, CircuitBreakerState> = new Map();

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Execute operation with retry logic
   */
  async execute<T>(
    operation: (context: RetryContext) => Promise<T>,
    operationName: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.config, ...customConfig };
    const circuitKey = operationName;

    // Check circuit breaker
    if (this.isCircuitOpen(circuitKey)) {
      throw new Error(`Circuit breaker open for: ${operationName}`);
    }

    const context: RetryContext = {
      attempt: 1,
      startTime: Date.now(),
      accumulatedDelay: 0,
    };

    while (context.attempt <= config.maxAttempts) {
      try {
        debug.debug('Attempting %s (attempt %d/%d)',
          operationName, context.attempt, config.maxAttempts);

        const result = await operation(context);

        // Success - reset circuit breaker
        this.recordSuccess(circuitKey);

        debug.info('%s succeeded on attempt %d', operationName, context.attempt);
        return result;

      } catch (error) {
        context.lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        if (!this.isRetryableError(context.lastError, config)) {
          debug.error('%s failed with non-retryable error', context.lastError || new Error('Unknown error'));
          throw context.lastError;
        }

        // Record failure for circuit breaker
        this.recordFailure(circuitKey);

        // Check if we've exhausted attempts
        if (context.attempt >= config.maxAttempts) {
          debug.error('%s failed after %d attempts', new Error(`${operationName} exhausted retries`), config.maxAttempts);
          throw new AggregateError(
            [context.lastError],
            `${operationName} failed after ${config.maxAttempts} attempts`
          );
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(context.attempt, config);
        context.accumulatedDelay += delay;

        debug.warn('%s failed (attempt %d), retrying in %dms: %s',
          operationName, context.attempt, delay, context.lastError.message);

        // Wait before retry
        await this.sleep(delay);

        context.attempt++;
      }
    }

    // Should never reach here
    throw new Error('Retry logic exhausted without resolution');
  }

  /**
   * Execute with fallback
   */
  async executeWithFallback<T>(
    operation: (context: RetryContext) => Promise<T>,
    fallback: () => Promise<T>,
    operationName: string,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    try {
      return await this.execute(operation, operationName, config);
    } catch (error) {
      debug.warn('%s failed, executing fallback', operationName);
      return fallback();
    }
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    // Exponential backoff: baseDelay * multiplier^(attempt-1)
    const exponentialDelay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);

    // Cap at max delay
    const cappedDelay = Math.min(exponentialDelay, config.maxDelay);

    // Add jitter: ±jitterFactor%
    const jitter = cappedDelay * config.jitterFactor * (Math.random() * 2 - 1);

    return Math.floor(cappedDelay + jitter);
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error, config: RetryConfig): boolean {
    // Check by error code/type
    for (const errorType of config.retryableErrors) {
      if (error.message.includes(errorType)) {
        return true;
      }
    }

    // Check by error name
    const retryableNames = ['NetworkError', 'TimeoutError', 'StorageError', 'SyncError'];
    if (retryableNames.some(name => error.name === name || error.name.includes(name))) {
      return true;
    }

    return false;
  }

  /**
   * Circuit breaker logic
   */
  private isCircuitOpen(key: string): boolean {
    const state = this.circuitBreaker.get(key);
    if (!state) {return false;}

    if (state.state === 'OPEN') {
      // Check if we should transition to half-open
      if (Date.now() >= state.nextAttempt) {
        state.state = 'HALF_OPEN';
        debug.info('Circuit breaker half-open for: %s', key);
        return false;
      }
      return true;
    }

    return false;
  }

  private recordSuccess(key: string): void {
    const state = this.circuitBreaker.get(key);
    if (state) {
      if (state.state === 'HALF_OPEN') {
        // Success in half-open state - close the circuit
        this.circuitBreaker.delete(key);
        debug.info('Circuit breaker closed for: %s', key);
      } else {
        // Reset failure count
        state.failures = 0;
      }
    }
  }

  private recordFailure(key: string): void {
    const state = this.circuitBreaker.get(key) || {
      state: 'CLOSED' as CircuitState,
      failures: 0,
      lastFailure: 0,
      nextAttempt: 0,
    };

    state.failures++;
    state.lastFailure = Date.now();

    if (state.failures >= this.config.circuitBreakerThreshold) {
      state.state = 'OPEN';
      state.nextAttempt = Date.now() + this.config.circuitBreakerResetTime;
      debug.error('Circuit breaker opened for: %s (reset in %dms)',
        new Error(`Circuit breaker: ${key}`), this.config.circuitBreakerResetTime);
    }

    this.circuitBreaker.set(key, state);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker status
   */
  getCircuitStatus(key?: string): Map<string, CircuitBreakerState> | CircuitBreakerState | null {
    if (key) {
      return this.circuitBreaker.get(key) || null;
    }
    return new Map(this.circuitBreaker);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuit(key?: string): void {
    if (key) {
      this.circuitBreaker.delete(key);
    } else {
      this.circuitBreaker.clear();
    }
  }
}