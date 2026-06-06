/**
 * Press handlers for VexPrimaryButton — static (motion stripped).
 */
import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export interface PressHandlers {
  handlePressIn: () => void;
  handlePressOut: () => void;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  glowStyle: ReturnType<typeof useAnimatedStyle>;
  auraStyle: ReturnType<typeof useAnimatedStyle>;
}

export function useButtonPressHandlers(_isReducedMotion: boolean): PressHandlers {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.15);
  const pulse = useSharedValue(0.3);

  const handlePressIn = useCallback(() => {
    { /* no-op */ }
  }, []);

  const handlePressOut = useCallback(() => {
    { /* no-op */ }
  }, []);

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
