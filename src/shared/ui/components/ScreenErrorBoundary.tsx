/**
 * Screen Error Boundary
 *
 * Provides error boundary protection for screen components
 * with graceful fallback UI, retry functionality, Sentry reporting,
 * and offline detection.
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react';

import { OfflineEmptyState } from './EmptyState';
import { captureException } from '../../../config/sentry';
import { ErrorFallback } from './ErrorFallback';
import type {} from './ErrorFallback';

export { ErrorFallback }
export type { ErrorFallbackProps } from './ErrorFallback';

export interface ScreenErrorBoundaryProps {
  children: ReactNode;
  screenName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  allowOffline?: boolean;
  /** Feature tag for Sentry error grouping */
  featureTag?: string;
}

interface ScreenErrorState {
  hasError: boolean;
  error: Error | null;
  isOffline: boolean;
}

export class ScreenErrorBoundary extends Component<
  ScreenErrorBoundaryProps,
  ScreenErrorState
> {
  constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, isOffline: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ScreenErrorState> {
    const msg = error.message.toLowerCase();
    return {
      hasError: true,
      error,
      isOffline:
        msg.includes('network') ||
        msg.includes('offline') ||
        msg.includes('connection'),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { featureTag } = this.props;
    captureException(error, {
      tags: { feature: featureTag ?? 'screen-error-boundary' },
      extra: { componentStack: errorInfo.componentStack ?? '' },
    });
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, isOffline: false });
  };

  render(): ReactNode {
    const { children, screenName, fallback, allowOffline } = this.props;
    const { hasError, error, isOffline } = this.state;

    if (!hasError) {
      return children;
    }

    if (isOffline && allowOffline) {
      return (
        <OfflineEmptyState
          onAction={this.handleRetry}
          actionLabel="Retry Connection"
        />
      );
    }

    if (fallback) {
      return fallback;
    }

    return (
      <ErrorFallback
        screenName={screenName}
        error={error}
        onRetry={this.handleRetry}
      />
    );
  }
}

export function withScreenErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string,
): (props: P) => React.ReactNode {
  return function WithErrorBoundary(props: P): React.ReactNode {
    return (
      <ScreenErrorBoundary screenName={screenName}>
        <WrappedComponent
          {...(props as P & React.PropsWithChildren<unknown>)}
        />
      </ScreenErrorBoundary>
    );
  };
}

const screenErrorContext = React.createContext<((error: Error) => void) | null>(
  null,
);

export function useScreenError(): (error: Error) => void {
  const ctx = React.useContext(screenErrorContext);
  return (error: Error) => {
    if (ctx) {
      ctx(error);
    } else {
      throw error;
    }
  };
}
