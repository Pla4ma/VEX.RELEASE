import React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text , Text as VexText } from '../../../components/primitives/Text';
import { getPremiumCardStyle } from '../../../components/premiumStyles';
import { useTheme } from '../../../theme/ThemeContext';
import { MetricRow, isProgressMetric } from './MetricRow';
import { StudyProgressPanel } from './StudyProgressPanel';
import type { SessionProgressionCardProps } from './SessionProgressionCard.types';
import { vexFire } from '../../../theme/tokens/vex-fire';

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
  const { theme: _theme } = useTheme();
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
      ? vexFire.success
      : rewardCreditStatus === 'failed'
        ? vexFire.amber
        : vexFire.textSecondary;

  return (
    <Box gap={16}>
      <Animated.View entering={FadeInUp.springify()}>
        <Text variant="label" style={{ color: vexFire.ember }}>
          SESSION SUMMARY
        </Text>
        <Text variant="h2" style={{ color: vexFire.cream }} mt={8}>
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
              backgroundColor: vexFire.panel,
              borderWidth: 1,
              borderColor: vexFire.border,
              ...getPremiumCardStyle('medium'),
            }}
          >
            <Text variant="body" style={{ color: vexFire.textSecondary }}>
              Progression data is syncing. Your progress is still safe.
            </Text>
          </Box>
        </Animated.View>
      )}
      <Animated.View entering={FadeInUp.delay(150).springify()}>
        <Box
          p={18}
          style={{
            backgroundColor: vexFire.panel,
            borderWidth: 1,
            borderColor: vexFire.border,
            ...getPremiumCardStyle('medium'),
          }}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text variant="h4" style={{ color: vexFire.cream }}>
              Consistency {streakLabel}
            </Text>
            {streakIncreased ? (
              <Box
                px={10}
                py={4}
                borderRadius={999}
                style={{ backgroundColor: vexFire.amber }}
              >
                <Text variant="caption" style={{ color: vexFire.background }}>
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
              <Text variant="caption" style={{ color: vexFire.textSecondary }}>
                Applying progress...
              </Text>
            ) : null}
            {rewardError ? (
              <Text variant="caption" style={{ color: vexFire.danger }}>
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
