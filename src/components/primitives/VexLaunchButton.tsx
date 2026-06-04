import React from 'react';
import { Pressable, ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Text } from './Text';
import { useTheme } from '../../theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { getMinTouchTargetStyle } from '../../utils/touchTarget';
import { useHaptics } from '../../utils/haptics';
import { lightColors } from '@/theme/tokens/colors';

export interface VexLaunchButtonProps extends ViewProps {
  label: string;
  subLabel?: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hapticOnPress?: boolean;
  testID?: string;
}

export function VexLaunchButton({
  label,
  subLabel,
  onPress,
  disabled,
  isLoading,
  hapticOnPress = true,
  style,
  testID,
  ...rest
}: VexLaunchButtonProps): JSX.Element {
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const { primaryAction } = useHaptics();
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.06);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  const handlePressIn = () => {
    if (isReducedMotion) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    glow.value = withTiming(0.15, { duration: 150 });
  };

  const handlePressOut = () => {
    if (isReducedMotion) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    glow.value = withTiming(0.06, { duration: 300 });
  };

  const handlePress = () => {
    if (hapticOnPress && !isReducedMotion) {
      primaryAction();
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || isLoading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || isLoading, busy: isLoading }}
      style={[getMinTouchTargetStyle(), style]}
      testID={testID}
      {...rest}
    >
      <Animated.View
        style={[
          {
            backgroundColor: lightColors.semantic.obsidian,
            borderRadius: theme.spacing?.[3] ?? 12,
            borderWidth: 1,
            borderColor: 'rgba(0,229,255,0.08)',
            paddingVertical: theme.spacing?.[4] ?? 16,
            paddingHorizontal: theme.spacing?.[5] ?? 20,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: lightColors.semantic.vexCyan,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 16,
            width: '100%',
          },
          animatedStyle,
        ]}
      >
        <Text variant="heading3" color={lightColors.semantic.vexCyan}>
          {label}
        </Text>
        {subLabel ? (
          <Text
            variant="caption"
            color="textMuted"
            style={{ marginTop: 4 }}
          >
            {subLabel}
          </Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}
