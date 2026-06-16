/**
 * Error Fallback Component
 *
 * Displays a themed error UI with contextual messaging,
 * offline detection, and retry / go-back actions.
 */

import React from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives';
import { Button } from '../../../components';
import { useNetInfo } from '../../../network';

export interface ErrorFallbackProps {
  screenName: string;
  error: Error | null;
  onRetry: () => void;
  onGoBack?: () => void;
}

export function ErrorFallback({
  screenName,
  error,
  onRetry,
  onGoBack,
}: ErrorFallbackProps): React.ReactNode {
  const { theme } = useTheme();
  const { isOffline } = useNetInfo();

  const errorMessage = error?.message?.toLowerCase() ?? '';
  const message = isOffline
    ? 'You are offline. Please check your connection and try again.'
    : errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('timeout')
      ? 'Connection lost. Please check your internet and try again.'
      : errorMessage.includes('auth') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('token')
        ? 'Your session expired. Please sign in again.'
        : `We couldn't load ${screenName}. Please try again.`;

  const offlineNotice = isOffline ? ' Retry when reconnected.' : '';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing[6],
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: isOffline
            ? `${theme.colors.warning.DEFAULT}18`
            : `${theme.colors.error.DEFAULT}18`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: theme.spacing[6],
        }}
      >
        <Text
          variant="h3"
          style={{
            color: isOffline
              ? theme.colors.warning.DEFAULT
              : theme.colors.error.DEFAULT,
          }}
        >
          {isOffline ? '!' : '×'}
        </Text>
      </View>
      <Text
        variant="h3"
        color="text.primary"
        style={{ marginBottom: theme.spacing[3], textAlign: 'center' }}
      >
        {isOffline ? 'You are offline' : 'Something went wrong'}
      </Text>
      <Text
        variant="body"
        color="text.secondary"
        style={{
          marginBottom: theme.spacing[6],
          maxWidth: 280,
          lineHeight: 22,
          textAlign: 'center',
        }}
      >
        {message}
        {offlineNotice}
      </Text>
      <Button variant="primary"
        onPress={onRetry}
        style={{ width: '100%', maxWidth: 280 }}
        accessibilityLabel="Try again"
        accessibilityRole="button"
        accessibilityHint="Retries the screen operation"
      >
        Try Again
      </Button>
      {onGoBack && (
        <Button variant="ghost"
          onPress={onGoBack}
          style={{ width: '100%', maxWidth: 280, marginTop: theme.spacing[3] }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Navigates back to the previous screen"
        >
          Go Back
        </Button>
      )}
    </ScrollView>
  );
}
