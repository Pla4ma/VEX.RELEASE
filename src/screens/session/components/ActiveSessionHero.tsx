import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { ActiveSessionProgressRing } from './ActiveSessionProgressRing';
import { formatTime } from '../utils/active-session';
import type { SharedValue } from 'react-native-reanimated';
import type { ActiveSessionHeroViewModel } from '../utils/active-session-hero-view-model';

type ActiveSessionHeroProps = {
  viewModel: ActiveSessionHeroViewModel;
  CIRCUMFERENCE: number;
  RADIUS: number;
  RING_SIZE: number;
  STROKE_WIDTH: number;
  animatedCircleProps: React.ComponentProps<typeof ActiveSessionProgressRing>['animatedCircleProps'];
  dailyProgress: number;
  glowStyle: React.ComponentProps<typeof ActiveSessionProgressRing>['glowStyle'];
  labelColor: string;
  outerStrokeDashoffset: number;
  perfectFocusBurst: React.ComponentProps<typeof ActiveSessionProgressRing>['perfectFocusBurst'];
  pulseStyle: React.ComponentProps<typeof ActiveSessionProgressRing>['pulseStyle'];
  rotatingPerfectFocusStyle: React.ComponentProps<typeof ActiveSessionProgressRing>['rotatingPerfectFocusStyle'];
  themeColors: {
    error: string;
    inverse: string;
    primary300: string;
    success: string;
    warning: string;
  };
  withAlpha: (color: string, alpha: number) => string;
};

export const ActiveSessionHero: React.FC<ActiveSessionHeroProps> = ({ viewModel, CIRCUMFERENCE, RADIUS, RING_SIZE, STROKE_WIDTH, animatedCircleProps, dailyProgress, glowStyle, labelColor, outerStrokeDashoffset, perfectFocusBurst, pulseStyle, rotatingPerfectFocusStyle, themeColors, withAlpha }) => (
  <Box flex={1} justifyContent="center" alignItems="center" px="lg">
    <Box alignItems="center">
      <SessionTargetBadge
        phaseIcon={viewModel.phaseIcon}
        phaseLabel={viewModel.phaseLabel}
        phaseAccent={viewModel.phaseAccent}
        studyTargetLabel={viewModel.studyTargetLabel}
        withAlpha={withAlpha}
      />
      <FocusSignalPill signalPill={viewModel.signalPill} themeColors={themeColors} withAlpha={withAlpha} />
      <ActiveSessionProgressRing
        CIRCUMFERENCE={CIRCUMFERENCE}
        RADIUS={RADIUS}
        RING_SIZE={RING_SIZE}
        STROKE_WIDTH={STROKE_WIDTH}
        animatedCircleProps={animatedCircleProps}
        completionPercentage={viewModel.completionPercentage}
        glowStyle={glowStyle}
        outerStrokeDashoffset={outerStrokeDashoffset}
        perfectFocusActive={viewModel.perfectFocusActive}
        perfectFocusBurst={perfectFocusBurst}
        phaseAccent={viewModel.phaseAccent}
        pulseStyle={pulseStyle}
        purityLabel={viewModel.purityLabel}
        purityScore={viewModel.purityScore}
        remainingSeconds={viewModel.remainingSeconds}
        rotatingPerfectFocusStyle={rotatingPerfectFocusStyle}
        showPurityScore={viewModel.showPurityScore}
        streakMultiplier={viewModel.streakMultiplier}
        themeColors={{ inverse: themeColors.inverse, primary300: themeColors.primary300, warning: themeColors.warning }}
        withAlpha={withAlpha}
      />
      <MomentumDots momentumScores={viewModel.momentumScores} themeColors={themeColors} />
      <DailyProgress dailyProgress={viewModel.dailyProgress} todayFocusSeconds={viewModel.todayFocusSeconds} />
      <SessionStats heroDensity={viewModel.heroDensity} elapsedSeconds={viewModel.elapsedSeconds} completionPercentage={viewModel.completionPercentage} labelColor={labelColor} />
    </Box>
  </Box>
);

