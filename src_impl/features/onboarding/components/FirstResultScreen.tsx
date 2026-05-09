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
import { Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';
import { SuccessCelebration } from './SuccessCelebration';
import { FocusScoreChange } from './FocusScoreChange';
import { calculateSessionGrade } from '../../session-completion/grading-service';
import type { SessionGradingInput } from '../../session-completion/grading-schemas';
import { resolveSessionMode } from '../../../session/modes';

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

/**
 * First result screen
 */
export function FirstResultScreen({
  userName,
  sessionDuration,
  sessionData,
  focusScoreBefore,
  onComplete,
}: FirstResultScreenProps): JSX.Element {
  const { theme } = useTheme();
  const displayName = userName || 'there';

  // Calculate session grade using the grading service
  const resolvedMode = resolveSessionMode(sessionData.mode);
  const gradingInput: SessionGradingInput = {
    ...sessionData,
    mode: resolvedMode,
    isRecoverySession: resolvedMode === 'STARTER' || resolvedMode === 'RECOVERY',
  };

  const gradingResult = calculateSessionGrade(gradingInput);
  const focusScoreAfter = focusScoreBefore + (gradingResult.focusScoreImpactRecommendation || 0);
  const xpEarned = Math.floor(sessionDuration * 2 * (gradingResult.xpQualityMultiplier || 1));
  const sessionGrade = gradingResult.kind === 'completed' ? gradingResult.grade : 'D';
  const sessionGradeLabel = gradingResult.kind === 'completed'
    ? gradingResult.gradeLabel
    : 'Recovery needed';

  return (
    <Box flex={1} bg="background.primary" px="lg" py="xl">
      {/* Header Content */}
      <Animated.View entering={FadeIn.duration(400)}>
        <Box gap="sm" mb="xl">
          <Text variant="label" color="success.DEFAULT">
            Step 5 of 5
          </Text>
          <Text variant="h2" color="text.primary">
            First session complete, {displayName}!
          </Text>
          <Text variant="body" color="text.secondary">
            You've taken the first step. Your focus journey begins now.
          </Text>
        </Box>
      </Animated.View>

      {/* Success Celebration */}
      <Animated.View entering={FadeInUp.duration(600).delay(200)} style={{ width: '100%' }}>
        <Box alignItems="center" py="lg">
          <SuccessCelebration />
        </Box>
      </Animated.View>

      {/* Session Results */}
      <Animated.View entering={FadeInUp.duration(500).delay(400)} style={{ width: '100%' }}>
        <Box gap="md">
          {/* Grade Display */}
          <Box
            p="lg"
            borderRadius="xl"
            bg="background.secondary"
            borderWidth={1}
            borderColor="border.light"
            alignItems="center"
            gap="sm"
          >
            <Text variant="bodyLarge" color="text.tertiary">
              Session Grade
            </Text>
            <Text variant="hero" color="text.primary" fontWeight="800">
              {sessionGrade}
            </Text>
            <Text variant="body" color="text.secondary">
              {sessionGradeLabel}
            </Text>
            <Text variant="bodySmall" color="text.tertiary">
              {sessionDuration} minutes completed
            </Text>
          </Box>

          {/* Focus Score Change */}
          <FocusScoreChange before={focusScoreBefore} after={focusScoreAfter} />

          {/* Companion Reaction */}
          <Box
            p="lg"
            borderRadius="xl"
            bg={`${theme.colors.primary[500]}10`}
            borderWidth={1}
            borderColor={`${theme.colors.primary[500]}30`}
            alignItems="center"
            gap="sm"
          >
            <Text fontSize={32}>🔥</Text>
            <Text variant="h3" color="text.primary" fontWeight="700">
              Your companion is excited!
            </Text>
            <Text variant="body" color="text.secondary" textAlign="center">
              {sessionGrade === 'S' || sessionGrade === 'A'
                ? "Amazing focus! Your companion can't wait for the next session."
                : sessionGrade === 'B'
                ? 'Great job! Your companion is proud of your progress.'
                : "Good start! Your companion knows you'll do even better next time."}
            </Text>
          </Box>

          {/* XP Earned */}
          <Box
            p="lg"
            borderRadius="xl"
            bg="background.secondary"
            borderWidth={1}
            borderColor="border.light"
            alignItems="center"
            gap="sm"
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={24}>⚡</Text>
              <Text variant="h3" color="text.primary" fontWeight="700">
                +{xpEarned} XP
              </Text>
              {gradingResult.xpQualityMultiplier && gradingResult.xpQualityMultiplier > 1 && (
                <Box px="sm" py="xs" borderRadius="full" bg={`${theme.colors.success[500]}20`}>
                  <Text variant="caption" color="success.600" fontWeight="600">
                    +{Math.round((gradingResult.xpQualityMultiplier - 1) * 100)}% bonus
                  </Text>
                </Box>
              )}
            </Box>
            <Text variant="body" color="text.secondary">
              Experience earned toward next level
            </Text>
          </Box>
        </Box>
      </Animated.View>

      {/* What's Next */}
      <Animated.View entering={FadeIn.duration(400).delay(600)}>
        <Box gap="sm" mt="lg">
          <Text variant="h3" color="text.primary" textAlign="center">
            What's next?
          </Text>
          <Box gap="sm">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16}>🔥</Text>
              <Text variant="body" color="text.secondary">
                Your streak has started (1 day)
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16}>🎯</Text>
              <Text variant="body" color="text.secondary">
                New daily mission: Complete another focus session
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16}>�</Text>
              <Text fontSize={16}>📈</Text>
              <Text variant="body" color="text.secondary">
                Focus Score updated based on your performance
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16}>⭐</Text>
              <Text variant="body" color="text.secondary">
                Companion growth progress unlocked
              </Text>
            </Box>
          </Box>
        </Box>
      </Animated.View>

      {/* Spacer */}
      <Box flex={1} minHeight={20} />

      {/* CTA Button */}
      <Animated.View entering={FadeInUp.duration(400).delay(800)} style={{ width: '100%' }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={onComplete}
          accessibilityLabel="Continue to Home → button"
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          Continue to Home →
        </Button>
      </Animated.View>
    </Box>
  );
}

export default FirstResultScreen;
