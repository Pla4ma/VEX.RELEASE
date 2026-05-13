/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  // Exponential backoff: initialDelay * (multiplier ^ (attempt - 1))
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

  // Add jitter (random variance to prevent thundering herd)
  const jitter = cappedDelay * config.jitterFactor * (Math.random() - 0.5);

  return Math.max(0, cappedDelay + jitter);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: Error, config: RetryConfig): boolean {
  // Check error code
  const errorCode = extractErrorCode(error);
  if (config.retryableErrors.includes(errorCode)) {
    return true;
  }

  // Check specific error types
  if (error instanceof RetryableError) {
    return error.retryable;
  }

  if (error instanceof NonRetryableError) {
    return false;
  }

  // Network errors are generally retryable
  if (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('ETIMEDOUT') || error.message.includes('ECONNRESET') || error.message.includes('ECONNREFUSED')) {
    return true;
  }

  return false;
}

/**
 * Extract error code from error object
 */
function extractErrorCode(error: Error): string {
  // Check for custom error code property
  if ('code' in error && typeof error.code === 'string') {
    return error.code;
  }

  // Extract from message
  const codeMatch = error.message.match(/\[([A-Z_]+)\]/);
  if (codeMatch) {
    return codeMatch[1];
  }

  return 'UNKNOWN_ERROR';
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Circuit Breaker Pattern
// ============================================================================
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
// ============================================================================
// Rate Limiting
// ============================================================================
export * from "./retry.types";
export * from "./retry.part1";
export * from "./retry.part2";
