export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
  onRetry?: (attempt: number, error: Error) => void;
  onExhausted?: (error: Error) => void;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    'network_error',
    'timeout',
    'rate_limited',
    'temporarily_unavailable',
  ],
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isRetryable = fullConfig.retryableErrors.some((errType) =>
        lastError!.message.toLowerCase().includes(errType),
      );
      if (!isRetryable || attempt === fullConfig.maxAttempts) {
        break;
      }
      const delay = Math.min(
        fullConfig.baseDelayMs *
          Math.pow(fullConfig.backoffMultiplier, attempt - 1),
        fullConfig.maxDelayMs,
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
