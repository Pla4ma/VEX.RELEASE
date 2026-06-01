import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../../../theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

export function VexEntryBackground(): JSX.Element {
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const { isReducedMotion } = useReducedMotion();
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) return;
    drift1.value = withRepeat(
      withTiming(1, { duration: 12000 }),
      -1,
      true,
    );
    drift2.value = withRepeat(
      withTiming(1, { duration: 16000 }),
      -1,
      true,
    );
  }, [isReducedMotion, drift1, drift2]);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: isReducedMotion ? 0 : (drift1.value - 0.5) * 20,
      },
      {
        translateY: isReducedMotion ? 0 : (drift2.value - 0.5) * 16,
      },
      { scale: isReducedMotion ? 1 : 1 + drift1.value * 0.06 },
    ],
    opacity: 0.18,
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: isReducedMotion ? 0 : (drift2.value - 0.5) * 14,
      },
      {
        translateY: isReducedMotion ? 0 : (drift1.value - 0.5) * 22,
      },
      { scale: isReducedMotion ? 1 : 1 + drift2.value * 0.04 },
    ],
    opacity: 0.12,
  }));

  return (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.9,
            height: width * 0.9,
            borderRadius: (width * 0.9) / 2,
            backgroundColor: `${theme.colors.semantic.vexCyan}18`,
            top: -height * 0.12,
            right: -width * 0.25,
          },
          orb1Style,
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: width * 0.7,
            height: width * 0.7,
            borderRadius: (width * 0.7) / 2,
            backgroundColor: `${theme.colors.semantic.vexCyan}10`,
            bottom: height * 0.08,
            left: -width * 0.2,
          },
          orb2Style,
        ]}
        pointerEvents="none"
      />
    </>
  );
}

export default VexEntryBackground;
