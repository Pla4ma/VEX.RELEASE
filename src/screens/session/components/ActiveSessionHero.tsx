import React from 'react';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { ActiveSessionProgressRing } from './ActiveSessionProgressRing';
import { formatTime, type PurityLabel } from '../utils/active-session';
import type { ActiveSessionDisplayPolicy } from '../utils/active-session-display-policy';

type ActiveSessionHeroProps = {
  CIRCUMFERENCE: number;
  RADIUS: number;
  RING_SIZE: number;
  STROKE_WIDTH: number;
  animatedCircleProps: React.ComponentProps<typeof ActiveSessionProgressRing>['animatedCircleProps'];
  completionPercentage: number;
  dailyProgress: number;
  displayPolicy: ActiveSessionDisplayPolicy;
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
  studyTargetLabel: string;
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

export const ActiveSessionHero: React.FC<ActiveSessionHeroProps> = (props) => (
  <Box flex={1} justifyContent="center" alignItems="center" px="lg">
    <Box alignItems="center">
      <SessionTargetBadge {...props} />
      <FocusSignalPills {...props} />
      <ActiveSessionProgressRing
        CIRCUMFERENCE={props.CIRCUMFERENCE}
        RADIUS={props.RADIUS}
        RING_SIZE={props.RING_SIZE}
        STROKE_WIDTH={props.STROKE_WIDTH}
        animatedCircleProps={props.animatedCircleProps}
        completionPercentage={props.completionPercentage}
        glowStyle={props.glowStyle}
        outerStrokeDashoffset={props.outerStrokeDashoffset}
        perfectFocusActive={props.perfectFocusActive}
        perfectFocusBurst={props.perfectFocusBurst}
        phaseAccent={props.phaseAccent}
        pulseStyle={props.pulseStyle}
        purityLabel={props.purityLabel}
        purityScore={props.purityScore}
        remainingSeconds={props.remainingSeconds}
        rotatingPerfectFocusStyle={props.rotatingPerfectFocusStyle}
        showPurityScore={props.displayPolicy.showPurityScore}
        streakMultiplier={props.streakMultiplier}
        themeColors={{
          inverse: props.themeColors.inverse,
          primary300: props.themeColors.primary300,
          warning: props.themeColors.warning,
        }}
        withAlpha={props.withAlpha}
      />
      <MomentumDots {...props} />
      <DailyProgress {...props} />
      <SessionStats {...props} />
    </Box>
  </Box>
);

function SessionTargetBadge(props: ActiveSessionHeroProps): React.JSX.Element {
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
          {props.phaseLabel.toUpperCase()}
        </Text>
      </Box>
      {props.displayPolicy.showStudyTarget ? (
        <Text variant="body" color="text.primary" textAlign="center" mb="md">
          {props.studyTargetLabel}
        </Text>
      ) : null}
    </>
  );
}

function FocusSignalPills(props: ActiveSessionHeroProps): React.JSX.Element | null {
  if (props.displayPolicy.showBossTinyIndicator) {
    return (
      <SignalPill color={props.themeColors.error} withAlpha={props.withAlpha}>
        Boss awaits completion
      </SignalPill>
    );
  }
  if (props.perfectFocusActive && props.displayPolicy.heroDensity !== 'minimal') {
    return (
      <SignalPill color={props.themeColors.warning} withAlpha={props.withAlpha}>
        Perfect Focus
      </SignalPill>
    );
  }
  return null;
}

function SignalPill(props: {
  children: string;
  color: string;
  withAlpha: (color: string, alpha: number) => string;
}): React.JSX.Element {
  return (
    <Box alignSelf="center" mb="md" px="md" py="xs" borderRadius="full" style={{
      backgroundColor: props.withAlpha(props.color, 0.12),
      borderWidth: 1,
      borderColor: props.withAlpha(props.color, 0.28),
    }}>
      <Text variant="caption" style={{ color: props.color, fontWeight: '700' }}>
        {props.children}
      </Text>
    </Box>
  );
}

function MomentumDots(props: ActiveSessionHeroProps): React.JSX.Element | null {
  if (!props.displayPolicy.showMomentumScore) return null;
  return (
    <Box flexDirection="row" alignItems="center" justifyContent="center" gap="sm" mt="lg">
      {props.momentumScores.length > 0 ? props.momentumScores.map((score, index) => (
        <Box key={`momentum-${index}`} width={8} height={8} borderRadius="full" style={{
          backgroundColor: score >= 70 ? props.themeColors.success : score >= 45 ? props.themeColors.warning : props.themeColors.error,
          opacity: 0.45 + ((index + 1) / props.momentumScores.length) * 0.55,
        }} />
      )) : (
        <Text variant="caption" color="text.secondary">
          Calibrating momentum...
        </Text>
      )}
    </Box>
  );
}

function DailyProgress(props: ActiveSessionHeroProps): React.JSX.Element | null {
  if (!props.displayPolicy.showDailyProgress) return null;
  return (
    <Text variant="caption" color="text.secondary" textAlign="center" mt="sm">
      {`${formatTime(props.todayFocusSeconds)} today - ${Math.round(props.dailyProgress)}% of 2h goal`}
    </Text>
  );
}

function SessionStats(props: ActiveSessionHeroProps): React.JSX.Element | null {
  if (props.displayPolicy.heroDensity === 'minimal') return null;
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
