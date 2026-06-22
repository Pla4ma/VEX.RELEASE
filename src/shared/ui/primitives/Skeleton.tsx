import React from 'react';
import { View, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { createSheet } from '@/shared/ui/create-sheet';
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  mt?: number;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  lines?: number;
  spacing?: number;
  style?: ViewStyle;
  animated?: boolean;
}
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
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const shimmerValue = useSharedValue(0);
  React.useEffect(() => {
    if (animated) {
      if (reducedMotion) {
        shimmerValue.value = 0;
        return;
      }
      shimmerValue.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false,
      );
    }
    // shimmerValue is a stable useSharedValue ref
    // eslint-disable-next-line react-doctor/exhaustive-deps
  }, [animated, reducedMotion]);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(shimmerValue.value, [0, 1], [-200, 200]) },
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
    const lineKey = `skeleton-line-${lines}-${index}`;
    return (
      <View
        key={lineKey}
        style={[
          styles.skeleton,
          {
            width: lineWidth as DimensionValue,
            height,
            borderRadius: borderRadius ?? getBorderRadius(),
            marginTop: mt,
            marginBottom: Number(lineKey.split('-')[2]) < lines - 1 ? spacing : 0,
            backgroundColor: theme.colors.background.tertiary,
          },
          style,
        ]}
      >
        {animated && (
          <Animated.View
            style={[
              styles.shimmer,
              { backgroundColor: theme.colors.background.elevated },
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
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { height, backgroundColor: theme.colors.background.secondary },
        style,
      ]}
    >
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
  const { theme } = useTheme();
  // Precompute random heights to avoid hydration mismatch
  const barHeights = Array.from({ length: 7 }, () =>
    Math.random() * height * 0.6 + height * 0.2,
  );
  return (
    <View
      style={[
        styles.chart,
        { height, backgroundColor: theme.colors.background.secondary },
      ]}
    >
      <View style={styles.chartBars}>
        {barHeights.map((h, index) => (
          <Skeleton
            key={`bar-${index}`}
            width={30}
            height={h}
            variant="rounded"
          />
        ))}
      </View>
    </View>
  );
}
const styles = createSheet({
  container: { overflow: 'hidden' },
  skeleton: { overflow: 'hidden', position: 'relative' },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    width: 100,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardContent: { flex: 1, marginLeft: 16, gap: 8 },
  cardTitle: { marginBottom: 8 },
  list: { gap: 12 },
  listItem: { marginBottom: 8 },
  chart: { borderRadius: 12, padding: 16 },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
});
