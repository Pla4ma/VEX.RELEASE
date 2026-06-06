/**
 * EtherealSkyBackground — the full Ethereal Sky visual stack.
 * Static (motion stripped for performance).
 * Layers (back to front):
 *   1. 3-stop dawn gradient
 *   2. God rays (static Skia, top-down light shafts)
 *   3. Light flare (static large ambient halo)
 *   4. Starfield (static stars in the upper sky)
 *   5. Cloud puffs (static, no parallax)
 *   6. Skia particles (static, gold/silver/rose dust)
 *   7. Light shaft (static beam from top)
 *   8. Film grain
 */
import React, { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { etherealSkyGradient, etherealOrb } from '@/theme/tokens/ethereal-sky';

import { CloudPuff } from './CloudPuff';
import { LightShaft } from './LightShaft';
import { GodRays } from './GodRays';
import { LightFlare } from './LightFlare';
import { Starfield } from './Starfield';
import { SkiaParticles } from './SkiaParticles';

type CloudSpec = {
  layer: 'back' | 'mid' | 'front';
  topPercent: number;
  size: number;
  drift: number;
  tint: 'cool' | 'warm';
  delay: number;
  parallaxFactor: number;
};

const CLOUDS: readonly CloudSpec[] = [
  { layer: 'back', topPercent: 12, size: 380, drift: 90, tint: 'cool', delay: 200, parallaxFactor: 6 },
  { layer: 'back', topPercent: 32, size: 460, drift: 70, tint: 'cool', delay: 1200, parallaxFactor: 6 },
  { layer: 'mid', topPercent: 22, size: 320, drift: 110, tint: 'cool', delay: 600, parallaxFactor: 12 },
  { layer: 'mid', topPercent: 48, size: 380, drift: 100, tint: 'warm', delay: 1800, parallaxFactor: 12 },
  { layer: 'front', topPercent: 60, size: 260, drift: 130, tint: 'cool', delay: 900, parallaxFactor: 22 },
  { layer: 'front', topPercent: 76, size: 300, drift: 120, tint: 'warm', delay: 2400, parallaxFactor: 22 },
];

function FilmGrain(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const dots = useMemo(
    () =>
      Array.from({ length: 90 }).map((_, i) => ({
        x: (i * 37) % 100,
        y: (i * 53) % 100,
        s: i % 3 === 0 ? 1.5 : 1,
      })),
    [],
  );
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={{ position: 'absolute', width, height, opacity: 0.05 }}
    >
      {dots.map((d, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            borderRadius: d.s,
            backgroundColor: etherealOrb.core,
          }}
        />
      ))}
    </View>
  );
}

export function EtherealSkyBackground(): React.JSX.Element {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <LinearGradient
        colors={[
          etherealSkyGradient.zenith,
          etherealSkyGradient.mid,
          etherealSkyGradient.horizon,
        ]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <GodRays />
      <LightFlare
        anchorXPercent={50}
        anchorYPercent={18}
        color={['rgba(255, 240, 200, 0.40)', 'rgba(255, 220, 180, 0.15)', 'rgba(255, 220, 180, 0)']}
        periodMs={9500}
        size={300}
      />
      <LightFlare
        anchorXPercent={22}
        anchorYPercent={45}
        color={['rgba(200, 220, 255, 0.30)', 'rgba(180, 200, 240, 0.12)', 'rgba(180, 200, 240, 0)']}
        periodMs={12000}
        size={220}
      />
      <LightFlare
        anchorXPercent={78}
        anchorYPercent={62}
        color={['rgba(255, 220, 230, 0.28)', 'rgba(255, 200, 220, 0.10)', 'rgba(255, 200, 220, 0)']}
        periodMs={14000}
        size={200}
      />
      <Starfield />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {CLOUDS.map((c, i) => (
          <CloudPuff
            key={i}
            delay={c.delay}
            drift={c.drift}
            layer={c.layer}
            parallaxFactor={c.parallaxFactor}
            size={c.size}
            tint={c.tint}
            topPercent={c.topPercent}
          />
        ))}
      </View>
      <SkiaParticles />
      <LightShaft />
      <FilmGrain />
    </View>
  );
}
