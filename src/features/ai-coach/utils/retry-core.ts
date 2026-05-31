export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryableErrors: string[];
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  jitterFactor: 0.3,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE',
    'CONNECTION_RESET',
  ],
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

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context: string = 'unknown',
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (!isRetryableError(lastError, fullConfig)) {
        throw new NonRetryableError(
          `${context}: Non-retryable error - ${lastError.message}`,
          extractErrorCode(lastError),
        );
      }
      if (attempt === fullConfig.maxAttempts) {
        throw new RetryableError(
          `${context}: Max retries (${fullConfig.maxAttempts}) exceeded - ${lastError.message}`,
          extractErrorCode(lastError),
          false,
        );
      }
      const delayMs = calculateDelay(attempt, fullConfig);
      fullConfig.onRetry?.(attempt, lastError, delayMs);
      await sleep(delayMs);
    }
  }
  throw lastError;
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay =
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  const jitter = cappedDelay * config.jitterFactor * (Math.random() - 0.5);
  return Math.max(0, cappedDelay + jitter);
}

function isRetryableError(error: Error, config: RetryConfig): boolean {
  const errorCode = extractErrorCode(error);
  if (config.retryableErrors.includes(errorCode)) {
    return true;
  }
  if (error instanceof RetryableError) {
    return error.retryable;
  }
  if (error instanceof NonRetryableError) {
    return false;
  }
  if (
    error.message.includes('network') ||
    error.message.includes('timeout') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('ECONNRESET') ||
    error.message.includes('ECONNREFUSED')
  ) {
    return true;
  }
  return false;
}

function extractErrorCode(error: Error): string {
  if ('code' in error && typeof error.code === 'string') {
    return error.code;
  }
  const codeMatch = error.message.match(/\[([A-Z_]+)\]/);
  if (codeMatch && codeMatch[1]) {
    return codeMatch[1];
  }
  return 'UNKNOWN_ERROR';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
