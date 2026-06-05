/**
 * EtherealSkyBackground — full-bleed dawn sky with parallax clouds,
 * light shaft, and film grain. Used by Login + Onboarding as the
 * shared visual canvas.
 */
import React, { useEffect, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { etherealSkyGradient } from '@/theme/tokens/ethereal-sky';
import { timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import { CloudPuff } from './CloudPuff';
import { LightShaft } from './LightShaft';

type CloudSpec = {
  layer: 'back' | 'mid' | 'front';
  topPercent: number;
  size: number;
  drift: number;
  tint: 'cool' | 'warm';
  delay: number;
};

const CLOUDS: readonly CloudSpec[] = [
  { layer: 'back', topPercent: 12, size: 380, drift: 90, tint: 'cool', delay: 200 },
  { layer: 'back', topPercent: 32, size: 460, drift: 70, tint: 'cool', delay: 1200 },
  { layer: 'mid', topPercent: 22, size: 320, drift: 110, tint: 'cool', delay: 600 },
  { layer: 'mid', topPercent: 48, size: 380, drift: 100, tint: 'warm', delay: 1800 },
  { layer: 'front', topPercent: 60, size: 260, drift: 130, tint: 'cool', delay: 900 },
  { layer: 'front', topPercent: 76, size: 300, drift: 120, tint: 'warm', delay: 2400 },
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
            backgroundColor: '#FFFFFF',
          }}
        />
      ))}
    </View>
  );
}

export function EtherealSkyBackground(): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const enter = useSharedValue(isReducedMotion ? 1 : 0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    enter.value = withDelay(
      0,
      withTiming(1, {
        duration: timingPresets.enter.duration,
        easing: Easing.bezier(...timingPresets.enter.easing),
      }),
    );
  }, [enter, isReducedMotion]);

  const skyEnterStyle = useAnimatedStyle(() => ({ opacity: enter.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={[
        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
        skyEnterStyle,
      ]}
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
      <LightShaft />
      {CLOUDS.map((c, i) => (
        <CloudPuff
          key={i}
          delay={c.delay}
          drift={c.drift}
          layer={c.layer}
          size={c.size}
          tint={c.tint}
          topPercent={c.topPercent}
        />
      ))}
      <FilmGrain />
    </Animated.View>
  );
}
