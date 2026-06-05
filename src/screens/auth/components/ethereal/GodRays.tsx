/**
 * GodRays — soft volumetric light beams descending from the
 * top of the screen, driving the "cathedral glow" effect.
 * Static layout with subtle tilt parallax via a wrapping
 * Animated.View.
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
import { Blur, Canvas, Group, RoundedRect } from '@shopify/react-native-skia';

import { useDeviceTilt } from '@/hooks/useDeviceTilt';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const RAY_COUNT = 6;
const CYCLE_MS = 14000;

type RaySpec = {
  xOffset: number;
  width: number;
  opacity: number;
};

function buildRays(): RaySpec[] {
  const rays: RaySpec[] = [];
  for (let i = 0; i < RAY_COUNT; i += 1) {
    const span = 100 / RAY_COUNT;
    const xOffset = span * i + span * 0.5;
    const width = 60 + ((i * 37) % 40);
    const opacity = 0.08 + ((i * 13) % 10) / 100;
    rays.push({ xOffset, width, opacity });
  }
  return rays;
}

type RayBeamProps = {
  width: number;
  height: number;
  xOffset: number;
  xWidth: number;
  opacity: number;
};

function RayBeam({
  width,
  height,
  xOffset,
  xWidth,
  opacity,
}: RayBeamProps): React.JSX.Element {
  const centerX = (xOffset / 100) * width;
  return (
    <Group opacity={opacity} transform={[{ translateX: centerX }, { translateY: 0 }]}>
      <RoundedRect
        color="#FFFBEF"
        height={height}
        r={xWidth}
        width={xWidth}
        x={-xWidth / 2}
        y={0}
      >
        <Blur blur={28} />
      </RoundedRect>
    </Group>
  );
}

export function GodRays(): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { tiltX, tiltY } = useDeviceTilt();
  const { width, height } = useWindowDimensions();
  const cycle = useSharedValue(0);
  const rays = useMemo(buildRays, []);

  useEffect(() => {
    if (isReducedMotion) {return;}
    cycle.value = withRepeat(
      withTiming(1, {
        duration: CYCLE_MS,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1,
      false,
    );
  }, [cycle, isReducedMotion]);

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tiltX.value * 22 },
      { translateY: tiltY.value * 12 },
    ],
    opacity: isReducedMotion ? 0.7 : 0.55 + cycle.value * 0.15,
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
        parallaxStyle,
      ]}
    >
      <Canvas style={{ width, height }}>
        {rays.map((ray, i) => (
          <RayBeam
            key={i}
            height={height * 0.9}
            opacity={ray.opacity}
            width={width}
            xOffset={ray.xOffset}
            xWidth={ray.width}
          />
        ))}
      </Canvas>
    </Animated.View>
  );
}
