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

export * from "./ErrorBoundary.types";
export * from "./ErrorBoundary.types";
export * from "./ErrorBoundary.part1";
export * from "./ErrorBoundary.part2";
