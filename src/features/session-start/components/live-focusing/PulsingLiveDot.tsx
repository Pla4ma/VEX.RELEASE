import React from 'react';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { lightColors } from '../../../../theme/tokens/colors';

export function PulsingLiveDot(): JSX.Element {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withTiming(1, { duration: 1000 }),
            withTiming(1.5, { duration: 1000 }),
          ),
          -1,
          true,
        ),
      },
    ],
    opacity: withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 }),
      ),
      -1,
      true,
    ),
  }));
  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: lightColors.semantic.success,
        },
        animatedStyle,
      ]}
    />
  );
}
