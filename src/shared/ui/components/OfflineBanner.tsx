import React, { useEffect, useState, useCallback } from "react";
import { View, Pressable, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { capture } from "../../analytics";
import { FeatureEvents } from "../../analytics/analytics-events";
import { createSheet } from "@/shared/ui/create-sheet";
const DISMISS_DURATION = 30 * 1000;
export interface OfflineBannerProps {
  message?: string;
  onDismiss?: () => void;
  onReappear?: () => void;
}
export function OfflineBanner({
  message = "You're offline. Sessions will sync when reconnected.",
  onDismiss,
  onReappear,
}: OfflineBannerProps): JSX.Element | null {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [dismissTimer, setDismissTimer] = useState<NodeJS.Timeout | null>(null);
  const slideAnim = useSharedValue(-100);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      if (!connected) {
        capture(FeatureEvents.NETWORK_STATUS_CHANGED, {
          is_connected: false,
          connection_type: state.type,
        });
      }
    });
    NetInfo["fetch"]().then((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => {
      unsubscribe();
      if (dismissTimer) {
        clearTimeout(dismissTimer);
      }
    };
  }, [dismissTimer]);
  useEffect(() => {
    const shouldShow = !isConnected && !isDismissed;
    if (shouldShow) {
      slideAnim.value = withSpring(0, { damping: 15, stiffness: 150 });
    } else {
      slideAnim.value = withTiming(-100, { duration: 250 });
    }
  }, [isConnected, isDismissed, slideAnim]);
  useEffect(() => {
    if (isDismissed && !isConnected) {
      const timer = setTimeout(() => {
        setIsDismissed(false);
        onReappear?.();
      }, DISMISS_DURATION);
      setDismissTimer(timer);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isConnected, isDismissed, onReappear]);
  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));
  if (isConnected === null) {
    return null;
  }
  const shouldShow = !isConnected && !isDismissed;
  if (!shouldShow) {
    return null;
  }
  const rgaOverlay = `${theme.colors.text.inverse}33`;
  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top,
          paddingTop: insets.top > 0 ? 8 : 0,
          backgroundColor: colors.semantic.danger,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.content, { paddingTop: insets.top > 0 ? 48 : 12 }]}>
        <View style={[styles.iconContainer, { backgroundColor: rgaOverlay }]}>
          <Text style={styles.icon}>📡</Text>
        </View>
        <Text
          variant="bodySmall"
          color="text.inverse"
          style={styles.message}
          numberOfLines={2}
        >
          {message}
        </Text>
        <Pressable
          onPress={handleDismiss}
          style={({ pressed }) => [
            styles.dismissButton,
            { backgroundColor: rgaOverlay },
            pressed && { opacity: 0.8 },
          ]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Dismiss offline banner"
          accessibilityRole="button"
          accessibilityHint="Dismisses the offline notification"
        >
          <Text
            style={[styles.dismissText, { color: theme.colors.text.inverse }]}
          >
            ✕
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
const styles = createSheet({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 14 },
  message: { flex: 1, fontWeight: "600" },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissText: { fontSize: 14, fontWeight: "700" },
});
export default OfflineBanner;
