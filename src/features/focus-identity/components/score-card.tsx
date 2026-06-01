import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { StatusBanner } from '@/shared/ui/components/StatusFeedback';
import { useTheme } from '@/theme';
import { MAX_FOCUS_SCORE } from '../schemas';
import type { FocusScoreDashboardModel } from '../types';

interface ScoreCardProps {
  model: FocusScoreDashboardModel;
}

export function ScoreCard({ model }: ScoreCardProps): JSX.Element | null {
  const { theme } = useTheme();
  if (!model.current) {return null;}

  const latestDelta =
    model.history[model.history.length - 1]?.delta ??
    model.current.currentScore - model.current.previousScore;
  const trendStart = model.history[0]?.score ?? model.current.previousScore;
  const trendDelta = model.current.currentScore - trendStart;
  const nextTarget = Math.min(MAX_FOCUS_SCORE, model.current.currentScore + 20);

  return (
    <View style={{ gap: theme.spacing[3] }}>
      {model.isOffline ? (
        <StatusBanner
          status="offline"
          message="Offline mode is active"
          description="Showing cached Focus Score data. Updates will sync when your connection is back."
        />
      ) : null}
      {model.isRefetching ? (
        <StatusBanner
          status="loading"
          message="Refreshing Focus Score"
          description="Updating your latest score signals."
        />
      ) : null}
      {model.isOptionalDataSyncing ? (
        <StatusBanner
          status="loading"
          message="Calibrating deeper signals"
          description="Your main Focus Score is ready. Trend and monthly insights will fill in as fresh data syncs."
        />
      ) : null}
      {model.optionalDataError ? (
        <StatusBanner
          status="error"
          message="Some insights are delayed"
          description="Your current score is stable while history and monthly reports retry in the background."
        />
      ) : null}
      <View
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[4],
          gap: theme.spacing[2],
          backgroundColor: theme.colors.background.secondary,
        }}
      >
        <Text variant="label" color={theme.colors.text.secondary}>
          Focus Score
        </Text>
        <Text variant="h2" color={theme.colors.text.primary}>
          {model.current.currentScore} · {model.current.band}
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          Last session delta:{' '}
          {latestDelta >= 0 ? `+${latestDelta}` : latestDelta}
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          30-day trend: {trendDelta >= 0 ? `+${trendDelta}` : trendDelta}
        </Text>
      </View>
    </View>
  );
}
