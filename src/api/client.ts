/**
 * API Client
 *
 * Production-grade HTTP client with:
 * - Request/response interceptors
 * - Exponential backoff retry
 * - Circuit breaker pattern
 * - Request deduplication
 * - Timeout handling
 * - Auth token refresh
 */

<<<<<<< HEAD
import { Platform } from 'react-native';
import { type ZodType } from 'zod';
=======
import { Platform } from "react-native";
import { type ZodType } from "zod";
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

import { CURRENT_CONFIG } from '../constants/app';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('api');

// ============================================================================
// Types
// ============================================================================

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  circuitBreakerThreshold: number;
  circuitBreakerResetTime: number;
}

export interface AuthProvider {
  getAccessToken(): Promise<string | null | undefined>;
  refreshToken(): Promise<boolean>;
  logout(): Promise<void>;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
  retries?: number;
  schema?: ZodType<unknown>;
  skipAuth?: boolean;
  deduplicate?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: unknown;
  retryable: boolean;
}

// ============================================================================
// Circuit Breaker
// ============================================================================

enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing recovery
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime: number | null = null;
  private nextAttempt: number = Date.now();

  constructor(
    private threshold = 5,
    private resetTimeout = 30000,
  ) {}

  canExecute(): boolean {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }
    if (this.state === CircuitState.OPEN) {
      if (Date.now() >= this.nextAttempt) {
        this.state = CircuitState.HALF_OPEN;
        return true;
      }
      return false;
    }
    return true; // HALF_OPEN
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = CircuitState.CLOSED;
    debug.debug('Circuit breaker closed');
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
      debug.debug('Circuit breaker opened, next attempt in %dms', this.resetTimeout);
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// ============================================================================
// Request Deduplication
// ============================================================================

class RequestDeduplicator {
  private pending = new Map<string, Promise<unknown>>();

  async deduplicate<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (this.pending.has(key)) {
      debug.debug('Deduplicating request: %s', key);
      return this.pending.get(key) as Promise<T>;
    }

