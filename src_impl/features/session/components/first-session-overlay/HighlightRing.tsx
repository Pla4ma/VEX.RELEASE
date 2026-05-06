/**
 * Highlight Ring Component
 */

import React from 'react';
import { View } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../../../theme';
import type { HighlightRingProps } from './types';

export function HighlightRing({
  visible,
  position,
}: HighlightRingProps): JSX.Element | null {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  React.useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(0.4, { duration: 1000 }),
        -1,
        true
      );
    }
  }, [visible, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible || !position) {return null;}

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[
        {
          position: 'absolute',
          left: position.x - 40,
          top: position.y - 40,
          width: 80,
          height: 80,
          borderRadius: 40,
          borderWidth: 3,
          borderColor: theme.colors.primary[500],
          backgroundColor: `${theme.colors.primary[500]}10`,
        },
        animatedStyle,
      ]}
    />
  );
}
