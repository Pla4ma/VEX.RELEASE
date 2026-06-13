/**
 * PNG Mascot Animation Styles
 *
 * Extracted animated styles for PngMascotRenderer to keep it under 200 lines.
 */

import {
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';

export function useMascotAnimatedStyles(
  float: SharedValue<number>,
  breath: SharedValue<number>,
  glow: SharedValue<number>,
  nod: SharedValue<number>,
  sparkle: SharedValue<number>,
  reducedMotion: boolean,
  isCelebrating: boolean,
  size: { width: number; height: number }
) {
  const mascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: reducedMotion ? 0 : -5 * float.value + 3 * nod.value },
      { scale: reducedMotion ? 1 : breath.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.7 }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.16 + glow.value * 0.45,
    transform: [{ scale: 0.82 + glow.value * 0.9 }],
  }));

  const sparkleOneStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + sparkle.value * 0.72,
    transform: [
      { translateY: -8 - sparkle.value * 10 },
      { translateX: 4 + sparkle.value * 8 },
      { scale: 0.7 + sparkle.value * 0.45 },
    ],
  }));

  const sparkleTwoStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + (1 - sparkle.value) * 0.62,
    transform: [
      { translateY: -18 + sparkle.value * 12 },
      { translateX: -10 - sparkle.value * 6 },
      { scale: 0.65 + (1 - sparkle.value) * 0.4 },
    ],
  }));

  const ringBaseStyle = {
    position: 'absolute' as const,
    top: 12,
    width: size.width * 0.86,
    height: size.width * 0.86,
    borderRadius: size.width,
    borderWidth: 1,
    borderColor: vexLightGlass.mint[300],
  };

  const glowBaseStyle = {
    position: 'absolute' as const,
    bottom: 6,
    width: size.width * 0.9,
    height: size.height * 0.58,
    borderRadius: size.width,
    backgroundColor: vexLightGlass.mint[200],
  };

  const sparkleOneBaseStyle = {
    position: 'absolute' as const,
    right: 12,
    top: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: vexLightGlass.mint[300],
  };

  const sparkleTwoBaseStyle = {
    position: 'absolute' as const,
    left: 14,
    top: 32,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: vexLightGlass.glass.innerHighlight,
  };

  return {
    mascotStyle,
    glowStyle,
    ringStyle,
    sparkleOneStyle,
    sparkleTwoStyle,
    ringBaseStyle,
    glowBaseStyle,
    sparkleOneBaseStyle,
    sparkleTwoBaseStyle,
  };
}