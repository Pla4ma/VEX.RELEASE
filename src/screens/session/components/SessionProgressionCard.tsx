import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box, Button, Text } from '../../../components/primitives';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { useTheme } from '../../../theme';
import { MetricRow, isProgressMetric } from './MetricRow';
import { StudyProgressPanel } from './StudyProgressPanel';
import type { SessionProgressionCardProps } from './SessionProgressionCard.types';
import { Text as VexText } from '../../../components/primitives/Text';

export type { SessionProgressionCardProps };

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
    rewardCreditStatus === 'crediting'
      ? 'Saving progress...'
      : rewardCreditStatus === 'retrying'
        ? 'Retrying progress sync...'
        : rewardCreditStatus === 'success'
          ? 'Progress saved'
          : rewardCreditStatus === 'failed'
            ? 'Progress is waiting to sync'
            : null;
  const rewardStatusColor =
    rewardCreditStatus === 'success'
      ? theme.colors.success.DEFAULT
      : rewardCreditStatus === 'failed'
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
              ...getPremiumCardStyle('medium'),
            }}
          >
            <Text variant="body" color={theme.colors.text.secondary}>
              Progression data is syncing. Your progress is still safe.
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
            ...getPremiumCardStyle('medium'),
          }}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text variant="h4" color={theme.colors.text.primary}>
              Consistency {streakLabel}
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
      {studyProgress ? <StudyProgressPanel studyProgress={studyProgress} /> : null}
      {isRewardSyncing || rewardError ? (
        <Animated.View entering={FadeInUp.delay(750).springify()}>
          <Box alignItems="center" gap={8}>
            {isRewardSyncing ? (
              <Text variant="caption" color={theme.colors.text.secondary}>
                Applying progress...
              </Text>
            ) : null}
            {rewardError ? (
              <Text variant="caption" color={theme.colors.error.DEFAULT}>
                {rewardError}
              </Text>
            ) : null}
            {rewardError ? (
              <Button variant="outline"
                size="sm"
                onPress={onRetryRewards}
                accessibilityLabel="Retry loading progress"
                accessibilityRole="button"
                accessibilityHint="Double tap to activate"
              >
                <VexText>Retry</VexText>
              </Button>
            ) : null}
          </Box>
        </Animated.View>
      ) : null}
    </Box>
  );
}
