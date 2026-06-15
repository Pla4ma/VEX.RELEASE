import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '../../../components/primitives/Text';
import { motionStagger } from '../../../theme/tokens/motion';

export interface AnimatedLetterProps {
  char: string;
  index: number;
  isReducedMotion: boolean;
}

export function AnimatedLetter({
  char,
  index,
  isReducedMotion,
}: AnimatedLetterProps): React.ReactNode {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  const staggerMs = motionStagger.tight;

  useEffect(() => {
    if (isReducedMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(
      400 + index * staggerMs,
      withTiming(1, { duration: 320, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
    );
    translateY.value = withDelay(
      400 + index * staggerMs,
      withTiming(0, { duration: 320, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
    );
  }, [isReducedMotion, index, opacity, translateY, staggerMs]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={style}>
      <Text
        color="text.primary"
        textAlign="center"
        variant="display"
        letterSpacing={4}
        style={{
          fontSize: 56,
          lineHeight: 60,
          textShadowColor: 'rgba(0,229,255,0.15)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 24,
        }}
      >
        {char}
      </Text>
    </Animated.View>
  );
}
