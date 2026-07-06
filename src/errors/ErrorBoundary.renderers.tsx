import React from 'react';
import { Box } from '../components/primitives/Box';
import { Text } from '../components/primitives/Text';
import { lightColors } from '@/theme/tokens/colors';

export function renderDegradedFallback(
  degradedFallback: React.ReactNode | undefined,
  children: React.ReactNode,
): React.ReactNode {
  if (degradedFallback) {
    return degradedFallback;
  }
  return (
    <Box flex={1} p="lg">
      <Box
        p="md"
        style={{
          backgroundColor: lightColors.warning[50],
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: lightColors.semantic.warning,
        }}
      >
        <Text variant="body" style={{ color: lightColors.semantic.warning }}>
          Running in limited mode. Some features may be unavailable.
        </Text>
      </Box>
      {children}
    </Box>
  );
}
