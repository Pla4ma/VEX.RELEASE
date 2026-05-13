import React from 'react';

import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import Animated, { useAnimatedProps, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { PurityHUD } from '../../../session/components/PurityHUD';
import { AnimatedCircle } from '../hooks/useSessionAnimations';
import { formatTime, PERFECT_PARTICLE_COUNT, type PurityLabel } from '../utils/active-session';

type ActiveSessionProgressRingProps = {
  CIRCUMFERENCE: number;
  RADIUS: number;
  RING_SIZE: number;
  STROKE_WIDTH: number;
  animatedCircleProps: ReturnType<typeof useAnimatedProps>;
  completionPercentage: number;
  glowStyle: {
    elevation: number;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
  };
  outerStrokeDashoffset: number;
  perfectFocusActive: boolean;
  perfectFocusBurst: SharedValue<number>;
  phaseAccent: string;
  pulseStyle: ReturnType<typeof useAnimatedStyle>;
  purityLabel: PurityLabel;
  purityScore: number;
  remainingSeconds: number;
  rotatingPerfectFocusStyle: ReturnType<typeof useAnimatedStyle>;
  streakMultiplier: number;
  themeColors: {
    inverse: string;
    primary300: string;
    warning: string;
  };
  withAlpha: (color: string, alpha: number) => string;
};

const USE_SAFE_PROGRESS_RING = true;

const PerfectFocusBurstParticle: React.FC<{
  color: string;
  index: number;
  progress: SharedValue<number>;
}> = ({ color, index, progress }) => {
  const angle = (Math.PI * 2 * index) / PERFECT_PARTICLE_COUNT;
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: Math.cos(angle) * 54 * progress.value },
      { translateY: Math.sin(angle) * 54 * progress.value },
      { scale: progress.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: 10, height: 10, borderRadius: 999 },
        { backgroundColor: color },
        style,
      ]}
    />
  );
};

export const ActiveSessionProgressRing: React.FC<ActiveSessionProgressRingProps> = ({
  CIRCUMFERENCE,
  RADIUS,
  RING_SIZE,
  STROKE_WIDTH,
  animatedCircleProps,
  completionPercentage,
  glowStyle,
  outerStrokeDashoffset,
  perfectFocusActive,
  perfectFocusBurst,
  phaseAccent,
  pulseStyle,
  purityLabel,
  purityScore,
  remainingSeconds,
  rotatingPerfectFocusStyle,
  streakMultiplier,
  themeColors,
  withAlpha,
}) => {
  const outerRadius = RADIUS + 16;
  const outerCircumference = 2 * Math.PI * outerRadius;

  return (
    <Animated.View style={[pulseStyle, { alignItems: 'center', justifyContent: 'center' }]}>
      <Box style={{ alignItems: 'center', justifyContent: 'center', borderRadius: 999, ...glowStyle }}>
        <Svg width={RING_SIZE + 34} height={RING_SIZE + 34}>
          <Circle
            cx={(RING_SIZE + 34) / 2}
            cy={(RING_SIZE + 34) / 2}
            r={outerRadius}
            stroke={withAlpha(themeColors.inverse, 0.08)}
            strokeWidth={4}
            fill="none"
          />
          <Circle
            cx={(RING_SIZE + 34) / 2}
            cy={(RING_SIZE + 34) / 2}
            r={outerRadius}
            stroke={withAlpha(phaseAccent, 0.42)}
            strokeWidth={4}
            fill="none"
            strokeDasharray={outerCircumference}
            strokeDashoffset={outerStrokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${(RING_SIZE + 34) / 2} ${(RING_SIZE + 34) / 2})`}
          />
          <Circle
            cx={(RING_SIZE + 34) / 2}
            cy={(RING_SIZE + 34) / 2}
            r={RADIUS}
            stroke={withAlpha(themeColors.inverse, 0.08)}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {USE_SAFE_PROGRESS_RING ? (
            <Circle
              cx={(RING_SIZE + 34) / 2}
              cy={(RING_SIZE + 34) / 2}
              r={RADIUS}
              stroke={phaseAccent}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, completionPercentage)) / 100)}
              strokeLinecap="round"
              transform={`rotate(-90 ${(RING_SIZE + 34) / 2} ${(RING_SIZE + 34) / 2})`}
            />
          ) : (
            <AnimatedCircle
              cx={(RING_SIZE + 34) / 2}
              cy={(RING_SIZE + 34) / 2}
              r={RADIUS}
              stroke={phaseAccent}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedCircleProps}
              strokeLinecap="round"
              transform={`rotate(-90 ${(RING_SIZE + 34) / 2} ${(RING_SIZE + 34) / 2})`}
            />
          )}
        </Svg>
        {perfectFocusActive ? (
          <Animated.View style={[{ position: 'absolute' }, rotatingPerfectFocusStyle]}>
            <Svg width={RING_SIZE + 34} height={RING_SIZE + 34}>
              <Defs>
                <SvgLinearGradient id="perfect-focus-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="theme.colors.primary[500]" />
                  <Stop offset="35%" stopColor="theme.colors.primary[500]" />
                  <Stop offset="68%" stopColor="theme.colors.primary[500]" />
                  <Stop offset="100%" stopColor="theme.colors.primary[500]" />
                </SvgLinearGradient>
              </Defs>
              <Circle
                cx={(RING_SIZE + 34) / 2}
                cy={(RING_SIZE + 34) / 2}
                r={RADIUS + 7}
                stroke="url(#perfect-focus-gradient)"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeDasharray="14 18"
              />
            </Svg>
          </Animated.View>
        ) : null}
        <Box position="absolute" width={RING_SIZE} height={RING_SIZE} justifyContent="center" alignItems="center">
          <Text variant="hero" color="text.primary" textAlign="center">
            {formatTime(remainingSeconds)}
          </Text>
          <Text variant="caption" color="text.secondary" textAlign="center" mt="xs">
            remaining
          </Text>
          <PurityHUD
            purityScore={purityScore}
            purityLabel={purityLabel}
            streakMultiplier={streakMultiplier}
            compact
          />
        </Box>
        {Array.from({ length: PERFECT_PARTICLE_COUNT }).map((_, index) => (
          <PerfectFocusBurstParticle
            key={`burst-${index}`}
            index={index}
            color={index % 2 === 0 ? themeColors.warning : themeColors.primary300}
            progress={perfectFocusBurst}
          />
        ))}
      </Box>
    </Animated.View>
  );
};

export * from "./ActiveSessionProgressRing.types";
