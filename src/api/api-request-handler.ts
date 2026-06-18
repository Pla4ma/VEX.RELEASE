import { Platform } from 'react-native';
import { CURRENT_CONFIG } from '../constants/app';
import { createDebugger } from '../utils/debug';
import { CircuitBreaker } from './circuit-breaker';
import { RequestDeduplicator } from './deduplicator';
import { calculateBackoff, isRetryableError, isRetryableErrorCode } from './retry';
import type { ApiConfig, ApiRequestConfig, ApiResponse, ApiError } from './client-types';

const debug = createDebugger('api');

export interface RequestExecutorDeps {
  config: ApiConfig;
  circuitBreaker: CircuitBreaker;
  deduplicator: RequestDeduplicator;
  runResponseInterceptors: (response: Response) => Promise<Response>;
}

export function buildURL(
  baseURL: string,
  endpoint: string,
  params?: Record<string, string | number | boolean>,
): string {
  // Reject path traversal attempts
  if (
    !endpoint.startsWith('/') ||
    endpoint.includes('..') ||
    endpoint.includes('//')
  ) {
    throw new Error(`Invalid endpoint path: ${endpoint}`);
  }
  const url = new URL(endpoint, baseURL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

export function createError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): ApiError {
  return { code, message, status, details, retryable: isRetryableErrorCode(code) };
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export async function parseErrorResponse(
  response: Response,
): Promise<Partial<ApiError>> {
  try {
    return JSON.parse(await response.text());
  } catch (error: unknown) {
    return {};
  }
}

export function parseHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => { result[key] = value; });
  return result;
}

export async function executeRequest<T>(
  deps: RequestExecutorDeps,
  endpoint: string,
  config: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  if (!deps.circuitBreaker.canExecute()) {
    throw createError('CIRCUIT_OPEN', 'Service temporarily unavailable', 503);
  }
  const url = buildURL(deps.config.baseURL, endpoint, config.params);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? deps.config.timeout);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Platform': Platform.OS,
      'X-App-Version': CURRENT_CONFIG.version,
      ...config.headers,
    };
    const fetchConfig: RequestInit = {
      method: config.method ?? 'GET',
      headers,
      signal: controller.signal,
    };
    if (config.data && config.method !== 'GET') {
      fetchConfig.body = JSON.stringify(config.data);
    }
    debug.debug('API Request: %s %s', fetchConfig.method, url);
    let response = await fetch(url, fetchConfig); // ponytail: canonical API client - internal fetch
    response = await deps.runResponseInterceptors(response);

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      throw createError(
        errorData.code ?? 'HTTP_ERROR',
        errorData.message ?? response.statusText,
        response.status,
        errorData.details,
      );
    }
    const data = await response.json();
    if (config.schema) {
      try {
        config.schema.parse(data);
      } catch (error) {
        throw createError('VALIDATION_ERROR', 'Response validation failed', response.status, { validationError: error });
      }
    }
    deps.circuitBreaker.recordSuccess();
    const result: ApiResponse<T> = { data, status: response.status, headers: parseHeaders(response.headers) };
    debug.debug('API Response: %s %d', url, response.status);
    return result;
  } catch (error) {
    deps.circuitBreaker.recordFailure();
    if (error instanceof Error && error.name === 'AbortError') {
      throw createError('TIMEOUT', 'Request timeout', 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function executeWithRetry<T>(
  deps: RequestExecutorDeps,
  endpoint: string,
  config: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  const maxRetries = config.retries ?? deps.config.retries;
  let lastError: Error = new Error('Unknown error');
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await executeRequest<T>(deps, endpoint, config);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxRetries) {break;}
      const apiError = isApiError(lastError)
        ? lastError
        : createError('UNKNOWN', lastError.message, 0);
      if (!isRetryableError(apiError)) {break;}
      const delay = calculateBackoff(attempt, deps.config.retryDelay);
      debug.debug('Retrying request in %dms (attempt %d/%d)', delay, attempt + 1, maxRetries + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function executeWithDeduplication<T>(
  deps: RequestExecutorDeps,
  endpoint: string,
  config: ApiRequestConfig,
): Promise<ApiResponse<T>> {
  if (!config.deduplicate) {
    return executeWithRetry<T>(deps, endpoint, config);
  }
  const key = `${config.method ?? 'GET'}:${endpoint}:${JSON.stringify(config.params ?? {})}:${JSON.stringify(config.data ?? {})}`;
  return deps.deduplicator.deduplicate(key, () => executeWithRetry<T>(deps, endpoint, config));
}
