/**
 * LightFlare — slow, large ambient light flare that drifts across
 * the sky. Pure visual ambient life. Static position; parallax and
 * breath are driven by a wrapping Animated.View + opacity.
 */
import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Blur, Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';

import { useDeviceTilt } from '@/hooks/useDeviceTilt';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type LightFlareColor = [string, string, string];

type LightFlareProps = {
  /** Anchor position as percentage of screen. */
  anchorXPercent?: number;
  anchorYPercent?: number;
  size?: number;
  color?: LightFlareColor;
  periodMs?: number;
};

const DEFAULT_COLOR: LightFlareColor = [
  'rgba(255, 240, 200, 0.45)',
  'rgba(255, 220, 180, 0.18)',
  'rgba(255, 220, 180, 0)',
];

export function LightFlare({
  anchorXPercent = 50,
  anchorYPercent = 22,
  size = 260,
  color = DEFAULT_COLOR,
  periodMs = 9000,
}: LightFlareProps): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const { isReducedMotion } = useReducedMotion();
  const { tiltX, tiltY } = useDeviceTilt();
  const cycle = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    cycle.value = withRepeat(
      withTiming(1, { duration: periodMs, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true,
    );
  }, [cycle, isReducedMotion, periodMs]);

  const centerX = (anchorXPercent / 100) * width;
  const centerY = (anchorYPercent / 100) * height;

  const wrapperStyle = useAnimatedStyle(() => {
    const breath = 0.5 + 0.5 * Math.sin(cycle.value * Math.PI * 2);
    const scale = isReducedMotion ? 1 : 0.9 + breath * 0.18;
    return {
      transform: [
        { translateX: centerX + tiltX.value * 40 },
        { translateY: centerY + tiltY.value * 25 },
        { scale },
      ],
      opacity: isReducedMotion ? 0.6 : 0.45 + breath * 0.25,
    };
  });

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
      <Canvas style={{ width: size * 2, height: size * 2 }}>
        <Group transform={[{ translateX: size }, { translateY: size }]}>
          <Circle cx={0} cy={0} r={size}>
            <RadialGradient c={vec(0, 0)} colors={color} r={size} />
            <Blur blur={40} />
          </Circle>
        </Group>
      </Canvas>
    </Animated.View>
  );
}
