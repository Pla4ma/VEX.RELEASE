import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Skeleton, SkeletonCard } from '../../../components/ui/Skeleton';
import { useTheme } from '../../../theme/ThemeContext';

export function SessionCompleteSkeleton(): React.ReactNode {
  const { theme } = useTheme();

  return (
    <Box
      flex={1}
      px="xl"
      py="2xl"
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      <Skeleton width="35%" height={theme.spacing[3]} />
      <Box mt="md">
        <Skeleton width="72%" height={theme.spacing[8]} />
      </Box>
      <Box mt="sm">
        <Skeleton width="88%" height={theme.spacing[4]} />
      </Box>
      <Box mt="xl">
        <SkeletonCard lines={3} height={theme.spacing[24]} />
      </Box>
      <Box mt="lg">
        <SkeletonCard lines={4} height={theme.spacing[24]} />
      </Box>
      <Box mt="lg">
        <SkeletonCard lines={2} height={theme.spacing[20]} />
      </Box>
    </Box>
  );
}
