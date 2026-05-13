

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitterFactor: 0.3,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'CONNECTION_RESET'],
};

export class RetryableError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = true,
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}

export class NonRetryableError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

export async function withRetry<T>(operation: () => Promise<T>, config: Partial<RetryConfig> = {}, context: string = 'unknown'): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (!isRetryableError(lastError, fullConfig)) {
        throw new NonRetryableError(`${context}: Non-retryable error - ${lastError.message}`, extractErrorCode(lastError));
      }

      // Don't retry on last attempt
      if (attempt === fullConfig.maxAttempts) {
        throw new RetryableError(`${context}: Max retries (${fullConfig.maxAttempts}) exceeded - ${lastError.message}`, extractErrorCode(lastError), false);
      }

      // Calculate delay with exponential backoff and jitter
      const delayMs = calculateDelay(attempt, fullConfig);

      // Notify retry attempt
      fullConfig.onRetry?.(attempt, lastError, delayMs);

      // Wait before retry
      await sleep(delayMs);
    }
  }

  // Should never reach here
  throw lastError;
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 30000, // 30 seconds
  halfOpenMaxCalls: 3,
};

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private halfOpenSuccesses = 0;

  constructor(
    private config: CircuitBreakerConfig = DEFAULT_CIRCUIT_BREAKER_CONFIG,
    private name: string,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('HALF_OPEN');
      } else {
        throw new CircuitBreakerOpenError(`Circuit breaker '${this.name}' is OPEN - too many failures`, this.getTimeUntilReset());
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.halfOpenSuccesses++;
      if (this.halfOpenSuccesses >= this.config.halfOpenMaxCalls) {
        this.transitionTo('CLOSED');
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN');
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo('OPEN');
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return true;
    }
    return Date.now() - this.lastFailureTime >= this.config.resetTimeoutMs;
  }

  private getTimeUntilReset(): number {
    if (!this.lastFailureTime) {
      return 0;
    }
    const timeElapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.config.resetTimeoutMs - timeElapsed);
  }

  private transitionTo(newState: CircuitState): void {
    this.state = newState;
    if (newState === 'CLOSED') {
      this.failureCount = 0;
      this.halfOpenSuccesses = 0;
    } else if (newState === 'HALF_OPEN') {
      this.halfOpenSuccesses = 0;
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(
    message: string,
    public timeUntilResetMs: number,
  ) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}