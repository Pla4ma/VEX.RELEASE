import { useState, useCallback, useRef, useEffect } from 'react';
import { getApiClient } from '../api/api-client';
import type { ApiRequestConfig, ApiError } from '../api/client-types';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('hooks:api');

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  retryCount: number;
}

export interface UseApiReturn<T> extends ApiState<T> {
  execute: (config?: Partial<ApiRequestConfig>) => Promise<T>;
  refetch: () => Promise<T>;
  retry: () => Promise<T>;
  cancel: () => void;
  reset: () => void;
}

export interface UseApiOptions<T> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  immediate?: boolean;
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  transform?: (data: unknown) => T;
  cacheTime?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function generateCacheKey(endpoint: string, config?: ApiRequestConfig): string {
  return `${config?.method ?? 'GET'}:${endpoint}:${JSON.stringify(config?.params)}`;
}

function isCacheValid<T>(entry: CacheEntry<T>, cacheTime: number): boolean {
  return Date.now() - entry.timestamp < cacheTime;
}

export function useApi<T = unknown>(
  options: UseApiOptions<T>,
): UseApiReturn<T> {
  const {
    endpoint,
    method = 'GET',
    immediate = false,
    initialData = null,
    onSuccess,
    onError,
    transform,
    cacheTime = 0,
  } = options;
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: immediate,
    error: null,
    retryCount: 0,
  });
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const lastConfigRef = useRef<ApiRequestConfig | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (overrideConfig?: Partial<ApiRequestConfig>): Promise<T> => {
      const api = getApiClient();
      const cacheKey = generateCacheKey(
        endpoint,
        overrideConfig as ApiRequestConfig,
      );
      if (cacheTime > 0 && method === 'GET') {
        const cached = cache.get(cacheKey) as CacheEntry<T> | undefined;
        if (cached && isCacheValid(cached, cacheTime)) {
          debug.debug('Using cached data for %s', endpoint);
          if (isMountedRef.current) {
            setState((prev) => ({
              ...prev,
              data: cached.data,
              loading: false,
              error: null,
            }));
          }
          return cached.data;
        }
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      }
      lastConfigRef.current = overrideConfig as ApiRequestConfig;
      try {
        debug.debug('Executing request: %s %s', method, endpoint);
        const response = await api.request<T>(endpoint, {
          method,
          ...overrideConfig,
        } as ApiRequestConfig);
        let data = response.data;
        if (transform) {
          data = transform(data);
        }
        if (cacheTime > 0) {
          cache.set(cacheKey, { data, timestamp: Date.now() });
        }
        if (isMountedRef.current) {
          setState({ data, loading: false, error: null, retryCount: 0 });
        }
        onSuccess?.(data);
        debug.info('Request successful: %s', endpoint);
        return data;
      } catch (error) {
        const apiError = error as ApiError;
        debug.error('Request failed: ' + endpoint, new Error(apiError.message));
        if (isMountedRef.current) {
          setState((prev) => ({ ...prev, loading: false, error: apiError }));
        }
        onError?.(apiError);
        throw apiError;
      }
    },
    [endpoint, method, cacheTime, transform, onSuccess, onError],
  );

  const refetch = useCallback(async (): Promise<T> => {
    return execute(lastConfigRef.current ?? undefined);
  }, [execute]);

  const retry = useCallback(async (): Promise<T> => {
    if (isMountedRef.current) {
      setState((prev) => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        loading: true,
        error: null,
      }));
    }
    try {
      const result = await execute(lastConfigRef.current ?? undefined);
      return result;
    } catch (error) {
      throw error;
    }
  }, [execute]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (isMountedRef.current) {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({ data: initialData, loading: false, error: null, retryCount: 0 });
  }, [cancel, initialData]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { ...state, execute, refetch, retry, cancel, reset };
}
