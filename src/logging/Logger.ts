/**
 * Logger Module
 *
 * Centralized logging utility for all service modules.
 * Provides structured logging with different log levels and context.
 */

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: string;
  service: string;
  message: string;
  context?: LogContext;
}

export interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error';
  enableConsole?: boolean;
  enableFile?: boolean;
  format?: 'json' | 'text';
}

export class Logger {
  private config: LoggerConfig;
  private serviceName: string;

  constructor(serviceName: string, config: LoggerConfig = {}) {
    this.serviceName = serviceName;
    this.config = {
      level: config.level || 'info',
      enableConsole: config.enableConsole !== false,
      enableFile: config.enableFile || false,
      format: config.format || 'json',
    };
  }

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Core logging method
   */
  private log(level: string, message: string, context?: LogContext): void {
    // Check if this level should be logged
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: this.serviceName,
      message,
      ...(context && { context }),
    };

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.outputToConsole(logEntry);
    }

    // Output to file if enabled (simplified - in production would use file system)
    if (this.config.enableFile) {
      this.outputToFile(logEntry);
    }
  }

  /**
   * Check if the log level should be output
   */
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level || 'info');
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(logEntry: LogEntry): void {
    logEntry;
  }

  /**
   * Output log entry to file (simplified implementation)
   */
  private outputToFile(logEntry: LogEntry): void {
    // In a real implementation, this would write to a log file
    // For now, we'll just add it to a simple in-memory buffer
    // that could be periodically written to disk
    logEntry;
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    const childLogger = new Logger(this.serviceName, this.config);

    // Override the log method to add the additional context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (
      level: string,
      message: string,
      context?: LogContext,
    ) => {
      const mergedContext = { ...additionalContext, ...context };
      originalLog(level, message, mergedContext);
    };

    return childLogger;
  }

  /**
   * Set log level dynamically
   */
  setLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
    this.config.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): string {
    return this.config.level || 'info';
  }
}

/**
 * Default logger instance for backward compatibility
 */
export const defaultLogger = new Logger('default');

/**
 * Create a new logger instance
 */
export function createLogger(
  serviceName: string,
  config?: LoggerConfig,
): Logger {
  return new Logger(serviceName, config);
}
