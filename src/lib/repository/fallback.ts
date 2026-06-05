import { captureSilentFailure } from '../../utils/silent-failure';
import {
  withRetry,
  RepositoryError,
} from './base';

export class StreaksRepositoryError extends RepositoryError {
  public override readonly name = 'StreaksRepositoryError';
  constructor(operation: string, error: unknown, code?: import('./base').RepositoryErrorCode) {
    super(operation, error, code);
  }
}

export interface RepositoryResult<T> {
  data: T | null;
  error: StreaksRepositoryError | null;
  fromCache: boolean;
}

export async function executeWithFallback<T>(
  operation: string,
  onlineFn: () => Promise<T>,
  offlineFn?: () => Promise<T | null>,
): Promise<RepositoryResult<T>> {
  try {
    const data = await withRetry(operation, onlineFn);
    return { data, error: null, fromCache: false };
  } catch (error) {
    const repoError =
      error instanceof RepositoryError
        ? new StreaksRepositoryError(operation, error.originalError, error.code)
        : new StreaksRepositoryError(
            operation,
            error instanceof Error ? error : new Error(String(error)),
          );
    if (offlineFn) {
      try {
        const cached = await offlineFn();
        if (cached) {
          return { data: cached, error: repoError, fromCache: true };
        }
      } catch (fallbackError) {
        captureSilentFailure(fallbackError, {
          feature: 'streaks',
          operation: 'network-fallback',
          type: 'network',
        });
      }
    }
    return { data: null, error: repoError, fromCache: false };
  }
}
