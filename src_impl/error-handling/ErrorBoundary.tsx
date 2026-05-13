/**
 * Error Boundary - Graceful Crash Recovery
 * Catches errors and provides recovery UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Sentry from '@sentry/react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      tags: { feature: 'error-boundary' },
      extra: { componentStack: errorInfo.componentStack },
    });
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: 'theme.colors.primary[500]',
        }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🛠️</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'theme.colors.primary[500]', marginBottom: 8 }}>Something went wrong</Text>
          <Text style={{ fontSize: 14, color: 'theme.colors.primary[500]', textAlign: 'center', marginBottom: 24 }}>
            Don&apos;t worry - your progress is safe. Try again.
          </Text>
          <Pressable
            onPress={this.handleRetry}
            style={({ pressed }) => ({
              backgroundColor: 'theme.colors.primary[500]',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
