/**
 * API Client — HTTP client with retry, circuit breaker, and deduplication.
 */

import { CURRENT_CONFIG } from "../constants/app";
import { CircuitBreaker, CircuitState } from "./circuit-breaker";
import { RequestDeduplicator } from "./deduplicator";
import type {
  ApiConfig,
  AuthProvider,
  ApiRequestConfig,
  ApiResponse,
} from "./client-types";
import type {
  RequestInterceptor,
  ResponseInterceptor,
} from "./api-client-types";
import {
  type RequestExecutorDeps,
  executeWithRetry,
  executeWithDeduplication,
} from "./api-request-handler";

export type { RequestInterceptor, ResponseInterceptor };

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

  private getDeps(): RequestExecutorDeps {
    return {
      config: this.config,
      circuitBreaker: this.circuitBreaker,
      deduplicator: this.deduplicator,
      runResponseInterceptors: (r) => this.runResponseInterceptors(r),
    };
  }

  async get<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "GET",
    });
    return executeWithDeduplication<T>(this.getDeps(), endpoint, finalConfig);
  }

  async post<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "POST",
    });
    return executeWithRetry<T>(this.getDeps(), endpoint, finalConfig);
  }

  async put<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "PUT",
    });
    return executeWithRetry<T>(this.getDeps(), endpoint, finalConfig);
  }

  async patch<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "PATCH",
    });
    return executeWithRetry<T>(this.getDeps(), endpoint, finalConfig);
  }

  async delete<T>(
    endpoint: string,
    config: Omit<ApiRequestConfig, "method"> = {},
  ): Promise<ApiResponse<T>> {
    const finalConfig = await this.runRequestInterceptors({
      ...config,
      method: "DELETE",
    });
    return executeWithRetry<T>(this.getDeps(), endpoint, finalConfig);
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
