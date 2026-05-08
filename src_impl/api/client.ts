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

import { Platform } from "react-native";
import { z, type ZodType } from "zod";

import { CURRENT_CONFIG } from "../constants/app";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("api");

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
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
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
  CLOSED = "CLOSED", // Normal operation
  OPEN = "OPEN", // Failing, reject requests
  HALF_OPEN = "HALF_OPEN", // Testing recovery
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
    debug.debug("Circuit breaker closed");
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
      debug.debug("Circuit breaker opened, next attempt in %dms", this.resetTimeout);
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
      debug.debug("Deduplicating request: %s", key);
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
  return error.retryable && ["NETWORK_ERROR", "TIMEOUT", "RATE_LIMIT", "SERVER_ERROR"].includes(error.code);
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "retryable" in error
  );
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

  async request<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const requestConfig = await this.runRequestInterceptors(config);
    const execute = (): Promise<ApiResponse<T>> => this.executeRequest<T>(endpoint, requestConfig);

    if (requestConfig.deduplicate) {
      const key = `${requestConfig.method ?? "GET"}:${endpoint}:${JSON.stringify(requestConfig.params ?? {})}:${JSON.stringify(requestConfig.data ?? {})}`;
      return this.deduplicator.deduplicate(key, execute);
    }

    return this.executeWithRetry(execute, requestConfig.retries ?? this.config.retries);
  }

  async get<T>(endpoint: string, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    const response = await this.request<T>(endpoint, { ...config, method: "GET" });
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    const response = await this.request<T>(endpoint, { ...config, method: "POST", data });
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    const response = await this.request<T>(endpoint, { ...config, method: "PUT", data });
    return response.data;
  }

  async patch<T>(endpoint: string, data?: unknown, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    const response = await this.request<T>(endpoint, { ...config, method: "PATCH", data });
    return response.data;
  }

  async delete<T>(endpoint: string, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    const response = await this.request<T>(endpoint, { ...config, method: "DELETE" });
    return response.data;
  }

  private async executeWithRetry<T>(
    execute: () => Promise<ApiResponse<T>>,
    retries: number
  ): Promise<ApiResponse<T>> {
    let attempt = 0;

    while (true) {
      try {
        return await execute();
      } catch (error) {
        const shouldRetry = attempt < retries && isApiError(error) && isRetryableError(error);

        if (!shouldRetry) {
          throw error;
        }

        await new Promise((resolve) => {
          setTimeout(resolve, calculateBackoff(attempt, this.config.retryDelay));
        });
        attempt += 1;
      }
    }
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
      throw this.createError("CIRCUIT_OPEN", "Service temporarily unavailable", 503);
    }

    const url = this.buildURL(endpoint, config.params);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? this.config.timeout);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Platform": Platform.OS,
        "X-App-Version": CURRENT_CONFIG.version,
        ...config.headers,
      };

      debug.debug("Request: %s %s", config.method, url);
      throw new Error("Direct HTTP calls are not allowed. Use Supabase client or a repository layer instead.");
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw this.createError("TIMEOUT", "Request timeout", 408, undefined, true);
        }
      }

      if (isApiError(error)) {
        this.circuitBreaker.recordFailure();
        throw error;
      }

      this.circuitBreaker.recordFailure();
      throw this.createError("NETWORK_ERROR", error instanceof Error ? error.message : "Network error", 0, error, true);
    }
  }

  private createError(code: string, message: string, status: number, details?: unknown, retryable = false): ApiError {
    return { code, message, status, details, retryable };
  }

  private getErrorCode(status: number): string {
    if (status === 429) {
      return "RATE_LIMIT";
    }
    if (status >= 500) {
      return "SERVER_ERROR";
    }
    if (status === 401) {
      return "AUTH_ERROR";
    }
    if (status === 403) {
      return "FORBIDDEN";
    }
    if (status === 404) {
      return "NOT_FOUND";
    }
    if (status >= 400) {
      return "CLIENT_ERROR";
    }
    return "UNKNOWN";
  }

  private isRetryableStatus(status: number): boolean {
    return status === 429 || status === 502 || status === 503 || status === 504;
  }
}

let apiClientInstance: ApiClient | null = null;

export function getApiClient(config?: Partial<ApiConfig>): ApiClient {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient(config);
  }
  return apiClientInstance;
}

export function resetApiClient(): void {
  apiClientInstance = null;
}
