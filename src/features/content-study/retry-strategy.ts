import type { ContentStudyError } from "./types";
import { CONTENT_STUDY_CONSTANTS, ContentStudyErrorCode } from "./types";
import { isRecoverableError } from "./validation";

export interface RetryStrategy {
  maxAttempts: number;
  backoffMs: number;
  maxBackoffMs: number;
  retryableCodes: ContentStudyErrorCode[];
  shouldRetry: (error: ContentStudyError, attempt: number) => boolean;
}

export const DefaultRetryStrategy: RetryStrategy = {
  maxAttempts: CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS,
  backoffMs: CONTENT_STUDY_CONSTANTS.RETRY_DELAY_MS,
  maxBackoffMs: 30000,
  retryableCodes: [
    ContentStudyErrorCode.NETWORK_ERROR,
    ContentStudyErrorCode.AI_TIMEOUT,
    ContentStudyErrorCode.STORAGE_ERROR,
    ContentStudyErrorCode.EXTRACTION_FAILED,
  ],
  shouldRetry: (error, attempt) => {
    if (attempt >= CONTENT_STUDY_CONSTANTS.MAX_RETRY_ATTEMPTS) {
      return false;
    }
    return isRecoverableError(error.code as ContentStudyErrorCode);
  },
};

export const ExponentialBackoffStrategy: RetryStrategy = {
  maxAttempts: 5,
  backoffMs: 1000,
  maxBackoffMs: 60000,
  retryableCodes: [
    ContentStudyErrorCode.NETWORK_ERROR,
    ContentStudyErrorCode.AI_RATE_LIMIT,
  ],
  shouldRetry: (error, attempt) => {
    if (attempt >= 5) {
      return false;
    }
    return (
      error.code === ContentStudyErrorCode.NETWORK_ERROR ||
      error.code === ContentStudyErrorCode.AI_RATE_LIMIT
    );
  },
};

export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  strategy: RetryStrategy = DefaultRetryStrategy,
  onRetry?: (attempt: number, delay: number, error: ContentStudyError) => void,
): Promise<T> {
  let lastError: ContentStudyError | undefined;
  for (let attempt = 0; attempt < strategy.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as ContentStudyError;
      if (!strategy.shouldRetry(lastError, attempt)) {
        throw lastError;
      }
      const delay = Math.min(
        strategy.backoffMs * Math.pow(2, attempt),
        strategy.maxBackoffMs,
      );
      if (onRetry) {
        onRetry(attempt + 1, delay, lastError);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError || new Error("Operation failed after max retries");
}
