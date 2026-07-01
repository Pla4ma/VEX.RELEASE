import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons/components/Icon';
import { ActiveSessionProgressRing } from './ActiveSessionProgressRing';
import {
  MomentumDots,
  DailyProgress,
  SessionStats,
} from './ActiveSessionHeroSecondary';
import type { ActiveSessionHeroViewModel } from '../utils/active-session-hero-view-model';

type ProgressRingProps = Pick<
  React.ComponentProps<typeof ActiveSessionProgressRing>,
  | 'CIRCUMFERENCE'
  | 'RADIUS'
  | 'RING_SIZE'
  | 'STROKE_WIDTH'
  | 'animatedCircleProps'
  | 'glowStyle'
  | 'outerStrokeDashoffset'
  | 'perfectFocusBurst'
  | 'pulseStyle'
  | 'rotatingPerfectFocusStyle'
> & {
  labelColor: string;
  withAlpha: (color: string, alpha: number) => string;
};

type ActiveSessionHeroProps = {
  viewModel: ActiveSessionHeroViewModel;
  progressRingProps: ProgressRingProps;
  themeColors: {
    error: string;
    inverse: string;
    primary300: string;
    success: string;
    warning: string;
  };
  isReducedMotion: boolean;
};

export const ActiveSessionHero: React.ComponentType<ActiveSessionHeroProps> = ({
  viewModel,
  progressRingProps,
  themeColors,
  isReducedMotion,
}) => (
  <Box flex={1} justifyContent="center" alignItems="center" px="lg">
    <Box alignItems="center">
      <SessionTargetBadge
        phaseIcon={viewModel.phaseIcon}
        phaseLabel={viewModel.phaseLabel}
        phaseAccent={viewModel.phaseAccent}
        studyTargetLabel={viewModel.studyTargetLabel}
        isReducedMotion={isReducedMotion}
        withAlpha={progressRingProps.withAlpha}
      />
      <FocusSignalPill
        signalPill={viewModel.signalPill}
        themeColors={themeColors}
        isReducedMotion={isReducedMotion}
        withAlpha={progressRingProps.withAlpha}
      />
      <ActiveSessionProgressRing
        CIRCUMFERENCE={progressRingProps.CIRCUMFERENCE}
        RADIUS={progressRingProps.RADIUS}
        RING_SIZE={progressRingProps.RING_SIZE}
        STROKE_WIDTH={progressRingProps.STROKE_WIDTH}
        animatedCircleProps={progressRingProps.animatedCircleProps}
        completionPercentage={viewModel.completionPercentage}
        glowStyle={progressRingProps.glowStyle}
        outerStrokeDashoffset={progressRingProps.outerStrokeDashoffset}
        perfectFocusActive={viewModel.perfectFocusActive}
        perfectFocusBurst={progressRingProps.perfectFocusBurst}
        phaseAccent={viewModel.phaseAccent}
        pulseStyle={progressRingProps.pulseStyle}
        purityLabel={viewModel.purityLabel}
        purityScore={viewModel.purityScore}
        remainingSeconds={viewModel.remainingSeconds}
        rotatingPerfectFocusStyle={progressRingProps.rotatingPerfectFocusStyle}
        showPurityScore={viewModel.showPurityScore}
        streakMultiplier={viewModel.streakMultiplier}
        themeColors={{
          inverse: themeColors.inverse,
          primary300: themeColors.primary300,
          warning: themeColors.warning,
        }}
        withAlpha={progressRingProps.withAlpha}
      />
      <MomentumDots viewModel={viewModel} themeColors={themeColors} />
      <DailyProgress viewModel={viewModel} />
      <SessionStats
        viewModel={viewModel}
        labelColor={progressRingProps.labelColor}
      />
    </Box>
  </Box>
);

function SessionTargetBadge(props: {
  phaseIcon: 'clock' | 'target';
  phaseLabel: string;
  phaseAccent: string;
  studyTargetLabel: string | null;
  isReducedMotion: boolean;
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
        props.isReducedMotion ? (
          <Text variant="body" color="text.primary" textAlign="center" mb="md">
            {props.studyTargetLabel}
          </Text>
        ) : (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text
              variant="body"
              color="text.primary"
              textAlign="center"
              mb="md"
            >
              {props.studyTargetLabel}
            </Text>
          </Animated.View>
        )
      ) : null}
    </>
  );
}

function FocusSignalPill(props: {
  signalPill: { type: 'boss' | 'focus'; label: string } | null;
  themeColors: { error: string; warning: string };
  isReducedMotion: boolean;
  withAlpha: (color: string, alpha: number) => string;
}): React.JSX.Element | null {
  if (!props.signalPill) {
    return null;
  }
  const color =
    props.signalPill.type === 'boss'
      ? props.themeColors.error
      : props.themeColors.warning;
  const content = (
    <Box
      alignSelf="center"
      mb="md"
      px="md"
      py="xs"
      borderRadius="full"
      style={{
        backgroundColor: props.withAlpha(color, 0.12),
        borderWidth: 1,
        borderColor: props.withAlpha(color, 0.28),
      }}
    >
      <Text variant="caption" style={{ color, fontWeight: '700' }}>
        {props.signalPill.label}
      </Text>
    </Box>
  );
  if (props.isReducedMotion) {
    return content;
  }
  return (
    <Animated.View entering={FadeIn.duration(150)}>{content}</Animated.View>
  );
}
