/**
 * Debug Utility for Session V2
 * 
 * Centralized debugging with configurable log levels.
 * Provides structured logging for combat system debugging.
 */

// ============================================================================
// Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface DebugContext {
  sessionId?: string;
  userId?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

export interface DebugEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: DebugContext;
  error?: Error;
}

// ============================================================================
// Debug Configuration
// ============================================================================

interface DebugConfig {
  enabled: boolean;
  level: LogLevel;
  maxEntries: number;
  persistToConsole: boolean;
  includeTimestamp: boolean;
  includeContext: boolean;
}

const DEFAULT_CONFIG: DebugConfig = {
  enabled: __DEV__,
  level: 'info',
  maxEntries: 1000,
  persistToConsole: true,
  includeTimestamp: true,
  includeContext: true,
};

// ============================================================================
// Debug Logger Class
// ============================================================================

export class DebugLogger {
  private config: DebugConfig;
  private entries: DebugEntry[] = [];
  private subscribers: Map<LogLevel, Set<(entry: DebugEntry) => void>> = new Map();

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Initialize subscribers
    this.subscribers.set('debug', new Set());
    this.subscribers.set('info', new Set());
    this.subscribers.set('warn', new Set());
    this.subscribers.set('error', new Set());
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  updateConfig(newConfig: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): DebugConfig {
    return { ...this.config };
  }

  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  enable(): void {
    this.config.enabled = true;
  }

  disable(): void {
    this.config.enabled = false;
  }

