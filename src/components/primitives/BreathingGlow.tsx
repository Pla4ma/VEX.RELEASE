import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ambientLoop, timingPresets } from '../../theme/tokens/motion';

interface BreathingGlowProps {
  /** Accent color of the halo. */
  color: string;
  /** Diameter of the glow at rest. */
  size: number;
  /** Peak opacity of the halo (0-1). Defaults to a restrained 0.45. */
  intensity?: number;
  /** Loop duration override (ms). Defaults to the ambient breathing loop. */
  durationMs?: number;
  /** Absolute-positioned by default so it sits behind content. */
  style?: ViewStyle;
}

/**
 * BreathingGlow — a soft, slowly breathing colored halo.
 *
 * The signature ambient layer behind premium surfaces (Home CTA, active
 * session atmosphere, companion aura). Pure decoration: pointerEvents none,
 * and it freezes to a calm static halo under reduced motion.
 */
export function BreathingGlow({
  color,
  size,
  intensity = 0.45,
  durationMs = ambientLoop.breathing,
  style,
}: BreathingGlowProps): React.ReactNode {
  const { isReducedMotion } = useReducedMotion();
  const phase = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {
      cancelAnimation(phase);
      phase.value = 0.5;
      return;
    }
    phase.value = withRepeat(
      withTiming(1, {
        duration: durationMs,
        easing: Easing.bezier(...timingPresets.breath.easing),
      }),
      -1,
      true,
    );
    return () => cancelAnimation(phase);
  }, [durationMs, isReducedMotion, phase]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(phase.value, [0, 1], [intensity * 0.55, intensity]),
    transform: [{ scale: interpolate(phase.value, [0, 1], [0.92, 1.08]) }],
  }));

  return (
    <View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
