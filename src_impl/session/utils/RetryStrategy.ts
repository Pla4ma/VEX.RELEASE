/**
 * Retry Strategy
 *
 * Production-grade retry logic with exponential backoff,
 * circuit breakers, and jitter for distributed system resilience.
 */

import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:retry');

// ============================================================================
// Retry Configuration
// ============================================================================
// ============================================================================
// Circuit Breaker State
// ============================================================================

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  lastFailure: number;
  nextAttempt: number;
}

// ============================================================================
// Retry Context
// ============================================================================
// ============================================================================
// Retry Strategy
// ============================================================================
// ============================================================================
// Utility Functions
// ============================================================================
// Singleton
let strategyInstance: RetryStrategy | null = null;
// ============================================================================
// Decorator for automatic retry
// ============================================================================
export * from "./RetryStrategy.types";
export * from "./RetryStrategy.types";
export * from "./RetryStrategy.part1";
export * from "./RetryStrategy.part2";
