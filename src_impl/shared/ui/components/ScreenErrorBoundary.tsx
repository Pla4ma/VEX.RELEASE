/**
 * Screen Error Boundary
 *
 * Provides error boundary protection for screen components
 * with graceful fallback UI and retry functionality.
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { ScrollView } from 'react-native';

import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives';
import { Button } from '../../../components';
import { OfflineEmptyState } from './EmptyState';

export interface ScreenErrorBoundaryProps {
  children: ReactNode;
  screenName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  allowOffline?: boolean;
}

interface ScreenErrorState {
  hasError: boolean;
  error: Error | null;
  isOffline: boolean;
}

interface ErrorFallbackProps {
  screenName: string;
  error: Error | null;
  onRetry: () => void;
  onGoBack?: () => void;
}

function ErrorFallback({ screenName, error, onRetry, onGoBack }: ErrorFallbackProps): JSX.Element {
  const { theme } = useTheme();

  const message = error?.message?.includes('network') || error?.message?.includes('offline')
    ? 'Connection lost. Please check your internet and try again.'
    : error?.message?.includes('auth') || error?.message?.includes('unauthorized')
    ? 'Your session expired. Please sign in again.'
    : `We couldn't load ${screenName}. Please try again.`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
    >
      <Text fontSize={64} style={{ marginBottom: 24 }}>⚠️</Text>
      <Text variant="h3" textAlign="center" style={{ marginBottom: 12 }}>
        Something went wrong
      </Text>
      <Text
        variant="body"
        color="text.secondary"
        textAlign="center"
        style={{ marginBottom: 24, maxWidth: 280, lineHeight: 22 }}
      >
        {message}
      </Text>
      {__DEV__ && error && (
        <Text
          variant="caption"
          color="error.DEFAULT"
          style={{
            padding: 12,
            borderRadius: 8,
            marginBottom: 24,
            maxWidth: 280,
            backgroundColor: theme.colors.background.secondary,
          }}
        >
          {error.message}
        </Text>
      )}
      <Button variant="primary" onPress={onRetry} style={{ width: '100%', maxWidth: 280 }}
        accessibilityLabel="Try Again button"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
        Try Again
      </Button>
      {onGoBack && (
        <Button variant="ghost" onPress={onGoBack} style={{ width: '100%', maxWidth: 280, marginTop: 12 }}
          accessibilityLabel="Go Back button"
          accessibilityRole="button"
          accessibilityHint="Activates this control">
          Go Back
        </Button>
      )}
    </ScrollView>
  );
}

export class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, ScreenErrorState> {
  constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, isOffline: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ScreenErrorState> {
    const msg = error.message.toLowerCase();
    return {
      hasError: true,
      error,
      isOffline: msg.includes('network') || msg.includes('offline') || msg.includes('connection'),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
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
      return <OfflineEmptyState onAction={this.handleRetry} actionLabel="Retry Connection" />;
    }

    if (fallback) {
      return fallback;
    }

    return <ErrorFallback screenName={screenName} error={error} onRetry={this.handleRetry} />;
  }
}

export function withScreenErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string,
) {
  return function WithErrorBoundary(props: P): JSX.Element {
    return (
      <ScreenErrorBoundary screenName={screenName}>
        <WrappedComponent {...(props as P & React.PropsWithChildren<unknown>)} />
      </ScreenErrorBoundary>
    );
  };
}

const screenErrorContext = React.createContext<((error: Error) => void) | null>(null);

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

export default ScreenErrorBoundary;
