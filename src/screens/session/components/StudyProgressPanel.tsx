import { vexFire } from "@/theme/tokens/vex-fire";
import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text , Text as VexText } from '../../../components/primitives/Text';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { Icon } from '../../../icons/components/Icon';
import { useTheme } from '../../../theme/ThemeContext';
import type { StudyProgress } from './SessionProgressionCard.types';

export function StudyProgressPanel({
  studyProgress,
}: {
  studyProgress: StudyProgress;
}) {
  const { theme: _theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.delay(600).springify()}>
      <Box
        p={18}
        style={{
          backgroundColor: `${vexFire.ember}08`,
          borderWidth: 1,
          borderColor: vexFire.ember,
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
            <Icon name="book" size={20} color={vexFire.ember} />
            <Text variant="label" color={vexFire.ember}>
              STUDY PROGRESS
            </Text>
          </Box>
          <Text variant="caption" color={vexFire.textSecondary}>
            {studyProgress.progressLabel}
          </Text>
        </Box>

        {/* Plan Title */}
        <Text variant="h4" color={vexFire.cream} mb={12}>
          {studyProgress.planTitle}
        </Text>

        {/* Progress bar */}
        <Box
          height={10}
          borderRadius={999}
          overflow="hidden"
          style={{ backgroundColor: vexFire.background }}
          mb={12}
        >
          <Box
            height="100%"
            width={`${Math.max(0, Math.min(1, studyProgress.progress)) * 100}%`}
            borderRadius={999}
            style={{ backgroundColor: vexFire.ember }}
          />
        </Box>

        {/* Stats Grid */}
        <Box flexDirection="row" gap={12} mb={14}>
          <Box
            flex={1}
            p={12}
            borderRadius={8}
            style={{ backgroundColor: vexFire.backgroundSoft }}
          >
            <Text variant="caption" color={vexFire.textMuted}>
              Chapters
            </Text>
            <Text variant="body" color={vexFire.cream} fontWeight="600">
              {studyProgress.chaptersCompleted}/
              {studyProgress.totalChapters}
            </Text>
          </Box>
          {studyProgress.quizAccuracy !== null && (
            <Box
              flex={1}
              p={12}
              borderRadius={8}
              style={{ backgroundColor: vexFire.backgroundSoft }}
            >
              <Text variant="caption" color={vexFire.textMuted}>
                Quiz Accuracy
              </Text>
              <Text variant="body" color={vexFire.success} fontWeight="600">
                {studyProgress.quizAccuracy}%
              </Text>
            </Box>
          )}
          <Box
            flex={1}
            p={12}
            borderRadius={8}
            style={{ backgroundColor: vexFire.backgroundSoft }}
          >
            <Text variant="caption" color={vexFire.textMuted}>
              Study Time
            </Text>
            <Text variant="body" color={vexFire.cream} fontWeight="600">
              {studyProgress.totalStudyTimeMinutes}m
            </Text>
          </Box>
        </Box>

        {/* Current Task */}
        <Text variant="body" color={vexFire.cream}>
          {studyProgress.taskLabel}
        </Text>
        <Text variant="bodySmall" color={vexFire.textSecondary} mt={4} mb={12}>
          {studyProgress.taskTitle}
        </Text>

        {/* Next Session Goal */}
        {studyProgress.nextSessionGoal && (
          <Box
            p={12}
            borderRadius={8}
            mb={14}
            style={{
              backgroundColor: `${vexFire.amber}15`,
              borderLeftWidth: 3,
              borderLeftColor: vexFire.amber,
            }}
          >
            <Text variant="caption" color="info.DEFAULT" fontWeight="600">
              Next Session Goal
            </Text>
            <Text variant="bodySmall" color={vexFire.cream} mt={4}>
              {studyProgress.nextSessionGoal.topic}
            </Text>
            <Text variant="caption" color={vexFire.textMuted} mt={4}>
              Suggested:{' '}
              {studyProgress.nextSessionGoal.suggestedDurationMinutes} min
            </Text>
          </Box>
        )}

        {studyProgress.error ? (
          <Text
            variant="caption"
            color={vexFire.danger}
            mt={10}
          >
            {studyProgress.error}
          </Text>
        ) : null}

        <Box flexDirection="row" gap={12}>
          <Button
            size="sm"
            onPress={studyProgress.onMarkComplete}
            isLoading={studyProgress.isCompleting}
            accessibilityLabel="Mark complete"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>Mark Complete</VexText>
          </Button>
          <Button variant="outline"
            size="sm"
            onPress={studyProgress.onSkip}
            accessibilityLabel="Skip task"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
            <VexText>Skip</VexText>
          </Button>
        </Box>
      </Box>
    </Animated.View>
  );
}
