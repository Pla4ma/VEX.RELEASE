import React, { useMemo } from "react";
import { View, ViewStyle, DimensionValue } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from "react-native-reanimated";
import { useTheme } from "../../../theme";


export const SkeletonItem: React.FC<SkeletonItemProps> = ({
  variant = 'text',
  width,
  height,
  circle = false,
  style,
}) => {
  const { theme } = useTheme();
  const shimmerValue = useSharedValue(0);

  // Start shimmer animation
  React.useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmerValue.value, [0, 0.5, 1], [0.6, 0.8, 0.6]),
  }));

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

  const borderRadius = circle || variant === 'avatar' || variant === 'circle'
    ? Math.max(Number(dimensions.width) || 0, dimensions.height) / 2
    : variant === 'button' ? 12 : 8;

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

export const CardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[4],
          gap: theme.spacing[3],
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', gap: theme.spacing[3], alignItems: 'center' }}>
        <SkeletonItem variant="avatar" />
        <View style={{ flex: 1, gap: theme.spacing[2] }}>
          <SkeletonItem variant="title" width="60%" />
          <SkeletonItem variant="text" width="40%" />
        </View>
      </View>
      <SkeletonItem variant="text" width="90%" />
      <SkeletonItem variant="text" width="75%" />
    </View>
  );
};

export const HeroSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius['2xl'],
          padding: theme.spacing[5],
          gap: theme.spacing[4],
        },
        style,
      ]}
    >
      <SkeletonItem variant="title" width="50%" height={32} />
      <SkeletonItem variant="text" width="80%" />
      <View style={{ flexDirection: 'row', gap: theme.spacing[4], marginTop: theme.spacing[2] }}>
        <SkeletonItem variant="circle" width={80} height={80} />
        <View style={{ flex: 1, justifyContent: 'center', gap: theme.spacing[2] }}>
          <SkeletonItem variant="text" width="60%" />
          <SkeletonItem variant="text" width="40%" />
        </View>
      </View>
    </View>
  );
};

export const ListSkeleton: React.FC<{ count?: number; style?: ViewStyle }> = ({
  count = 3,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[{ gap: theme.spacing[3] }, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
};

export const StatsSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: theme.spacing[3],
        },
        style,
      ]}
    >
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            flex: 1,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing[4],
            gap: theme.spacing[2],
          }}
        >
          <SkeletonItem variant="text" width="80%" />
          <SkeletonItem variant="title" width="60%" height={28} />
        </View>
      ))}
    </View>
  );
};