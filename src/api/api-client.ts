/**
 * API Client — HTTP client with retry, circuit breaker, and deduplication.
 */

import { Platform } from "react-native";
import { CURRENT_CONFIG } from "../constants/app";
import { createDebugger } from "../utils/debug";
import { CircuitBreaker, CircuitState } from "./circuit-breaker";
import { RequestDeduplicator } from "./deduplicator";
import {
  calculateBackoff,
  isRetryableError,
  isRetryableErrorCode,
} from "./retry";
import type {
  ApiConfig,
  AuthProvider,
  ApiRequestConfig,
  ApiResponse,
  ApiError,
} from "./client-types";
import type {
  RequestInterceptor,
  ResponseInterceptor,
} from "./api-client-types";

export type { RequestInterceptor, ResponseInterceptor };

const debug = createDebugger("api");

export class ApiClient {
  private config: ApiConfig;
  private circuitBreaker: CircuitBreaker;
  private deduplicator = new RequestDeduplicator();
  private requestInterceptors: Array<RequestInterceptor> = [];
  private responseInterceptors: Array<ResponseInterceptor> = [];
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
    this.circuitBreaker = new CircuitBreaker(
      this.config.circuitBreakerThreshold,
      this.config.circuitBreakerResetTime,
    );
  }

  setAuthProvider(provider: AuthProvider): void {
    this.authProvider = provider;
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

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  private async runRequestInterceptors(
    config: ApiRequestConfig,
  ): Promise<ApiRequestConfig> {
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

  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
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

  private createError(
    code: string,
    message: string,
    status: number,
    details?: unknown,
  ): ApiError {
    return {
      code,
      message,
      status,
      details,
      retryable: isRetryableErrorCode(code),
    };
  }

  private isApiError(error: unknown): error is ApiError {
    return typeof error === "object" && error !== null && "code" in error;
  }

  private async parseErrorResponse(
    response: Response,
  ): Promise<Partial<ApiError>> {
    try {
      return JSON.parse(await response.text());
    } catch (error: unknown) {
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

  private async executeRequest<T>(
    endpoint: string,
    config: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    if (!this.circuitBreaker.canExecute()) {
      throw this.createError(
        "CIRCUIT_OPEN",
        "Service temporarily unavailable",
        503,
      );
    }

    const url = this.buildURL(endpoint, config.params);
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      config.timeout ?? this.config.timeout,
    );

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Platform": Platform.OS,
        "X-App-Version": CURRENT_CONFIG.version,
        ...config.headers,
      };

      const fetchConfig: RequestInit = {
        method: config.method ?? "GET",
        headers,
        signal: controller.signal,
      };
      if (config.data && config.method !== "GET") {
        fetchConfig.body = JSON.stringify(config.data);
      }

      debug.debug("API Request: %s %s", fetchConfig.method, url);
      let response = await fetch(url, fetchConfig);
      response = await this.runResponseInterceptors(response);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw this.createError(
          errorData.code ?? "HTTP_ERROR",
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
          throw this.createError(
            "VALIDATION_ERROR",
            "Response validation failed",
            response.status,
            { validationError: error },
          );
        }
      }

      this.circuitBreaker.recordSuccess();
      const result: ApiResponse<T> = {
        data,
        status: response.status,
        headers: this.parseHeaders(response.headers),
      };
      debug.debug("API Response: %s %d", url, response.status);
      return result;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      if (error instanceof Error && error.name === "AbortError") {
        throw this.createError("TIMEOUT", "Request timeout", 408);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async executeWithRetry<T>(
    endpoint: string,
    config: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    const maxRetries = config.retries ?? this.config.retries;
    let lastError: Error = new Error("Unknown error");

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeRequest<T>(endpoint, config);
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries) {
          break;
        }
        const apiError = this.isApiError(lastError)
          ? lastError
          : this.createError("UNKNOWN", lastError.message, 0);
        if (!isRetryableError(apiError)) {
          break;
        }
        const delay = calculateBackoff(attempt, this.config.retryDelay);
        debug.debug(
          "Retrying request in %dms (attempt %d/%d)",
          delay,
          attempt + 1,
          maxRetries + 1,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }

  private async executeWithDeduplication<T>(
    endpoint: string,
    config: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    if (!config.deduplicate) {
      return this.executeWithRetry<T>(endpoint, config);
    }
    const key = `${config.method ?? "GET"}:${endpoint}:${JSON.stringify(config.params ?? {})}:${JSON.stringify(config.data ?? {})}`;
    return this.deduplicator.deduplicate(key, () =>
      this.executeWithRetry<T>(endpoint, config),
    );
  }

  async get<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "GET",
    });
    return this.executeWithDeduplication<T>(endpoint, finalConfig);
  }

  async post<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "POST",
    });
    return this.executeWithRetry<T>(endpoint, finalConfig);
  }

  async put<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "PUT",
    });
    return this.executeWithRetry<T>(endpoint, finalConfig);
  }

  async patch<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "PATCH",
    });
    return this.executeWithRetry<T>(endpoint, finalConfig);
  }

  async delete<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "DELETE",
    });
    return this.executeWithRetry<T>(endpoint, finalConfig);
  }

  getCircuitBreakerState(): CircuitState {
    return this.circuitBreaker.getState();
  }
  resetCircuitBreaker(): void {
    this.circuitBreaker = new CircuitBreaker(
      this.config.circuitBreakerThreshold,
      this.config.circuitBreakerResetTime,
    );
  }
}

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

export default ApiClient;
