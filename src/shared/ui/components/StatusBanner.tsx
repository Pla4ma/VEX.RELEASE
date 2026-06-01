import React, { useEffect } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { triggerHaptic } from '../../../utils/haptics';
import {
  type AsyncStatus,
  type StatusFeedbackProps,
  STATUS_CONFIG,
  getStatusColor,
} from './StatusFeedback.types';

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
    if (status === 'success' && autoDismissSuccess) {
      const timer = setTimeout(() => {
        onDismiss?.();
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status, autoDismissSuccess, autoDismissDelay, onDismiss]);

  useEffect(() => {
    if (status === 'success') {
      triggerHaptic('success');
    } else if (status === 'error') {
      triggerHaptic('error');
    }
  }, [status]);

  if (status === 'idle') {
    return null;
  }

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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing[3],
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isError ? theme.colors.error[50] : `${color}20`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {status === 'loading' || status === 'retrying' ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <Text
              style={{
                color: isError ? theme.colors.error.DEFAULT : color,
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              {config.icon}
            </Text>
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            variant="bodySmall"
            color={
              isError ? theme.colors.error.DEFAULT : theme.colors.text.primary
            }
            style={{ fontWeight: '700' }}
          >
            {displayMessage}
          </Text>
          {description && (
            <Text variant="caption" color={theme.colors.text.secondary}>
              {description}
            </Text>
          )}
        </View>
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Dismiss"
            accessibilityRole="button"
            accessibilityHint="Dismisses this notification"
          >
            <Text color={theme.colors.text.tertiary}>✕</Text>
          </Pressable>
        )}
      </View>
      {(onRetry || onAction) && (
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing[2],
            marginTop: theme.spacing[2],
          }}
        >
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onPress={onRetry}
              accessibilityLabel="Retry loading"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              Retry
            </Button>
          )}
          {onAction && (
            <Button
              size="sm"
              onPress={onAction}
              accessibilityLabel="Perform action"
              accessibilityRole="button"
              accessibilityHint="Double tap to activate"
            >
              {actionLabel || 'Continue'}
            </Button>
          )}
        </View>
      )}
    </Animated.View>
  );
};
