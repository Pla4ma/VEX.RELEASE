/**
 * Starfield — twinkling stars in the upper portion of the sky.
 * Each star has its own phase, size, and color. Rendered as
 * Animated.View with per-star opacity twinkle for crisp type
 * safety and a soft glow via RN shadow.
 */
import React, { useEffect, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useDeviceTilt } from '@/hooks/useDeviceTilt';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type Star = {
  x: number;
  y: number;
  r: number;
  phase: number;
  color: string;
};

const STAR_COUNT = 38;
const TILT_FACTOR = 18;
const TWINKLE_DURATION_MS = 3200;

const STAR_PALETTE = ['#FFFFFF', '#E7F1FB', '#FFE9C2', '#FFD9E0'];

function buildStars(count: number): Star[] {
  const arr: Star[] = [];
  for (let i = 0; i < count; i += 1) {
    arr.push({
      x: (i * 41 + 7) % 100,
      y: (i * 17 + 3) % 45,
      r: 0.6 + ((i * 13) % 8) * 0.15,
      phase: (i * 0.43) % (Math.PI * 2),
      color: STAR_PALETTE[i % STAR_PALETTE.length] ?? '#FFFFFF',
    });
  }
  return arr;
}

export function Starfield(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { isReducedMotion } = useReducedMotion();
  const { tiltX, tiltY } = useDeviceTilt();
  const stars = useMemo(() => buildStars(STAR_COUNT), []);

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tiltX.value * TILT_FACTOR },
      { translateY: tiltY.value * TILT_FACTOR * 0.6 },
    ],
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
          height: height * 0.55,
        },
        wrapperStyle,
      ]}
    >
      {stars.map((s, i) => (
        <StarNode
          key={i}
          baseRadius={s.r}
          baseX={s.x}
          baseY={s.y}
          color={s.color}
          isReducedMotion={isReducedMotion}
          phase={s.phase}
          width={width}
        />
      ))}
    </Animated.View>
  );
}

type StarNodeProps = {
  baseX: number;
  baseY: number;
  baseRadius: number;
  width: number;
  phase: number;
  color: string;
  isReducedMotion: boolean;
};

function StarNode({
  baseX,
  baseY,
  baseRadius,
  width,
  phase,
  color,
  isReducedMotion,
}: StarNodeProps): React.JSX.Element {
  const twinkle = useSharedValue(0.5);

  useEffect(() => {
    if (isReducedMotion) {return;}
    twinkle.value = withDelay(
      phase * 400,
      withRepeat(
        withTiming(1, {
          duration: TWINKLE_DURATION_MS + phase * 200,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true,
      ),
    );
  }, [twinkle, phase, isReducedMotion]);

  const twinkleStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.55 * twinkle.value,
    transform: [{ scale: 0.85 + 0.35 * twinkle.value }],
  }));

  const left = (baseX / 100) * width - baseRadius * 4;
  const top = (baseY / 100) * 540;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left,
          top,
          width: baseRadius * 8,
          height: baseRadius * 8,
          borderRadius: baseRadius * 4,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: baseRadius * 6,
        },
        twinkleStyle,
      ]}
    />
  );
}
