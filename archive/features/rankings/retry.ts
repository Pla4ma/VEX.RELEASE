/**
 * Rankings Operations Retry Logic
 *
 * Handles transient failures during leaderboard operations.
 */

import { RetryableOperation, type RetryConfig, CircuitBreaker, OfflineQueue } from '../squads/retry';
import { type RankingErrorCode } from './schemas';

export const RANKINGS_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMITED'],
};

export function withRankingsRetry<T>(
  operation: () => Promise<T>,
  context: string,
  config?: Partial<RetryConfig>
): Promise<T> {
  const mergedConfig = { ...RANKINGS_RETRY_CONFIG, ...config };
  return new RetryableOperation(operation, mergedConfig, context).execute();
}

export const rankingsCircuitBreaker = new CircuitBreaker(5, 30000);
export const rankingsOfflineQueue = new OfflineQueue();
