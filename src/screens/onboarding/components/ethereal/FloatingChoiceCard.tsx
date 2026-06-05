/**
 * FloatingChoiceCard — glass choice card with ambient float,
 * device-tilt parallax, and premium press feedback (shimmer
 * sweep + tap ripple). Used for onboarding step choices.
 */
import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { etherealCard, etherealGlass } from '@/theme/tokens/ethereal-sky';
import { springPresets, timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDeviceTilt } from '@/hooks/useDeviceTilt';
import { Text } from '../../../../components/primitives/Text';
import { SafeBlurView } from '../../../../screens/auth/components/SafeBlurView';
import { ShimmerSweep } from '../../../../screens/auth/components/ethereal/ShimmerSweep';

type FloatingChoiceCardProps = {
  title: string;
  body?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityHint?: string;
  delayMs?: number;
  index: number;
};

const FLOAT_DURATION_MS = 4200;

export function FloatingChoiceCard({
  title,
  body,
  selected = false,
  disabled = false,
  onPress,
  accessibilityHint,
  delayMs = 0,
  index,
}: FloatingChoiceCardProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { tiltX, tiltY } = useDeviceTilt();
  const enter = useSharedValue(isReducedMotion ? 1 : 0);
  const float = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    enter.value = withDelay(
      delayMs + index * 90,
      withSpring(1, { ...springPresets.settle, stiffness: 120 }),
    );
  }, [enter, delayMs, index, isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion) {return;}
    float.value = withDelay(
      delayMs + 800,
      withRepeat(
        withTiming(1, {
          duration: FLOAT_DURATION_MS + index * 300,
          easing: Easing.bezier(...timingPresets.breath.easing),
        }),
        -1,
        true,
      ),
    );
  }, [float, delayMs, index, isReducedMotion]);

  const containerStyle = useAnimatedStyle(() => {
    const floatY = isReducedMotion ? 0 : (float.value - 0.5) * 6;
    return {
      opacity: enter.value,
      transform: [
        { perspective: 900 },
        { rotateX: `${-tiltY.value * 3}deg` },
        { rotateY: `${tiltX.value * 4}deg` },
        { translateY: 24 * (1 - enter.value) + floatY },
        { scale: enter.value },
      ],
    };
  });

  const surfaceStyle: ViewStyle = {
    borderRadius: 24,
    backgroundColor: selected ? etherealCard.fillSelected : etherealCard.fill,
    borderWidth: selected ? 1.5 : 1,
    borderColor: selected ? etherealCard.borderSelected : etherealCard.border,
    overflow: 'hidden',
    shadowColor: etherealGlass.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
  };

  return (
    <Animated.View style={containerStyle}>
      <ShimmerSweep
        accessibilityHint={accessibilityHint ?? 'Select this option'}
        accessibilityLabel={title}
        backgroundColor={selected ? etherealCard.fillSelected : etherealCard.fill}
        borderColor={selected ? etherealCard.borderSelected : etherealCard.border}
        borderRadius={24}
        borderWidth={selected ? 1.5 : 1}
        disabled={disabled}
        height={undefined}
        onPress={onPress}
        selected={selected}
        style={surfaceStyle}
      >
        <SafeBlurView intensity={40} tint="light" style={{ flex: 1 }}>
          <View style={{ padding: 18, gap: 6 }}>
            <Text
              fontSize={17}
              fontWeight="700"
              style={{ color: etherealCard.title }}
            >
              {title}
            </Text>
            {body ? (
              <Text
                fontSize={14}
                style={{ color: etherealCard.body, lineHeight: 20 }}
              >
                {body}
              </Text>
            ) : null}
          </View>
        </SafeBlurView>
      </ShimmerSweep>
    </Animated.View>
  );
}
