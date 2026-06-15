import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box, Button, Text } from '../../../components/primitives';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import type { StudyProgress } from './SessionProgressionCard.types';

export function StudyProgressPanel({
  studyProgress,
}: {
  studyProgress: StudyProgress;
}) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(600).springify()}>
      <Box
        p={18}
        style={{
          backgroundColor: `${theme.colors.primary[500]}08`,
          borderWidth: 1,
          borderColor: theme.colors.primary[500],
          ...getPremiumCardStyle('medium'),
        }}
      >
        {/* Header with Plan Title */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mb={12}
        >
          <Box flexDirection="row" alignItems="center" gap={10}>
            <Icon name="book" size={20} color={theme.colors.primary[500]} />
            <Text variant="label" color="primary.500">
              STUDY PROGRESS
            </Text>
          </Box>
          <Text variant="caption" color="text.secondary">
            {studyProgress.progressLabel}
          </Text>
        </Box>

        {/* Plan Title */}
        <Text variant="h4" color="text.primary" mb={12}>
          {studyProgress.planTitle}
        </Text>

        {/* Progress bar */}
        <Box
          height={10}
          borderRadius={999}
          overflow="hidden"
          style={{ backgroundColor: theme.colors.background.primary }}
          mb={12}
        >
          <Box
            height="100%"
            width={`${Math.max(0, Math.min(1, studyProgress.progress)) * 100}%`}
            borderRadius={999}
            style={{ backgroundColor: theme.colors.primary[500] }}
          />
        </Box>

        {/* Stats Grid */}
        <Box flexDirection="row" gap={12} mb={14}>
          <Box
            flex={1}
            p={12}
            borderRadius={8}
            style={{ backgroundColor: theme.colors.background.tertiary }}
          >
            <Text variant="caption" color="text.tertiary">
              Chapters
            </Text>
            <Text variant="body" color="text.primary" fontWeight="600">
              {studyProgress.chaptersCompleted}/
              {studyProgress.totalChapters}
            </Text>
          </Box>
          {studyProgress.quizAccuracy !== null && (
            <Box
              flex={1}
              p={12}
              borderRadius={8}
              style={{ backgroundColor: theme.colors.background.tertiary }}
            >
              <Text variant="caption" color="text.tertiary">
                Quiz Accuracy
              </Text>
              <Text variant="body" color="success.DEFAULT" fontWeight="600">
                {studyProgress.quizAccuracy}%
              </Text>
            </Box>
          )}
          <Box
            flex={1}
            p={12}
            borderRadius={8}
            style={{ backgroundColor: theme.colors.background.tertiary }}
          >
            <Text variant="caption" color="text.tertiary">
              Study Time
            </Text>
            <Text variant="body" color="text.primary" fontWeight="600">
              {studyProgress.totalStudyTimeMinutes}m
            </Text>
          </Box>
        </Box>

        {/* Current Task */}
        <Text variant="body" color="text.primary">
          {studyProgress.taskLabel}
        </Text>
        <Text variant="bodySmall" color="text.secondary" mt={4} mb={12}>
          {studyProgress.taskTitle}
        </Text>

        {/* Next Session Goal */}
        {studyProgress.nextSessionGoal && (
          <Box
            p={12}
            borderRadius={8}
            mb={14}
            style={{
              backgroundColor: `${theme.colors.info.DEFAULT}15`,
              borderLeftWidth: 3,
              borderLeftColor: theme.colors.info.DEFAULT,
            }}
          >
            <Text variant="caption" color="info.DEFAULT" fontWeight="600">
              Next Session Goal
            </Text>
            <Text variant="bodySmall" color="text.primary" mt={4}>
              {studyProgress.nextSessionGoal.topic}
            </Text>
            <Text variant="caption" color="text.tertiary" mt={4}>
              Suggested:{' '}
              {studyProgress.nextSessionGoal.suggestedDurationMinutes} min
            </Text>
          </Box>
        )}

        {studyProgress.error ? (
          <Text
            variant="caption"
            color={theme.colors.error.DEFAULT}
            mt={10}
          >
            {studyProgress.error}
          </Text>
        ) : null}

        <Box flexDirection="row" gap={12}>
          <Button
            <Text>size="sm"</Text>
            onPress={studyProgress.onMarkComplete}
            isLoading={studyProgress.isCompleting}
            accessibilityLabel="Mark complete"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            Mark Complete
          </Button>
          <Button
            <Text>variant="outline"</Text>
            size="sm"
            onPress={studyProgress.onSkip}
            accessibilityLabel="Skip task"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            Skip
          </Button>
        </Box>
      </Box>
    </Animated.View>
  );
}
