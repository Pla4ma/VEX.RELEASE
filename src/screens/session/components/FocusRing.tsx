/**
 * FocusRing — animated SVG progress ring with time label and stats.
 * Renders the centered timer display for the active focus session.
 */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { VexAssetImage } from '../../../components/glass/VexAssetImage';
import { Text } from '../../../components/primitives/Text';
import { spacing } from '../../../theme/tokens/spacing';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

import {
  FocusRingSvg,
  RING_SIZE,
  STROKE_WIDTH,
} from './FocusRingSvg';
import { FocusStats } from './FocusStats';

function formatTime(totalSeconds: number): { m: string; s: string } {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return {
    m: m.toString().padStart(2, '0'),
    s: s.toString().padStart(2, '0'),
  };
}

interface FocusRingProps {
  isActive: boolean;
  isPaused: boolean;
  remainingSeconds: number;
  elapsedSeconds: number;
  totalSeconds: number;
  percentage: number;
  themeAsset: 'orbFocus' | 'orbStudy' | 'orbSprint' | 'orbRecovery';
}

export function FocusRing({
  isActive,
  isPaused,
  remainingSeconds,
  elapsedSeconds,
  totalSeconds,
  percentage,
  themeAsset,
}: FocusRingProps): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    const target = Math.max(0, Math.min(100, percentage)) / 100;
    if (isReducedMotion) {
      animatedProgress.value = target;
      return;
    }
    animatedProgress.value = withTiming(target, {
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage, animatedProgress, isReducedMotion]);

  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: 2 * Math.PI * ((RING_SIZE - STROKE_WIDTH) / 2) *
      (1 - animatedProgress.value),
  }));

  const breath = useSharedValue(0);
  useEffect(() => {
    if (!isPaused) {
      cancelAnimation(breath);
      breath.value = withTiming(0, { duration: 220 });
      return;
    }
    if (isReducedMotion) {
      breath.value = 1;
      return;
    }
    breath.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [isPaused, breath, isReducedMotion]);
  const breathStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + breath.value * 0.16,
    transform: [{ scale: 0.96 + breath.value * 0.06 }],
  }));

  const time = formatTime(remainingSeconds);

  return (
    <View style={{ alignItems: 'center' }}>
      <Animated.View
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center',
          },
          isPaused ? breathStyle : undefined,
        ]}
      >
        <FocusRingSvg animatedProps={animatedRingProps} />
        <View
          pointerEvents="none"
          style={{
            alignItems: 'center',
            height: RING_SIZE,
            justifyContent: 'center',
            position: 'absolute',
            width: RING_SIZE,
          }}
        >
          <VexAssetImage
            name={themeAsset}
            opacity={0.16}
            resizeMode="contain"
            size={140}
          />
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 72,
              fontWeight: '900',
              fontVariant: ['tabular-nums'],
              letterSpacing: -2,
              lineHeight: 80,
            }}
          >
            {time.m}
            <Text
              style={{
                color: isPaused
                  ? vexLightGlass.semantic.fireDeep
                  : vexLightGlass.text.secondary,
                fontSize: 56,
                fontWeight: '700',
                letterSpacing: -1,
              }}
            >
              :{time.s}
            </Text>
          </Text>
          <Text
            style={{
              color: isPaused
                ? vexLightGlass.semantic.fireDeep
                : vexLightGlass.text.tertiary,
              fontSize: 12,
              fontWeight: '800',
              letterSpacing: 2.4,
              marginTop: spacing[2],
              textTransform: 'uppercase',
            }}
          >
            {isPaused ? 'Paused' : isActive ? 'In focus' : 'Ready'}
          </Text>
        </View>
      </Animated.View>

      <FocusStats
        elapsedSeconds={elapsedSeconds}
        percentage={percentage}
        totalSeconds={totalSeconds}
      />
    </View>
  );
}
