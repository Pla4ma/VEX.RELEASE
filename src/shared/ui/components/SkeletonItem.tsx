import React, { useMemo } from 'react';
import { DimensionValue, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';

export type SkeletonVariant =
  | 'text'
  | 'title'
  | 'avatar'
  | 'card'
  | 'circle'
  | 'button';

export type SkeletonSize = 'sm' | 'md' | 'lg' | 'full';

export interface SkeletonItemProps {
  variant?: SkeletonVariant;
  width?: DimensionValue;
  height?: number;
  circle?: boolean;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonItem: React.ComponentType<SkeletonItemProps> = ({
  variant = 'text',
  width,
  height,
  circle = false,
  borderRadius: borderRadiusProp,
  style,
}) => {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const shimmerValue = useSharedValue(0);
  React.useEffect(() => {
    if (reducedMotion) {
      shimmerValue.value = 0;
      return;
    }
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true,
    );
  }, [shimmerValue, reducedMotion]);
  const animatedStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return { opacity: 0.6 };
    }
    return {
      opacity: interpolate(shimmerValue.value, [0, 0.5, 1], [0.6, 0.8, 0.6]),
    };
  });
  const dimensions = useMemo(() => {
    switch (variant) {
      case 'title':
        return { width: width ?? '70%', height: height ?? 24 };
      case 'avatar':
        return { width: width ?? 48, height: height ?? 48 };
      case 'card':
        return { width: width ?? '100%', height: height ?? 120 };
      case 'button':
        return { width: width ?? 120, height: height ?? 44 };
      case 'circle':
        return { width: width ?? 64, height: height ?? 64 };
      case 'text':
      default:
        return { width: width ?? '100%', height: height ?? 16 };
    }
  }, [variant, width, height]);
  const borderRadius =
    borderRadiusProp ??
    (circle || variant === 'avatar' || variant === 'circle'
      ? Math.max(Number(dimensions.width) || 0, dimensions.height) / 2
      : variant === 'button'
        ? 12
        : 8);
  return (
    <Animated.View
      style={[
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius,
          backgroundColor: theme.colors.background.tertiary,
        },
        animatedStyle,
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
    />
  );
};
