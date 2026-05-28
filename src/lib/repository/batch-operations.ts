import { getSupabaseClient } from "../../config/supabase";
import {
  classifyError,
  RepositoryError,
  RepositoryErrorCode,
} from "./error-handling";
import { withRetry, type RetryConfig } from "./retry";

export interface VersionedEntity {
  id: string;
  version: number;
  updatedAt: number;
}

export async function withOptimisticLock<T extends VersionedEntity>(
  operation: string,
  fetchFn: () => Promise<T | null>,
  updateFn: (entity: T) => Promise<T>,
  expectedVersion: number,
): Promise<T> {
  return withRetry(operation, async () => {
    const entity = await fetchFn();
    if (!entity) {
      throw new RepositoryError(
        operation,
        { code: "PGRST116" },
        RepositoryErrorCode.NOT_FOUND,
      );
    }
    if (entity.version !== expectedVersion) {
      throw new RepositoryError(
        operation,
        { message: "Version conflict detected", code: "409" },
        RepositoryErrorCode.CONFLICT,
      );
    }
    return updateFn(entity);
  });
}

export interface BatchResult<TItem, TResult = TItem> {
  successful: TResult[];
  failed: Array<{ item: TItem; error: RepositoryError }>;
}

export async function batchWithRetry<T, R>(
  operation: string,
  items: T[],
  fn: (item: T) => Promise<R>,
  config: Partial<RetryConfig> & { continueOnError?: boolean } = {},
): Promise<BatchResult<T, R>> {
  const { continueOnError = true, ...retryConfig } = config;
  const result: BatchResult<T, R> = { successful: [], failed: [] };
  for (const item of items) {
    try {
      const res = await withRetry(`${operation}`, () => fn(item), retryConfig);
      result.successful.push(res);
    } catch (error) {
      const repoError =
        error instanceof RepositoryError
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
      fn: (
        client: typeof supabase,
      ) => Promise<{ data: T | null; error: Error | null }>,
    ): Promise<T> {
      return withRetry(operation, async () => {
        const { data, error } = await fn(supabase);
        if (error) {
          const code = classifyError(error);
          throw new RepositoryError(operation, error, code);
        }
        if (data === null) {
          throw new RepositoryError(
            operation,
            { code: "PGRST116" },
            RepositoryErrorCode.NOT_FOUND,
          );
        }
        return data;
      });
    },
    async queryNullable<T>(
      operation: string,
      fn: (
        client: typeof supabase,
      ) => Promise<{ data: T | null; error: Error | null }>,
    ): Promise<T | null> {
      return withRetry(operation, async () => {
        const { data, error } = await fn(supabase);
        if (error) {
          const code = classifyError(error);
          if (code === RepositoryErrorCode.NOT_FOUND) {
            return null;
          }
          throw new RepositoryError(operation, error, code);
        }
        return data;
      });
    },
  };
}
