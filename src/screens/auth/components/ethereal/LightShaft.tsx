/**
 * LightShaft — vertical volumetric light beam descending from top.
 *
 * Pure visual; continuous slow pulse.
 */
import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { etherealSkyAccents } from '@/theme/tokens/ethereal-sky';
import { timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const PULSE_DURATION_MS = 6000;
const MIN_OPACITY = 0.5;
const MAX_OPACITY = 0.9;

export function LightShaft(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { isReducedMotion } = useReducedMotion();
  const opacity = useSharedValue(MIN_OPACITY);

  useEffect(() => {
    if (isReducedMotion) {
      opacity.value = (MIN_OPACITY + MAX_OPACITY) / 2;
      return;
    }
    opacity.value = withRepeat(
      withTiming(MAX_OPACITY, {
        duration: PULSE_DURATION_MS,
        easing: Easing.bezier(...timingPresets.breath.easing),
      }),
      -1,
      true,
    );
  }, [opacity, isReducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const style: ViewStyle = {
    position: 'absolute',
    top: -height * 0.1,
    left: width * 0.5 - 80,
    width: 160,
    height: height * 0.7,
    backgroundColor: etherealSkyAccents.lightBeam,
    borderRadius: 160,
    transform: [{ scaleX: 0.35 }, { rotate: '4deg' }],
    shadowColor: etherealSkyAccents.lightBeam,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 80,
  };

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={[style, animatedStyle]}
    />
  );
}
