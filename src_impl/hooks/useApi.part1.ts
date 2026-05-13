import { useState, useCallback, useRef, useEffect } from "react";
import { getApiClient, ApiRequestConfig, ApiResponse, ApiError } from "../api/client";
import { createDebugger } from "../utils/debug";


export function useApi<T = unknown>(options: UseApiOptions<T>): UseApiReturn<T> {
  const {
    endpoint,
    method = 'GET',
    immediate = false,
    initialData = null,
    onSuccess,
    onError,
    transform,
    cacheTime = 0, // 0 = no caching
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Execute API request
   */
  const execute = useCallback(async (
    overrideConfig?: Partial<ApiRequestConfig>
  ): Promise<T> => {
    const api = getApiClient();
    const cacheKey = generateCacheKey(endpoint, overrideConfig as ApiRequestConfig);

    // Check cache
    if (cacheTime > 0 && method === 'GET') {
      const cached = cache.get(cacheKey) as CacheEntry<T> | undefined;
      if (cached && isCacheValid(cached, cacheTime)) {
        debug.debug('Using cached data for %s', endpoint);
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            data: cached.data,
            loading: false,
            error: null,
          }));
        }
        return cached.data;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Set loading state
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
      }));
    }

    lastConfigRef.current = overrideConfig as ApiRequestConfig;

    try {
      debug.debug('Executing request: %s %s', method, endpoint);

      const response = await api.request<T>(endpoint, {
        method,
        ...overrideConfig,
      } as ApiRequestConfig);

      let data = response.data;

      // Apply transform if provided
      if (transform) {
        data = transform(data);
      }

      // Update cache
      if (cacheTime > 0) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }

      if (isMountedRef.current) {
        setState({
          data,
          loading: false,
          error: null,
          retryCount: 0,
        });
      }

      onSuccess?.(data);
      debug.info('Request successful: %s', endpoint);

      return data;
    } catch (error) {
      const apiError = error as ApiError;
      debug.error('Request failed: ' + endpoint, new Error(apiError.message));

      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError,
        }));
      }

      onError?.(apiError);
      throw apiError;
    }
  }, [endpoint, method, cacheTime, transform, onSuccess, onError]);

  /**
   * Refetch with same config
   */
  const refetch = useCallback(async (): Promise<T> => {
    return execute(lastConfigRef.current ?? undefined);
  }, [execute]);

  /**
   * Retry after error
   */
  const retry = useCallback(async (): Promise<T> => {
    if (isMountedRef.current) {
      setState(prev => ({
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

  /**
   * Cancel current request
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        loading: false,
      }));
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    cancel();
    setState({
      data: initialData,
      loading: false,
      error: null,
      retryCount: 0,
    });
  }, [cancel, initialData]);

  // Immediate execution
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refetch,
    retry,
    cancel,
    reset,
  };
}