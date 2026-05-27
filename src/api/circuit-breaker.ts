/**
 * Circuit Breaker
 *
 * Circuit breaker pattern implementation for API resilience.
 */

import { createDebugger } from "../utils/debug";

const debug = createDebugger("circuit-breaker");

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export class CircuitBreaker {
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
    return true;
  }

  recordSuccess(): void {
    this.failures = 0;
    this.state = CircuitState.CLOSED;
    debug.debug("Circuit breaker closed");
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
      debug.debug(
        "Circuit breaker opened, next attempt in %dms",
        this.resetTimeout,
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}