function SessionTargetBadge(props: {
  phaseIcon: 'clock' | 'target';
  phaseLabel: string;
  phaseAccent: string;
  studyTargetLabel: string | null;
  withAlpha: (color: string, alpha: number) => string;
}): React.JSX.Element {
  return (
    <>
      <Box
        flexDirection="row"
        alignItems="center"
        gap="sm"
        mb="lg"
        px="md"
        py="sm"
        borderRadius="full"
        style={{
          backgroundColor: props.withAlpha(props.phaseAccent, 0.12),
          borderWidth: 1,
          borderColor: props.withAlpha(props.phaseAccent, 0.22),
        }}
      >
        <Icon name={props.phaseIcon} size="sm" color={props.phaseAccent} />
        <Text variant="label" style={{ color: props.phaseAccent }}>
          {props.phaseLabel}
        </Text>
      </Box>
      {props.studyTargetLabel ? (
        <Text variant="body" color="text.primary" textAlign="center" mb="md">
          {props.studyTargetLabel}
        </Text>
      ) : null}
    </>
  );
}

function FocusSignalPill(props: {
  signalPill: { type: 'boss' | 'focus'; label: string } | null;
  themeColors: { error: string; warning: string };
  withAlpha: (color: string, alpha: number) => string;
}): React.JSX.Element | null {
  if (!props.signalPill) {return null;}
  const color = props.signalPill.type === 'boss' ? props.themeColors.error : props.themeColors.warning;
  return (
    <Box alignSelf="center" mb="md" px="md" py="xs" borderRadius="full" style={{
      backgroundColor: props.withAlpha(color, 0.12),
      borderWidth: 1,
      borderColor: props.withAlpha(color, 0.28),
    }}>
      <Text variant="caption" style={{ color, fontWeight: '700' }}>
        {props.signalPill.label}
      </Text>
    </Box>
  );
}

function MomentumDots(props: {
  momentumScores: number[] | null;
  themeColors: { success: string; warning: string; error: string };
}): React.JSX.Element | null {
  if (!props.momentumScores) {return null;}
  const scores = props.momentumScores;
  return (
    <Box flexDirection="row" alignItems="center" justifyContent="center" gap="sm" mt="lg">
      {scores.length > 0 ? scores.map((score, index) => (
        <Box key={`momentum-${index}`} width={8} height={8} borderRadius="full" style={{
          backgroundColor: score >= 70 ? props.themeColors.success : score >= 45 ? props.themeColors.warning : props.themeColors.error,
          opacity: 0.45 + ((index + 1) / scores.length) * 0.55,
        }} />
      )) : (
        <Text variant="caption" color="text.secondary">
          Calibrating momentum...
        </Text>
      )}
    </Box>
  );
}

function DailyProgress(props: {
  dailyProgress: number | null;
  todayFocusSeconds: number | null;
}): React.JSX.Element | null {
  if (props.dailyProgress === null || props.todayFocusSeconds === null) {return null;}
  return (
    <Text variant="caption" color="text.secondary" textAlign="center" mt="sm">
      {`${formatTime(props.todayFocusSeconds)} today - ${Math.round(props.dailyProgress)}% of 2h goal`}
    </Text>
  );
}

function SessionStats(props: {
  heroDensity: 'minimal' | 'standard' | 'rich';
  elapsedSeconds: number;
  completionPercentage: number;
  labelColor: string;
}): React.JSX.Element | null {
  if (props.heroDensity === 'minimal') {return null;}
  return (
    <Box flexDirection="row" justifyContent="center" gap="xl" mt="xl">
      <Stat label="Elapsed" value={formatTime(props.elapsedSeconds)} />
      <Stat label="Complete" value={`${Math.round(props.completionPercentage)}%`} color={props.labelColor} />
    </Box>
  );
}

function Stat(props: { label: string; value: string; color?: string }): React.JSX.Element {
  return (
    <Box alignItems="center">
      <Text variant="h4" color={props.color ? undefined : 'text.primary'} style={props.color ? { color: props.color } : undefined}>
        {props.value}
      </Text>
      <Text variant="caption" color="text.secondary">
        {props.label}
      </Text>
    </Box>
  );
}
