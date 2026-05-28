import React from "react";
import { View, Text, ViewStyle, Modal, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useFadeIn } from "../hooks/useReanimated";
import { useTheme } from "../../../theme";
import { overlayStyles as styles } from "./loadingOverlay.styles";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  blur?: boolean;
  style?: ViewStyle;
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
