import React from 'react';
import { View } from 'react-native';
import { SkeletonItem } from '../../ui/components/SkeletonItem';
import { useTheme } from '../../../theme/ThemeContext';
import { PREMIUM_BENEFITS } from './paywall-data';

export function VipPaywallSkeleton(): React.ReactNode {
  const { theme } = useTheme();
  const spacing = theme.spacing;

  return (
    <View style={{ gap: spacing[3] }}>
      <View style={{ padding: spacing[4], borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.background.secondary }}>
        <SkeletonItem variant="title" width="60%" style={{ marginBottom: spacing[2] }} />
        <SkeletonItem variant="text" width="40%" />
      </View>
      <View style={{ padding: spacing[4], borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.background.secondary }}>
        <SkeletonItem variant="title" width="50%" style={{ marginBottom: spacing[2] }} />
        <SkeletonItem variant="text" width="35%" />
      </View>
      <View style={{ gap: spacing[3] }}>
        {PREMIUM_BENEFITS.map(([title]) => (
          <View
            key={title}
            style={{ padding: spacing[4], borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.background.secondary }}
          >
            <SkeletonItem variant="title" width="55%" style={{ marginBottom: spacing[2] }} />
            <SkeletonItem variant="text" width="80%" />
          </View>
        ))}
      </View>
    </View>
  );
}
