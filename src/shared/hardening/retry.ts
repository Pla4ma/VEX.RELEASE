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
    'network_error',
    'timeout',
    'rate_limited',
    'temporarily_unavailable',
  ],
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
        lastError?.message.toLowerCase().includes(errType) ?? false,
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
  const finalError = lastError ?? new Error('Unknown error');
  fullConfig.onExhausted?.(finalError);
  throw finalError;
}

export { CircuitBreaker } from './circuit-breaker';

export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  label?: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(label ?? `Timeout after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([Promise.resolve().then(fn), timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

export function classifyError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export class TTLCache<V = unknown, K = string> {
  private cache = new Map<K, { value: V; expiry: number }>();
  constructor(private ttlMs: number) {}
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiry) { this.cache.delete(key); return undefined; }
    return entry.value;
  }
  set(key: K, value: V): void {
    this.cache.set(key, { value, expiry: Date.now() + this.ttlMs });
  }
  delete(key: K): void { this.cache.delete(key); }
  clear(): void { this.cache.clear(); }
}
