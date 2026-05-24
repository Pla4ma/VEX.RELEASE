/**
 * Weekly Quest Card
 *
 * Displays weekly quest progress on the home screen.
 */

import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { useWeeklyQuestState } from '../hooks';
import type { WeeklyQuestStep } from '../schemas';

interface WeeklyQuestCardProps {
  userId: string;
  onPress?: () => void;
}

export const WeeklyQuestCard: React.FC<WeeklyQuestCardProps> = ({ userId, onPress }) => {
  const { theme } = useTheme();
  const { data: questState, isPending } = useWeeklyQuestState(userId, Date.now());

  if (isPending || !questState) {
    return null;
  }

  // Only show if there are incomplete steps
  const completedSteps = questState.steps.filter((s: WeeklyQuestStep) => s.completed).length;
  const totalSteps = questState.steps.length;

  if (completedSteps === totalSteps) {
    return null;
  }

  // Get current active step (first incomplete)
  const currentStep = questState.steps.find((s: WeeklyQuestStep) => !s.completed);
  if (!currentStep) {return null;}

  const progressPercent = (currentStep.progress / currentStep.target) * 100;

  return (
    <Pressable onPress={onPress}>
      <Box
        style={{
          backgroundColor: theme.colors.background.elevated,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[4],
          marginHorizontal: theme.spacing[4],
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        }}
      >
        {/* Header */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb={theme.spacing[2]}>
          <Text variant="h4" color="text.primary">
            🎯 Weekly Quest
          </Text>
          <Text variant="caption" color="text.tertiary">
            {completedSteps}/{totalSteps} complete
          </Text>
        </Box>

        {/* Current Step */}
        <Text variant="body" color="text.primary" style={{ marginBottom: theme.spacing[2] }}>
          {currentStep.title}
        </Text>

        {/* Progress Bar */}
        <Box
          height={8}
          borderRadius={4}
          overflow="hidden"
          style={{ backgroundColor: theme.colors.background.tertiary }}
        >
          <Box
            height="100%"
            borderRadius={4}
            style={{
              width: `${Math.min(100, progressPercent)}%`,
              backgroundColor: theme.colors.primary[500],
            }}
          />
        </Box>

        {/* Progress Text */}
        <Text variant="caption" color="text.secondary" style={{ marginTop: theme.spacing[1] }}>
          {currentStep.progress}/{currentStep.target} ({Math.round(progressPercent)}%)
        </Text>
      </Box>
    </Pressable>
  );
};

export default WeeklyQuestCard;
