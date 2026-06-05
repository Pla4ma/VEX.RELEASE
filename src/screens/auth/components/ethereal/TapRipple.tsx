/**
 * TapRipple — a soft, expanding light ring at the user's touch
 * point. Adds premium tactile feedback.
 */
import React, { useCallback } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { timingPresets } from '@/theme/tokens/motion';
import { getMinTouchTargetStyle } from '@/utils/touchTarget';

type TapRippleProps = {
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  rippleColor?: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  children?: React.ReactNode;
};

const RIPPLE_DURATION = 540;
const RIPPLE_MAX = 220;

export function TapRipple({
  onPress,
  disabled = false,
  style,
  height = 56,
  borderRadius = 28,
  backgroundColor = '#0A0A0A',
  rippleColor = 'rgba(255, 255, 255, 0.55)',
  accessibilityLabel,
  accessibilityHint,
  children,
}: TapRippleProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pressScale = useSharedValue(1);

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const onPressIn = useCallback(() => {
    if (!isReducedMotion) {
      scale.value = 0;
      opacity.value = 0.6;
      scale.value = withTiming(1, {
        duration: RIPPLE_DURATION,
        easing: Easing.bezier(...timingPresets.cinematicReveal.easing),
      });
      opacity.value = withTiming(0, {
        duration: RIPPLE_DURATION,
        easing: Easing.bezier(...timingPresets.cinematicReveal.easing),
      });
    }
    pressScale.value = withTiming(0.97, { duration: 80 });
  }, [scale, opacity, pressScale, isReducedMotion]);

  const onPressOut = useCallback(() => {
    pressScale.value = withTiming(1, {
      duration: 240,
      easing: Easing.bezier(...timingPresets.enter.easing),
    });
  }, [pressScale]);

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [
        getMinTouchTargetStyle(),
        style,
        {
          height,
          borderRadius,
          backgroundColor,
          overflow: 'hidden',
          opacity: disabled ? 0.6 : pressed ? 0.94 : 1,
        },
      ]}
    >
      <Animated.View style={[{ flex: 1 }, pressStyle]}>{children}</Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: RIPPLE_MAX,
            height: RIPPLE_MAX,
            marginLeft: -RIPPLE_MAX / 2,
            marginTop: -RIPPLE_MAX / 2,
            borderRadius: RIPPLE_MAX / 2,
            borderWidth: 1.5,
            borderColor: rippleColor,
            backgroundColor: 'rgba(255, 255, 255, 0.10)',
          },
          rippleStyle,
        ]}
      />
    </Pressable>
  );
}
