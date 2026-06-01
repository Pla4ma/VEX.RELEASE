import React from 'react';
import { View } from 'react-native';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorState } from '../../../components/states/ErrorState';
import { useTheme } from '../../../theme';
import type { FocusScoreDashboardModel } from '../types';
import { loadingSkeleton } from './loading-skeleton';
import { ScoreCard } from './score-card';
import { FactorMap } from './factor-map';
import { WhatChanged } from './what-changed';

interface FocusScoreDashboardProps {
  model: FocusScoreDashboardModel;
  onRetry: () => void;
  onStartSession: () => void;
  onOpenMonthlyReport: () => void;
}

export function FocusScoreDashboard({
  model,
  onRetry,
  onStartSession,
  onOpenMonthlyReport,
}: FocusScoreDashboardProps): JSX.Element {
  const { theme } = useTheme();

  if (model.isPending) {
    return loadingSkeleton(
      theme.spacing[3],
      theme.colors.border.DEFAULT,
      theme.colors.background.secondary,
    );
  }
  if (model.isError) {
    return (
      <ErrorState
        title="Focus Score couldn't load"
        description={
          model.error?.message ?? 'Your score data is temporarily unavailable.'
        }
        retryLabel="Retry"
        onRetry={onRetry}
      />
    );
  }
  if (!model.current) {
    return (
      <EmptyState
        icon="◎"
        title="Your Focus Score needs three sessions"
        body="Finish three sessions and VEX will start reading your focus rhythm."
        actionLabel="Start session"
        onAction={onStartSession}
      />
    );
  }

  return (
    <View style={{ gap: theme.spacing[3] }}>
      <ScoreCard model={model} />
      <FactorMap model={model} />
      <WhatChanged model={model} onOpenMonthlyReport={onOpenMonthlyReport} />
    </View>
  );
}

export { loadingSkeleton } from './loading-skeleton';
export { ScoreCard } from './score-card';
export { FactorMap } from './factor-map';
export { WhatChanged } from './what-changed';
