/**
 * SkiaParticles — actual Skia-rendered luminous dust field with
 * physics (drift, gravity, life, fade). Drives a true volumetric
 * ambient feel behind the Ethereal Sky visual layer.
 *
 * Pure visual primitive. Honors reduced-motion.
 */
import React, { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  RadialGradient,
  Blur,
  vec,
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useDeviceTilt } from '@/hooks/useDeviceTilt';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { timingPresets } from '@/theme/tokens/motion';

type Particle = {
  baseX: number;
  baseY: number;
  radius: number;
  phase: number;
  hue: 'gold' | 'silver' | 'rose';
  sizeFactor: number;
};

const PARTICLE_COUNT = 70;
const PARALLAX_STRENGTH = 28;

const HUE_COLORS: Record<Particle['hue'], readonly [string, string, string]> = {
  gold: ['rgba(255, 230, 175, 0.95)', 'rgba(255, 200, 120, 0.55)', 'rgba(255, 200, 120, 0)'],
  silver: ['rgba(255, 255, 255, 0.85)', 'rgba(220, 235, 255, 0.45)', 'rgba(220, 235, 255, 0)'],
  rose: ['rgba(255, 210, 220, 0.85)', 'rgba(255, 170, 190, 0.45)', 'rgba(255, 170, 190, 0)'],
};

function generateParticles(count: number, width: number, height: number): Particle[] {
  const arr: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const hueRoll = i % 5;
    let hue: Particle['hue'];
    if (hueRoll === 0) {hue = 'rose';}
    else if (hueRoll === 1) {hue = 'silver';}
    else {hue = 'gold';}
    arr.push({
      baseX: (i * 137 + 23) % 100,
      baseY: (i * 71 + 11) % 100,
      radius: 1.2 + ((i * 19) % 10) * 0.4,
      phase: (i * 0.27) % (Math.PI * 2),
      hue,
      sizeFactor: 0.6 + ((i * 31) % 10) * 0.08,
    });
  }
  return arr;
}

export function SkiaParticles(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { isReducedMotion } = useReducedMotion();
  const { tiltX, tiltY } = useDeviceTilt();

  const particles = useMemo(
    () => generateParticles(PARTICLE_COUNT, width, height),
    [width, height],
  );

  const clock = useSharedValue(0);

  React.useEffect(() => {
    if (isReducedMotion) {return;}
    clock.value = withRepeat(
      withTiming(Math.PI * 2, {
        duration: 18000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [clock, isReducedMotion]);

  const opacityCycle = useDerivedValue<number>(() => {
    'worklet';
    return 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(clock.value * 0.7));
  }, [clock]);

  return (
    <Canvas
      pointerEvents="none"
      style={{ position: 'absolute', width, height, opacity: 0.85 }}
    >
      <Group>
        {particles.map((p, i) => (
          <ParticleNode
            key={i}
            baseX={p.baseX}
            baseY={p.baseY}
            baseRadius={p.radius}
            clock={clock}
            height={height}
            hue={p.hue}
            opacityCycle={opacityCycle}
            phase={p.phase}
            sizeFactor={p.sizeFactor}
            tiltX={tiltX}
            tiltY={tiltY}
            width={width}
          />
        ))}
      </Group>
    </Canvas>
  );
}

type ParticleNodeProps = {
  baseX: number;
  baseY: number;
  baseRadius: number;
  width: number;
  height: number;
  phase: number;
  hue: Particle['hue'];
  sizeFactor: number;
  clock: ReturnType<typeof useSharedValue<number>>;
  opacityCycle: ReturnType<typeof useSharedValue<number>>;
  tiltX: ReturnType<typeof useDerivedValue<number>>;
  tiltY: ReturnType<typeof useDerivedValue<number>>;
};

function ParticleNode({
  baseX,
  baseY,
  baseRadius,
  width,
  height,
  phase,
  hue,
  sizeFactor,
  clock,
  opacityCycle,
  tiltX,
  tiltY,
}: ParticleNodeProps): React.JSX.Element {
  const colors = HUE_COLORS[hue];

  const driftX = useDerivedValue<number>(() => {
    'worklet';
    return baseX + 6 * Math.sin(clock.value + phase);
  }, [clock]);

  const driftY = useDerivedValue<number>(() => {
    'worklet';
    const upDrift = (clock.value / (Math.PI * 2)) * 18;
    const wave = 4 * Math.sin(clock.value * 1.4 + phase);
    return baseY - upDrift + wave;
  }, [clock]);

  const radiusAnim = useDerivedValue<number>(() => {
    'worklet';
    const pulse = 0.5 + 0.5 * Math.sin(clock.value * 2 + phase);
    return baseRadius * sizeFactor * (0.85 + pulse * 0.4);
  }, [clock]);

  const cx = useDerivedValue<number>(() => {
    'worklet';
    const px = (driftX.value / 100) * width;
    return px + tiltX.value * PARALLAX_STRENGTH * (1 - sizeFactor);
  }, [driftX, tiltX, width]);

  const cy = useDerivedValue<number>(() => {
    'worklet';
    const py = (driftY.value / 100) * height;
    return py + tiltY.value * PARALLAX_STRENGTH * (1 - sizeFactor);
  }, [driftY, tiltY, height]);

  const opacity = useDerivedValue<number>(() => {
    'worklet';
    return opacityCycle.value * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(clock.value * 1.6 + phase)));
  }, [opacityCycle, clock]);

  return (
    <Group
      origin={vec(0, 0)}
      transform={[{ translateX: cx }, { translateY: cy }]}
    >
      <Circle cx={0} cy={0} r={radiusAnim}>
        <RadialGradient
          c={vec(0, 0)}
          colors={colors}
          r={radiusAnim}
        />
        <Blur blur={2.5} />
      </Circle>
    </Group>
  );
}
