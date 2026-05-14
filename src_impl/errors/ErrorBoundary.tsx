/**
 * Error Boundary
 *
 * Production-grade error boundary with:
 * - Retry logic with exponential backoff
 * - Error categorization and handling
 * - Degraded state support
 * - Analytics integration
 * - Rich UI states (loading, error, retry, degraded)
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import { Box } from '../components/primitives';
import { Text } from '../components/primitives';
import { Button } from '../components';
import { useTheme } from '../theme';
import { createDebugger } from '../utils/debug';
import { getAnalyticsService } from '../analytics/AnalyticsService';

const debug = createDebugger('error');

/**
 * Error categories for handling strategy
 */
export type ErrorCategory = 'network' | 'auth' | 'validation' | 'server' | 'client' | 'unknown';

/**
 * Error state with retry tracking
 */
export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  category: ErrorCategory;
  retryCount: number;
  isRetrying: boolean;
  lastRetryAt: number | null;
  degraded: boolean;
}

/**
 * Error boundary props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  degradedFallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, category: ErrorCategory) => void;
  onReset?: () => void | Promise<void>;
  onDegraded?: () => ReactNode;
  maxRetries?: number;
  retryDelay?: number;
  allowDegraded?: boolean;
}

/**
 * Categorize error for handling strategy
 */
function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'network';
  }
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('token')) {
    return 'auth';
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation';
  }
  if (message.includes('server') || message.includes('500') || message.includes('503')) {
    return 'server';
  }
  if (name.includes('error') && !name.includes('reference') && !name.includes('type')) {
    return 'client';
  }
  return 'unknown';
}

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(attempt: number, baseDelay: number): number {
  const exponential = Math.pow(2, attempt) * baseDelay;
  const jitter = Math.random() * 1000;
  return Math.min(exponential + jitter, 30000);
}

/**
 * Error boundary component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorState> {
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      category: 'unknown',
      retryCount: 0,
      isRetrying: false,
      lastRetryAt: null,
      degraded: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    const category = categorizeError(error);
    return {
      hasError: true,
      error,
      category,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { category } = this.state;

    debug.error('ErrorBoundary caught error: ' + error.message, error);
    debug.debug('Component stack: %s', errorInfo.componentStack);

    // Report to analytics
    this.reportError(error, errorInfo, category);

    // Call error handler
    this.props.onError?.(error, errorInfo, category);

    // Auto-retry for retryable errors
    if (this.shouldAutoRetry(category)) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  private shouldAutoRetry(category: ErrorCategory): boolean {
    const { maxRetries = 3 } = this.props;
    return category === 'network' && this.state.retryCount < maxRetries;
  }

  private scheduleRetry(): void {
    const { retryDelay = 1000 } = this.props;
    const delay = calculateRetryDelay(this.state.retryCount, retryDelay);

    debug.debug('Scheduling retry in %dms', delay);

    this.retryTimer = setTimeout(() => {
      this.handleRetry();
    }, delay);
  }

  private reportError(error: Error, errorInfo: ErrorInfo, category: ErrorCategory): void {
    const analytics = getAnalyticsService();

    analytics.track('error', {
      error: error.message,
      category,
      stack: __DEV__ ? (error.stack ?? undefined) : undefined,
      componentStack: errorInfo.componentStack,
      fatal: category === 'client',
    });

    if (__DEV__) {
      debug.debug('🔴 Error Report');
      debug.debug('Category: %s', category);
      debug.debug('Error: %s', error.message);
      debug.debug('Stack: %s', error.stack);
      debug.debug('Component Stack: %s', errorInfo.componentStack);
      debug.debug('Retry Count: %d', this.state.retryCount);
    }
  }

  private handleRetry = async (): Promise<void> => {
    const { maxRetries = 3, onReset } = this.props;
    const { retryCount, category } = this.state;

    if (retryCount >= maxRetries) {
      debug.warn('Max retries reached, entering degraded mode');
      this.setState({ degraded: true, isRetrying: false });
      return;
    }

    this.setState({ isRetrying: true, lastRetryAt: Date.now() });

    try {
      // Call reset handler
      if (onReset) {
        await onReset();
      }

      // Clear error state
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false,
        retryCount: retryCount + 1,
      });

      debug.info('Retry successful after %d attempts', retryCount + 1);
    } catch (retryError) {
      debug.error('Retry failed:', retryError as Error);

      this.setState({
        isRetrying: false,
        retryCount: retryCount + 1,
        error: retryError as Error,
      });

      // Schedule another retry if still retryable
      if (this.shouldAutoRetry(category)) {
        this.scheduleRetry();
      } else if (retryCount + 1 >= maxRetries) {
        this.setState({ degraded: true });
      }
    }
  };

  private handleDegradedContinue = (): void => {
    this.setState({ degraded: true, hasError: false });
  };

  private renderErrorUI(): ReactNode {
    const { fallback, maxRetries = 3, allowDegraded = true } = this.props;
    const { error, category, retryCount, isRetrying, degraded } = this.state;

    // Custom fallback
    if (fallback) {
      return fallback;
    }

    // Degraded mode
    if (degraded && allowDegraded) {
      return this.renderDegradedUI();
    }

    const canRetry = retryCount < maxRetries && category !== 'client';
    const isRecoverable = category === 'network' || category === 'server';

    return <ErrorFallback error={error} category={category} retryCount={retryCount} maxRetries={maxRetries} isRetrying={isRetrying} canRetry={canRetry} isRecoverable={isRecoverable} onRetry={this.handleRetry} onDegraded={allowDegraded ? this.handleDegradedContinue : undefined} />;
  }

  private renderDegradedUI(): ReactNode {
    if (this.props.degradedFallback) {
      return this.props.degradedFallback;
    }
    return (
      <Box flex={1} p="lg">
        <Box
          p="md"
          style={{
            backgroundColor: '#fef3c7',
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: '#f59e0b',
          }}
        >
          <Text variant="body" style={{ color: '#92400e' }}>
            Running in limited mode. Some features may be unavailable.
          </Text>
        </Box>
        {this.props.children}
      </Box>
    );
  }

  render(): ReactNode {
    if (this.state.hasError && !this.state.degraded) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

/**
 * Error fallback UI component
 */
