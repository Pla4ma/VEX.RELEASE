import React, { useEffect } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';
import { triggerHaptic } from '../../../utils/haptics';
import { useThemeObject } from '../../../theme';
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
  const config = STATUS_CONFIG[status];
  const theme = useThemeObject();
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
          ? 'rgba(192, 57, 43, 0.08)'
          : isOffline
            ? vexLightGlass.background.pageMid
            : `${color}10`,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: isError
          ? 'rgba(192, 57, 43, 0.25)'
          : isOffline
            ? 'rgba(16, 35, 31, 0.15)'
            : `${color}30`,
        padding: 16,
        gap: 8,
      }}
    >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isError ? 'rgba(192, 57, 43, 0.12)' : `${color}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {status === 'loading' || status === 'retrying' ? (
              <ActivityIndicator size="small" color={color} />
            ) : (
              <Text
                style={{
                  color: isError ? vexLightGlass.semantic.danger : color,
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
              style={{
                color: isError ? vexLightGlass.semantic.danger : vexLightGlass.text.primary,
                fontWeight: '700',
                fontSize: 14,
              }}
            >
              {displayMessage}
            </Text>
            {description && (
              <Text
                variant="caption"
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 13,
                }}
              >
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
              <Text style={{ color: vexLightGlass.text.disabled }}>✕</Text>
            </Pressable>
          )}
        </View>
        {(onRetry || onAction) && (
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              marginTop: 8,
            }}
          >
            {onRetry && (
              <LiquidButton
                variant="secondary"
                label="Retry"
                size="sm"
                onPress={onRetry}
                accessibilityLabel="Retry loading"
                accessibilityHint="Double tap to activate"
              />
            )}
            {onAction && (
              <LiquidButton
                label={actionLabel || 'Continue'}
                size="sm"
                onPress={onAction}
                accessibilityLabel="Perform action"
                accessibilityHint="Double tap to activate"
              />
            )}
          </View>
        )}
    </Animated.View>
  );
};
