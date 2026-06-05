/**
 * AnimatedVexMark — the VEX brand mark as an animated SVG with a
 * stroke-draw reveal. Replaces static "VEX" text on the Login
 * screen. Drawn with three layers: glow halo, main stroke, and
 * accent wing. Tilts subtly with device motion.
 *
 * Pure visual; respects reduced-motion.
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useDeviceTilt } from '@/hooks/useDeviceTilt';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { timingPresets } from '@/theme/tokens/motion';

const APath = Animated.createAnimatedComponent(Path);

const MARK_PATH = 'M 20 8 L 50 92 L 80 8';
const WING_PATH = 'M 50 8 C 58 18, 64 28, 50 32';

const GLOW_DURATION = 4200;
const STROKE_DURATION = 1100;

type AnimatedVexMarkProps = {
  size?: number;
  startDelayMs?: number;
};

export function AnimatedVexMark({
  size = 120,
  startDelayMs = 500,
}: AnimatedVexMarkProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { tiltX, tiltY } = useDeviceTilt();

  const draw = useSharedValue(isReducedMotion ? 1 : 0);
  const wingDraw = useSharedValue(isReducedMotion ? 1 : 0);
  const glow = useSharedValue(0.65);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    draw.value = withDelay(
      startDelayMs,
      withTiming(1, {
        duration: STROKE_DURATION,
        easing: Easing.bezier(...timingPresets.cinematicReveal.easing),
      }),
    );
    wingDraw.value = withDelay(
      startDelayMs + 600,
      withTiming(1, {
        duration: 600,
        easing: Easing.bezier(...timingPresets.enter.easing),
      }),
    );
    glow.value = withRepeat(
      withTiming(1, {
        duration: GLOW_DURATION,
        easing: Easing.bezier(...timingPresets.breath.easing),
      }),
      -1,
      true,
    );
    breathe.value = withRepeat(
      withTiming(1, {
        duration: 5200,
        easing: Easing.bezier(...timingPresets.breath.easing),
      }),
      -1,
      true,
    );
  }, [draw, wingDraw, glow, breathe, isReducedMotion, startDelayMs]);

  const wrapperStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 800 },
      { rotateX: `${-tiltY.value * 4}deg` },
      { rotateY: `${tiltX.value * 6}deg` },
      { scale: 1 + breathe.value * 0.03 },
    ],
  }));

  const strokeProps = useAnimatedProps(() => ({
    strokeDashoffset: 1 - draw.value,
  }));

  const wingProps = useAnimatedProps(() => ({
    strokeDashoffset: 1 - wingDraw.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.4,
    transform: [{ scale: 0.9 + glow.value * 0.3 }],
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: size,
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            shadowColor: '#FFFFFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 30,
          },
          glowStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          },
          wrapperStyle,
        ]}
      >
        <Svg height={size} viewBox="0 0 100 100" width={size}>
          <APath
            animatedProps={strokeProps}
            d={MARK_PATH}
            stroke="#0A0A0A"
            strokeDasharray="1 1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={6}
          />
          <APath
            animatedProps={wingProps}
            d={WING_PATH}
            stroke="#0A0A0A"
            strokeDasharray="1 1"
            strokeLinecap="round"
            strokeWidth={3}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
