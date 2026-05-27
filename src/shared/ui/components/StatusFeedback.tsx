import React, { useEffect } from "react";
import {
  View,
  ViewStyle,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme, type Theme } from "../../../theme";
import { triggerHaptic } from "../../../utils/haptics";
export type AsyncStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "retrying"
  | "offline";
export interface StatusFeedbackProps {
  status: AsyncStatus;
  message?: string;
  description?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "inline" | "banner" | "card";
  style?: ViewStyle;
  autoDismissSuccess?: boolean;
  autoDismissDelay?: number;
  showIcon?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}
const STATUS_CONFIG: Record<AsyncStatus, { icon: string; title: string }> = {
  idle: { icon: "", title: "" },
  loading: { icon: "⏳", title: "Loading" },
  retrying: { icon: "🔄", title: "Retrying" },
  success: { icon: "✓", title: "Success" },
  error: { icon: "✕", title: "Error" },
  offline: { icon: "📡", title: "Offline" },
};
const getStatusColor = (status: AsyncStatus, theme: Theme): string => {
  switch (status) {
    case "loading":
      return theme.colors.primary[500];
    case "retrying":
      return theme.colors.warning.dark;
    case "success":
      return theme.colors.success.dark;
    case "error":
      return theme.colors.error.dark;
    case "offline":
      return theme.colors.text.disabled;
    default:
      return "transparent";
  }
};
export const InlineStatus: React.FC<{
  status: AsyncStatus;
  message?: string;
  size?: "sm" | "md";
  style?: ViewStyle;
}> = ({ status, message, size = "sm", style }) => {
  const { theme } = useTheme();
  const config = STATUS_CONFIG[status];
  const color = getStatusColor(status, theme);
  if (status === "idle") {
    return null;
  }
  const sizeStyles = size === "sm" ? { fontSize: 12 } : { fontSize: 14 };
  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", gap: theme.spacing[1] },
        style,
      ]}
    >
      {" "}
      {status === "loading" || status === "retrying" ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Text style={[{ color, fontWeight: "700" }, sizeStyles]}>
          {config.icon}
        </Text>
      )}{" "}
      {message && (
        <Text
          variant={size === "sm" ? "caption" : "bodySmall"}
          color={
            status === "error"
              ? theme.colors.error.DEFAULT
              : theme.colors.text.secondary
          }
        >
          {" "}
          {message}{" "}
        </Text>
      )}{" "}
    </View>
  );
};
export const StatusChip: React.FC<{
  status: AsyncStatus;
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ status, label, onPress, style }) => {
  const { theme } = useTheme();
  const config = STATUS_CONFIG[status];
  const color = getStatusColor(status, theme);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  if (status === "idle") {
    return null;
  }
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
    >
      {" "}
      <Animated.View
        entering={FadeInUp.duration(200)}
        exiting={FadeOutUp.duration(150)}
        style={[
          animatedStyle,
          {
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing[1],
            backgroundColor: `${color}15`,
            paddingVertical: theme.spacing[1],
            paddingHorizontal: theme.spacing[2],
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: `${color}30`,
          },
          style,
        ]}
      >
        {" "}
        {status === "loading" || status === "retrying" ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Text style={{ color, fontSize: 12, fontWeight: "700" }}>
            {config.icon}
          </Text>
        )}{" "}
        {label && (
          <Text variant="caption" color={color} style={{ fontWeight: "600" }}>
            {" "}
            {label}{" "}
          </Text>
        )}{" "}
      </Animated.View>{" "}
    </Wrapper>
  );
};
export const StatusBanner: React.FC<StatusFeedbackProps> = ({
  status,
  message,
  description,
  onRetry,
  onDismiss,
  autoDismissSuccess = true,
  autoDismissDelay = 3000,
  actionLabel,
  onAction,
}) => {
  const { theme } = useTheme();
  const config = STATUS_CONFIG[status];
  const color = getStatusColor(status, theme);
  useEffect(() => {
    if (status === "success" && autoDismissSuccess) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status, autoDismissSuccess, autoDismissDelay, onDismiss]);
  useEffect(() => {
    if (status === "success") {
      void triggerHaptic("success");
    } else if (status === "error") {
      void triggerHaptic("error");
    }
  }, [status]);
  if (status === "idle") {
    return null;
  }
  const displayMessage = message || config.title;
  const isError = status === "error";
  const isOffline = status === "offline";
  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={{
        backgroundColor: isError
          ? theme.colors.error[50]
          : isOffline
            ? theme.colors.background.tertiary
            : `${color}10`,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: isError
          ? theme.colors.error.light
          : isOffline
            ? theme.colors.border.DEFAULT
            : `${color}30`,
        padding: theme.spacing[4],
        gap: theme.spacing[2],
      }}
    >
      {" "}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing[3],
        }}
      >
        {" "}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isError ? theme.colors.error[50] : `${color}20`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          {status === "loading" || status === "retrying" ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <Text
              style={{
                color: isError ? theme.colors.error.DEFAULT : color,
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {" "}
              {config.icon}{" "}
            </Text>
          )}{" "}
        </View>{" "}
        <View style={{ flex: 1, gap: 2 }}>
          {" "}
          <Text
            variant="bodySmall"
            color={
              isError ? theme.colors.error.DEFAULT : theme.colors.text.primary
            }
            style={{ fontWeight: "700" }}
          >
            {" "}
            {displayMessage}{" "}
          </Text>{" "}
          {description && (
            <Text variant="caption" color={theme.colors.text.secondary}>
              {" "}
              {description}{" "}
            </Text>
          )}{" "}
        </View>{" "}
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
            accessibilityHint="Dismisses this notification"
          >
            {" "}
            <Text color={theme.colors.text.tertiary}>✕</Text>{" "}
          </Pressable>
        )}{" "}
      </View>{" "}
      {(onRetry || onAction) && (
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing[2],
            marginTop: theme.spacing[2],
          }}
        >
          {" "}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onPress={onRetry}
              accessibilityLabel="Retry button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              {" "}
              Retry{" "}
            </Button>
          )}{" "}
          {onAction && (
            <Button
              size="sm"
              onPress={onAction}
              accessibilityLabel="Action button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              {" "}
              {actionLabel || "Continue"}{" "}
            </Button>
          )}{" "}
        </View>
      )}{" "}
    </Animated.View>
  );
};
export const CardStatusOverlay: React.FC<{
  status: AsyncStatus;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}> = ({ status, message, onRetry, style }) => {
  const { theme } = useTheme();
  if (status === "idle" || status === "success") {
    return null;
  }
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[
        {
          ...StyleSheet.absoluteFill,
          backgroundColor: `${theme.colors.background.primary}E0`,
          borderRadius: theme.borderRadius.xl,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing[4],
          gap: theme.spacing[3],
        },
        style,
      ]}
    >
      {" "}
      {status === "loading" || status === "retrying" ? (
        <>
          {" "}
          <ActivityIndicator
            size="large"
            color={theme.colors.primary[500]}
          />{" "}
          {message && (
            <Text variant="bodySmall" color={theme.colors.text.secondary}>
              {" "}
              {message}{" "}
            </Text>
          )}{" "}
        </>
      ) : status === "error" ? (
        <>
          {" "}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.error[50],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {" "}
            <Text style={{ color: theme.colors.error.DEFAULT, fontSize: 24 }}>
              ✕
            </Text>{" "}
          </View>{" "}
          {message && (
            <Text
              variant="bodySmall"
              color={theme.colors.error.DEFAULT}
              textAlign="center"
            >
              {" "}
              {message}{" "}
            </Text>
          )}{" "}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onPress={onRetry}
              accessibilityLabel="Retry button"
              accessibilityRole="button"
              accessibilityHint="Activates this control"
            >
              {" "}
              Retry{" "}
            </Button>
          )}{" "}
        </>
      ) : null}{" "}
    </Animated.View>
  );
};
export const StatusFeedback: React.FC<StatusFeedbackProps> = (props) => {
  switch (props.variant) {
    case "inline":
      return (
        <InlineStatus
          status={props.status}
          message={props.message}
          style={props.style}
        />
      );
    case "banner":
      return <StatusBanner {...props} />;
    case "card":
      return (
        <CardStatusOverlay
          status={props.status}
          message={props.message}
          onRetry={props.onRetry}
          style={props.style}
        />
      );
    default:
      return <StatusBanner {...props} />;
  }
};
export default StatusFeedback;
