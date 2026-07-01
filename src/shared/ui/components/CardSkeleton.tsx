const sizeStyles: Record<CardSize, ViewStyle> = {
    sm: { padding: 12, borderRadius: 12 },
    md: { padding: 16, borderRadius: 16 },
    lg: { padding: 20, borderRadius: 20 },
  };

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Skeleton } from '../state-components/skeleton';
import type { CardVariant, CardSize } from './InteractiveCardTypes';
import { cardStyles as styles } from './InteractiveCardStyles';

export const CardSkeleton: React.ComponentType<{
  variant?: CardVariant;
  size?: CardSize;
  lines?: number;
  hasIcon?: boolean;
  style?: ViewStyle;
}> = ({ size = 'md', lines = 2, hasIcon = true, style }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        sizeStyles[size],
        { backgroundColor: theme.colors.background.secondary },
        style,
      ]}
    >
      <View style={styles.skeletonRow}>
        {hasIcon && (
          <Skeleton variant="avatar" width={48} height={48} circle />
        )}
        <View style={styles.skeletonLines}>
          {Array(lines)
            .fill(null)
            .map((_, i) => (
              <Skeleton
                key={_.id}
                variant="text"
                width={i === 0 ? '70%' : '50%'}
                height={16}
                style={{ marginTop: i > 0 ? 8 : 0 }}
              />
            ))}
        </View>
      </View>
    </View>
  );
};