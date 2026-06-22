/**
 * StudyPlanSuggestionCard Component
 *
 * Shows a dedicated suggestion card when user has an active study plan.
 * Card appears at the top of SessionSuggestions to create a direct flow:
 * "Study Plan → Start Session" without manual mode selection.
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import type { ActiveStudyPlan } from '../hooks/helpers';
import type { LearningExecutionCopy } from '../../learning-execution';

export interface StudyPlanSuggestionCardProps {
  /** The active study plan from useActiveStudyPlan */
  studyPlan: ActiveStudyPlan;
  /** Callback when user selects this study plan suggestion */
  onSelect: (studyPlan: ActiveStudyPlan) => void;
  copy?: LearningExecutionCopy;
}

/**
 * Individual study plan suggestion card
 */
export function StudyPlanSuggestionCard({
  copy,
  studyPlan,
  onSelect,
}: StudyPlanSuggestionCardProps): React.ReactNode {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withTiming(0.98, { duration: 100 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });
    onSelect(studyPlan);
  };

  const progressText = `${studyPlan.completedTasks}/${studyPlan.totalTasks} tasks completed (${studyPlan.progressPercent}%)`;
  const layerName = copy?.layerName ?? 'Study OS';
  const title = copy
    ? `${copy.homeTitle}: ${studyPlan.title}`
    : `Continue studying ${studyPlan.title}`;
  const modeLabel = copy?.layerName ?? 'STUDY mode';

  return (
    <Animated.View entering={FadeInUp.duration(300)} style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        accessibilityLabel={`${copy?.homeCta ?? 'Continue studying'} ${studyPlan.title}`}
        accessibilityRole="button"
        accessibilityHint={`Starts ${layerName} with ${studyPlan.remainingMinutes} minutes recommended duration`}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          gap="md"
          p="md"
          borderRadius="xl"
          bg={`${theme.colors.info.DEFAULT}15`}
          borderWidth={2}
          borderColor={theme.colors.info.DEFAULT}
        >
          {/* Icon */}
          <Box
            width={48}
            height={48}
            borderRadius="lg"
            bg={`${theme.colors.info.DEFAULT}25`}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={24} color={theme.colors.info.DEFAULT}>◊</Text>
          </Box>

          {/* Content */}
          <Box flex={1} gap="xs">
            <Text variant="body" color="text.primary" fontWeight="600">
              {title}
            </Text>
            {studyPlan.nextTask && (
              <Text variant="caption" color="text.secondary" numberOfLines={1}>
                Next: {studyPlan.nextTask.content}
              </Text>
            )}
            <Box flexDirection="row" alignItems="center" gap="sm" mt="xs">
              <Box
                px="sm"
                py="xs"
                borderRadius="sm"
                bg={theme.colors.background.tertiary}
              >
                <Text variant="caption" color="text.secondary" fontSize={10}>
                  {studyPlan.remainingMinutes} min remaining
                </Text>
              </Box>
              <Box
                px="sm"
                py="xs"
                borderRadius="sm"
                bg={theme.colors.background.tertiary}
              >
                <Text variant="caption" color="info.DEFAULT" fontSize={10}>
                  {modeLabel}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Arrow */}
          <Text fontSize={20} color={theme.colors.info.DEFAULT}>
            ›
          </Text>
        </Box>

        {/* Progress bar */}
        <Box
          mt="sm"
          height={4}
          borderRadius={2}
          overflow="hidden"
          style={{ backgroundColor: theme.colors.background.tertiary }}
        >
          <Box
            height="100%"
            width={`${studyPlan.progressPercent}%`}
            style={{ backgroundColor: theme.colors.info.DEFAULT }}
          />
        </Box>
        <Text variant="caption" color="text.tertiary" mt="xs">
          {progressText}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export { StudyPlanSuggestionCard }