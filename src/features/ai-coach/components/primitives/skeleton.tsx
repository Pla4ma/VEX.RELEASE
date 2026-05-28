import React, { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { skeletonStyles as styles } from "./skeleton-styles";
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  shimmer?: boolean;
}
export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 4,
  style,
  shimmer = true,
}: SkeletonProps) {
  const shimmerAnim = useSharedValue(0);
  useEffect(() => {
    shimmerAnim.value = shimmer
      ? withRepeat(
          withSequence(
            withTiming(1, { duration: 1500 }),
            withTiming(0, { duration: 1500 }),
          ),
          -1,
          false,
        )
      : 0;
  }, [shimmer, shimmerAnim]);
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -200 + shimmerAnim.value * 400 }],
  }));
  return (
    <View
      style={[
        styles.container,
        { width: width as ViewStyle["width"], height, borderRadius },
        style,
      ]}
    >
      {shimmer && <Animated.View style={[styles.shimmer, shimmerStyle]} />}
    </View>
  );
}
export function TextSkeleton({
  lines = 3,
  lastLineWidth = "60%",
}: {
  lines?: number;
  lastLineWidth?: string | number;
}) {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? lastLineWidth : "100%"}
          style={styles.textLine}
        />
      ))}
    </View>
  );
}
export function CardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <Skeleton width={120} height={16} style={styles.headerLine} />
          <Skeleton width={80} height={12} />
        </View>
      </View>
      <TextSkeleton lines={3} />
      <Skeleton
        width="100%"
        height={44}
        borderRadius={8}
        style={styles.button}
      />
    </View>
  );
}
export function PersonaSelectorSkeleton() {
  return (
    <View style={styles.personaContainer}>
      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.personaCard}>
          <Skeleton width={64} height={64} borderRadius={32} />
          <Skeleton width={100} height={16} style={styles.personaName} />
          <Skeleton width={140} height={12} />
        </View>
      ))}
    </View>
  );
}
export function HistoryListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.listItem}>
          <Skeleton width={48} height={48} borderRadius={8} />
          <View style={styles.listContent}>
            <Skeleton width="70%" height={16} style={styles.listLine} />
            <Skeleton width="40%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}
export function StreakRiskSkeleton() {
  return (
    <View style={styles.streakContainer}>
      <Skeleton width="100%" height={200} borderRadius={16} />
      <View style={styles.streakContent}>
        <Skeleton
          width={120}
          height={32}
          borderRadius={16}
          style={styles.streakBadge}
        />
        <TextSkeleton lines={2} lastLineWidth="50%" />
        <Skeleton width="100%" height={48} borderRadius={8} />
      </View>
    </View>
  );
}
export function ComebackBannerSkeleton() {
  return (
    <View style={styles.comebackContainer}>
      <Skeleton
        width="100%"
        height={8}
        borderRadius={4}
        style={styles.progressBar}
      />
      <View style={styles.comebackContent}>
        <Skeleton width={80} height={24} borderRadius={12} />
        <TextSkeleton lines={2} />
        <Skeleton width="100%" height={44} borderRadius={8} />
      </View>
    </View>
  );
}
