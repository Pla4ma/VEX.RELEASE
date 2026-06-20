/**
 * FirstResultScreen Component
 *
 * First result screen for five-screen maximum onboarding.
 * Shows after first session completion with grade, Focus Score movement,
 * companion reaction, XP progress, streak seed, and next mission.
 *
 * @phase 4
 */

import React from 'react';

import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme/ThemeContext';
import { SuccessCelebration } from './SuccessCelebration';
import { FirstResultSessionResults } from './FirstResultSessionResults';
import { calculateSessionGrade } from '../../session-completion/grading-service';
import type { SessionGradingInput } from '../../session-completion/grading-schemas';
import { resolveSessionMode } from '../../../session/modes';
import { Text as VexText } from '../../../components/primitives/Text';

interface FirstResultScreenProps {
  userName: string;
  sessionDuration: number;
  sessionData: {
    completedDurationSeconds: number;
    targetDurationSeconds: number;
    effectiveFocusedSeconds: number;
    pauseCount: number;
    interruptionCount: number;
    backgroundTimeSeconds: number;
    mode: string;
    strictMode: boolean;
    isAbandoned: boolean;
  };
  focusScoreBefore: number;
  onComplete: () => void;
}

export function FirstResultScreen({
  userName,
  sessionDuration,
  sessionData,
  focusScoreBefore,
  onComplete,
}: FirstResultScreenProps): React.ReactNode {
  const { theme: _theme } = useTheme();
  const displayName = userName || 'there';

  const resolvedMode = resolveSessionMode(sessionData.mode);
  const gradingInput: SessionGradingInput = {
    ...sessionData,
    mode: resolvedMode,
    isRecoverySession:
      resolvedMode === 'STARTER' || resolvedMode === 'RECOVERY',
  };

  const gradingResult = calculateSessionGrade(gradingInput);
  const focusScoreAfter =
    focusScoreBefore + (gradingResult.focusScoreImpactRecommendation || 0);
  const sessionGrade =
    gradingResult.kind === 'completed' ? gradingResult.grade : 'D';
  const sessionGradeLabel =
    gradingResult.kind === 'completed'
      ? gradingResult.gradeLabel
      : 'Recovery needed';

  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="xl">
          <Text variant="label" color="success.DEFAULT">
            Complete
          </Text>
          <Text variant="h2" color="text.primary">
            First session complete, {displayName}!
          </Text>
          <Text variant="body" color="text.secondary">
            You have taken the first step. VEX is learning how you focus.
          </Text>
        </Box>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(600).delay(200)}
        style={{ width: '100%' }}
      >
        <Box alignItems="center" py="lg">
          <SuccessCelebration />
        </Box>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(500).delay(400)}
        style={{ width: '100%' }}
      >
        <FirstResultSessionResults
          sessionGrade={sessionGrade}
          sessionGradeLabel={sessionGradeLabel}
          sessionDuration={sessionDuration}
          focusScoreBefore={focusScoreBefore}
          focusScoreAfter={focusScoreAfter}
          gradingResult={gradingResult}
        />
      </Animated.View>

      <Animated.View entering={FadeIn.duration(400).delay(600)}>
        <Box gap="md" mt="lg">
          <Text variant="h3" color="text.primary" textAlign="center">
            VEX is learning what helps you start.
          </Text>
          <Box gap="sm">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16}>🌱</Text>
              <Text variant="body" color="text.secondary">
                Your session data was saved
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16}>✨</Text>
              <Text variant="body" color="text.secondary">
                VEX will adapt your next session
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16}>📅</Text>
              <Text variant="body" color="text.secondary">
                Come back tomorrow for your next session
              </Text>
            </Box>
          </Box>
        </Box>
      </Animated.View>

      <Box flex={1} minHeight={20} />

      <Animated.View
        entering={FadeInUp.duration(400).delay(800)}
        style={{ width: '100%' }}
      >
        <Button variant="primary"
          size="lg"
          fullWidth
          onPress={onComplete}
          accessibilityLabel="Continue to home"
          accessibilityRole="button"
          accessibilityHint="Double tap to select"
        >
          <VexText>Continue to Home →</VexText>
        </Button>
      </Animated.View>
    </Box>
  );
}

export default FirstResultScreen;
