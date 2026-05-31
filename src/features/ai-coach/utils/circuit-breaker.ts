export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxCalls: number;
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeoutMs: 30000,
  halfOpenMaxCalls: 3,
};

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

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
        throw new CircuitBreakerOpenError(
          `Circuit breaker '${this.name}' is OPEN - too many failures`,
          this.getTimeUntilReset(),
        );
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
