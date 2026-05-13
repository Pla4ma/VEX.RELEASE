import { getSupabaseClient } from "../../config/supabase";


export class RepositoryError extends Error {
  public readonly code: RepositoryErrorCode;
  public readonly isRetryable: boolean;
  public readonly originalError: unknown;

  constructor(
    operation: string,
    error: unknown,
    code: RepositoryErrorCode = RepositoryErrorCode.UNKNOWN
  ) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    super(`[${operation}] ${message}`);
    this.name = 'RepositoryError';
    this.originalError = error;
    this.code = code;
    this.isRetryable = code === RepositoryErrorCode.NETWORK_ERROR ||
                       code === RepositoryErrorCode.RATE_LIMIT ||
                       code === RepositoryErrorCode.SERVER_ERROR;
  }
}

export async function withRetry<T>(
  operation: string,
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: RepositoryError | undefined;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const code = classifyError(error);
      lastError = new RepositoryError(operation, error, code);

      // Don't retry non-retryable errors
      if (!lastError.isRetryable) {
        throw lastError;
      }

      // Don't retry after last attempt
      if (attempt === retryConfig.maxAttempts) {
        break;
      }

      // Wait before retry
      const delay = calculateDelay(attempt, retryConfig);
      await sleep(delay);
    }
  }

  throw lastError;
}

export function getConnectionState(): ConnectionState {
  return currentConnectionState;
}

export function subscribeToConnectionChanges(callback: (state: ConnectionState) => void): () => void {
  connectionListeners.add(callback);
  return () => connectionListeners.delete(callback);
}

export function updateConnectionState(state: ConnectionState): void {
  if (currentConnectionState !== state) {
    currentConnectionState = state;
    connectionListeners.forEach(cb => cb(state));
  }
}

export async function withOptimisticLock<T extends VersionedEntity>(
  operation: string,
  fetchFn: () => Promise<T | null>,
  updateFn: (entity: T) => Promise<T>,
  expectedVersion: number
): Promise<T> {
  return withRetry(operation, async () => {
    const entity = await fetchFn();

    if (!entity) {
      throw new RepositoryError(operation, { code: 'PGRST116' }, RepositoryErrorCode.NOT_FOUND);
    }

    if (entity.version !== expectedVersion) {
      throw new RepositoryError(
        operation,
        { message: 'Version conflict detected', code: '409' },
        RepositoryErrorCode.CONFLICT
      );
    }

    return updateFn(entity);
  });
}

export async function batchWithRetry<T, R>(
  operation: string,
  items: T[],
  fn: (item: T) => Promise<R>,
  config: Partial<RetryConfig> & { continueOnError?: boolean } = {}
): Promise<BatchResult<T, R>> {
  const { continueOnError = true, ...retryConfig } = config;
  const result: BatchResult<T, R> = { successful: [], failed: [] };

  for (const item of items) {
    try {
      const res = await withRetry(`${operation}`, () => fn(item), retryConfig);
      result.successful.push(res);
    } catch (error) {
      const repoError = error instanceof RepositoryError
        ? error
        : new RepositoryError(operation, error);
      result.failed.push({ item, error: repoError });

      if (!continueOnError) {
        throw repoError;
      }
    }
  }

  return result;
}

export function createRetryableQuery() {
  const supabase = getSupabaseClient();

  return {
    async query<T>(
      operation: string,
      fn: (client: typeof supabase) => Promise<{ data: T | null; error: Error | null }>
    ): Promise<T> {
      return withRetry(operation, async () => {
        const { data, error } = await fn(supabase);

        if (error) {
          const code = classifyError(error);
          throw new RepositoryError(operation, error, code);
        }

        if (data === null) {
          throw new RepositoryError(operation, { code: 'PGRST116' }, RepositoryErrorCode.NOT_FOUND);
        }

        return data;
      });
    },

    async queryNullable<T>(
      operation: string,
      fn: (client: typeof supabase) => Promise<{ data: T | null; error: Error | null }>
    ): Promise<T | null> {
      return withRetry(operation, async () => {
        const { data, error } = await fn(supabase);

        if (error) {
          const code = classifyError(error);
          // Not found is OK for nullable queries
          if (code === RepositoryErrorCode.NOT_FOUND) {return null;}
          throw new RepositoryError(operation, error, code);
        }

        return data;
      });
    },
  };
}