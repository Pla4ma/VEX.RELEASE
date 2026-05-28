import React, { useEffect } from "react";
import { Pressable, Text } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "../../../theme";
import { useFadeStyle, useScaleInStyle } from "./animations";
import { styles } from "./styles";
import type { SuccessStateProps } from "./types";

export function SuccessState({
  icon = "OK",
  title,
  subtitle,
  autoDismiss = false,
  dismissDelay = 3000,
  onDismiss,
  actionLabel,
  onAction,
  style,
  testID,
}: SuccessStateProps): JSX.Element {
  const { theme } = useTheme();
  const fadeStyle = useFadeStyle(true, 200);
  const scaleStyle = useScaleInStyle(0.5);
  useEffect(() => {
    if (!autoDismiss || !onDismiss) {
      return undefined;
    }
    const timer = setTimeout(onDismiss, dismissDelay);
    return () => clearTimeout(timer);
  }, [autoDismiss, dismissDelay, onDismiss]);
  return (
    <Animated.View
      style={[styles.successContainer, style, fadeStyle, scaleStyle]}
      testID={testID}
    >
      <Text style={styles.successIcon}>{icon}</Text>
      <Text style={[styles.successTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.successSubtitle,
            { color: theme.colors.text.disabled },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.successButton,
            { backgroundColor: theme.colors.success.DEFAULT },
            pressed && { opacity: 0.8 },
          ]}
          accessibilityLabel="Interactive control"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text
            style={[
              styles.successButtonText,
              { color: theme.colors.text.inverse },
            ]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
