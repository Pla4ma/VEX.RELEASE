import { useCallback, type ReactNode } from 'react';
import { Skeleton } from '../components/ui/Skeleton';
import { Box, Text } from '../components/primitives';
import { Button } from '../components';
import { useTheme } from '../theme';
import { Icon } from '../icons';
import { captureException } from '../config/sentry';
import type { ErrorFallbackProps, ErrorCategory } from './ErrorBoundary.types';

function getErrorMessage(category: ErrorCategory, error: Error | null): string {
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
}

function getErrorIconName(category: ErrorCategory): string {
  switch (category) {
    case 'network':
      return 'exclamation-circle';
    case 'auth':
      return 'logout';
    case 'server':
      return 'exclamation-triangle';
    case 'validation':
      return 'info';
    default:
      return 'x-circle';
  }
}

export function ErrorFallback({
  error,
  category,
  retryCount,
  maxRetries,
  isRetrying,
  canRetry,
  isRecoverable,
  onRetry,
  onDegraded,
}: ErrorFallbackProps): ReactNode {
  const { theme } = useTheme();

  const handleRestart = useCallback(() => {
    captureException(error ?? new Error('Fatal error requiring restart'), {
      extra: { category, component: 'ErrorBoundary', action: 'restart' },
    });
    try {
      const { reloadAsync } = require('expo-updates');
      void reloadAsync();
    } catch {
    }
  }, [category, error]);
  return (
    <Box flex={1} justifyContent="center" alignItems="center" p="xl">
      <Box
        mb="lg"
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.semantic.vexCyanSoft,
          borderColor: theme.colors.semantic.vexCyan,
          borderWidth: 1,
        }}
      >
        <Icon
          name={getErrorIconName(category)}
          size={28}
          color={theme.colors.semantic.vexCyan}
          variant="outline"
        />
      </Box>

      <Text variant="h3" mb="md" textAlign="center">
        Oops! Something went wrong
      </Text>

      <Text
        variant="body"
        color="text.secondary"
        textAlign="center"
        mb="lg"
      >
        {getErrorMessage(category, error)}
      </Text>

      {retryCount > 0 && (
        <Text
          variant="caption"
          color="text.tertiary"
          mb="lg"
        >
          Retry attempt {retryCount} of {maxRetries}
        </Text>
      )}

      {isRetrying ? (
        <Box flexDirection="row" alignItems="center" style={{ gap: 8 }}>
          <Skeleton width={16} height={16} variant="circular" />
          <Text variant="body" color="text.secondary">
            Retrying...
          </Text>
        </Box>
      ) : (
        <Box flexDirection="row" style={{ gap: 12 }}>
          {canRetry && (
            <Button
              <Text>variant="primary"</Text>
              onPress={onRetry}
              accessibilityLabel="Try again"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Try Again
            </Button>
          )}
          {onDegraded && isRecoverable && (
            <Button
              <Text>variant="ghost"</Text>
              onPress={onDegraded}
              accessibilityLabel="Continue anyway"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Continue Anyway
            </Button>
          )}
          {category === 'client' && (
            <Button
              <Text>variant="primary"</Text>
              onPress={handleRestart}
              accessibilityLabel="Restart app"
              accessibilityRole="button"
              accessibilityHint="Double tap to restart the application"
            >
              Restart App
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
