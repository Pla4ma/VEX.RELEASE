import React from 'react';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';

export function ActiveSessionScreen(): React.JSX.Element {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text variant="h4">Active session</Text>
    </Box>
  );
}

export default ActiveSessionScreen;
