import {
  classifyError,
  RepositoryError,
} from "./error-handling";

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponential =
    config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  const jitter = Math.random() * 100;
  return Math.min(exponential + jitter, config.maxDelayMs);
}

export async function withRetry<T>(
  operation: string,
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: RepositoryError | undefined;
  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const code = classifyError(error);
      lastError = new RepositoryError(operation, error, code);
      if (!lastError.isRetryable) {
        throw lastError;
      }
      if (attempt === retryConfig.maxAttempts) {
        break;
      }
      const delay = calculateDelay(attempt, retryConfig);
      await sleep(delay);
    }
  }
  throw lastError;
}

export type ConnectionState = "online" | "offline" | "unknown";

let currentConnectionState: ConnectionState = "unknown";
const connectionListeners: Set<(state: ConnectionState) => void> = new Set();

export function getConnectionState(): ConnectionState {
  return currentConnectionState;
}

export function subscribeToConnectionChanges(
  callback: (state: ConnectionState) => void,
): () => void {
  connectionListeners.add(callback);
  return () => connectionListeners.delete(callback);
}

export function updateConnectionState(state: ConnectionState): void {
  if (currentConnectionState !== state) {
    currentConnectionState = state;
    connectionListeners.forEach((cb) => cb(state));
  }
}
