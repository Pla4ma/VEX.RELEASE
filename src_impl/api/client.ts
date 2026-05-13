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

import { Platform } from 'react-native';
import { z, type ZodType } from 'zod';

import { CURRENT_CONFIG } from '../constants/app';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('api');

// ============================================================================
// Types
// ============================================================================
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

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'retryable' in error
  );
}

// ============================================================================
// API Client
// ============================================================================
let apiClientInstance: ApiClient | null = null;
export * from "./client.types";
export * from "./client.part1";
export * from "./client.part2";
