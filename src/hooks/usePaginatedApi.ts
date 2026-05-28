import { useState, useCallback, useEffect } from "react";
import { useApi, type UseApiOptions, type UseApiReturn } from "./useApiCore";

export interface UsePaginatedApiReturn<T> extends UseApiReturn<T[]> {
  page: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  resetPagination: () => void;
}

export function usePaginatedApi<T = unknown>(
  endpoint: string,
  options?: Omit<UseApiOptions<T[]>, "endpoint"> & { pageSize?: number },
): UsePaginatedApiReturn<T> {
  const pageSize = options?.pageSize ?? 20;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { data, loading, error, retryCount, execute, retry, cancel, reset } =
    useApi<T[]>({ ...options, endpoint, immediate: false });

  const loadPage = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        const result = await execute({
          params: { page: pageNum, limit: pageSize },
        });
        setHasMore(result.length === pageSize);
        if (append && data) {
          return [...data, ...result] as T[];
        }
        return result;
      } catch (error) {
        throw error;
      }
    },
    [execute, pageSize, data],
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      return;
    }
    const nextPage = page + 1;
    await loadPage(nextPage, true);
    setPage(nextPage);
  }, [loadPage, page, loading, hasMore]);

  const resetPagination = useCallback(() => {
    setPage(1);
    setHasMore(true);
    reset();
  }, [reset]);

  useEffect(() => {
    if (options?.immediate) {
      loadPage(1);
    }
  }, [options?.immediate, loadPage]);

  return {
    data: data ?? [],
    loading,
    error,
    retryCount,
    page,
    hasMore,
    execute,
    retry,
    cancel,
    reset: resetPagination,
    loadMore,
  } as UsePaginatedApiReturn<T>;
}
