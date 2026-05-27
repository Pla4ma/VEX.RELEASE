import React from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Box, Button, Text } from "../../../components/primitives";
import { getPremiumCardStyle } from "../../../components/premiumStyles";
import { Icon } from "../../../icons";
import { useTheme } from "../../../theme";

type ProgressMetric = {
  id: string;
  label: string;
  value: string;
  progress: number;
  accent: string;
  reward?: string;
  icon?: string;
  showPlusBadge?: boolean;
};

type SessionProgressionCardProps = {
  isRewardSyncing: boolean;
  levelMetric: ProgressMetric | null;
  rewardCreditStatus: "idle" | "crediting" | "success" | "retrying" | "failed";
  rewardError: string | null;
  streakLabel: string;
  streakIncreased: boolean;
  studyProgress: {
    progressLabel: string;
    taskLabel: string;
    taskTitle: string;
    progress: number;
    isCompleting: boolean;
    error: string | null;
    onMarkComplete: () => void;
    onSkip: () => void;
    // Enhanced study progress details (10.2)
    planTitle: string;
    chaptersCompleted: number;
    totalChapters: number;
    quizAccuracy: number | null;
    totalStudyTimeMinutes: number;
    nextSessionGoal: {
      topic: string;
      suggestedDurationMinutes: number;
    } | null;
  } | null;
  onRetryRewards: () => void;
  onStartNewSession: () => void;
};

function MetricRow({
  metric,
  delay,
}: {
  metric: ProgressMetric;
  delay: number;
}) {
  const { theme } = useTheme();
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <Box
        p={18}
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          ...getPremiumCardStyle("medium"),
        }}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mb={10}
        >
          <Box flexDirection="row" alignItems="center" gap={10}>
            {metric.icon ? (
              <Icon name={metric.icon} size={18} color={metric.accent} />
            ) : null}
            <Text variant="label" color={theme.colors.text.secondary}>
              {metric.label}
            </Text>
          </Box>
          <Text
            variant="body"
            color={theme.colors.text.primary}
            fontWeight="700"
          >
            {metric.value}
          </Text>
        </Box>
        <Box
          height={10}
          borderRadius={999}
          overflow="hidden"
          style={{ backgroundColor: theme.colors.background.primary }}
        >
          <Box
            height="100%"
            width={`${Math.max(0, Math.min(1, metric.progress)) * 100}%`}
            borderRadius={999}
            style={{ backgroundColor: metric.accent }}
          />
        </Box>
        {metric.reward ? (
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            mt={10}
          >
            <Text variant="caption" color={theme.colors.text.secondary}>
              {metric.reward}
            </Text>
            {metric.showPlusBadge ? (
              <Box
                px={10}
                py={4}
                borderRadius={999}
                style={{ backgroundColor: theme.colors.primary[500] }}
              >
                <Text variant="caption" color={theme.colors.text.inverse}>
                  +1
                </Text>
              </Box>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Animated.View>
  );
}

function isProgressMetric(
  metric: ProgressMetric | null,
): metric is ProgressMetric {
  return metric !== null;
}

export function SessionProgressionCard({
  isRewardSyncing,
  levelMetric,
  rewardCreditStatus,
  rewardError,
  streakLabel,
  streakIncreased,
  studyProgress,
  onRetryRewards,
  onStartNewSession: _onStartNewSession,
}: SessionProgressionCardProps) {
  const { theme } = useTheme();
  const metrics = [levelMetric].filter(isProgressMetric);
  const rewardStatusMessage =
    rewardCreditStatus === "crediting"
      ? "Saving rewards..."
      : rewardCreditStatus === "retrying"
        ? "Retrying reward sync..."
        : rewardCreditStatus === "success"
          ? "Rewards saved"
          : rewardCreditStatus === "failed"
            ? "Rewards are waiting to sync"
            : null;
  const rewardStatusColor =
    rewardCreditStatus === "success"
      ? theme.colors.success.DEFAULT
      : rewardCreditStatus === "failed"
        ? theme.colors.warning.DEFAULT
        : theme.colors.text.secondary;

  return (
    <Box gap={16}>
      <Animated.View entering={FadeInUp.springify()}>
        <Text variant="label" color={theme.colors.primary[400]}>
          SESSION SUMMARY
        </Text>
        <Text variant="h2" color={theme.colors.text.primary} mt={8}>
          The run paid off.
        </Text>
        {rewardStatusMessage ? (
          <Text variant="caption" color={rewardStatusColor} mt={8}>
            {rewardStatusMessage}
          </Text>
        ) : null}
      </Animated.View>
      {metrics.length > 0 ? (
        metrics.map((metric, index) => (
          <MetricRow key={metric.id} metric={metric} delay={index * 150} />
        ))
      ) : (
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <Box
            p={18}
            style={{
              backgroundColor: theme.colors.background.secondary,
              borderWidth: 1,
              borderColor: theme.colors.border.light,
              ...getPremiumCardStyle("medium"),
            }}
          >
            <Text variant="body" color={theme.colors.text.secondary}>
              Progression data is syncing. Your rewards are still safe.
            </Text>
          </Box>
        </Animated.View>
      )}
      <Animated.View entering={FadeInUp.delay(150).springify()}>
        <Box
          p={18}
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderWidth: 1,
            borderColor: theme.colors.border.light,
            ...getPremiumCardStyle("medium"),
          }}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text variant="h4" color={theme.colors.text.primary}>
              Streak {streakLabel}
            </Text>
            {streakIncreased ? (
              <Box
                px={10}
                py={4}
                borderRadius={999}
                style={{ backgroundColor: theme.colors.warning.DEFAULT }}
              >
                <Text variant="caption" color={theme.colors.text.inverse}>
                  +1
                </Text>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Animated.View>
      {studyProgress ? (
        <Animated.View entering={FadeInUp.delay(600).springify()}>
          <Box
            p={18}
            style={{
              backgroundColor: `${theme.colors.primary[500]}08`,
              borderWidth: 1,
              borderColor: theme.colors.primary[500],
              ...getPremiumCardStyle("medium"),
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
                  Suggested:{" "}
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
                size="sm"
                onPress={studyProgress.onMarkComplete}
                isLoading={studyProgress.isCompleting}
                accessibilityLabel="Mark Complete button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={studyProgress.onSkip}
                accessibilityLabel="Skip button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                Skip
              </Button>
            </Box>
          </Box>
        </Animated.View>
      ) : null}
      {isRewardSyncing || rewardError ? (
        <Animated.View entering={FadeInUp.delay(750).springify()}>
          <Box alignItems="center" gap={8}>
            {isRewardSyncing ? (
              <Text variant="caption" color={theme.colors.text.secondary}>
                Applying rewards...
              </Text>
            ) : null}
            {rewardError ? (
              <Text variant="caption" color={theme.colors.error.DEFAULT}>
                {rewardError}
              </Text>
            ) : null}
            {rewardError ? (
              <Button
                variant="outline"
                size="sm"
                onPress={onRetryRewards}
                accessibilityLabel="Retry Rewards button"
                accessibilityRole="button"
                accessibilityHint="Activates this control"
              >
                Retry Rewards
              </Button>
            ) : null}
          </Box>
        </Animated.View>
      ) : null}
    </Box>
  );
}

export default SessionProgressionCard;