    const promise = request().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

// ============================================================================
// Retry Logic
// ============================================================================

function calculateBackoff(attempt: number, baseDelay: number): number {
  // Exponential backoff with jitter
  const exponential = Math.pow(2, attempt) * baseDelay;
  const jitter = Math.random() * 1000;
  return Math.min(exponential + jitter, 30000); // Cap at 30s
}

function isRetryableError(error: ApiError): boolean {
  return error.retryable && ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR'].includes(error.code);
}

// ============================================================================
// API Client
// ============================================================================

export class ApiClient {
  private config: ApiConfig;
  private circuitBreaker: CircuitBreaker;
  private deduplicator = new RequestDeduplicator();
  private requestInterceptors: Array<(config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];
  private authProvider: AuthProvider | null = null;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: CURRENT_CONFIG.apiUrl,
      timeout: CURRENT_CONFIG.apiTimeout,
      retries: 3,
      retryDelay: 1000,
      circuitBreakerThreshold: 5,
      circuitBreakerResetTime: 30000,
      ...config,
    };

    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreakerThreshold, this.config.circuitBreakerResetTime);
  }

  /**
   * Set auth provider to break circular dependency
   * Call this from auth service initialization
   */
  setAuthProvider(provider: AuthProvider): void {
    this.authProvider = provider;

    // Add auth interceptor now that we have provider
    this.addRequestInterceptor(async (config) => {
      if (config.skipAuth || !this.authProvider) {
        return config;
      }

      const token = await this.authProvider.getAccessToken();

      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      return config;
    });
  }

  addRequestInterceptor(interceptor: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>): void {
    this.responseInterceptors.push(interceptor);
  }

  private async runRequestInterceptors(config: ApiRequestConfig): Promise<ApiRequestConfig> {
    let result = config;
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private async runResponseInterceptors(response: Response): Promise<Response> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.config.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async executeRequest<T>(endpoint: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    if (!this.circuitBreaker.canExecute()) {
      throw this.createError('CIRCUIT_OPEN', 'Service temporarily unavailable', 503);
    }

    const url = this.buildURL(endpoint, config.params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? this.config.timeout);

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

      let response = await fetch(url, fetchConfig);
      response = await this.runResponseInterceptors(response);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw this.createError(
          errorData.code ?? 'HTTP_ERROR',
          errorData.message ?? response.statusText,
          response.status,
          errorData.details
        );
      }

      const data = await response.json();

      // Validate response schema if provided
      if (config.schema) {
        try {
          config.schema.parse(data);
        } catch (error) {
          throw this.createError(
            'VALIDATION_ERROR',
            'Response validation failed',
            response.status,
            { validationError: error }
          );
        }
      }

      this.circuitBreaker.recordSuccess();

      const result: ApiResponse<T> = {
        data,
        status: response.status,
        headers: this.parseHeaders(response.headers),
      };

      debug.debug('API Response: %s %d', url, response.status);
      return result;

    } catch (error) {
      this.circuitBreaker.recordFailure();

      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError('TIMEOUT', 'Request timeout', 408);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async executeWithRetry<T>(endpoint: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const maxRetries = config.retries ?? this.config.retries;
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeRequest<T>(endpoint, config);
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        const apiError = this.isApiError(lastError) ? lastError : this.createError('UNKNOWN', lastError.message, 0);

        if (!isRetryableError(apiError)) {
          break;
        }

        const delay = calculateBackoff(attempt, this.config.retryDelay);
        debug.debug('Retrying request in %dms (attempt %d/%d)', delay, attempt + 1, maxRetries + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  private async executeWithDeduplication<T>(endpoint: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    if (!config.deduplicate) {
      return this.executeWithRetry<T>(endpoint, config);
    }

    const key = this.buildDeduplicationKey(endpoint, config);
    return this.deduplicator.deduplicate(key, () => this.executeWithRetry<T>(endpoint, config));
  }

  private buildDeduplicationKey(endpoint: string, config: ApiRequestConfig): string {
    const method = config.method ?? 'GET';
    const params = JSON.stringify(config.params ?? {});
    const data = JSON.stringify(config.data ?? {});
    return `${method}:${endpoint}:${params}:${data}`;
  }

  private async parseErrorResponse(response: Response): Promise<Partial<ApiError>> {
    try {
      const text = await response.text();
      return JSON.parse(text);
    } catch {
      return {};
    }
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private createError(code: string, message: string, status: number, details?: unknown): ApiError {
    return {
      code,
      message,
      status,
      details,
      retryable: this.isRetryableErrorCode(code),
    };
  }

  private isRetryableErrorCode(code: string): boolean {
    return ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT', 'SERVER_ERROR'].includes(code);
  }

  private isApiError(error: unknown): error is ApiError {
    return typeof error === 'object' && error !== null && 'code' in error;
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  async get<T>(endpoint: string, config: Omit<ApiRequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({ ...config, method: 'GET' });
    return this.executeWithDeduplication<T>(endpoint, finalConfig);
  }

  async post<T>(endpoint: string, config: Omit<ApiRequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({ ...config, method: 'POST' });
    return this.executeWithRetry<T>(endpoint, finalConfig);
  }

  async put<T>(endpoint: string, config: Omit<ApiRequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({ ...config, method: 'PUT' });
    return this.executeWithRetry<T>(endpoint, finalConfig);
  }

  async patch<T>(endpoint: string, config: Omit<ApiRequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({ ...config, method: 'PATCH' });
    return this.executeWithRetry<T>(endpoint, finalConfig);
  }

  async delete<T>(endpoint: string, config: Omit<ApiRequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({ ...config, method: 'DELETE' });
    return this.executeWithRetry<T>(endpoint, finalConfig);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  getCircuitBreakerState(): CircuitState {
    return this.circuitBreaker.getState();
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker = new CircuitBreaker(this.config.circuitBreakerThreshold, this.config.circuitBreakerResetTime);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let apiClientInstance: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient();
  }
  return apiClientInstance;
}

export function resetApiClient(): void {
  apiClientInstance = null;
}

// ============================================================================
// Default Export
// ============================================================================

export default ApiClient;
