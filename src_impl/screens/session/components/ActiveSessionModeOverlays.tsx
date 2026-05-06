import React from 'react';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { StudyQuizBreak } from '../../../features/session/StudyQuizBreak';
import { CreativeMoodLogger, type Mood } from '../../../session/components/CreativeMoodLogger';
import { ModeIndicatorBadge } from '../../../session/components/ModeIndicatorBadge';
import { SessionMode } from '../../../session/modes';

type ActiveSessionModeOverlaysProps = {
  chainCount: number;
  completionPercentage: number;
  currentMode: SessionMode;
  isPaused: boolean;
  onCloseQuiz: (correctAnswers: number) => void;
  onCreativeMoodSelected?: (mood: Mood) => void;
  onSkipCreativeMood?: () => void;
  onSkipQuiz: () => void;
  quizBreakKey: string | null;
  remainingSeconds: number;
  studyPlanId: string | undefined;
};

export function ActiveSessionModeOverlays({
  chainCount,
  completionPercentage,
  currentMode,
  isPaused,
  onCloseQuiz,
  onCreativeMoodSelected,
  onSkipCreativeMood,
  onSkipQuiz,
  quizBreakKey,
  remainingSeconds,
  studyPlanId,
}: ActiveSessionModeOverlaysProps): JSX.Element {
  return (
    <>
      <ModeIndicatorBadge mode={currentMode} chainCount={chainCount} />

      {currentMode === SessionMode.SPRINT ? (
        <Box position="absolute" top={104} left={16} right={16} flexDirection="row" alignItems="center" gap="xs" style={{ zIndex: 20 }}>
          {/* Chain dots */}
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

          {/* Chain multiplier text — NEW */}
          {chainCount > 1 && (
            <Animated.View
              entering={ZoomIn.duration(200)}
              style={{ marginLeft: 8 }}
            >
              <Text
                variant="caption"
                weight="semibold"
                color="primary.500"
              >
                ×{(1 + (chainCount - 1) * 0.05).toFixed(2)} chain bonus
              </Text>
            </Animated.View>
          )}
        </Box>
      ) : null}

      {currentMode === SessionMode.STUDY ? (
        <Box position="absolute" top={104} left={16} right={16} style={{ zIndex: 20 }}>
          <Text variant="caption" color="text.secondary">
            {completionPercentage < 50 ? 'Quiz break at 50%' : 'Final quiz check at 90%'}
          </Text>
        </Box>
      ) : null}

      {currentMode === SessionMode.CREATIVE && (
        <CreativeMoodLogger
          isVisible={remainingSeconds <= 120 && !isPaused}
          onMoodSelected={onCreativeMoodSelected ?? (() => {})}
          onSkip={onSkipCreativeMood ?? (() => {})}
        />
      )}

      <StudyQuizBreak
        isVisible={currentMode === SessionMode.STUDY && quizBreakKey !== null && isPaused}
        studyPlanId={studyPlanId}
        onSkip={onSkipQuiz}
        onClose={onCloseQuiz}
      />
    </>
  );
}
