import React from 'react';
import { View, Pressable, ActivityIndicator, type ViewStyle } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import {
  type AsyncStatus,
  STATUS_CONFIG,
  getStatusColor,
} from './StatusFeedback.types';

export const StatusChip: React.FC<{
  status: AsyncStatus;
  label?: string;
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ status, label, onPress, style }) => {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const config = STATUS_CONFIG[status];
  const color = getStatusColor(status, theme);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (status === 'idle') {
    return null;
  }

  const handlePressIn = () => {
    scale.value = reducedMotion ? 0.95 : withSpring(0.95, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = reducedMotion ? 1 : withSpring(1, { damping: 15, stiffness: 300 });
  };

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
      accessibilityLabel={label || config.icon || 'Status chip'}
    >
      <Animated.View
        entering={reducedMotion ? undefined : FadeInUp.duration(200)}
        exiting={reducedMotion ? undefined : FadeOutUp.duration(150)}
        style={[
          animatedStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
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
        {status === 'loading' || status === 'retrying' ? (
          <ActivityIndicator size="small" color={color} />
        ) : (
          <Text style={{ color, fontSize: 12, fontWeight: '700' }}>
            {config.icon}
          </Text>
        )}
        {label && (
          <Text variant="caption" color={color} style={{ fontWeight: '600' }}>
            {label}
          </Text>
        )}
      </Animated.View>
    </Wrapper>
  );
};
