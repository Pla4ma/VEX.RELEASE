import * as Sentry from '@sentry/react-native';
import React, { useCallback } from 'react';
import { Share } from 'react-native';

import { EmptyState } from '../../../../components/EmptyState';
import { Box, Button, Text } from '../../../../components/primitives';
import { ErrorState } from '../../../../components/states/ErrorState';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { useToast } from '../../../../shared/ui/components/Toast';
import { useTheme } from '../../../../theme';
import { buttonTap } from '../../../../utils/haptics';
import type { WeeklyFocusSummary } from '../schemas';

type WeeklyFocusCardProps = {
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  onStartSession: () => void;
  summary: WeeklyFocusSummary | null;
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

function formatDateRange(start: string, end: string): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${new Date(start).toLocaleDateString(undefined, options)} - ${new Date(end).toLocaleDateString(undefined, options)}`;
}

function getInsightText(insight: WeeklyFocusSummary['insight']): string {
  const texts: Record<WeeklyFocusSummary['insight'], string> = {
    comeback_kid: 'Making a strong comeback',
    consistency_king: 'Consistency is your edge',
    gradual_improver: 'Building lasting momentum',
    nothing_yet: 'This week is ready when you are',
    quality_over_quantity: 'Quality over quantity',
    streak_master: 'Your streak is carrying the week',
  };
  return texts[insight];
}

function buildShareText(summary: WeeklyFocusSummary): string {
  const range = formatDateRange(summary.weekStartDate, summary.weekEndDate);
  const score = summary.currentWeekScore === null
    ? ''
    : ` Score ${summary.currentWeekScore}${summary.scoreDelta === null ? '' : ` (${summary.scoreDelta >= 0 ? '+' : ''}${summary.scoreDelta})`}.`;
  const band = summary.currentBand === null ? '' : ` ${summary.currentBand} band.`;
  const best = summary.bestSession
    ? ` Best session: ${formatMinutes(summary.bestSession.durationMinutes)}.`
    : '';
  return `My VEX weekly focus (${range}): ${formatMinutes(summary.totalMinutes)}, ${summary.sessionsCompleted} sessions.${score}${band}${best} ${getInsightText(summary.insight)}.`;
}

function formatScoreDetail(summary: WeeklyFocusSummary): string | undefined {
  const delta = summary.scoreDelta === null
    ? null
    : `${summary.scoreDelta >= 0 ? '+' : ''}${summary.scoreDelta}`;
  if (delta && summary.currentBand) return `${delta} - ${summary.currentBand}`;
  return delta ?? summary.currentBand ?? undefined;
}

export function WeeklyFocusCard({
  error,
  isError,
  isLoading,
  onRetry,
  onStartSession,
  summary,
}: WeeklyFocusCardProps): JSX.Element {
  const { theme } = useTheme();
  const { show } = useToast();

  const handleShare = useCallback(async (): Promise<void> => {
    if (!summary) return;
    await buttonTap();
    try {
      await Share.share({ message: buildShareText(summary) });
    } catch (caught) {
      const shareError = caught instanceof Error ? caught : new Error(String(caught));
      Sentry.captureException(shareError, {
        tags: { feature: 'weekly-focus-card', operation: 'share' },
      });
      show({
        message: 'Try again from Progress in a moment.',
        title: 'Weekly card did not share',
        type: 'error',
      });
    }
  }, [show, summary]);

  if (isLoading) {
    return <WeeklyFocusCardSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Weekly proof did not load"
        description={error?.message ?? 'Your progress is safe. Retry the weekly card.'}
        retryLabel="Retry weekly card"
        onRetry={onRetry}
      />
    );
  }

  if (!summary) {
    return (
      <EmptyState
        icon="chart"
        title="Weekly Focus"
        body="Finish a focus session and this card becomes shareable proof."
      />
    );
  }

  return (
    <Box p="lg" borderWidth={1} borderColor="border.light" bg="background.secondary" gap="md">
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box flex={1}>
          <Text variant="label" color="text.secondary">Weekly Focus</Text>
          <Text variant="h4" color="text.primary">{formatDateRange(summary.weekStartDate, summary.weekEndDate)}</Text>
        </Box>
        <Button
          accessibilityHint="Shares a text summary of this weekly focus card"
          accessibilityLabel="Share weekly focus summary"
          accessibilityRole="button"
          onPress={() => void handleShare()}
          variant="outline"
        >
          Share
        </Button>
      </Box>

      {summary.isEmpty ? (
        <Box gap="sm" py="md">
          <Text variant="body" color="text.secondary" textAlign="center">
            No sessions this week yet. Start with one clean block.
          </Text>
          <Button
            accessibilityHint="Opens session setup"
            accessibilityLabel="Start a focus session"
            accessibilityRole="button"
            onPress={onStartSession}
            variant="primary"
          >
            Start focus
          </Button>
        </Box>
      ) : (
        <Box gap="md">
          <Box flexDirection="row" gap="md">
            <Metric label="Total time" value={formatMinutes(summary.totalMinutes)} />
            <Metric label="Sessions" value={String(summary.sessionsCompleted)} />
          </Box>
          <Metric
            label="Focus Score"
            value={summary.currentWeekScore === null ? 'Not enough data' : String(summary.currentWeekScore)}
            detail={formatScoreDetail(summary)}
          />
          <Metric label="Streak" value={`${summary.currentStreakDays} day${summary.currentStreakDays === 1 ? '' : 's'}`} />
          {summary.bestSession ? (
            <Metric label="Best session" value={formatMinutes(summary.bestSession.durationMinutes)} detail={summary.bestSession.mode ?? undefined} />
          ) : null}
          <Text variant="body" color="text.secondary" textAlign="center">
            {getInsightText(summary.insight)}
          </Text>
        </Box>
      )}
    </Box>
  );
}

function Metric({ detail, label, value }: { detail?: string; label: string; value: string }): JSX.Element {
  return (
    <Box flex={1} p="md" bg="background.primary">
      <Text variant="label" color="text.secondary">{label}</Text>
      <Text variant="h3" color="text.primary">{value}</Text>
      {detail ? <Text variant="caption" color="text.tertiary">{detail}</Text> : null}
    </Box>
  );
}

function WeeklyFocusCardSkeleton(): JSX.Element {
  const { theme } = useTheme();
  return (
    <Box p="lg" borderWidth={1} borderColor="border.light" bg="background.secondary" gap="md">
      <Skeleton width="60%" height={theme.spacing[6]} borderRadius={theme.borderRadius.sm} />
      <Skeleton width="100%" height={theme.spacing[16]} borderRadius={theme.borderRadius.sm} />
      <Skeleton width="80%" height={theme.spacing[5]} borderRadius={theme.borderRadius.sm} />
    </Box>
  );
}
