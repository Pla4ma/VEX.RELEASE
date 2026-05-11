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
 *
 * This file re-exports from modular files for backward compatibility.
 * New code should import directly from the modular files.
 */

export type { ApiConfig, AuthProvider, ApiRequestConfig, ApiResponse, ApiError } from './client-types';
export { CircuitBreaker } from './circuit-breaker';
export { CircuitState } from './circuit-breaker';
export type { CircuitState as CircuitStateType } from './circuit-breaker';
export { calculateBackoff, isRetryableError, isRetryableErrorCode } from './retry';
export { RequestDeduplicator } from './deduplicator';
export { ApiClient, getApiClient, resetApiClient } from './api-client';
export { default } from './api-client';