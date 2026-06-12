export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeoutMs: number;
  halfOpenMaxCalls: number;
  onStateChange?: (state: CircuitState) => void;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private halfOpenCalls = 0;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeoutMs: 30000,
      halfOpenMaxCalls: 3,
      ...config,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('half-open');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    if (
      this.state === 'half-open' &&
      this.halfOpenCalls >= this.config.halfOpenMaxCalls
    ) {
      throw new Error('Circuit breaker half-open call limit reached');
    }
    if (this.state === 'half-open') {
      this.halfOpenCalls++;
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenMaxCalls) {
        this.transitionTo('closed');
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo('open');
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return true;
    }
    return Date.now() - this.lastFailureTime >= this.config.recoveryTimeoutMs;
  }

  private transitionTo(state: CircuitState): void {
    this.state = state;
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    this.config.onStateChange?.(state);
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): {
    failureCount: number;
    successCount: number;
    state: CircuitState;
  } {
    return {
      failureCount: this.failureCount,
      successCount: this.successCount,
      state: this.state,
    };
  }
}
