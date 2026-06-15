import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { Box, Text } from '../components/primitives/Box';
import { createDebugger } from '../utils/debug';
import { getAnalyticsService } from '../analytics/AnalyticsService';
import { lightColors } from '@/theme/tokens/colors';

import { categorizeError, calculateRetryDelay } from './ErrorBoundary.helpers';
import { ErrorFallback } from './ErrorFallback';
import type {
  ErrorBoundaryProps,
  ErrorState,
  ErrorCategory,
} from './ErrorBoundary.types';

const debug = createDebugger('error');

export type { ErrorCategory, ErrorState } from './ErrorBoundary.types';

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
    return { hasError: true, error, category, isRetrying: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { category } = this.state;
    debug.error('ErrorBoundary caught error: ' + error.message, error);
    debug.debug('Component stack: %s', errorInfo.componentStack);
    this.reportError(error, errorInfo, category);
    this.props.onError?.(error, errorInfo, category);
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

  private reportError(
    error: Error,
    errorInfo: ErrorInfo,
    category: ErrorCategory,
  ): void {
    // P1-16: Capture all uncaught errors in Sentry
    try {
      const Sentry = require('@sentry/react-native');
      Sentry.captureException(error, {
        tags: { errorBoundary: 'root', category },
        extra: { componentStack: errorInfo.componentStack },
      });
    } catch {
      // Sentry unavailable in Expo Go — non-critical
    }

    const analytics = getAnalyticsService();
    analytics.track('error', {
      error: error.message,
      category,
      stack: __DEV__ ? (error.stack ?? undefined) : undefined,
      componentStack: errorInfo.componentStack,
      fatal: category === 'client',
    });
    if (__DEV__) {
      debug.debug('Error Report');
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
      if (onReset) {
        await onReset();
      }
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false,
        retryCount: retryCount + 1,
      });
      debug.info('Retry successful after %d attempts', retryCount + 1);
    } catch (retryError) {
      const typedError =
        retryError instanceof Error ? retryError : new Error(String(retryError));
      debug.error('Retry failed:', typedError);
      this.setState({
        isRetrying: false,
        retryCount: retryCount + 1,
        error: typedError,
      });
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
    if (fallback) {
      return fallback;
    }
    if (degraded && allowDegraded) {
      return this.renderDegradedUI();
    }
    const canRetry = retryCount < maxRetries && category !== 'client';
    const isRecoverable = category === 'network' || category === 'server';
    return (
      <ErrorFallback
        error={error}
        category={category}
        retryCount={retryCount}
        maxRetries={maxRetries}
        isRetrying={isRetrying}
        canRetry={canRetry}
        isRecoverable={isRecoverable}
        onRetry={this.handleRetry}
        onDegraded={allowDegraded ? this.handleDegradedContinue : undefined}
      />
    );
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
            backgroundColor: lightColors.warning[50],
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: lightColors.semantic.warning,
          }}
        >
          <Text variant="body" style={{ color: lightColors.semantic.warning }}>
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
