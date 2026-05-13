/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: ApiMeta;
    error?: ApiError;
}

/**
 * API metadata for responses
 */
export interface ApiMeta {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
    rateLimit?: RateLimitInfo;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

/**
 * Rate limiting information
 */
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetAt: string;
}

/**
 * API error structure
 */
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    field?: string;
    stack?: string;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig {
    method: HttpMethod;
    url: string;
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    data?: unknown;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    signal?: AbortSignal;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
    baseURL: string;
    timeout: number;
    headers: Record<string, string>;
    retries: number;
    retryDelay: number;
}

/**
 * API cache configuration
 */
export interface ApiCacheConfig {
    enabled: boolean;
    ttl: number;
    key: string;
    staleWhileRevalidate: boolean;
}

/**
 * API retry strategy
 */
export interface RetryStrategy {
    maxRetries: number;
    retryDelay: number;
    retryCondition?: (error: ApiError) => boolean;
    backoffMultiplier?: number;
}

/**
 * API endpoint definition
 */
export interface ApiEndpoint<TRequest, TResponse> {
    method: HttpMethod;
    path: string;
    requestSchema?: TRequest extends unknown ? unknown : never;
    responseSchema?: TResponse extends unknown ? unknown : never;
    cache?: ApiCacheConfig;
    retry?: RetryStrategy;
}

/**
 * API interceptor for requests
 */
export interface ApiRequestInterceptor {
    onRequest: ApiMiddleware;
    onRequestError?: (error: Error) => Promise<Error>;
}

/**
 * API interceptor for responses
 */
export interface ApiResponseInterceptor {
    onResponse: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
    onResponseError?: (error: ApiError) => Promise<ApiError>;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = unknown> {
    type: WebSocketMessageType;
    channel?: string;
    payload?: T;
    timestamp: string;
    id: string;
}

/**
 * GraphQL request
 */
export interface GraphQLRequest<TVariables = Record<string, unknown>> {
    operationName?: string;
    query: string;
    variables?: TVariables;
}

/**
 * GraphQL response
 */
export interface GraphQLResponse<TData = unknown> {
    data?: TData;
    errors?: GraphQLError[];
}

/**
 * GraphQL error
 */
export interface GraphQLError {
    message: string;
    locations?: { line: number; column: number }[];
    path?: (string | number)[];
    extensions?: Record<string, unknown>;
}

/**
 * API health status
 */
export interface ApiHealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    uptime: number;
    version: string;
    timestamp: string;
}

/**
 * API version information
 */
export interface ApiVersion {
    major: number;
    minor: number;
    patch: number;
    deprecated?: boolean;
    sunsetDate?: string;
}
