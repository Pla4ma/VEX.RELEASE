import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

interface CapacityIndicatorProps {
  current: number;
  max: number;
}

export function CapacityIndicator({
  current,
  max,
}: CapacityIndicatorProps): React.ReactNode {
  const { theme } = useTheme();
  const isFull = current >= max;

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      gap="sm"
      px="lg"
      py="md"
      borderRadius="lg"
      bg={
        isFull
          ? `${theme.colors.warning.DEFAULT}15`
          : theme.colors.background.secondary
      }
      borderWidth={1}
      borderColor={
        isFull ? theme.colors.warning.DEFAULT : theme.colors.border.light
      }
      mb="lg"
    >
      <Text fontSize={16}>{isFull ? '⚠️' : '📦'}</Text>
      <Box flex={1}>
        <Text
          variant="bodySmall"
          color={isFull ? 'warning.DEFAULT' : 'text.secondary'}
        >
          {isFull ? 'Vault Full!' : 'Vault Capacity'}
        </Text>
        <Box
          height={4}
          borderRadius="full"
          bg={theme.colors.background.tertiary}
          mt="xs"
          overflow="hidden"
        >
          <Box
            width={`${(current / max) * 100}%`}
            height="100%"
            borderRadius="full"
            bg={
              isFull ? theme.colors.warning.DEFAULT : theme.colors.primary[500]
            }
          />
        </Box>
      </Box>
      <Text
        variant="caption"
        color={isFull ? 'warning.DEFAULT' : 'text.secondary'}
      >
        {current}/{max}
      </Text>
    </Box>
  );
}
