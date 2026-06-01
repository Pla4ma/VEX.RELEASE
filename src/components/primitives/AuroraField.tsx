import React, { useEffect, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ambientLoop } from '../../theme/tokens/motion';

interface AuroraFieldProps {
  colors: readonly string[];
  size: number;
  intensity?: number;
  style?: ViewStyle;
}

interface BloomSpec {
  key: number;
  color: string;
  diameter: number;
  orbitX: number;
  orbitY: number;
  phase: number;
  baseLeft: number;
  baseTop: number;
}

function AuroraBloom({
  spec,
  clock,
  intensity,
}: {
  spec: BloomSpec;
  clock: SharedValue<number>;
  intensity: number;
}): JSX.Element {
  const animatedStyle = useAnimatedStyle(() => {
    const angle = clock.value * Math.PI * 2 + spec.phase;
    const drift = interpolate(clock.value, [0, 0.5, 1], [0, 1, 0]);
    return {
      opacity: interpolate(drift, [0, 1], [intensity * 0.4, intensity]),
      transform: [
        { translateX: Math.cos(angle) * spec.orbitX },
        { translateY: Math.sin(angle * 0.8) * spec.orbitY },
        { scale: interpolate(drift, [0, 1], [0.82, 1.15]) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: spec.baseLeft,
          top: spec.baseTop,
          width: spec.diameter,
          height: spec.diameter,
          borderRadius: spec.diameter / 2,
          backgroundColor: spec.color,
        },
        animatedStyle,
      ]}
    />
  );
}

export function AuroraField({
  colors,
  size,
  intensity = 0.5,
  style,
}: AuroraFieldProps): JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const clock = useSharedValue(0);

  const blooms = useMemo<BloomSpec[]>(() => {
    const palette = colors.length > 0 ? colors : ['#6366F1'];
    return Array.from({ length: 5 }, (_, index) => {
      const diameter = size * (0.55 + (index % 3) * 0.18);
      return {
        key: index,
        color: palette[index % palette.length] as string,
        diameter,
        orbitX: size * (0.12 + (index % 4) * 0.05),
        orbitY: size * (0.1 + (index % 3) * 0.06),
        phase: (index / 5) * Math.PI * 2,
        baseLeft: size * (0.18 + (index % 3) * 0.22) - diameter / 2,
        baseTop: size * (0.16 + (index % 4) * 0.18) - diameter / 2,
      };
    });
  }, [colors, size]);

  useEffect(() => {
    if (isReducedMotion) {
      cancelAnimation(clock);
      clock.value = 0.5;
      return;
    }
    clock.value = withRepeat(
      withTiming(1, {
        duration: ambientLoop.drift,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    return () => cancelAnimation(clock);
  }, [clock, isReducedMotion]);

  return (
    <View
      pointerEvents="none"
      style={[
        { width: size, height: size, overflow: 'hidden' },
        style,
      ]}
    >
      {blooms.map((spec) => (
        <AuroraBloom
          key={spec.key}
          spec={spec}
          clock={clock}
          intensity={intensity}
        />
      ))}
    </View>
  );
}
