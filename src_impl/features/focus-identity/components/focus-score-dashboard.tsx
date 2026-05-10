import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { StatusBanner } from '../../../shared/ui/components/StatusFeedback';
import { useTheme } from '../../../theme';
import type { FocusScoreDashboardModel } from '../hooks-focus-score';
import { MAX_FOCUS_SCORE } from '../schemas';

interface FocusScoreDashboardProps {
  model: FocusScoreDashboardModel;
  onRetry: () => void;
  onStartSession: () => void;
  onOpenMonthlyReport: () => void;
}

function loadingSkeleton(spacing: number, borderColor: string, cardColor: string): JSX.Element {
  return (
    <View style={{ gap: spacing }}>
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          style={{
            height: spacing * 5,
            borderRadius: spacing,
            borderWidth: 1,
            borderColor,
            backgroundColor: cardColor,
          }}
        />
      ))}
    </View>
  );
}

export function FocusScoreDashboard({ model, onRetry, onStartSession, onOpenMonthlyReport }: FocusScoreDashboardProps): JSX.Element {
  const { theme } = useTheme();
  const strongestWeakest = useMemo(() => {
    if (!model.current) {return null;}
    const entries = [
      ['Consistency', model.current.factors.consistency.score],
      ['Streak stability', model.current.factors.streakStability.score],
      ['Session quality', model.current.factors.sessionQuality.score],
      ['Intentional difficulty', model.current.factors.intentionalDifficulty.score],
      ['Recency', model.current.factors.recency.score],
    ] as const;
    const strongest = [...entries].sort((a, b) => b[1] - a[1])[0];
    const weakest = [...entries].sort((a, b) => a[1] - b[1])[0];
    return { strongest, weakest, entries };
  }, [model]);

  if (model.isPending) {
    return loadingSkeleton(theme.spacing[3], theme.colors.border.DEFAULT, theme.colors.background.secondary);
  }
  if (model.isError) {
    return (
      <ErrorState
        title="Focus Score couldn't load"
        description={model.error?.message ?? 'Your score data is temporarily unavailable.'}
        retryLabel="Retry"
        onRetry={onRetry}
      />
    );
  }
  if (!model.current) {
    return (
      <EmptyState
        icon="◎"
        title="Your Focus Score starts after session one"
        body="Complete one focused session and VEX will unlock your signal map, score trend, and next target."
        actionLabel="Start session"
        onAction={onStartSession}
      />
    );
  }

  const latestDelta = model.history[model.history.length - 1]?.delta ?? model.current.currentScore - model.current.previousScore;
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
        <StatusBanner status="loading" message="Refreshing Focus Score" description="Updating your latest score signals." />
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
      <View style={{ borderWidth: 1, borderColor: theme.colors.border.light, borderRadius: theme.borderRadius.lg, padding: theme.spacing[4], gap: theme.spacing[2], backgroundColor: theme.colors.background.secondary }}>
        <Text variant="label" color={theme.colors.text.secondary}>Focus Score</Text>
        <Text variant="h2" color={theme.colors.text.primary}>{model.current.currentScore} · {model.current.band}</Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>Last session delta: {latestDelta >= 0 ? `+${latestDelta}` : latestDelta}</Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>30-day trend: {trendDelta >= 0 ? `+${trendDelta}` : trendDelta}</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: theme.colors.border.light, borderRadius: theme.borderRadius.lg, padding: theme.spacing[4], gap: theme.spacing[2], backgroundColor: theme.colors.background.secondary }}>
        <Text variant="h4" color={theme.colors.text.primary}>Factor map</Text>
        {strongestWeakest?.entries.map(([label, score]) => (
          <View key={label} style={{ gap: theme.spacing[1] }}>
            <Text variant="caption" color={theme.colors.text.secondary}>{label}: {score}</Text>
            <View style={{ height: theme.spacing[2], borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.background.tertiary }}>
              <View style={{ height: theme.spacing[2], width: `${score}%`, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.primary[500] }} />
            </View>
          </View>
        ))}
        <Text variant="bodySmall" color={theme.colors.text.secondary}>Strongest pattern: {strongestWeakest?.strongest[0]}</Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>Weakest pattern: {strongestWeakest?.weakest[0]}</Text>
      </View>
      <View style={{ borderWidth: 1, borderColor: theme.colors.border.light, borderRadius: theme.borderRadius.lg, padding: theme.spacing[4], gap: theme.spacing[2], backgroundColor: theme.colors.background.secondary }}>
        <Text variant="h4" color={theme.colors.text.primary}>What changed</Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          {model.monthlyInput?.historyPoints[model.monthlyInput.historyPoints.length - 1]?.reason ?? model.current.lastChangeReason}
        </Text>
        <Text variant="bodySmall" color={theme.colors.text.secondary}>Next target: {nextTarget}</Text>
        <Button
          variant="outline"
          onPress={onOpenMonthlyReport}
          accessibilityLabel="Open monthly focus report"
          accessibilityRole="button"
          accessibilityHint="Opens your monthly focus report details"
        >
          Open monthly report
        </Button>
      </View>
    </View>
  );
}
