/**
 * Session Feature — Retry Strategy Tests
 */

import { RetryStrategy } from "../utils/RetryStrategy";
import { DEFAULT_RETRY_CONFIG } from "../utils/retry-strategy-types";
import { createRetryStrategy, getRetryStrategy } from "../utils/retry-factories";

describe("RetryStrategy", () => {
  let strategy: RetryStrategy;

  beforeEach(() => {
    strategy = new RetryStrategy({ maxAttempts: 3, baseDelay: 10, maxDelay: 100, jitterFactor: 0 });
  });

  test("returns result on first success", async () => {
    const result = await strategy.execute(async () => "ok", "test-op");
    expect(result).toBe("ok");
  });

  test("retries on retryable error and eventually succeeds", async () => {
    let callCount = 0;
    const result = await strategy.execute(async () => {
      callCount++;
      if (callCount < 3) throw new Error("NETWORK_ERROR timeout");
      return "recovered";
    }, "retry-op");
    expect(result).toBe("recovered");
    expect(callCount).toBe(3);
  });

  test("throws AggregateError after max attempts exhausted", async () => {
    await expect(
      strategy.execute(async () => {
        throw new Error("NETWORK_ERROR");
      }, "fail-op"),
    ).rejects.toThrow(AggregateError);
  });

  test("throws immediately for non-retryable errors", async () => {
    await expect(
      strategy.execute(async () => {
        throw new Error("VALIDATION_ERROR");
      }, "non-retry"),
    ).rejects.toThrow("VALIDATION_ERROR");
  });

  test("executeWithFallback uses fallback when operation fails", async () => {
    const result = await strategy.executeWithFallback(
      async () => {
        throw new Error("NETWORK_ERROR timeout");
      },
      async () => "fallback-value",
      "fallback-op",
    );
    expect(result).toBe("fallback-value");
  });

  test("circuit breaker opens after threshold failures", async () => {
    const breakerStrategy = new RetryStrategy({
      maxAttempts: 1,
      baseDelay: 1,
      maxDelay: 10,
      jitterFactor: 0,
      circuitBreakerThreshold: 2,
      circuitBreakerResetTime: 60000,
    });

    // Fail twice to trip the breaker
    for (let i = 0; i < 2; i++) {
      try {
        await breakerStrategy.execute(async () => {
          throw new Error("NETWORK_ERROR");
        }, "breaker-test");
      } catch {
        // expected
      }
    }

    // Third call should fail immediately with circuit breaker open
    await expect(
      breakerStrategy.execute(async () => "ok", "breaker-test"),
    ).rejects.toThrow("Circuit breaker open");
  });

  test("resetCircuit clears circuit breaker state", async () => {
    const breakerStrategy = new RetryStrategy({
      maxAttempts: 1,
      baseDelay: 1,
      maxDelay: 10,
      jitterFactor: 0,
      circuitBreakerThreshold: 1,
      circuitBreakerResetTime: 60000,
    });

    try {
      await breakerStrategy.execute(async () => {
        throw new Error("NETWORK_ERROR");
      }, "reset-test");
    } catch {
      // expected
    }

    breakerStrategy.resetCircuit("reset-test");
    const result = await breakerStrategy.execute(async () => "ok", "reset-test");
    expect(result).toBe("ok");
  });
});

describe("retry-factories", () => {
  test("createRetryStrategy returns a RetryStrategy instance", () => {
    const strategy = createRetryStrategy();
    expect(strategy).toBeInstanceOf(RetryStrategy);
  });

  test("getRetryStrategy returns same instance on repeated calls", () => {
    const a = getRetryStrategy();
    const b = getRetryStrategy();
    expect(a).toBe(b);
  });
});
