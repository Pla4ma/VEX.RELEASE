import { IS_DEVELOPMENT } from '../constants/app';
import { captureException, captureMessage } from '../config/sentry';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

// Current log level (can be set via env or storage)
let currentLogLevel = IS_DEVELOPMENT ? LogLevel.DEBUG : LogLevel.WARN;

// Enabled namespaces for debugging
let enabledNamespaces: string[] = IS_DEVELOPMENT ? ['*'] : [];

/**
 * Set global log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Enable debug namespaces
 */
export function enableDebug(namespaces: string[]): void {
  enabledNamespaces = namespaces;
}

/**
 * Check if namespace is enabled
 */
function isNamespaceEnabled(namespace: string): boolean {
  if (enabledNamespaces.includes('*')) {
    return true;
  }
  return enabledNamespaces.some((ns) =>
    namespace.startsWith(ns.replace('*', '')),
  );
}

/**
 * Format log message with timestamp and namespace
 */
function formatMessage(namespace: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${namespace}] ${message}`;
}

/**
 * Send to error reporting service (e.g., Sentry)
 */
function reportToErrorTracking(
  level: LogLevel,
  message: string,
  error?: Error,
): void {
  if (!IS_DEVELOPMENT && level >= LogLevel.ERROR) {
    try {
      if (error) {
        captureException(error);
      } else {
        captureMessage(message, 'error');
      }
    } catch {
      // Sentry not available — fail silently
    }
  }
}

/**
 * Debugger instance for a namespace
 */
export interface Debugger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, error?: Error | unknown, ...args: unknown[]) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}

/**
 * Create a namespaced debugger
 */
export function createDebugger(namespace: string): Debugger {
  return {
    debug: (message: string, ...args: unknown[]) => {
      if (currentLogLevel <= LogLevel.DEBUG && isNamespaceEnabled(namespace)) {
        console.debug(formatMessage(namespace, message), ...args);
      }
    },

    info: (message: string, ...args: unknown[]) => {
      if (currentLogLevel <= LogLevel.INFO) {

        console.info(formatMessage(namespace, message), ...args);
      }
    },

    warn: (message: string, ...args: unknown[]) => {
      if (currentLogLevel <= LogLevel.WARN) {
        console.warn(formatMessage(namespace, message), ...args);
      }
    },

    error: (message: string, error?: Error | unknown, ...args: unknown[]) => {
      if (currentLogLevel <= LogLevel.ERROR) {
        const errorInstance =
          error instanceof Error ? error : new Error(String(error));
        console.error(formatMessage(namespace, message), errorInstance, ...args);
        reportToErrorTracking(LogLevel.ERROR, message, errorInstance);
      }
    },

    time: (label: string) => {
      if (currentLogLevel <= LogLevel.DEBUG && isNamespaceEnabled(namespace)) {
        console.time(label);
      }
    },

    timeEnd: (label: string) => {
      if (currentLogLevel <= LogLevel.DEBUG && isNamespaceEnabled(namespace)) {
        console.timeEnd(label);
      }
    },
  };
}

/**
 * Global debug instance
 */
export const debug = createDebugger('app');

/**
 * Performance tracking decorator
 */
export function measurePerformance(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalMethod = descriptor.value;
  const methodDebugger = createDebugger(
    `perf:${target?.constructor?.name || 'unknown'}`,
  );

  descriptor.value = async function (...args: unknown[]) {
    const start = performance.now();
    methodDebugger.debug(`${propertyKey} started`);

    try {
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;
      methodDebugger.debug(
        `${propertyKey} completed in ${duration.toFixed(2)}ms`,
      );
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      methodDebugger.error(
        `${propertyKey} failed after ${duration.toFixed(2)}ms`,
        error as Error,
      );
      throw error;
    }
  };

  return descriptor;
}
