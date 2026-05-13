/**
 * useApi Hook
 *
 * React hook for API integration with:
 * - Loading states
 * - Error handling with retry
 * - Data caching
 * - Automatic refetch
 * - Request cancellation
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getApiClient, ApiRequestConfig, ApiResponse, ApiError } from '../api/client';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('hooks:api');

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Generate cache key
 */
function generateCacheKey(endpoint: string, config?: ApiRequestConfig): string {
  return `${config?.method ?? 'GET'}:${endpoint}:${JSON.stringify(config?.params)}`;
}

/**
 * Check if cache is valid
 */
function isCacheValid<T>(entry: CacheEntry<T>, cacheTime: number): boolean {
  return Date.now() - entry.timestamp < cacheTime;
}

export * from "./useApi.types";
export * from "./useApi.types";
export * from "./useApi.part1";
export * from "./useApi.part2";
