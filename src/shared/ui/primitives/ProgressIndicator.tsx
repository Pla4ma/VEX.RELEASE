import React from "react";
import { View, Text, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useFadeIn } from "../hooks/useReanimated";
import { useTheme } from "../../../theme";
import { progressStyles as styles } from "./loadingOverlay.styles";

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
