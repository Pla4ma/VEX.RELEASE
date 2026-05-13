import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * QA Hardening Utilities
 * Retry logic, circuit breakers, failure recovery, and resilience patterns
 */

import * as Sentry from '@sentry/react-native';

// Retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    'network_error',
    'timeout',
    'rate_limited',
    'temporarily_unavailable',
  ],
};

// Execute function with retry logic
// Circuit breaker states
// Timeout wrapper
// Debounce function
// Throttle function
// Memory cache with TTL
// Rate limiter
// Async operation queue with concurrency control
// Utility function for delay
// Error classifier
// Safe JSON parse with fallback
// Safe JSON stringify with fallback
// Health check utility
export * from "./index.types";
export * from "./index.part1";
export * from "./index.part2";
export * from "./index.part3";
