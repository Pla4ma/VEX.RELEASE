/**
 * Screen Error Boundary
 *
 * Provides error boundary protection specifically for screen components
 * with graceful fallback UI and retry functionality.
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives';
import { Button } from '../../../components';
import { ErrorBoundary } from '../../../errors/ErrorBoundary';
import { OfflineEmptyState } from './EmptyState';
import { createSheet } from '@/shared/ui/create-sheet';
import { createDebugger } from '@/utils/debug';

const debug = createDebugger('ui:screen-error-boundary');

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Error Fallback Component
// ============================================================================

interface ErrorFallbackProps {
  screenName: string;
  error: Error | null;
  onRetry: () => void;
  onGoBack?: () => void;
}

function ErrorFallback({ screenName, error, onRetry, onGoBack }: ErrorFallbackProps): JSX.Element {
  const { theme } = useTheme();

  const getErrorMessage = () => {
    if (error?.message?.includes('network') || error?.message?.includes('offline')) {
      return 'Connection lost. Please check your internet and try again.';
    }
    if (error?.message?.includes('auth') || error?.message?.includes('unauthorized')) {
      return 'Your session expired. Please sign in again.';
    }
    return `We couldn't load ${screenName}. Please try again.`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.iconContainer}>
        <Text style={[styles.icon, { color: theme.colors.error.DEFAULT }]}>⚠️</Text>
      </View>

      <Text variant="h3" style={styles.title} textAlign="center">
        Something went wrong
      </Text>

      <Text
        variant="body"
        style={[styles.description, { color: theme.colors.text.secondary }]}
        textAlign="center"
      >
        {getErrorMessage()}
      </Text>

      {__DEV__ && error && (
        <View style={[styles.debugContainer, { backgroundColor: theme.colors.background.secondary }]}>
          <Text variant="caption" style={{ color: theme.colors.error.DEFAULT }}>
            {error.message}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <Button variant="primary" onPress={onRetry} style={styles.primaryAction}
  accessibilityLabel="Try Again button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          Try Again
        </Button>

        {onGoBack && (
          <Button variant="ghost" onPress={onGoBack} style={styles.secondaryAction}
  accessibilityLabel="Go Back button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            Go Back
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Screen Error Boundary Component
// ============================================================================

export class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, ScreenErrorState> {
  constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isOffline: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ScreenErrorState> {
    const isOffline =
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('offline') ||
      error.message.toLowerCase().includes('connection');

    return {
      hasError: true,
      error,
      isOffline,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { screenName, onError } = this.props;

    // Log to console in development
    if (__DEV__) {
      debug.error(`ScreenErrorBoundary:${screenName}`, error);
    }

    // Call error handler if provided
    onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      isOffline: false,
    });
  };

  private handleGoBack = (): void => {
    // This would typically use navigation, but we'll leave it to the parent
    // The parent can pass a custom onGoBack handler
  };

  render(): ReactNode {
    const { children, screenName, fallback, allowOffline } = this.props;
    const { hasError, error, isOffline } = this.state;

    // If no error, render children normally
    if (!hasError) {
      return children;
    }

    // Show offline state if applicable
    if (isOffline && allowOffline) {
      return (
        <OfflineEmptyState
          onAction={this.handleRetry}
          actionLabel="Retry Connection"
        />
      );
    }

    // Custom fallback if provided
    if (fallback) {
      return fallback;
    }

    // Default error fallback
    return (
      <ErrorFallback
        screenName={screenName}
        error={error}
        onRetry={this.handleRetry}
        onGoBack={this.handleGoBack}
      />
    );
  }
}

// ============================================================================
// Hook for functional components
// ============================================================================

export function useScreenError(screenName: string) {
  return {
    ErrorBoundary: ({ children, ...props }: Omit<ScreenErrorBoundaryProps, 'screenName'>) => (
      <ScreenErrorBoundary screenName={screenName} {...props}>
        {children}
      </ScreenErrorBoundary>
    ),
  };
}

// ============================================================================
// HOC for wrapping screen components
// ============================================================================

export function withScreenErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  screenName: string,
  options?: Omit<ScreenErrorBoundaryProps, 'children' | 'screenName'>
): React.ComponentType<P> {
  return function WithScreenErrorBoundary(props: P): JSX.Element {
    return (
      <ScreenErrorBoundary screenName={screenName} {...options}>
        <Component {...props} />
      </ScreenErrorBoundary>
    );
  };
}

// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 24,
    maxWidth: 280,
    lineHeight: 22,
  },
  debugContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    maxWidth: 280,
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  primaryAction: {
    width: '100%',
  },
  secondaryAction: {
    width: '100%',
  },
});

export default ScreenErrorBoundary;
