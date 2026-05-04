/**
 * Social System - Error State Component
 *
 * Production-grade error state with retry functionality.
 */

import React from 'react';
import { View } from 'react-native';
import { Text } from '../../components/primitives';
import { Button } from '../../components';
import { useTheme } from '../../theme';
import type { SocialError } from '../types';
import { createSheet } from '@/shared/ui/create-sheet';

interface SocialErrorStateProps {
  error: SocialError;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const SocialErrorState: React.FC<SocialErrorStateProps> = ({
  error,
  onRetry,
  fullScreen = false,
}) => {
  const { theme } = useTheme();

  const getErrorIcon = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'OFFLINE':
        return '📡';
      case 'AUTH_ERROR':
        return '🔐';
      case 'RATE_LIMITED':
        return '⏱️';
      case 'NOT_FOUND':
        return '🔍';
      default:
        return '⚠️';
    }
  };

  const getErrorTitle = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'OFFLINE':
        return 'Connection Lost';
      case 'AUTH_ERROR':
        return 'Session Expired';
      case 'RATE_LIMITED':
        return 'Slow Down';
      case 'NOT_FOUND':
        return 'Not Found';
      default:
        return 'Something Went Wrong';
    }
  };

  const getErrorMessage = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
      case 'OFFLINE':
        return 'Unable to connect to social feed. Check your connection and try again.';
      case 'AUTH_ERROR':
        return 'Your session has expired. Please sign in again.';
      case 'RATE_LIMITED':
        return "You're doing that too much. Please wait a moment.";
      case 'NOT_FOUND':
        return "The content you're looking for doesn't exist or was removed.";
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      <Text style={styles.icon}>{getErrorIcon()}</Text>
      <Text
        variant="h3"
        style={[styles.title, { color: theme.colors.text.primary }]}
      >
        {getErrorTitle()}
      </Text>
      <Text
        variant="body"
        style={[styles.message, { color: theme.colors.text.secondary }]}
      >
        {getErrorMessage()}
      </Text>
      {error.recoverable && onRetry && (
        <Button variant="primary" onPress={onRetry} style={styles.retryButton}
  accessibilityLabel="Try Again button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          Try Again
        </Button>
      )}
      {error.retryAfter && (
        <Text
          variant="caption"
          style={[styles.retryAfter, { color: theme.colors.text.muted }]}
        >
          Retry available in {error.retryAfter} seconds
        </Text>
      )}
    </View>
  );
};

const styles = createSheet({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  fullScreen: {
    flex: 1,
    minHeight: 400,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    maxWidth: 280,
  },
  retryButton: {
    marginTop: 16,
    minWidth: 120,
  },
  retryAfter: {
    marginTop: 8,
  },
});

export default SocialErrorState;
