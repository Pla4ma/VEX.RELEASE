/**
 * ShimmerSweep — diagonal light beam that crosses a button on
 * press. Adds premium tactile feedback. Pair with a Pressable.
 */
import React, { useCallback } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { timingPresets } from '@/theme/tokens/motion';
import { getMinTouchTargetStyle } from '@/utils/touchTarget';

type ShimmerSweepProps = {
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  style?: ViewStyle | ViewStyle[];
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  accessibilityLabel: string;
  accessibilityHint: string;
  children?: React.ReactNode;
};

const SWEEP_DURATION = 700;
const SWEEP_DELAY = 80;

export function ShimmerSweep({
  onPress,
  disabled = false,
  selected = false,
  style,
  height = 56,
  borderRadius = 28,
  backgroundColor = '#0A0A0A',
  borderColor,
  borderWidth = 0,
  accessibilityLabel,
  accessibilityHint,
  children,
}: ShimmerSweepProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const sweepX = useSharedValue(-1);
  const pressScale = useSharedValue(1);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweepX.value * 360 }, { skewX: '-20deg' }],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const onPressIn = useCallback(() => {
    if (isReducedMotion) {return;}
    sweepX.value = -1;
    sweepX.value = withDelay(
      SWEEP_DELAY,
      withTiming(1, {
        duration: SWEEP_DURATION,
        easing: Easing.bezier(...timingPresets.cinematicReveal.easing),
      }),
    );
    pressScale.value = withTiming(0.97, { duration: 100 });
  }, [sweepX, pressScale, isReducedMotion]);

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
      accessibilityState={{ disabled, selected }}
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
          borderColor,
          borderWidth,
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
            top: 0,
            bottom: 0,
            left: -100,
            width: 80,
            backgroundColor: 'rgba(255, 255, 255, 0.20)',
            shadowColor: '#FFFFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
          },
          sweepStyle,
        ]}
      />
    </Pressable>
  );
}
