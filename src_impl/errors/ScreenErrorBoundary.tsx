/**
 * Screen Error Boundary
 * 
 * Specialized error boundary for critical app screens with:
 * - Screen-specific error handling
 * - Graceful degradation paths
 * - Context-aware recovery options
 * - Screen state preservation
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { ErrorBoundary, type ErrorCategory } from './ErrorBoundary';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('screen-error-boundary');

// ============================================================================
// Screen-Specific Error Configuration
// ============================================================================

export interface ScreenErrorConfig {
  /** Screen name for error reporting */
  screenName: string;
  /** Whether this screen is critical to app flow */
  isCritical: boolean;
  /** Custom error messages for this screen */
  errorMessages?: Partial<Record<ErrorCategory, string>>;
  /** Recovery navigation target */
  recoveryTarget?: string;
  /** Whether to preserve screen state on error */
  preserveState?: boolean;
  /** Custom fallback component */
  fallback?: ReactNode;
}

export interface ScreenErrorBoundaryProps {
  children: ReactNode;
  config: ScreenErrorConfig;
  onError?: (error: Error, errorInfo: ErrorInfo, category: ErrorCategory) => void;
  onRecovery?: (target: string) => void;
}

interface ScreenErrorState {
  hasError: boolean;
  error: Error | null;
  category: ErrorCategory;
  retryCount: number;
  isRetrying: boolean;
  preservedState?: any;
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
      category: 'unknown',
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ScreenErrorState> {
    // Use the same categorization as the base ErrorBoundary
    const category = categorizeError(error);
    return {
      hasError: true,
      error,
      category,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { config, onError } = this.props;
    const { category } = this.state;

    debug.error(`Screen error in ${config.screenName}:`, error);
    debug.debug('Component stack:', errorInfo.componentStack);

    // Report to analytics with screen context
    this.reportScreenError(error, errorInfo, category);

    // Call screen-specific error handler
    onError?.(error, errorInfo, category);

    // Preserve state if configured
    if (config.preserveState) {
      this.setState({ preservedState: this.getPreservableState() });
    }
  }

  private reportScreenError(error: Error, errorInfo: ErrorInfo, category: ErrorCategory): void {
    const { config } = this.props;

    // In a real implementation, this would send to analytics service
    debug.info('Screen Error Report:', {
      screen: config.screenName,
      isCritical: config.isCritical,
      error: error.message,
      category,
      stack: __DEV__ ? error.stack : undefined,
      componentStack: errorInfo.componentStack,
    });
  }

  private getPreservableState(): any {
    // Extract state that can be preserved across error recovery
    // This would be customized per screen
    return {
      timestamp: Date.now(),
      // Add screen-specific state here
    };
  }

  private handleRetry = async (): Promise<void> => {
    const { config } = this.props;
    const { retryCount } = this.state;

    this.setState({ isRetrying: true });

    try {
      // Clear error state and increment retry count
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false,
        retryCount: retryCount + 1,
      });

      debug.info(`Screen ${config.screenName} retry successful`);
    } catch (retryError) {
      debug.error(`Screen ${config.screenName} retry failed:`, retryError);

      this.setState({
        isRetrying: false,
        retryCount: retryCount + 1,
        error: retryError as Error,
      });
    }
  };

  private handleRecovery = (): void => {
    const { config, onRecovery } = this.props;

    const target = config.recoveryTarget || 'Home';

    debug.info(`Navigating to recovery target: ${target}`);

    // Call recovery handler
    onRecovery?.(target);
  };

  private handleDegradedContinue = (): void => {
    const { config } = this.props;

    debug.info(`Continuing in degraded mode for ${config.screenName}`);

    this.setState({
      hasError: false,
      error: null,
    });
  };

  private getScreenErrorMessage(category: ErrorCategory): string {
    const { config } = this.props;

    // Use screen-specific error message if provided
    if (config.errorMessages?.[category]) {
      return config.errorMessages[category];
    }

    // Default to base error boundary messages
    switch (category) {
      case 'network':
        return `Can't connect to ${config.screenName}. Check your internet connection.`;
      case 'auth':
        return `Your session for ${config.screenName} has expired. Please sign in again.`;
      case 'server':
        return `${config.screenName} is temporarily unavailable. Please try again later.`;
      case 'validation':
        return `Invalid data for ${config.screenName}. Please check your input.`;
      case 'client':
        return `${config.screenName} encountered an unexpected error. Please restart the app.`;
      default:
        return `Something went wrong with ${config.screenName}.`;
    }
  }

  private renderErrorUI(): ReactNode {
    const { config } = this.props;
    const { error, category, retryCount, isRetrying } = this.state;

    // Use custom fallback if provided
    if (config.fallback) {
      return config.fallback;
    }

    return (
      <ScreenErrorFallback
        error={error}
        category={category}
        screenName={config.screenName}
        isCritical={config.isCritical}
        retryCount={retryCount}
        isRetrying={isRetrying}
        errorMessage={this.getScreenErrorMessage(category)}
        onRetry={this.handleRetry}
        onRecovery={this.handleRecovery}
        onDegraded={config.preserveState ? this.handleDegradedContinue : undefined}
      />
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

// ============================================================================
// Screen Error Fallback Component
// ============================================================================

interface ScreenErrorFallbackProps {
  error: Error | null;
  category: ErrorCategory;
  screenName: string;
  isCritical: boolean;
  retryCount: number;
  isRetrying: boolean;
  errorMessage: string;
  onRetry: () => void;
  onRecovery: () => void;
  onDegraded?: () => void;
}

function ScreenErrorFallback({
  error,
  category,
  screenName,
  isCritical,
  retryCount,
  isRetrying,
  errorMessage,
  onRetry,
  onRecovery,
  onDegraded,
}: ScreenErrorFallbackProps): React.ReactElement {
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

  const canRetry = category !== 'client' && retryCount < 3;
  const showDegraded = onDegraded && category !== 'client';

  return (
    <Box flex={1} justifyContent="center" alignItems="center" p="xl" style={{ backgroundColor: '#f8fafc' }}>
      <Box style={{ marginBottom: 24 }}>
        <Text variant="hero" style={{ fontSize: 64, textAlign: 'center' }}>
          {getErrorIcon()}
        </Text>
      </Box>

      <Box style={{ marginBottom: 16 }}>
        <Text variant="h3" style={{ textAlign: 'center', color: '#1e293b' }}>
          {isCritical ? 'Critical Error' : 'Something went wrong'}
        </Text>
        <Text variant="h4" style={{ textAlign: 'center', color: '#475569', marginTop: 4 }}>
          {screenName}
        </Text>
      </Box>

      <Box style={{ marginBottom: 24, maxWidth: 300 }}>
        <Text variant="body" style={{ textAlign: 'center', color: '#64748b', lineHeight: 22 }}>
          {errorMessage}
        </Text>
      </Box>

      {retryCount > 0 && (
        <Box style={{ marginBottom: 16 }}>
          <Text variant="caption" style={{ textAlign: 'center', color: '#94a3b8' }}>
            Retry attempt {retryCount} of 3
          </Text>
        </Box>
      )}

      {isRetrying ? (
        <Box flexDirection="row" alignItems="center" style={{ gap: 12 }}>
          <ActivityIndicator color="#3b82f6" />
          <Text variant="body" style={{ color: '#64748b' }}>
            Retrying...
          </Text>
        </Box>
      ) : (
        <Box flexDirection="column" alignItems="center" style={{ gap: 12 }}>
          {canRetry && (
            <Button
              variant="primary"
              onPress={onRetry}
              accessibilityLabel="Try Again button"
              accessibilityRole="button"
              accessibilityHint="Retries the screen operation"
            >
              Try Again
            </Button>
          )}
          
          <Button
            variant="ghost"
            onPress={onRecovery}
            accessibilityLabel="Go Back button"
            accessibilityRole="button"
            accessibilityHint="Navigates back to previous screen"
          >
            Go Back
          </Button>

          {showDegraded && (
            <Button
              variant="secondary"
              onPress={onDegraded}
              accessibilityLabel="Continue Anyway button"
              accessibilityRole="button"
              accessibilityHint="Continues in degraded mode"
            >
              Continue Anyway
            </Button>
          )}
        </Box>
      )}

      {isCritical && (
        <Box style={{ marginTop: 32, padding: 16, backgroundColor: '#fef2f2', borderRadius: 8 }}>
          <Text variant="caption" style={{ textAlign: 'center', color: '#dc2626' }}>
            This is a critical screen. If the error persists, please contact support.
          </Text>
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

// Reuse categorization from base ErrorBoundary
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

// Import Box and Text components - these would be from the design system
import { Box } from '../components/primitives';
import { Text } from '../components/primitives';
import { Button } from '../components';
import { ActivityIndicator } from 'react-native';