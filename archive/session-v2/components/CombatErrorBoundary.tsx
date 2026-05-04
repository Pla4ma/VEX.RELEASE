/**
 * Combat Error Boundary
 * 
 * Error boundary component for combat system.
 * Provides graceful error handling and recovery mechanisms.
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { Box, Button } from '../../components/primitives';

// ============================================================================
// Types
// ============================================================================

interface CombatErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface CombatErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

// ============================================================================
// Combat Error Boundary Component
// ============================================================================

export class CombatErrorBoundary extends Component<CombatErrorBoundaryProps, CombatErrorBoundaryState> {
  private maxRetries: number;

  constructor(props: CombatErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      retryCount: 0,
    };
    
    this.maxRetries = props.maxRetries || 3;
  }

  static getDerivedStateFromError(error: Error): Partial<CombatErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    console.error('Combat Error Boundary caught an error:', error, errorInfo);

    // Call error callback
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <CombatErrorUI 
        error={this.state.error}
        retryCount={this.state.retryCount}
        maxRetries={this.maxRetries}
        onRetry={this.handleRetry}
        onReset={this.handleReset}
      />;
    }

    return this.props.children;
  }
}

// ============================================================================
// Default Error UI Component
// ============================================================================

interface CombatErrorUIProps {
  error?: Error;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReset: () => void;
}

const CombatErrorUI: React.FC<CombatErrorUIProps> = ({
  error,
  retryCount,
  maxRetries,
  onRetry,
  onReset,
}) => {
  const { theme } = useTheme();

  const canRetry = retryCount < maxRetries;
  const errorType = getErrorType(error);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          maxWidth: 400,
        }}
      >
        {/* Error Icon */}
        <Text
          style={{
            fontSize: 48,
            marginBottom: 16,
          }}
        >
          {getErrorIcon(errorType)}
        </Text>

        {/* Error Title */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text.primary,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {getErrorTitle(errorType)}
        </Text>

        {/* Error Message */}
        <Text
          style={{
            fontSize: 14,
            color: theme.colors.text.secondary,
            marginBottom: 16,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          {getErrorMessage(errorType, error)}
        </Text>

        {/* Retry Count */}
        {retryCount > 0 && (
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.text.tertiary,
              marginBottom: 16,
            }}
          >
            Retry attempt {retryCount} of {maxRetries}
          </Text>
        )}

        {/* Action Buttons */}
        <Box flexDirection="row" gap={3}>
          {canRetry && (
            <Button
              variant="primary"
              onPress={onRetry}
              style={{ flex: 1 }}
            >
              Retry
            </Button>
          )}
          
          <Button
            variant="secondary"
            onPress={onReset}
            style={{ flex: 1 }}
          >
            {canRetry ? 'Skip' : 'Continue'}
          </Button>
        </Box>

        {/* Error Details (Debug) */}
        {__DEV__ && error && (
          <TouchableOpacity
            onPress={() => {
              console.log('Error details:', error);
            }}
            style={{
              marginTop: 16,
              padding: 8,
              backgroundColor: theme.colors.gray[800],
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: theme.colors.text.tertiary,
                fontFamily: 'monospace',
              }}
            >
              {error.name}: {error.message}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// Error Type Detection
// ============================================================================

function getErrorType(error?: Error): 'NETWORK' | 'PERMISSION' | 'VALIDATION' | 'SYSTEM' | 'UNKNOWN' {
  if (!error) return 'UNKNOWN';

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'NETWORK';
  }

  // Permission errors
  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'PERMISSION';
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || name.includes('validation')) {
    return 'VALIDATION';
  }

  // System errors
  if (message.includes('system') || message.includes('memory') || message.includes('timeout')) {
    return 'SYSTEM';
  }

  return 'UNKNOWN';
}

function getErrorIcon(errorType: string): string {
  const icons: Record<string, string> = {
    'NETWORK': '🌐',
    'PERMISSION': '🔒',
    'VALIDATION': '⚠️',
    'SYSTEM': '💻',
    'UNKNOWN': '❌',
  };

  return icons[errorType] || icons['UNKNOWN'];
}

function getErrorTitle(errorType: string): string {
  const titles: Record<string, string> = {
    'NETWORK': 'Connection Error',
    'PERMISSION': 'Permission Error',
    'VALIDATION': 'Validation Error',
    'SYSTEM': 'System Error',
    'UNKNOWN': 'Something Went Wrong',
  };

  return titles[errorType] || titles['UNKNOWN'];
}

function getErrorMessage(errorType: string, error?: Error): string {
  const messages: Record<string, string> = {
    'NETWORK': 'Please check your internet connection and try again.',
    'PERMISSION': 'You don\'t have permission to perform this action.',
    'VALIDATION': 'The provided data is invalid. Please try again.',
    'SYSTEM': 'A system error occurred. Please try again in a moment.',
    'UNKNOWN': 'An unexpected error occurred. Please try again.',
  };

  const baseMessage = messages[errorType] || messages['UNKNOWN'];

  // Add specific error message if available and not too technical
  if (error && error.message && !isTechnicalMessage(error.message)) {
    return `${baseMessage}\n\n${error.message}`;
  }

  return baseMessage;
}

function isTechnicalMessage(message: string): boolean {
  const technicalTerms = [
    'stack',
    'trace',
    'undefined',
    'null',
    'cannot read',
    'property',
    'function',
    'object',
    'array',
    'string',
    'number',
    'boolean',
  ];

  const lowerMessage = message.toLowerCase();
  return technicalTerms.some(term => lowerMessage.includes(term));
}

// ============================================================================
// Error Recovery Hook
// ============================================================================

export interface UseCombatErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
}

