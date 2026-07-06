import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { Text as VexText } from '../../../components/primitives/Text';
import type { Theme } from '../../../theme/types';

export function CompanionGrowthLoading({ theme }: { theme: Theme }): React.ReactElement {
  return (
    <Box
      mt={6}
      p={4}
      borderRadius="lg"
      bg={theme.colors.background.secondary}
    >
      <Box
        width={160}
        height={16}
        borderRadius="sm"
        bg={theme.colors.background.tertiary}
      />
      <Box
        mt={3}
        width="100%"
        height={10}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
      />
    </Box>
  );
}

export function CompanionGrowthError({
  theme,
  onRetry,
}: {
  theme: Theme;
  onRetry: () => void;
}): React.ReactElement {
  return (
    <Box
      mt={6}
      p={4}
      borderRadius="lg"
      bg={theme.colors.background.secondary}
    >
      <Text variant="label" color={theme.colors.error.DEFAULT}>
        Companion sync stumbled.
      </Text>
      <Text variant="caption" color={theme.colors.text.secondary} mt={1}>
        Your session is safe. Retry the companion growth sync.
      </Text>
      <Button variant="secondary"
        onPress={onRetry}
        style={{ marginTop: theme.spacing[3] }}
        accessibilityLabel="Retry loading"
        accessibilityRole="button"
        accessibilityHint="Double tap to activate"
      >
        <VexText>Retry</VexText>
      </Button>
    </Box>
  );
}

export function CompanionGrowthEmpty({ theme }: { theme: Theme }): React.ReactElement {
  return (
    <Box
      mt={6}
      p={4}
      borderRadius="lg"
      bg={theme.colors.background.secondary}
    >
      <Text variant="label" color={theme.colors.text.primary}>
        Companion is waiting for a profile.
      </Text>
    </Box>
  );
}
