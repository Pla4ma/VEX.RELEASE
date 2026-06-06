/**
 * SkiaParticles — static Skia-rendered luminous dust field.
 * Motion stripped for performance.
 */
import React, { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Blur, Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';

import { buildParticles, type Particle, PARTICLE_COUNT } from './skia-particles.data';

export function SkiaParticles(): React.JSX.Element {
  const { width, height } = useWindowDimensions();

  const particles = useMemo(() => buildParticles(PARTICLE_COUNT), []);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Canvas style={{ width, height }}>
        {particles.map((p, i) => (
          <ParticleNode
            key={i}
            height={height}
            particle={p}
            width={width}
          />
        ))}
      </Canvas>
    </View>
  );
}

type ParticleNodeProps = {
  particle: Particle;
  width: number;
  height: number;
};

function ParticleNode({
  particle,
  width,
  height,
}: ParticleNodeProps): React.JSX.Element {
  const { baseX, baseY, radius, sizeFactor } = particle;
  const baseSize = radius * sizeFactor;
  const px = (baseX / 100) * width;
  const py = (baseY / 100) * height;

  return (
    <Circle cx={px} cy={py} r={baseSize * 1.15}>
      <RadialGradient
        c={vec(0, 0)}
        colors={[particle.innerColor, particle.midColor, particle.outerColor]}
        r={baseSize * 4}
      />
      <Blur blur={2.5} />
    </Circle>
  );
}
