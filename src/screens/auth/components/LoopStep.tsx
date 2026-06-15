import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';

export const previewSteps = [
  { label: 'Start', value: 'One protected block' },
  { label: 'Protect', value: 'Focus without interruption' },
  { label: 'Return', value: 'Proof saved for tomorrow' },
] as const;

export type PreviewStep = typeof previewSteps[number];

interface LoopStepProps {
  step: PreviewStep;
  index: number;
  isReducedMotion: boolean;
  staggerMs: number;
}

export function LoopStep({ step, index, isReducedMotion, staggerMs }: LoopStepProps): React.ReactNode {
  const labelOpacity = useSharedValue(0);
  const labelTranslateY = useSharedValue(8);

  useEffect(() => {
    if (isReducedMotion) {
      labelOpacity.value = 1;
      labelTranslateY.value = 0;
      return;
    }
    labelOpacity.value = withDelay(
      600 + index * staggerMs,
      withTiming(1, { duration: 420, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
    );
    labelTranslateY.value = withDelay(
      600 + index * staggerMs,
      withTiming(0, { duration: 420, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
    );
  }, [isReducedMotion, index, labelOpacity, labelTranslateY, staggerMs]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelTranslateY.value }],
  }));

  return (
    <Animated.View style={[{ gap: 4 }, labelStyle]}>
      <Text
        color="text.primary"
        variant="label"
        style={{ opacity: 0.95 }}
      >
        {step.label}
      </Text>
      <Text
        color="text.muted"
        variant="bodySmall"
        style={{ opacity: 0.75 }}
      >
        {step.value}
      </Text>
    </Animated.View>
  );
}
