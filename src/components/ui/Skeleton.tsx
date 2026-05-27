import React from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../../theme";
import { createSheet } from "@/shared/ui/create-sheet";
type SkeletonWidth = number | `${number}%` | "auto";
interface SkeletonProps {
  width?: SkeletonWidth;
  height?: number;
  borderRadius?: number;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  lines?: number;
  spacing?: number;
  animate?: boolean;
}
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  borderRadius,
  variant = "text",
  lines = 1,
  spacing = 8,
  animate = true,
}) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);
  React.useEffect(() => {
    opacity.value = animate
      ? withRepeat(
          withSequence(
            withTiming(0.6, { duration: 800 }),
            withTiming(0.3, { duration: 800 }),
          ),
          -1,
          true,
        )
      : 0.3;
  }, [animate, opacity]);
  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  const getBorderRadius = () => {
    if (borderRadius !== undefined) {
      return borderRadius;
    }
    switch (variant) {
      case "circular":
        return height / 2;
      case "rounded":
        return 8;
      case "rectangular":
        return 0;
      default:
        return 4;
    }
  };
  const renderLines = () => {
    const lineArray = Array.from({ length: lines }, (_, i) => i);
    return lineArray.map((_, index) => (
      <Animated.View
        key={index}
        style={[
          styles.skeleton,
          {
            width,
            height,
            borderRadius: getBorderRadius(),
            backgroundColor: theme.colors.surface.selected,
            marginBottom: index < lines - 1 ? spacing : 0,
          },
          animatedOpacityStyle,
        ]}
      />
    ));
  };
  return <View style={styles.container}>{renderLines()}</View>;
};
export const SkeletonCard: React.FC<{ lines?: number; height?: number }> = ({
  lines = 3,
  height = 120,
}) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [opacity]);
  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: theme.colors.semantic.surfaceGlass },
        animatedOpacityStyle,
      ]}
    >
      <View style={styles.cardHeader}>
        <Skeleton width={40} height={40} variant="circular" animate={false} />
        <View style={styles.cardHeaderText}>
          <Skeleton width={120} height={16} animate={false} />
          <Skeleton width={80} height={12} animate={false} />
        </View>
      </View>
      <View style={styles.cardContent}>
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? "80%" : "100%"}
            height={14}
            animate={false}
          />
        ))}
      </View>
    </Animated.View>
  );
};
export const SkeletonList: React.FC<{
  count?: number;
  itemHeight?: number;
}> = ({ count = 5, itemHeight = 72 }) => {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.listItem, { height: itemHeight }]}>
          <Skeleton width={48} height={48} variant="circular" />
          <View style={styles.listItemContent}>
            <Skeleton width={150} height={16} />
            <Skeleton width={100} height={12} />
          </View>
          <Skeleton width={60} height={24} variant="rounded" />
        </View>
      ))}
    </View>
  );
};
const styles = createSheet({
  container: { width: "100%" },
  skeleton: { overflow: "hidden" },
  card: { borderRadius: 12, padding: 16, marginVertical: 8 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardHeaderText: { marginLeft: 12, gap: 4 },
  cardContent: { gap: 8 },
  list: { gap: 8 },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  listItemContent: { flex: 1, gap: 4 },
});
