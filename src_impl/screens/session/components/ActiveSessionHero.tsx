import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { ActiveSessionProgressRing } from './ActiveSessionProgressRing';
import { formatTime, type PurityLabel } from '../utils/active-session';

type ActiveSessionHeroProps = {
  CIRCUMFERENCE: number;
  RADIUS: number;
  RING_SIZE: number;
  STROKE_WIDTH: number;
  animatedCircleProps: React.ComponentProps<typeof ActiveSessionProgressRing>['animatedCircleProps'];
  completionPercentage: number;
  dailyProgress: number;
  elapsedSeconds: number;
  glowStyle: React.ComponentProps<typeof ActiveSessionProgressRing>['glowStyle'];
  labelColor: string;
  momentumScores: number[];
  outerStrokeDashoffset: number;
  perfectFocusActive: boolean;
  perfectFocusBurst: React.ComponentProps<typeof ActiveSessionProgressRing>['perfectFocusBurst'];
  phaseAccent: string;
  phaseIcon: 'clock' | 'target';
  phaseLabel: string;
  pulseStyle: React.ComponentProps<typeof ActiveSessionProgressRing>['pulseStyle'];
  purityLabel: PurityLabel;
  purityScore: number;
  remainingSeconds: number;
  rotatingPerfectFocusStyle: React.ComponentProps<typeof ActiveSessionProgressRing>['rotatingPerfectFocusStyle'];
  streakMultiplier: number;
  themeColors: {
    error: string;
    inverse: string;
    primary300: string;
    success: string;
    warning: string;
  };
  todayFocusSeconds: number;
  withAlpha: (color: string, alpha: number) => string;
};

export const ActiveSessionHero: React.FC<ActiveSessionHeroProps> = ({
  CIRCUMFERENCE,
  RADIUS,
  RING_SIZE,
  STROKE_WIDTH,
  animatedCircleProps,
  completionPercentage,
  dailyProgress,
  elapsedSeconds,
  glowStyle,
  labelColor,
  momentumScores,
  outerStrokeDashoffset,
  perfectFocusActive,
  perfectFocusBurst,
  phaseAccent,
  phaseIcon,
  phaseLabel,
  pulseStyle,
  purityLabel,
  purityScore,
  remainingSeconds,
  rotatingPerfectFocusStyle,
  streakMultiplier,
  themeColors,
  todayFocusSeconds,
  withAlpha,
}) => (
  <Box flex={1} justifyContent="center" alignItems="center" px="lg">
    <Box alignItems="center">
      <Box
        flexDirection="row"
        alignItems="center"
        gap="sm"
        mb="lg"
        px="md"
        py="sm"
        borderRadius="full"
        style={{
          backgroundColor: withAlpha(phaseAccent, 0.12),
          borderWidth: 1,
          borderColor: withAlpha(phaseAccent, 0.22),
        }}
      >
        <Icon name={phaseIcon} size="sm" color={phaseAccent} />
        <Text variant="label" style={{ color: phaseAccent }}>
          {phaseLabel.toUpperCase()}
        </Text>
      </Box>
      {perfectFocusActive ? (
        <Box
          alignSelf="center"
          mb="md"
          px="md"
          py="xs"
          borderRadius="full"
          style={{
            backgroundColor: withAlpha(themeColors.warning, 0.14),
            borderWidth: 1,
            borderColor: withAlpha(themeColors.warning, 0.36),
          }}
        >
          <Text variant="caption" style={{ color: themeColors.warning, fontWeight: '700' }}>
            {'\uD83D\uDD25 Perfect Focus'}
          </Text>
        </Box>
      ) : null}
      <ActiveSessionProgressRing
        CIRCUMFERENCE={CIRCUMFERENCE}
        RADIUS={RADIUS}
        RING_SIZE={RING_SIZE}
        STROKE_WIDTH={STROKE_WIDTH}
        animatedCircleProps={animatedCircleProps}
        glowStyle={glowStyle}
        outerStrokeDashoffset={outerStrokeDashoffset}
        perfectFocusActive={perfectFocusActive}
        perfectFocusBurst={perfectFocusBurst}
        phaseAccent={phaseAccent}
        pulseStyle={pulseStyle}
        purityLabel={purityLabel}
        purityScore={purityScore}
        remainingSeconds={remainingSeconds}
        rotatingPerfectFocusStyle={rotatingPerfectFocusStyle}
        streakMultiplier={streakMultiplier}
        themeColors={{
          inverse: themeColors.inverse,
          primary300: themeColors.primary300,
          warning: themeColors.warning,
        }}
        withAlpha={withAlpha}
      />
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="sm" mt="lg">
        {momentumScores.length > 0 ? (
          momentumScores.map((score, index) => (
            <Box
              key={`momentum-${index}`}
              width={8}
              height={8}
              borderRadius="full"
              style={{
                backgroundColor:
                  score >= 70
                    ? themeColors.success
                    : score >= 45
                      ? themeColors.warning
                      : themeColors.error,
                opacity: 0.45 + ((index + 1) / momentumScores.length) * 0.55,
              }}
            />
          ))
        ) : (
          <Text variant="caption" color="text.secondary">
            Calibrating momentum...
          </Text>
        )}
      </Box>
      <Text variant="caption" color="text.secondary" textAlign="center" mt="sm">
        {`${formatTime(todayFocusSeconds)} today • ${Math.round(dailyProgress)}% of 2h goal`}
      </Text>
      <Box flexDirection="row" justifyContent="center" gap="xl" mt="xl">
        <Box alignItems="center">
          <Text variant="h4" color="text.primary">
            {formatTime(elapsedSeconds)}
          </Text>
          <Text variant="caption" color="text.secondary">
            Elapsed
          </Text>
        </Box>
        <Box alignItems="center">
          <Text variant="h4" style={{ color: labelColor }}>
            {Math.round(completionPercentage)}%
          </Text>
          <Text variant="caption" color="text.secondary">
            Complete
          </Text>
        </Box>
      </Box>
    </Box>
  </Box>
);
