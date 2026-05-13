import React from 'react';
import { Box } from '../../components/primitives/Box';
import { Text } from '../../components/primitives/Text';

export function SessionSetupScreen(): React.JSX.Element {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text variant="h4">Session setup</Text>
    </Box>
  );
}

export default SessionSetupScreen;
