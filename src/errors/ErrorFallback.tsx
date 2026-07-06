import { useCallback, type ReactNode } from 'react';
import { Skeleton } from '../components/ui/Skeleton';
import { Box } from '../components/primitives/Box';
import { Text } from '../components/primitives/Text';
import { Button } from '../components/primitives/Button';
import { useTheme } from '../theme/ThemeContext';
import { Icon } from '../icons/components/Icon';
import { captureException } from '../config/sentry';
import type { ErrorFallbackProps, ErrorCategory } from './ErrorBoundary.types';
import { IS_DEVELOPMENT } from '../constants/app';

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
      return 'wifi-off';
    case 'auth':
      return 'lock';
    case 'server':
      return 'server';
    case 'validation':
      return 'alert-circle';
    case 'client':
      return 'alert-triangle';
    default:
      return 'alert-circle';
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
      // SAFETY: require() defers optional expo-updates native module access until recovery action.
      const { reloadAsync } = require('expo-updates');
      void reloadAsync();
    } catch (reloadError) {
      if (IS_DEVELOPMENT) { console.warn('[VEX] Reload failed:', reloadError); }
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
          backgroundColor: theme.colors.surface.card,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon
          name={getErrorIconName(category)}
          size={32}
          color={theme.colors.semantic.danger}
        />
      </Box>

      <Text
        variant="heading"
        color="textPrimary"
        mb="sm"
        textAlign="center"
      >
        {getErrorMessage(category, error)}
      </Text>

      <Text
        variant="body"
        color="textSecondary"
        mb="xl"
        textAlign="center"
      >
        {category === 'network'
          ? 'Make sure you have a stable connection.'
          : 'If this keeps happening, try restarting the app.'}
      </Text>

      {canRetry && (
        <Button
          variant="primary"
          onPress={onRetry}
          disabled={isRetrying}
          mb="md"
          accessibilityLabel="Retry the failed operation"
          accessibilityHint="Attempts to reload the content"
        >
          {isRetrying ? <Text fontWeight="700">Retrying...</Text> : <Text fontWeight="700">{`Retry${retryCount > 0 ? ` (${retryCount}/${maxRetries})` : ''}`}</Text>}
        </Button>
      )}

      {isRecoverable && onDegraded && (
        <Button
          variant="secondary"
          onPress={onDegraded}
          mb="md"
          accessibilityLabel="Continue in degraded mode"
          accessibilityHint="Loads the app with reduced functionality"
        >
          Continue Anyway
        </Button>
      )}

      <Button
        variant="ghost"
        onPress={handleRestart}
        accessibilityLabel="Restart the app"
        accessibilityHint="Closes and reopens the app"
      >
        Restart App
      </Button>

      {IS_DEVELOPMENT && error && (
        <Box mt="xl" p="md" style={{ backgroundColor: theme.colors.surface.input, borderRadius: 8, maxWidth: '100%' }}>
          <Text variant="caption" color="textSecondary" numberOfLines={10}>
            {error.message}
            {'\n'}
            {error.stack}
          </Text>
        </Box>
      )}
    </Box>
  );
}
