import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { Box } from '../../components/primitives/Box';
import { SkeletonItem } from '../../shared/ui/components/SkeletonItem';

export const PrivacySettingsSkeleton: React.ComponentType = () => {
  const { theme } = useTheme();

  return (
    <Box flex={1} style={{ padding: theme.spacing[4] }}>
      <SkeletonItem variant="title" style={{ marginBottom: theme.spacing[2] }} />
      <SkeletonItem variant="text" width="80%" style={{ marginBottom: theme.spacing[4] }} />
      <SkeletonItem variant="card" style={{ marginBottom: theme.spacing[4] }} />
      <SkeletonItem variant="card" style={{ marginBottom: theme.spacing[4] }} />
      <SkeletonItem variant="button" style={{ marginBottom: theme.spacing[3] }} />
      <SkeletonItem variant="button" />
    </Box>
  );
};
