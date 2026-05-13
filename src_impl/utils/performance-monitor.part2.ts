import { createDebugger } from "./debug";
import { eventBus } from "../events";


export function measureExecutionTime<T>(
  fn: () => T,
  label: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (duration > 16) {
    debug.warn(`Slow execution: ${label} took ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (duration > 100) {
    debug.warn(`Slow async execution: ${label} took ${duration.toFixed(2)}ms`);

    eventBus.publish('analytics:track', {
      event: 'performance_slow_operation',
      properties: { operation: label, duration },
    });
  }

  return { result, duration };
}

export const Performance = {
  PerformanceMonitor,
  measureExecutionTime,
  measureAsyncExecutionTime,
  DEFAULT_THRESHOLDS,
};