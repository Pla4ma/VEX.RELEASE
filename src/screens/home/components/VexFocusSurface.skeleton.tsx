import React from 'react';
import { View } from 'react-native';

import { Skeleton } from '../../../components/ui/Skeleton';
import { Card } from '../../../components/primitives/Card';
import { useTheme } from '../../../theme/ThemeContext';

/**
 * VexFocusSkeleton — solid card with skeleton lines.
 * Replaces a previous GlassCard wrapper; the loading state should match
 * the loaded state's chrome without paying the cost of frosted material.
 */
export function VexFocusSkeleton(): React.ReactNode {
  const { theme } = useTheme();
  return (
    <Card variant="default" size="lg">
      <View style={{ gap: theme.spacing[3] }}>
        <Skeleton width={96} height={12} borderRadius={999} />
        <Skeleton width="70%" height={32} borderRadius={14} />
        <Skeleton width="88%" height={14} />
        <Skeleton width="72%" height={14} />
      </View>
    </Card>
  );
}
