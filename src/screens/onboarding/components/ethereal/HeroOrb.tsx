/**
 * HeroOrb — persistent luminous orb that follows the user through
 * the onboarding journey. Continuous breath + parallax translate.
 */
import React, { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { etherealOrb } from '@/theme/tokens/ethereal-sky';
import { timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type HeroOrbProps = {
  size?: number;
  /** Horizontal anchor (0 = left, 1 = right). */
  anchorX?: number;
  /** Vertical anchor (0 = top, 1 = bottom). */
  anchorY?: number;
};

    const elementStyle_79 = {
  position: 'absolute',
  left: `${anchorX * 100}%` as ViewStyle['left'],
  top: `${anchorY * 100}%` as ViewStyle['top'],
  width: size,
  height: size,
  marginLeft: -size / 2,
  marginTop: -size / 2,
  alignItems: 'center',
  justifyContent: 'center',
};
const BREATH_DURATION_MS = 2600;
const ROTATION_DURATION_MS = 30000;

export function HeroOrb({
  size = 96,
  anchorX = 0.5,
  anchorY = 0.18,
}: HeroOrbProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const breath = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    breath.value = withRepeat(
      withTiming(1, {
        duration: BREATH_DURATION_MS,
        easing: Easing.bezier(...timingPresets.breath.easing),
      }),
      -1,
      true,
    );
    rotation.value = withRepeat(
      withTiming(360, { duration: ROTATION_DURATION_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [breath, rotation, isReducedMotion]);

  const orbStyle = useAnimatedStyle(() => {
    const t = breath.value;
    return {
      transform: [
        { scale: 0.94 + t * 0.12 },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: 0.9 + t * 0.1,
    };
  });

  const haloStyle = useAnimatedStyle(() => {
    const t = breath.value;
    return {
      transform: [{ scale: 1 + t * 0.35 }],
      opacity: 0.5 - t * 0.3,
    };
  });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={elementStyle_79}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 2.4,
            height: size * 2.4,
            borderRadius: size * 1.2,
            backgroundColor: etherealOrb.outerGlow,
          },
          haloStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.5,
            height: size * 1.5,
            borderRadius: size * 0.75,
            backgroundColor: etherealOrb.innerGlow,
          },
          haloStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: etherealOrb.core,
            boxShadow: '0px 0px 24px etherealOrb.ring / 0.9',
            borderWidth: 1,
            borderColor: etherealOrb.ring,
          },
          orbStyle,
        ]}
      />
    </Animated.View>
  );
}
