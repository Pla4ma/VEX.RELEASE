/**
 * Retry Logic
 *
 * Exponential backoff retry logic for API requests.
 */

import type { ApiError } from './client-types';

export function calculateBackoff(attempt: number, baseDelay: number): number {
  const exponential = Math.pow(2, attempt) * baseDelay;
  const jitter = Math.random() * 1000;
  return Math.min(exponential + jitter, 30000);
}

export function isRetryableError(error: ApiError): boolean {
  return error.retryable && ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR'].includes(error.code);
}

export function isRetryableErrorCode(code: string): boolean {
  return ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR'].includes(code);
}
