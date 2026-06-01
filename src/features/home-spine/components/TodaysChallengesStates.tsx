import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export function ChallengesWidgetSkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box m="lg" p="lg" borderRadius="xl" bg={theme.colors.background.secondary}>
      <Box flexDirection="row" alignItems="center" gap="md" mb="md">
        <Box
          width={40}
          height={40}
          borderRadius="lg"
          bg={theme.colors.background.tertiary}
        />
        <Box gap="sm" flex={1}>
          <Box
            width={120}
            height={18}
            borderRadius="sm"
            bg={theme.colors.background.tertiary}
          />
          <Box
            width={80}
            height={12}
            borderRadius="sm"
            bg={theme.colors.background.tertiary}
          />
        </Box>
      </Box>
      {[1, 2, 3].map((i) => (
        <Box key={i} mb="sm" gap="xs">
          <Box
            width="100%"
            height={8}
            borderRadius="full"
            bg={theme.colors.background.tertiary}
          />
        </Box>
      ))}
    </Box>
  );
}

export function ChallengesEmptyState(): JSX.Element {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const hoursUntilReset = Math.floor(
    (midnight.getTime() - now.getTime()) / (1000 * 60 * 60),
  );
  const minutesUntilReset = Math.floor(
    ((midnight.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60),
  );
  return (
    <Box alignItems="center" gap="sm" py="md">
      <Text fontSize={32}>⏳</Text>
      <Text variant="bodySmall" color="text.secondary" textAlign="center">
        Challenges reset at midnight
      </Text>
      <Text variant="caption" color="text.tertiary">
        {hoursUntilReset}h {minutesUntilReset}m remaining
      </Text>
    </Box>
  );
}

export function ChallengesErrorState({
  onRetry,
}: {
  onRetry?: () => void;
}): JSX.Element {
  return (
    <Box alignItems="center" gap="md" py="md">
      <Text fontSize={32}>⚠️</Text>
      <Text variant="bodySmall" color="error.DEFAULT" textAlign="center">
        Couldn't load challenges
      </Text>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onPress={onRetry}
          accessibilityLabel="Retry loading challenges"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          Try Again
        </Button>
      ) : null}
    </Box>
  );
}