export function useCombatErrorRecovery(options: UseCombatErrorRecoveryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const retry = React.useCallback(async () => {
    if (retryCount >= maxRetries) {
      onMaxRetriesReached?.();
      return false;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    onRetry?.(retryCount + 1);

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, retryDelay));

    setIsRetrying(false);
    return true;
  }, [retryCount, maxRetries, retryDelay, onRetry, onMaxRetriesReached]);

  const reset = React.useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retryCount,
    isRetrying,
    canRetry: retryCount < maxRetries,
    retry,
    reset,
  };
}

// ============================================================================
// Error Reporting Service
// ============================================================================

export class CombatErrorReporting {
  private static instance: CombatErrorReporting;
  private errors: Array<{
    error: Error;
    errorInfo: React.ErrorInfo;
    timestamp: number;
    userId?: string;
    sessionId?: string;
  }> = [];

  static getInstance(): CombatErrorReporting {
    if (!CombatErrorReporting.instance) {
      CombatErrorReporting.instance = new CombatErrorReporting();
    }
    return CombatErrorReporting.instance;
  }

  reportError(
    error: Error,
    errorInfo: React.ErrorInfo,
    context?: {
      userId?: string;
      sessionId?: string;
    }
  ): void {
    this.errors.push({
      error,
      errorInfo,
      timestamp: Date.now(),
      ...context,
    });

    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // In production, this would send to error reporting service
    console.error('Combat error reported:', error, errorInfo, context);
  }

  getErrors(limit?: number): Array<{
    error: Error;
    errorInfo: React.ErrorInfo;
    timestamp: number;
    userId?: string;
    sessionId?: string;
  }> {
    return limit ? this.errors.slice(-limit) : [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: number;
  } {
    const totalErrors = this.errors.length;
    const errorsByType: Record<string, number> = {};
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentErrors = this.errors.filter(e => e.timestamp > oneHourAgo).length;

    for (const errorReport of this.errors) {
      const errorType = getErrorType(errorReport.error);
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
    }

    return {
      totalErrors,
      errorsByType,
      recentErrors,
    };
  }
}
