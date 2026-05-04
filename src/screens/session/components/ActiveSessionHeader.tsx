import React from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import type { useTheme } from '../../../theme';

type ActiveSessionHeaderProps = {
  isPaused: boolean;
  onInterrupt: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
};

export function ActiveSessionHeader({
  isPaused,
  onInterrupt,
  theme,
}: ActiveSessionHeaderProps): JSX.Element {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      p="lg"
      pt="xl"
      style={{ zIndex: 2 }}
    >
      <Pressable
        accessibilityHint="Opens the session interruption confirmation."
        accessibilityLabel="End or abandon session"
        accessibilityRole="button"
        onPress={onInterrupt}
      >
        <Icon name="chevron-down" size="lg" color={theme.colors.text.secondary} />
      </Pressable>
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Box
          width={8}
          height={8}
          borderRadius="full"
          bg={isPaused ? 'warning.DEFAULT' : 'success.DEFAULT'}
        />
        <Text variant="caption" color="text.secondary">
          {isPaused ? 'Paused' : 'In Session'}
        </Text>
      </Box>
      <Box width={40} />
    </Box>
  );
}
