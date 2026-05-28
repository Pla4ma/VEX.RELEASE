import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "../../../theme";
import { useFadeStyle } from "./animations";
import { Skeleton } from "./skeleton";
import { styles } from "./styles";
import type { LoadingStateProps } from "./types";

export function LoadingState({
  message = "Loading...",
  submessage,
  progress,
  showProgress = false,
  size = "large",
  variant = "spinner",
  skeletonItems = 3,
  style,
  testID,
}: LoadingStateProps): JSX.Element {
  const { theme } = useTheme();
  const fadeStyle = useFadeStyle(true, 200);
  if (variant === "skeleton") {
    return (
      <Animated.View
        style={[styles.container, style, fadeStyle]}
        testID={testID}
      >
        <Skeleton variant="list" count={skeletonItems} />
      </Animated.View>
    );
  }
  return (
    <Animated.View style={[styles.container, style, fadeStyle]} testID={testID}>
      {variant === "progress" && showProgress && progress !== undefined ? (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBarBackground,
              { backgroundColor: theme.colors.background.tertiary },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  backgroundColor: theme.colors.semantic.danger,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.progressText, { color: theme.colors.text.disabled }]}
          >
            {Math.round(progress)}%
          </Text>
        </View>
      ) : (
        <ActivityIndicator
          size={size}
          color={theme.colors.semantic.danger}
          style={styles.spinner}
        />
      )}
      <Text
        style={[styles.loadingMessage, { color: theme.colors.text.primary }]}
      >
        {message}
      </Text>
      {submessage ? (
        <Text
          style={[
            styles.loadingSubmessage,
            { color: theme.colors.text.disabled },
          ]}
        >
          {submessage}
        </Text>
      ) : null}
    </Animated.View>
  );
}