  // ============================================================================
  // Logging Methods
  // ============================================================================

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    
    return levels[level] >= levels[this.config.level];
  }

  private createEntry(level: LogLevel, message: string, context?: DebugContext, error?: Error): DebugEntry {
    return {
      level,
      message,
      timestamp: Date.now(),
      context,
      error,
    };
  }

  private storeEntry(entry: DebugEntry): void {
    this.entries.push(entry);
    
    // Maintain max entries limit
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }
  }

  private notifySubscribers(entry: DebugEntry): void {
    const subscribers = this.subscribers.get(entry.level);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(entry);
        } catch (error) {
          // Prevent subscriber errors from breaking logging
          console.error('Debug subscriber error:', error);
        }
      });
    }
  }

  private formatMessage(entry: DebugEntry): string {
    let message = '';
    
    if (this.config.includeTimestamp) {
      message += `[${new Date(entry.timestamp).toISOString()}] `;
    }
    
    message += `[${entry.level.toUpperCase()}] ${entry.message}`;
    
    if (this.config.includeContext && entry.context) {
      const contextStr = Object.entries(entry.context)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join(' ');
      message += ` (${contextStr})`;
    }
    
    if (entry.error) {
      message += `\nError: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\nStack: ${entry.error.stack}`;
      }
    }
    
    return message;
  }

  // ============================================================================
  // Public Logging API
  // ============================================================================

  debug(message: string, context?: DebugContext): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createEntry('debug', message, context);
    this.storeEntry(entry);
    this.notifySubscribers(entry);
    
    if (this.config.persistToConsole) {
      console.debug(this.formatMessage(entry));
    }
  }

  info(message: string, context?: DebugContext): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createEntry('info', message, context);
    this.storeEntry(entry);
    this.notifySubscribers(entry);
    
    if (this.config.persistToConsole) {
      console.info(this.formatMessage(entry));
    }
  }

  warn(message: string, context?: DebugContext): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createEntry('warn', message, context);
    this.storeEntry(entry);
    this.notifySubscribers(entry);
    
    if (this.config.persistToConsole) {
      console.warn(this.formatMessage(entry));
    }
  }

  error(message: string, error?: Error, context?: DebugContext): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.createEntry('error', message, context, error);
    this.storeEntry(entry);
    this.notifySubscribers(entry);
    
    if (this.config.persistToConsole) {
      console.error(this.formatMessage(entry));
    }
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  getEntries(level?: LogLevel, limit?: number): DebugEntry[] {
    let filtered = this.entries;
    
    if (level) {
      filtered = filtered.filter(entry => entry.level === level);
    }
    
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    
    return filtered;
  }

  getEntriesByContext(contextKey: string, contextValue: unknown, level?: LogLevel): DebugEntry[] {
    return this.entries.filter(entry => {
      if (level && entry.level !== level) return false;
      return entry.context && entry.context[contextKey] === contextValue;
    });
  }

  getEntriesByTimeRange(startTime: number, endTime: number, level?: LogLevel): DebugEntry[] {
    return this.entries.filter(entry => {
      if (level && entry.level !== level) return false;
      return entry.timestamp >= startTime && entry.timestamp <= endTime;
    });
  }

  getRecentEntries(count: number = 50, level?: LogLevel): DebugEntry[] {
    const entries = level 
      ? this.entries.filter(entry => entry.level === level)
      : this.entries;
    return entries.slice(-count);
  }

  // ============================================================================
  // Subscription Methods
  // ============================================================================

  subscribe(level: LogLevel, callback: (entry: DebugEntry) => void): () => void {
    const subscribers = this.subscribers.get(level);
    if (subscribers) {
      subscribers.add(callback);
      
      // Return unsubscribe function
      return () => {
        subscribers.delete(callback);
      };
    }
    
    return () => {}; // No-op if level not found
  }

  subscribeAll(callback: (entry: DebugEntry) => void): () => void {
    const unsubscribes: (() => void)[] = [];
    
    ['debug', 'info', 'warn', 'error'].forEach(level => {
      unsubscribes.push(this.subscribe(level as LogLevel, callback));
    });
    
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  clear(): void {
    this.entries = [];
  }

  export(): string {
    return JSON.stringify({
      config: this.config,
      entries: this.entries,
      exportedAt: Date.now(),
    }, null, 2);
  }

  getStats(): {
    totalEntries: number;
    entriesByLevel: Record<LogLevel, number>;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    const entriesByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    };
    
    let oldestEntry: number | undefined;
    let newestEntry: number | undefined;
    
    this.entries.forEach(entry => {
      entriesByLevel[entry.level]++;
      
      if (!oldestEntry || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      
      if (!newestEntry || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    });
    
    return {
      totalEntries: this.entries.length,
      entriesByLevel,
      oldestEntry,
      newestEntry,
    };
  }

  // ============================================================================
  // Performance Monitoring
  // ============================================================================

  time<T>(label: string, fn: () => T, context?: DebugContext): T {
    const startTime = performance.now();
    
    try {
      const result = fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.debug(`Timer: ${label}`, {
        ...context,
        duration: `${duration.toFixed(2)}ms`,
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.error(`Timer: ${label} (failed)`, error as Error, {
        ...context,
        duration: `${duration.toFixed(2)}ms`,
      });
      
      throw error;
    }
  }

  async timeAsync<T>(label: string, fn: () => Promise<T>, context?: DebugContext): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.debug(`Timer: ${label}`, {
        ...context,
        duration: `${duration.toFixed(2)}ms`,
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.error(`Timer: ${label} (failed)`, error as Error, {
        ...context,
        duration: `${duration.toFixed(2)}ms`,
      });
      
      throw error;
    }
  }
}

// ============================================================================
// Debug Logger Factory
// ============================================================================

const loggers = new Map<string, DebugLogger>();

export function createDebugger(name: string, config?: Partial<DebugConfig>): DebugLogger {
  let logger = loggers.get(name);
  
  if (!logger) {
    logger = new DebugLogger(config);
    loggers.set(name, logger);
  } else if (config) {
    logger.updateConfig(config);
  }
  
  return logger;
}

export function getDebugger(name: string): DebugLogger | undefined {
  return loggers.get(name);
}

export function getAllLoggers(): Map<string, DebugLogger> {
  return new Map(loggers);
}

export function clearAllLoggers(): void {
  loggers.forEach(logger => logger.clear());
}

export function setGlobalLevel(level: LogLevel): void {
  loggers.forEach(logger => logger.setLevel(level));
}

export function enableAll(): void {
  loggers.forEach(logger => logger.enable());
}

export function disableAll(): void {
  loggers.forEach(logger => logger.disable());
}

// ============================================================================
// Default Export
// ============================================================================

export default createDebugger;
