import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useFadeIn } from "../hooks/useReanimated";
import { Skeleton, SkeletonCard, SkeletonList } from "./Skeleton";
import { useTheme } from "../../../theme";
import { createSheet } from "@/shared/ui/create-sheet";
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  blur?: boolean;
  style?: ViewStyle;
}
export function LoadingOverlay({
  visible,
  message = "Loading...",
  progress,
  showProgress = false,
  blur = true,
  style,
}: LoadingOverlayProps) {
  const { theme } = useTheme();
  const fadeStyle = useFadeIn(300);
  const pulseStyle = usePulseAnimation();
  if (!visible) {
    return null;
  }
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.container,
          blur && { backgroundColor: theme.colors.background.overlay },
          fadeStyle,
          style,
        ]}
      >
        <View style={styles.content}>
          <Animated.View style={pulseStyle}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          </Animated.View>
          <Text
            style={[styles.message, { color: theme.colors.text.secondary }]}
          >
            {message}
          </Text>
          {showProgress && progress !== undefined && (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.border.DEFAULT },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, Math.max(0, progress))}%`,
                      backgroundColor: theme.colors.primary[500],
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.progressText,
                  { color: theme.colors.text.tertiary },
                ]}
              >
                {Math.round(progress)}%
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}
function usePulseAnimation() {
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      true,
    );
  }, [scale]);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}
interface SectionLoadingProps {
  type?: "text" | "card" | "chart" | "list";
  count?: number;
  style?: ViewStyle;
}
export function SectionLoading({
  type = "card",
  count = 3,
  style,
}: SectionLoadingProps) {
  switch (type) {
    case "text":
      return (
        <View style={[styles.sectionContainer, style]}>
          <Skeleton lines={count} height={16} spacing={8} />
        </View>
      );
    case "card":
      return (
        <View style={[styles.sectionContainer, style]}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} style={styles.sectionItem} />
          ))}
        </View>
      );
    case "chart":
      return (
        <View style={[styles.sectionContainer, style]}>
          <Skeleton variant="rounded" height={200} />
        </View>
      );
    case "list":
      return (
        <View style={[styles.sectionContainer, style]}>
          <SkeletonList count={count} />
        </View>
      );
    default:
      return null;
  }
}
interface ProgressIndicatorProps {
  progress: number;
  message?: string;
  submessage?: string;
  style?: ViewStyle;
}
export function ProgressIndicator({
  progress,
  message = "Processing...",
  submessage,
  style,
}: ProgressIndicatorProps) {
  const { theme } = useTheme();
  const fadeStyle = useFadeIn(300);
  return (
    <Animated.View
      style={[
        styles.progressOverlay,
        style,
        { backgroundColor: theme.colors.background.overlay },
        fadeStyle,
      ]}
    >
      <View style={styles.progressContent}>
        <View
          style={[
            styles.progressBarLarge,
            { backgroundColor: theme.colors.border.DEFAULT },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFillLarge,
              {
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: theme.colors.primary[500],
              },
            ]}
          />
        </View>
        <Text
          style={[styles.progressMessage, { color: theme.colors.text.primary }]}
        >
          {message}
        </Text>
        {submessage && (
          <Text
            style={[
              styles.progressSubmessage,
              { color: theme.colors.text.tertiary },
            ]}
          >
            {submessage}
          </Text>
        )}
        <Text
          style={[
            styles.progressPercentage,
            { color: theme.colors.primary[500] },
          ]}
        >
          {Math.round(progress)}%
        </Text>
      </View>
    </Animated.View>
  );
}
interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
}
export function ButtonLoading({ loading, children }: ButtonLoadingProps) {
  const { theme } = useTheme();
  if (!loading) {
    return <>{children}</>;
  }
  return (
    <View style={styles.buttonLoading}>
      <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      <Text
        style={[
          styles.buttonLoadingText,
          { color: theme.colors.text.tertiary },
        ]}
      >
        Processing...
      </Text>
    </View>
  );
}
const styles = createSheet({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { alignItems: "center", padding: 32 },
  message: { marginTop: 16, fontSize: 16, fontWeight: "500" },
  progressContainer: { marginTop: 16, width: 200 },
  progressBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: { marginTop: 8, fontSize: 12, textAlign: "center" },
  sectionContainer: { padding: 16 },
  sectionItem: { marginBottom: 12 },
  progressOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  progressContent: { width: "80%", maxWidth: 300, alignItems: "center" },
  progressBarLarge: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFillLarge: { height: "100%", borderRadius: 4 },
  progressMessage: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  progressSubmessage: { fontSize: 14, marginBottom: 8, textAlign: "center" },
  progressPercentage: { fontSize: 24, fontWeight: "700" },
  buttonLoading: { flexDirection: "row", alignItems: "center", gap: 8 },
  buttonLoadingText: { fontSize: 14 },
});
