/**
 * Press handlers for VexPrimaryButton
 * Extracted to keep the main component under 200 lines
 */
import { useCallback } from 'react';
import {
  Easing,
  useSharedValue,
  withTiming,
  withRepeat,
  useAnimatedStyle,
} from 'react-native-reanimated';

const PRESS_SCALE = 0.97;
const PRESS_MS = 100;
const PULSE_MS = 5000;

export interface PressHandlers {
  handlePressIn: () => void;
  handlePressOut: () => void;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  glowStyle: ReturnType<typeof useAnimatedStyle>;
  auraStyle: ReturnType<typeof useAnimatedStyle>;
}

export function useButtonPressHandlers(isReducedMotion: boolean): PressHandlers {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.15);
  const pulse = useSharedValue(isReducedMotion ? 0.3 : 0);

  useCallback(() => {
    if (isReducedMotion) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: PULSE_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [pulse, isReducedMotion])();

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(PRESS_SCALE, { duration: PRESS_MS });
    glowOpacity.value = withTiming(0.45, { duration: PRESS_MS });
  }, [scale, glowOpacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: PRESS_MS });
    glowOpacity.value = withTiming(0.15, { duration: PRESS_MS });
  }, [scale, glowOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  const auraStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + pulse.value * 0.10,
  }));

  return { handlePressIn, handlePressOut, animatedStyle, glowStyle, auraStyle };
}
