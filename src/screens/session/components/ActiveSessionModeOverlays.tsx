import React from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { StudyQuizBreak } from '../../../features/session/StudyQuizBreak';
import {
  CreativeMoodLogger,
  type Mood,
} from '../../../session/components/CreativeMoodLogger';
import { ModeIndicatorBadge } from '../../../session/components/ModeIndicatorBadge';
import { SessionMode } from '../../../session/modes';
import type { ActiveSessionDisplayPolicy } from '../utils/active-session-display-policy';

type ActiveSessionModeOverlaysProps = {
  allowStudyQuizBreak?: boolean;
  chainCount?: number;
  completionPercentage: number;
  currentMode: SessionMode;
  displayPolicy: ActiveSessionDisplayPolicy;
  isPaused: boolean;
  onCloseQuiz?: (correctAnswers: number) => void;
  onCreativeMoodSelected?: (mood: Mood) => void;
  onSkipCreativeMood?: () => void;
  onSkipQuiz?: () => void;
  quizBreakKey?: string | null;
  remainingSeconds: number;
  studyPlanId?: string;
};

export function ActiveSessionModeOverlays(
  props: ActiveSessionModeOverlaysProps,
): JSX.Element {
  if (!props.displayPolicy.showModeOverlay) {
    return <></>;
  }

  return (
    <>
      <ModeOverlay {...props} />
      <StudyQuizBreak
        isVisible={
          props.allowStudyQuizBreak &&
          props.quizBreakKey !== null &&
          props.isPaused
        }
        studyPlanId={props.studyPlanId}
        onSkip={props.onSkipQuiz}
        onClose={props.onCloseQuiz}
      />
    </>
  );
}

function ModeOverlay(props: ActiveSessionModeOverlaysProps): React.JSX.Element {
  if (props.currentMode === SessionMode.SPRINT) {
    return <SprintOverlay chainCount={props.chainCount} />;
  }
  if (props.currentMode === SessionMode.STUDY) {
    return <StudyOverlay completionPercentage={props.completionPercentage} />;
  }
  if (props.currentMode === SessionMode.CREATIVE) {
    return (
      <CreativeMoodLogger
        isVisible={props.remainingSeconds <= 120 && !props.isPaused}
        onMoodSelected={props.onCreativeMoodSelected ?? (() => {})}
        onSkip={props.onSkipCreativeMood ?? (() => {})}
      />
    );
  }
  return (
    <ModeIndicatorBadge
      mode={props.currentMode}
      chainCount={props.chainCount}
    />
  );
}

function SprintOverlay({
  chainCount,
}: {
  chainCount: number;
}): React.JSX.Element {
  return (
    <Box
      position="absolute"
      top={104}
      left={16}
      right={16}
      flexDirection="row"
      alignItems="center"
      gap="xs"
      style={{ zIndex: 20 }}
    >
      <Box flexDirection="row" gap="xs">
        {[1, 2, 3, 4].map((item) => (
          <Box
            key={item}
            width={10}
            height={10}
            borderRadius="full"
            bg={item <= chainCount ? 'primary.500' : 'background.tertiary'}
          />
        ))}
      </Box>
      {chainCount > 1 ? (
        <Animated.View
          entering={ZoomIn.duration(200)}
          style={{ marginLeft: 8 }}
        >
          <Text variant="caption" weight="semibold" color="primary.500">
            {`${(1 + (chainCount - 1) * 0.05).toFixed(2)}x chain bonus`}
          </Text>
        </Animated.View>
      ) : null}
    </Box>
  );
}

function StudyOverlay({
  completionPercentage,
}: {
  completionPercentage: number;
}): React.JSX.Element {
  return (
    <Box
      position="absolute"
      top={104}
      left={16}
      right={16}
      style={{ zIndex: 20 }}
    >
      <Text variant="caption" color="text.secondary">
        {completionPercentage < 50
          ? 'Planned quiz break at 50%'
          : 'Final planned quiz check at 90%'}
      </Text>
    </Box>
  );
}
