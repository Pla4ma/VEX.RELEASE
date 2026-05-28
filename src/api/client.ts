/** API Client — delegates infra to ./circuit-breaker, ./deduplicator, ./retry */
import { Platform } from "react-native";
import { CURRENT_CONFIG } from "../constants/app";
import { createDebugger } from "../utils/debug";
import { CircuitBreaker } from "./circuit-breaker";
import { RequestDeduplicator } from "./deduplicator";
import {
  calculateBackoff, isRetryableError, isApiError, createApiError,
} from "./retry";
import type {
  ApiConfig, AuthProvider, ApiRequestConfig, ApiResponse, ApiError,
} from "./client-types";

export type { ApiConfig, AuthProvider, ApiRequestConfig, ApiResponse, ApiError };

const debug = createDebugger("api");
type ReqInterceptor = (c: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
type ResInterceptor = (r: Response) => Response | Promise<Response>;

export class ApiClient {
  private config: ApiConfig;
  private circuitBreaker: CircuitBreaker;
  private deduplicator = new RequestDeduplicator();
  private reqInterceptors: ReqInterceptor[] = [];
  private resInterceptors: ResInterceptor[] = [];
  private authProvider: AuthProvider | null = null;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: CURRENT_CONFIG.apiUrl,
      timeout: CURRENT_CONFIG.apiTimeout,
      retries: 3, retryDelay: 1000,
      circuitBreakerThreshold: 5, circuitBreakerResetTime: 30000,
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
      if (config.skipAuth || !this.authProvider) return config;
      const token = await this.authProvider.getAccessToken();
      if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
      return config;
    });
  }

  addRequestInterceptor(interceptor: ReqInterceptor): void {
    this.reqInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResInterceptor): void {
    this.resInterceptors.push(interceptor);
  }

  async request<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const requestConfig = await this.runReqInterceptors(config);
    const execute = (): Promise<ApiResponse<T>> => this.executeRequest<T>(endpoint, requestConfig);
    if (requestConfig.deduplicate) {
      const key = `${requestConfig.method ?? "GET"}:${endpoint}:${JSON.stringify(requestConfig.params ?? {})}:${JSON.stringify(requestConfig.data ?? {})}`;
      return this.deduplicator.deduplicate(key, execute);
    }
    return this.executeWithRetry(execute, requestConfig.retries ?? this.config.retries);
  }

  async get<T>(endpoint: string, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    return (await this.request<T>(endpoint, { ...config, method: "GET" })).data;
  }

  async post<T>(endpoint: string, data?: unknown, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    return (await this.request<T>(endpoint, { ...config, method: "POST", data })).data;
  }

  async put<T>(endpoint: string, data?: unknown, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    return (await this.request<T>(endpoint, { ...config, method: "PUT", data })).data;
  }

  async patch<T>(endpoint: string, data?: unknown, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    return (await this.request<T>(endpoint, { ...config, method: "PATCH", data })).data;
  }

  async delete<T>(endpoint: string, config: Omit<ApiRequestConfig, "method" | "data"> = {}): Promise<T> {
    return (await this.request<T>(endpoint, { ...config, method: "DELETE" })).data;
  }

  private async executeWithRetry<T>(
    execute: () => Promise<ApiResponse<T>>, retries: number,
  ): Promise<ApiResponse<T>> {
    let attempt = 0;
    while (true) {
      try {
        return await execute();
      } catch (error) {
        if (attempt >= retries || !isApiError(error) || !isRetryableError(error)) throw error;
        await new Promise((r) => { setTimeout(r, calculateBackoff(attempt, this.config.retryDelay)); });
        attempt += 1;
      }
    }
  }

  private async runReqInterceptors(config: ApiRequestConfig): Promise<ApiRequestConfig> {
    let result = config;
    for (const interceptor of this.reqInterceptors) result = await interceptor(result);
    return result;
  }

  private async runResInterceptors(response: Response): Promise<Response> {
    let result = response;
    for (const interceptor of this.resInterceptors) result = await interceptor(result);
    return result;
  }

  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.config.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  private async executeRequest<T>(
    endpoint: string, config: ApiRequestConfig,
  ): Promise<ApiResponse<T>> {
    if (!this.circuitBreaker.canExecute()) {
      throw createApiError("CIRCUIT_OPEN", "Service temporarily unavailable", 503);
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
      if (error instanceof Error && error.name === "AbortError") {
        throw createApiError("TIMEOUT", "Request timeout", 408, undefined, true);
      }
      if (isApiError(error)) { this.circuitBreaker.recordFailure(); throw error; }
      this.circuitBreaker.recordFailure();
      throw createApiError("NETWORK_ERROR", error instanceof Error ? error.message : "Network error", 0, error, true);
    }
  }
}

let apiClientInstance: ApiClient | null = null;

export function getApiClient(config?: Partial<ApiConfig>): ApiClient {
  if (!apiClientInstance) apiClientInstance = new ApiClient(config);
  return apiClientInstance;
}

export function resetApiClient(): void {
  apiClientInstance = null;
}
