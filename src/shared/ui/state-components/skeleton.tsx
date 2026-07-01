import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { usePulseStyle } from './animations';
import { styles } from './styles';
import type { SkeletonProps } from './types';

export function Skeleton({
  variant = 'text',
  count = 1,
  width,
  height,
  circle = false,
  animated = true,
  style,
  testID,
}: SkeletonProps): React.ReactNode {
  const { theme } = useTheme();
  const pulseStyle = usePulseStyle(animated);
  const variantStyles: Record<
    NonNullable<SkeletonProps['variant']>,
    ViewStyle
  > = {
    card: { width: width ?? '100%', height: height ?? 120, borderRadius: 12 },
    list: { width: width ?? '100%', height: height ?? 60, borderRadius: 8 },
    text: { width: width ?? '80%', height: height ?? 16, borderRadius: 4 },
    avatar: {
      width: width ?? 48,
      height: height ?? 48,
      borderRadius: circle ? 24 : 8,
    },
    chip: { width: width ?? 80, height: height ?? 32, borderRadius: 16 },
  };
  return (
    <View style={[styles.skeletonContainer, style]} testID={testID}>
      {Array.from({ length: count }, (_, index) => (
        <Animated.View
          key={`item-${index}`}
          style={[
            styles.skeletonBase,
            { backgroundColor: theme.colors.background.tertiary },
            variantStyles[variant],
            { marginBottom: index < count - 1 ? 8 : 0 },
            pulseStyle,
          ]}
        />
      ))}
    </View>
  );
}
