import React from 'react';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';

export function OfflineBanner(): React.ReactNode {
  return (
    <Box
      bg="warning.light"
      px="sm"
      py="xs"
      alignItems="center"
      accessibilityLabel="You are offline. Data will sync when connection returns."
      accessibilityRole="alert"
    >
      <Text variant="caption" color="text.primary">
        You are offline. Data will sync when connection returns.
      </Text>
    </Box>
  );
}