interface ErrorFallbackProps {
  error: Error | null;
  category: ErrorCategory;
  retryCount: number;
  maxRetries: number;
  isRetrying: boolean;
  canRetry: boolean;
  isRecoverable: boolean;
  onRetry: () => void;
  onDegraded?: () => void;
}

function ErrorFallback({ error, category, retryCount, maxRetries, isRetrying, canRetry, isRecoverable, onRetry, onDegraded }: ErrorFallbackProps): JSX.Element {
  const theme = useTheme();

  const getErrorMessage = () => {
    switch (category) {
      case 'network':
        return 'Connection lost. Check your internet and try again.';
      case 'auth':
        return 'Session expired. Please sign in again.';
      case 'server':
        return 'Our servers are having issues. Please try again later.';
      case 'validation':
        return 'Invalid data. Please check your input.';
      case 'client':
        return 'An unexpected error occurred. Please restart the app.';
      default:
        return error?.message || 'Something went wrong';
    }
  };

  const getErrorIcon = () => {
    switch (category) {
      case 'network':
        return '📡';
      case 'auth':
        return '🔐';
      case 'server':
        return '🔧';
      case 'validation':
        return '⚠️';
      default:
        return '❌';
    }
  };

  return (
    <Box flex={1} justifyContent="center" alignItems="center" p="xl">
      <Text variant="hero" style={{ fontSize: 64, marginBottom: 16 }}>
        {getErrorIcon()}
      </Text>

      <Text variant="h3" mb="md" textAlign="center">
        Oops! Something went wrong
      </Text>

      <Text variant="body" style={{ color: '#6b7280', textAlign: 'center' }} mb="lg">
        {getErrorMessage()}
      </Text>

      {retryCount > 0 && (
        <Text variant="caption" style={{ color: '#9ca3af' }} mb="lg">
          Retry attempt {retryCount} of {maxRetries}
        </Text>
      )}

      {isRetrying ? (
        <Box flexDirection="row" alignItems="center" style={{ gap: 8 }}>
          <ActivityIndicator color="#3b82f6" />
          <Text variant="body" style={{ color: '#6b7280' }}>
            Retrying...
          </Text>
        </Box>
      ) : (
        <Box flexDirection="row" style={{ gap: 12 }}>
          {canRetry && (
            <Button variant="primary" onPress={onRetry} accessibilityLabel="Try Again button" accessibilityRole="button" accessibilityHint="Activates this control">
              Try Again
            </Button>
          )}
          {onDegraded && isRecoverable && (
            <Button variant="ghost" onPress={onDegraded} accessibilityLabel="Continue Anyway button" accessibilityRole="button" accessibilityHint="Activates this control">
              Continue Anyway
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

/**
 * Global error handler
 */
export function setupGlobalErrorHandler(): void {
  // Handle JS errors
  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    debug.error(isFatal ? 'Fatal Error' : 'Error', error);

    // Report to error tracking
    if (__DEV__) {
      debug.debug('Global Error Handler');
      debug.debug('Error: %s', error.message);
      debug.debug('Stack: %s', error.stack);
      debug.debug('Is Fatal: %s', String(isFatal));
    }

    // Call original handler
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}

/**
 * Promise rejection handler
 */
export function setupRejectionHandler(): void {
  // Handle unhandled promise rejections
  // This is a no-op in React Native as it handles rejections differently
}
