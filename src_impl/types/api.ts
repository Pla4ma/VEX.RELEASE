/**
 * API Type Definitions
 *
 * Type definitions for API requests, responses, and related types.
 * Establishes the contract between the app and backend services.
 */

import type { PaginationData } from './global';

/**
 * HTTP methods supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
/**
 * Paginated API response
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginationData<T>>;
/**
 * API request state
 */
export type ApiRequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };
/**
 * API middleware function
 */
export type ApiMiddleware = (
  config: ApiRequestConfig
) => ApiRequestConfig | Promise<ApiRequestConfig>;
/**
 * WebSocket message types
 */
export type WebSocketMessageType =
  | 'connect'
  | 'disconnect'
  | 'subscribe'
  | 'unsubscribe'
  | 'message'
  | 'ping'
  | 'pong';
/**
 * GraphQL operation types
 */
export type GraphQLOperationType = 'query' | 'mutation' | 'subscription';

export * from "./api.types";
