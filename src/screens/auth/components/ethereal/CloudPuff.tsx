/**
 * CloudPuff — single soft radial cloud with continuous x-drift.
 *
 * Part of the Ethereal Sky visual layer used by Login + Onboarding.
 * Pure visual primitive; no business logic.
 */
import React, { useEffect, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { etherealCloud, etherealSkyAccents } from '@/theme/tokens/ethereal-sky';
import { timingPresets } from '@/theme/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type CloudLayer = 'back' | 'mid' | 'front';

type CloudPuffProps = {
  layer: CloudLayer;
  /** Vertical position as a percentage of the screen height (0-100). */
  topPercent: number;
  /** Diameter in points. */
  size: number;
  /** Horizontal drift amplitude in points. */
  drift?: number;
  /** Tint variant. */
  tint?: 'cool' | 'warm';
  /** Delay (ms) before the loop starts. */
  delay?: number;
};

const OPACITY_BY_LAYER: Record<CloudLayer, number> = {
  back: etherealCloud.layerBack,
  mid: etherealCloud.layerMid,
  front: etherealCloud.layerFront,
};

const DURATION_BY_LAYER: Record<CloudLayer, number> = {
  back: 28000,
  mid: 22000,
  front: 18000,
};

export function CloudPuff({
  layer,
  topPercent,
  size,
  drift = 80,
  tint = 'cool',
  delay = 0,
}: CloudPuffProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const { isReducedMotion } = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isReducedMotion) {return;}
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: DURATION_BY_LAYER[layer],
          easing: Easing.bezier(...timingPresets.breath.easing),
        }),
        -1,
        true,
      ),
    );
  }, [progress, isReducedMotion, layer, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      transform: [{ translateX: -drift + t * drift * 2 }],
      opacity: isReducedMotion ? OPACITY_BY_LAYER[layer] : OPACITY_BY_LAYER[layer] * (0.6 + t * 0.4),
    };
  });

  const baseStyle = useMemo<ViewStyle>(
    () => ({
      position: 'absolute',
      top: `${topPercent}%` as ViewStyle['top'],
      left: -size * 0.3,
      width: size,
      height: size * 0.55,
      borderRadius: size,
      backgroundColor:
        tint === 'warm' ? etherealSkyAccents.warmCloud : etherealSkyAccents.coolCloud,
      shadowColor: tint === 'warm' ? etherealSkyAccents.warmCloud : etherealSkyAccents.coolCloud,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: size * 0.4,
    }),
    [size, topPercent, tint],
  );

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={[baseStyle, { width }, animatedStyle]}
    />
  );
}
