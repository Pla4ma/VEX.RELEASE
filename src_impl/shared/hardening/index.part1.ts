import { captureSilentFailure } from "../../utils/silent-failure";
import * as Sentry from "@sentry/react-native";


export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const isRetryable = fullConfig.retryableErrors.some((errType) =>
        lastError!.message.toLowerCase().includes(errType)
      );

      if (!isRetryable || attempt === fullConfig.maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff + jitter
      const delay = Math.min(
        fullConfig.baseDelayMs * Math.pow(fullConfig.backoffMultiplier, attempt - 1),
        fullConfig.maxDelayMs
      );
      const jitter = Math.random() * 1000;

      fullConfig.onRetry?.(attempt, lastError);

      await sleep(delay + jitter);
    }
  }

  const finalError = lastError ?? new Error('Unknown error');
  fullConfig.onExhausted?.(finalError);
  throw finalError;
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

    if (this.state === 'half-open' && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
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
    if (!this.lastFailureTime) {return true;}
    return Date.now() - this.lastFailureTime >= this.config.recoveryTimeoutMs;
  }

  private transitionTo(state: CircuitState): void {
    this.state = state;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    this.config.onStateChange?.(state);
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): { failureCount: number; successCount: number; state: CircuitState } {
    return {
      failureCount: this.failureCount,
      successCount: this.successCount,
      state: this.state,
    };
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}