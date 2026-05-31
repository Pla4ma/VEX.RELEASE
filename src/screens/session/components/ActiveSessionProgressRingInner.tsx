import React from 'react';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import Animated from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { PurityHUD } from '../../../session/components/PurityHUD';
import { AnimatedCircle } from '../hooks/useSessionAnimations';
import { formatTime, PERFECT_PARTICLE_COUNT } from '../utils/active-session';
import { launchColors } from '@theme/tokens/launch-colors';
import { PerfectFocusBurstParticle } from './PerfectFocusBurstParticle';
import {
  USE_SAFE_PROGRESS_RING,
  type ActiveSessionProgressRingProps,
} from './progress-ring-types';

export const ActiveSessionProgressRing: React.FC<
  ActiveSessionProgressRingProps
> = ({
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
  showPurityScore,
  streakMultiplier,
  themeColors,
  withAlpha,
}) => {
  const outerRadius = RADIUS + 16;
  const outerCircumference = 2 * Math.PI * outerRadius;
  return (
    <Animated.View
      style={[pulseStyle, { alignItems: 'center', justifyContent: 'center' }]}
    >
      <Box
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 999,
          ...glowStyle,
        }}
      >
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
              strokeDashoffset={
                CIRCUMFERENCE *
                (1 - Math.max(0, Math.min(100, completionPercentage)) / 100)
              }
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
          <Animated.View
            style={[{ position: 'absolute' }, rotatingPerfectFocusStyle]}
          >
            <Svg width={RING_SIZE + 34} height={RING_SIZE + 34}>
              <Defs>
                <SvgLinearGradient
                  id="perfect-focus-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor={launchColors.hex_fde68a} />
                  <Stop offset="35%" stopColor={launchColors.hex_f59e0b} />
                  <Stop offset="68%" stopColor={launchColors.hex_f472b6} />
                  <Stop offset="100%" stopColor={launchColors.hex_60a5fa} />
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
        <Box
          position="absolute"
          width={RING_SIZE}
          height={RING_SIZE}
          justifyContent="center"
          alignItems="center"
        >
          <Text variant="hero" color="text.primary" textAlign="center">
            {formatTime(remainingSeconds)}
          </Text>
          <Text
            variant="caption"
            color="text.secondary"
            textAlign="center"
            mt="xs"
          >
            remaining
          </Text>
          {showPurityScore ? (
            <PurityHUD
              purityScore={purityScore}
              purityLabel={purityLabel}
              streakMultiplier={streakMultiplier}
              compact
            />
          ) : null}
        </Box>
        {Array.from({ length: PERFECT_PARTICLE_COUNT }).map((_, index) => (
          <PerfectFocusBurstParticle
            key={`burst-${index}`}
            index={index}
            color={
              index % 2 === 0 ? themeColors.warning : themeColors.primary300
            }
            progress={perfectFocusBurst}
          />
        ))}
      </Box>
    </Animated.View>
  );
};
