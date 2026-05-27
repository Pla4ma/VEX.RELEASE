import { captureSilentFailure } from "../../utils/silent-failure";
import * as Sentry from "@sentry/react-native";
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
  onRetry?: (attempt: number, error: Error) => void;
  onExhausted?: (error: Error) => void;
}
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    "network_error",
    "timeout",
    "rate_limited",
    "temporarily_unavailable",
  ],
};
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isRetryable = fullConfig.retryableErrors.some((errType) =>
        lastError!.message.toLowerCase().includes(errType),
      );
      if (!isRetryable || attempt === fullConfig.maxAttempts) {
        break;
      }
      const delay = Math.min(
        fullConfig.baseDelayMs *
          Math.pow(fullConfig.backoffMultiplier, attempt - 1),
        fullConfig.maxDelayMs,
      );
      const jitter = Math.random() * 1000;
      fullConfig.onRetry?.(attempt, lastError);
      await sleep(delay + jitter);
    }
  }
  const finalError = lastError ?? new Error("Unknown error");
  fullConfig.onExhausted?.(finalError);
  throw finalError;
}
export type CircuitState = "closed" | "open" | "half-open";
export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeoutMs: number;
  halfOpenMaxCalls: number;
  onStateChange?: (state: CircuitState) => void;
}
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private halfOpenCalls = 0;
  private config: CircuitBreakerConfig;
  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      recoveryTimeoutMs: 30000,
      halfOpenMaxCalls: 3,
      ...config,
    };
  }
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (this.shouldAttemptReset()) {
        this.transitionTo("half-open");
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }
    if (
      this.state === "half-open" &&
      this.halfOpenCalls >= this.config.halfOpenMaxCalls
    ) {
      throw new Error("Circuit breaker half-open call limit reached");
    }
    if (this.state === "half-open") {
      this.halfOpenCalls++;
    }
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  private onSuccess(): void {
    if (this.state === "half-open") {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenMaxCalls) {
        this.transitionTo("closed");
      }
    } else {
      this.failureCount = 0;
    }
  }
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo("open");
    }
  }
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return true;
    }
    return Date.now() - this.lastFailureTime >= this.config.recoveryTimeoutMs;
  }
  private transitionTo(state: CircuitState): void {
    this.state = state;
    this.successCount = 0;
    this.halfOpenCalls = 0;
    this.config.onStateChange?.(state);
  }
  getState(): CircuitState {
    return this.state;
  }
  getMetrics(): {
    failureCount: number;
    successCount: number;
    state: CircuitState;
  } {
    return {
      failureCount: this.failureCount,
      successCount: this.successCount,
      state: this.state,
    };
  }
}
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Operation timed out",
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };
}
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limitMs: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
export class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTtlMs: number;
  constructor(defaultTtlMs = 300000) {
    this.defaultTtlMs = defaultTtlMs;
  }
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }
  set(key: string, value: T, ttlMs?: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }
  delete(key: string): void {
    this.cache.delete(key);
  }
  clear(): void {
    this.cache.clear();
  }
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
  size(): number {
    this.cleanup();
    return this.cache.size;
  }
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}
export class RateLimiter {
  private requests: number[] = [];
  private limit: number;
  private windowMs: number;
  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }
  canProceed(): boolean {
    this.cleanup();
    return this.requests.length < this.limit;
  }
  recordRequest(): void {
    this.requests.push(Date.now());
  }
  getRemaining(): number {
    this.cleanup();
    return Math.max(0, this.limit - this.requests.length);
  }
  getResetTime(): number {
    if (this.requests.length === 0) {
      return 0;
    }
    const firstRequest = this.requests[0];
    return (firstRequest ?? Date.now()) + this.windowMs;
  }
  private cleanup(): void {
    const cutoff = Date.now() - this.windowMs;
    this.requests = this.requests.filter((time) => time > cutoff);
  }
}
export class AsyncQueue {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private concurrency: number;
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
  }
  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const task = async () => {
        try {
          this.running++;
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.process();
        }
      };
      this.queue.push(task);
      this.process();
    });
  }
  private process(): void {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      task?.();
    }
  }
  get size(): number {
    return this.queue.length;
  }
  get active(): number {
    return this.running;
  }
}
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function classifyError(error: Error): {
  type: "transient" | "persistent" | "auth" | "validation" | "unknown";
  retryable: boolean;
  severity: "low" | "medium" | "high" | "critical";
} {
  const message = error.message.toLowerCase();
  if (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("temporarily")
  ) {
    return { type: "transient", retryable: true, severity: "medium" };
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return { type: "transient", retryable: true, severity: "low" };
  }
  if (
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("auth")
  ) {
    return { type: "auth", retryable: false, severity: "high" };
  }
  if (message.includes("validation") || message.includes("invalid")) {
    return { type: "validation", retryable: false, severity: "medium" };
  }
  if (message.includes("not found") || message.includes("does not exist")) {
    return { type: "persistent", retryable: false, severity: "low" };
  }
  return { type: "unknown", retryable: false, severity: "high" };
}
export function safeJsonParse<T>(
  json: string,
  fallback: T,
  context?: string,
): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    Sentry.addBreadcrumb({
      category: "parse_error",
      message: `Failed to parse JSON${context ? ` (${context})` : ""}`,
      level: "warning",
    });
    return fallback;
  }
}
export function safeJsonStringify(
  obj: unknown,
  fallback = "{}",
  context?: string,
): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    Sentry.addBreadcrumb({
      category: "stringify_error",
      message: `Failed to stringify${context ? ` (${context})` : ""}`,
      level: "warning",
    });
    return fallback;
  }
}
export interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  critical: boolean;
}
export async function runHealthChecks(
  checks: HealthCheck[],
): Promise<{
  healthy: boolean;
  results: Array<{ name: string; healthy: boolean; critical: boolean }>;
}> {
  const results = await Promise.all(
    checks.map(async (check) => {
      try {
        const healthy = await check.check();
        return { name: check.name, healthy, critical: check.critical };
      } catch (error) {
        captureSilentFailure(error, {
          feature: "shared",
          operation: "ui-fallback",
          type: "ui",
        });
        return { name: check.name, healthy: false, critical: check.critical };
      }
    }),
  );
  const healthy = results.every((r) => !r.critical || r.healthy);
  return { healthy, results };
}
