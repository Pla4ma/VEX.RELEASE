import React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../components/primitives';

export function StreakFuneralFlame(): React.JSX.Element {
  const flameScale = useSharedValue(1);
  const flameOpacity = useSharedValue(1);

  React.useEffect(() => {
    flameScale.value = withSequence(
      withTiming(0.9, { duration: 500 }),
      withTiming(0.7, { duration: 500 }),
      withTiming(0.4, { duration: 500 }),
      withTiming(0, { duration: 500 }),
    );
    flameOpacity.value = withSequence(
      withTiming(0.8, { duration: 500 }),
      withTiming(0.6, { duration: 500 }),
      withTiming(0.3, { duration: 500 }),
      withTiming(0, { duration: 500 }),
    );
  }, [flameOpacity, flameScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
    opacity: flameOpacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text fontSize={96}>🔥</Text>
    </Animated.View>
  );
}
