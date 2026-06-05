/**
 * AuthPillButton — single Apple/Google auth pill with enter + press
 * animations. Internal to the EtherealAuthButtons group.
 */
import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../../components/primitives/Text';
import { springPresets, timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getMinTouchTargetStyle } from '../../../../utils/touchTarget';

export type AuthButtonSpec = {
  provider: string;
  label: string;
  fill: string;
  textColor: string;
  borderColor?: string;
  glyph: React.ReactNode;
  accessibilityHint: string;
};

type AuthPillButtonProps = {
  spec: AuthButtonSpec;
  onPress: () => void;
  disabled: boolean;
  delay: number;
};

export function AuthPillButton({
  spec,
  onPress,
  disabled,
  delay,
}: AuthPillButtonProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const progress = useSharedValue(isReducedMotion ? 1 : 0);
  const press = useSharedValue(1);

  useEffect(() => {
    if (isReducedMotion) {return;}
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration: timingPresets.enter.duration,
        easing: Easing.bezier(...timingPresets.enter.easing),
      }),
    );
  }, [progress, delay, isReducedMotion]);

  const enterStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }, { scale: press.value }],
  }));

  return (
    <Animated.View style={enterStyle}>
      <Pressable
        accessibilityHint={spec.accessibilityHint}
        accessibilityLabel={spec.label}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          press.value = withSpring(0.97, springPresets.tactile);
        }}
        onPressOut={() => {
          press.value = withSpring(1, springPresets.tactile);
        }}
        style={({ pressed }) => [
          {
            height: 56,
            width: '100%',
            borderRadius: 28,
            backgroundColor: spec.fill,
            borderWidth: spec.borderColor ? 1 : 0,
            borderColor: spec.borderColor,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
            gap: 12,
            opacity: disabled ? 0.6 : pressed ? 0.92 : 1,
          },
          getMinTouchTargetStyle(),
        ]}
      >
        {spec.glyph}
        <Text
          fontSize={16}
          fontWeight="700"
          color={spec.textColor}
          style={{ color: spec.textColor }}
        >
          {spec.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
