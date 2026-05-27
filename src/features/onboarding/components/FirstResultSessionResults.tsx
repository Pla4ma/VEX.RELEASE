/**
 * FirstResultSessionResults Component
 *
 * Displays grade, focus score change, companion reaction, and XP earned.
 */

import React from "react";
import { Box } from "../../../components/primitives/Box";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { FocusScoreChange } from "./FocusScoreChange";
import type { SessionGradingResult } from "../../session-completion/grading-schemas";

interface FirstResultSessionResultsProps {
  sessionGrade: string;
  sessionGradeLabel: string;
  sessionDuration: number;
  focusScoreBefore: number;
  focusScoreAfter: number;
  gradingResult: SessionGradingResult;
}

export function FirstResultSessionResults({
  sessionGrade,
  sessionGradeLabel,
  sessionDuration,
  focusScoreBefore,
  focusScoreAfter,
  gradingResult,
}: FirstResultSessionResultsProps): JSX.Element {
  const { theme } = useTheme();
  const xpEarned = Math.floor(
    sessionDuration * 2 * (gradingResult.xpQualityMultiplier || 1),
  );

  return (
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
          {sessionGrade === "S" || sessionGrade === "A"
            ? "Amazing focus! Your companion can't wait for the next session."
            : sessionGrade === "B"
              ? "Great job! Your companion is proud of your progress."
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
          {gradingResult.xpQualityMultiplier &&
            gradingResult.xpQualityMultiplier > 1 && (
              <Box
                px="sm"
                py="xs"
                borderRadius="full"
                bg={`${theme.colors.success[500]}20`}
              >
                <Text variant="caption" color="success.600" fontWeight="600">
                  +{Math.round((gradingResult.xpQualityMultiplier - 1) * 100)}%
                  bonus
                </Text>
              </Box>
            )}
        </Box>
        <Text variant="body" color="text.secondary">
          Experience earned toward next level
        </Text>
      </Box>
    </Box>
  );
}
