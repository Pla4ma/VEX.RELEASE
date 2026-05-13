import React from "react";
import { View, ViewStyle, DimensionValue } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, interpolate } from "react-native-reanimated";
import { createSheet } from "@/shared/ui/create-sheet";


export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius,
  mt,
  variant = 'text',
  lines = 1,
  spacing = 8,
  style,
  animated = true,
}: SkeletonProps) {
  const shimmerValue = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      shimmerValue.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    }
  }, [animated, shimmerValue]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(shimmerValue.value, [0, 1], [-200, 200]),
      },
    ],
  }));

  const getBorderRadius = () => {
    switch (variant) {
      case 'circular':
        return typeof height === 'number' ? height / 2 : 50;
      case 'rounded':
        return 8;
      case 'rectangular':
        return 0;
      case 'text':
      default:
        return 4;
    }
  };

  const renderLine = (index: number) => {
    const lineWidth =
      variant === 'text' && lines > 1 && index === lines - 1
        ? typeof width === 'number'
          ? width * 0.6
          : '60%'
        : width;

    return (
      <View
        key={index}
        style={[
          styles.skeleton,
          {
            width: lineWidth as DimensionValue,
            height,
            borderRadius: borderRadius ?? getBorderRadius(),
            marginTop: mt,
            marginBottom: index < lines - 1 ? spacing : 0,
          },
          style,
        ]}
      >
        {animated && (
          <Animated.View
            style={[
              styles.shimmer,
              shimmerStyle,
            ]}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: lines }).map((_, index) => renderLine(index))}
    </View>
  );
}

export function SkeletonCard({
  height = 120,
  style,
}: {
  height?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, { height }, style]}>
      <Skeleton width={60} height={60} variant="circular" />
      <View style={styles.cardContent}>
        <Skeleton width="70%" height={20} style={styles.cardTitle} />
        <Skeleton width="40%" height={16} />
      </View>
    </View>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={styles.listItem} />
      ))}
    </View>
  );
}

export function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <View style={[styles.chart, { height }]}>
      <View style={styles.chartBars}>
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton
            key={index}
            width={30}
            height={Math.random() * height * 0.6 + height * 0.2}
            variant="rounded"
          />
        ))}
      </View>
    </View>
  );
}