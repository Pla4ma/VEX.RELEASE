/**
 * EtherealMedallion — luminous concentric rings used as the brand
 * anchor on the Login screen. Continuous slow rotation.
 */
import React, { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { etherealMedallion } from '@/theme/tokens/ethereal-sky';
import { springPresets, timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDeviceTilt } from '@/hooks/useDeviceTilt';

type EtherealMedallionProps = {
  size?: number;
  /** Optional VEX glyph color override. */
  glyphColor?: string;
};

const ROTATION_PERIOD_MS = 22000;
const GLYPH_SIZE_FACTOR = 0.32;

export function EtherealMedallion({
  size = 180,
  glyphColor = '#0A0A0A',
}: EtherealMedallionProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { tiltX, tiltY } = useDeviceTilt();
  const entranceScale = useSharedValue(isReducedMotion ? 1 : 0.6);
  const entranceOpacity = useSharedValue(isReducedMotion ? 1 : 0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    entranceScale.value = withDelay(
      500,
      withSpring(1, { ...springPresets.lively, stiffness: 110 }),
    );
    entranceOpacity.value = withDelay(
      500,
      withTiming(1, {
        duration: timingPresets.cinematicReveal.duration,
        easing: Easing.bezier(...timingPresets.cinematicReveal.easing),
      }),
    );
  }, [entranceScale, entranceOpacity, isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion) {return;}
    rotation.value = withRepeat(
      withTiming(360, {
        duration: ROTATION_PERIOD_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [rotation, isReducedMotion]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: entranceOpacity.value,
    transform: [
      { perspective: 800 },
      { rotateX: `${-tiltY.value * 5}deg` },
      { rotateY: `${tiltX.value * 7}deg` },
      { scale: entranceScale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const reverseStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rotation.value}deg` }],
  }));

  const ringStyle = (color: string, scale: number, opacity: number) => ({
    position: 'absolute' as const,
    width: size * scale,
    height: size * scale,
    borderRadius: size * scale,
    borderWidth: 1.5,
    borderColor: color,
    backgroundColor: 'transparent',
    top: (size - size * scale) / 2,
    left: (size - size * scale) / 2,
    opacity,
  });

  const coreSize = size * 0.32;
  const coreStyle = {
    position: 'absolute' as const,
    top: (size - coreSize) / 2,
    left: (size - coreSize) / 2,
    width: coreSize,
    height: coreSize,
    borderRadius: coreSize,
    backgroundColor: etherealMedallion.core,
    shadowColor: etherealMedallion.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[{ width: size, height: size }, containerStyle]}
    >
      <Animated.View style={ringStyle(etherealMedallion.ring1, 1.0, 0.55)} />
      <Animated.View style={ringStyle(etherealMedallion.ring2, 0.78, 0.35)} />
      <Animated.View style={ringStyle(etherealMedallion.ring3, 0.56, 0.18)} />
      <Animated.View style={[coreStyle, reverseStyle]}>
        <Animated.Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            fontSize: size * GLYPH_SIZE_FACTOR,
            fontWeight: '800',
            color: glyphColor,
            letterSpacing: -1,
            fontFamily: 'serif',
            fontStyle: 'italic',
          }}
        >
          v
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}
