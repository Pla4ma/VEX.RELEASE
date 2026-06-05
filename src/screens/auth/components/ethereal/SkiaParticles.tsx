/**
 * SkiaParticles — actual Skia-rendered luminous dust field with
 * physics (drift, gravity, life, fade). Drives a true volumetric
 * ambient feel behind the Ethereal Sky visual layer.
 *
 * Pure visual primitive. Honors reduced-motion.
 */
import React, { useEffect, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Blur, Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';

import { useDeviceTilt } from '@/hooks/useDeviceTilt';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { buildParticles, type Particle, PARTICLE_COUNT, PARALLAX_STRENGTH } from './skia-particles.data';

export function SkiaParticles(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { isReducedMotion } = useReducedMotion();
  const { tiltX, tiltY } = useDeviceTilt();

  const particles = useMemo(() => buildParticles(PARTICLE_COUNT), []);
  const clock = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    clock.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 18000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [clock, isReducedMotion]);

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tiltX.value * PARALLAX_STRENGTH * 0.5 },
      { translateY: tiltY.value * PARALLAX_STRENGTH * 0.3 },
    ],
    opacity: isReducedMotion ? 0.6 : 0.75 + 0.15 * Math.sin(clock.value * 0.7),
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        wrapperStyle,
      ]}
    >
      <Canvas style={{ width, height }}>
        {particles.map((p, i) => (
          <ParticleNode
            key={i}
            height={height}
            isReducedMotion={isReducedMotion}
            particle={p}
            width={width}
          />
        ))}
      </Canvas>
    </Animated.View>
  );
}

type ParticleNodeProps = {
  particle: Particle;
  width: number;
  height: number;
  isReducedMotion: boolean;
};

function ParticleNode({
  particle,
  width,
  height,
  isReducedMotion,
}: ParticleNodeProps): React.JSX.Element {
  const { baseX, baseY, radius, sizeFactor } = particle;
  const baseSize = radius * sizeFactor;
  const px = (baseX / 100) * width;
  const py = (baseY / 100) * height;

  return (
    <Circle cx={px} cy={py} r={isReducedMotion ? baseSize : baseSize * 1.15}>
      <RadialGradient
        c={vec(0, 0)}
        colors={[particle.innerColor, particle.midColor, particle.outerColor]}
        r={baseSize * 4}
      />
      <Blur blur={2.5} />
    </Circle>
  );
}
