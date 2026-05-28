import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "../../../theme";
import { useFadeStyle, useScaleInStyle } from "./animations";
import { styles } from "./styles";
import type { EmptyStateProps } from "./types";

export function EmptyState({
  icon = "[ ]",
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
  testID,
}: EmptyStateProps): JSX.Element {
  const { theme } = useTheme();
  const fadeStyle = useFadeStyle(true, 300);
  const scaleStyle = useScaleInStyle(0.9);
  return (
    <Animated.View
      style={[styles.emptyContainer, style, fadeStyle, scaleStyle]}
      testID={testID}
    >
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[styles.emptySubtitle, { color: theme.colors.text.disabled }]}
        >
          {subtitle}
        </Text>
      ) : null}
      {actionLabel || secondaryActionLabel ? (
        <View style={styles.emptyActions}>
          {actionLabel && onAction ? (
            <Pressable
              onPress={onAction}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.colors.semantic.danger },
                pressed && { opacity: 0.8 },
              ]}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: theme.colors.text.inverse },
                ]}
              >
                {actionLabel}
              </Text>
            </Pressable>
          ) : null}
          {secondaryActionLabel && onSecondaryAction ? (
            <Pressable
              onPress={onSecondaryAction}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: theme.colors.background.tertiary },
                pressed && { opacity: 0.8 },
              ]}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.text.disabled },
                ]}
              >
                {secondaryActionLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}
