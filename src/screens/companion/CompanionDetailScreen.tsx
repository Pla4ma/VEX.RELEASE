import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import React, { useCallback, useEffect, useState } from 'react';

import { Box, Button, Text } from '../../components/primitives';
import { loadCompanionState } from '../../features/companion/session-storage';
import type { CompanionState } from '../../features/companion/types';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';

type LoadState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
  | { status: 'success'; companion: CompanionState };

export function CompanionDetailScreen(): JSX.Element {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const load = useCallback(() => {
    if (!userId) {
      setLoadState({ status: 'empty' });
      return;
    }
    setLoadState({ status: 'loading' });
    loadCompanionState(userId)
      .then((companion) => setLoadState({ status: 'success', companion }))
      .catch((caught: unknown) => {
        setLoadState({
          status: 'error',
          error: caught instanceof Error ? caught : new Error(String(caught)),
        });
      });
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loadState.status === 'loading') {
    return (
      <Box flex={1} bg="background.primary" p="lg" justifyContent="center">
        <Box
          height={28}
          width={180}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
        <Box
          mt={4}
          height={120}
          borderRadius="lg"
          bg={theme.colors.background.secondary}
        />
      </Box>
    );
  }

  if (loadState.status === 'empty') {
    return (
      <Box flex={1} bg="background.primary" p="lg" justifyContent="center">
        <Text variant="h4" color="text.primary">
          Your companion needs an active profile.
        </Text>
      </Box>
    );
  }

  if (loadState.status === 'error') {
    return (
      <Box flex={1} bg="background.primary" p="lg" justifyContent="center">
        <Text variant="h4" color={theme.colors.error.DEFAULT}>
          Companion details did not load.
        </Text>
        <Text variant="body" color="text.secondary" mt={2}>
          VEX kept the session safe. Retry the companion profile.
        </Text>
        <Button
          variant="secondary"
          onPress={load}
          style={{ marginTop: theme.spacing[4] }}
          accessibilityLabel="Retry loading companion"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          Retry
        </Button>
      </Box>
    );
  }

  const { companion } = loadState;

  return (
    <Box flex={1} bg="background.primary" p="lg" justifyContent="center">
      <Text variant="label" color={theme.colors.primary[400]}>
        Living Companion
      </Text>
      <Text variant="h2" color="text.primary" mt={2}>
        {companion.currentMood}
      </Text>
      <Box
        mt={5}
        p={4}
        borderRadius="lg"
        bg={theme.colors.background.secondary}
      >
        <Text variant="h4" color="text.primary">
          {companion.phase} - Level {companion.level}
        </Text>
        <Text variant="body" color="text.secondary" mt={2}>
          {Math.floor(companion.totalFocusMinutes)} focus minutes together.
        </Text>
        <Text variant="caption" color="text.secondary" mt={2}>
          Element affinity {companion.elementAffinity}% - {companion.element}
        </Text>
      </Box>
    </Box>
  );
}

export default withScreenErrorBoundary(
  CompanionDetailScreen,
  'CompanionDetail',
);
