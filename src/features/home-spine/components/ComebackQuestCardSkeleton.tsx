import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { useTheme } from '../../../theme';

export function ComebackQuestCardSkeleton(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box
      mx="lg"
      mb="md"
      p="lg"
      borderRadius="xl"
      bg={theme.colors.background.tertiary}
    >
      <Box
        height={20}
        width="60%"
        bg={theme.colors.background.secondary}
        borderRadius="sm"
      />
      <Box
        height={16}
        width="80%"
        bg={theme.colors.background.secondary}
        borderRadius="sm"
        mt="sm"
      />
      <Box
        height={8}
        width="100%"
        bg={theme.colors.background.secondary}
        borderRadius="full"
        mt="md"
      />
    </Box>
  );
}
