import React, { useEffect } from "react";
import { View, ViewStyle, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut, FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { Button } from "../../../components/primitives/Button";
import { useTheme } from "../../../theme";
import { triggerHaptic } from "../../../utils/haptics";


export const InlineStatus: React.FC<{
  status: AsyncStatus;
  message?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}> = ({ status, message, size = 'sm', style }) => {
  const { theme } = useTheme();
  const config = STATUS_CONFIG[status];

  if (status === 'idle') {return null;}

  const sizeStyles = size === 'sm' ? { fontSize: 12 } : { fontSize: 14 };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[1],
        },
        style,
      ]}
    >
      {status === 'loading' || status === 'retrying' ? (
        <ActivityIndicator size="small" color={config.color} />
      ) : (
        <Text style={[{ color: config.color, fontWeight: '700' }, sizeStyles]}>
          {config.icon}
        </Text>
      )}
      {message && (
        <Text
          variant={size === 'sm' ? 'caption' : 'bodySmall'}
          color={status === 'error' ? theme.colors.error.DEFAULT : theme.colors.text.secondary}
        >
          {message}
        </Text>
      )}
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (status === 'idle') {return null;}

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
      <Animated.View
        entering={FadeInUp.duration(200)}
        exiting={FadeOutUp.duration(150)}
        style={[
          animatedStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[1],
            backgroundColor: `${config.color}15`,
            paddingVertical: theme.spacing[1],
            paddingHorizontal: theme.spacing[2],
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: `${config.color}30`,
          },
          style,
        ]}
      >
        {status === 'loading' || status === 'retrying' ? (
          <ActivityIndicator size="small" color={config.color} />
        ) : (
          <Text style={{ color: config.color, fontSize: 12, fontWeight: '700' }}>
            {config.icon}
          </Text>
        )}
        {label && (
          <Text variant="caption" color={config.color} style={{ fontWeight: '600' }}>
            {label}
          </Text>
        )}
      </Animated.View>
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

  // Auto-dismiss success
  useEffect(() => {
    if (status === 'success' && autoDismissSuccess) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [status, autoDismissSuccess, autoDismissDelay, onDismiss]);

  // Haptic feedback
  useEffect(() => {
    if (status === 'success') {
      void triggerHaptic('success');
    } else if (status === 'error') {
      void triggerHaptic('error');
    }
  }, [status]);

  if (status === 'idle') {return null;}

  const displayMessage = message || config.title;
  const isError = status === 'error';
  const isOffline = status === 'offline';

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={{
        backgroundColor: isError
          ? theme.colors.error[50]
          : isOffline
            ? theme.colors.background.tertiary
            : `${config.color}10`,
        borderRadius: theme.borderRadius.xl,
        borderWidth: 1,
        borderColor: isError
          ? theme.colors.error.light
          : isOffline
            ? theme.colors.border.DEFAULT
            : `${config.color}30`,
        padding: theme.spacing[4],
        gap: theme.spacing[2],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
        {/* Icon */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isError
              ? theme.colors.error[50]
              : `${config.color}20`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {status === 'loading' || status === 'retrying' ? (
            <ActivityIndicator size="small" color={config.color} />
          ) : (
            <Text style={{ color: isError ? theme.colors.error.DEFAULT : config.color, fontSize: 16, fontWeight: '700' }}>
              {config.icon}
            </Text>
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodySmall" color={isError ? theme.colors.error.DEFAULT : theme.colors.text.primary} style={{ fontWeight: '700' }}>
            {displayMessage}
          </Text>
          {description && (
            <Text variant="caption" color={theme.colors.text.secondary}>
              {description}
            </Text>
          )}
        </View>

        {/* Dismiss */}
        {onDismiss && (
          <Pressable onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  accessibilityLabel="✕ button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Text color={theme.colors.text.tertiary}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Actions */}
      {(onRetry || onAction) && (
        <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[2] }}>
          {onRetry && (
            <Button variant="outline" size="sm" onPress={onRetry}
  accessibilityLabel="Retry button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              Retry
            </Button>
          )}
          {onAction && (
            <Button size="sm" onPress={onAction}
  accessibilityLabel="Action button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              {actionLabel || 'Continue'}
            </Button>
          )}
        </View>
      )}
    </Animated.View>
  );
};