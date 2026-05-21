import React from 'react';
import { View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { getPremiumCardStyle } from '../../components/premiumStyles';
import { Skeleton } from '../../components/ui/Skeleton';
import { useTheme } from '../../theme';
import type { SessionHistoryEntry } from '../../session/types';
import { createSheet } from '@/shared/ui/create-sheet';
import type { LearningExecutionCopy } from '../../features/learning-execution';

export function HistoryCard({ entry }: { entry: SessionHistoryEntry }) {
  const { theme } = useTheme();
  const minutes = Math.max(1, Math.round((entry.summary?.actualDuration ?? entry.config.duration) / 60));
  return <View style={[styles.card, getPremiumCardStyle('medium'), { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.border.light, padding: theme.spacing[4], gap: theme.spacing[2] }]}><View style={styles.row}><Text variant="label" color={theme.colors.text.primary}>{entry.config.customName || 'Focus Session'}</Text><Text variant="caption" color={theme.colors.text.secondary}>{entry.endedAt ? new Date(entry.endedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'In progress'}</Text></View><Text variant="bodySmall" color={theme.colors.text.secondary}>{`${minutes} min | ${entry.status.replace('_', ' ')}${entry.summary ? ` | +${entry.summary.xpEarned} XP` : ''}`}</Text></View>;
}

export function ContentStudyHeroCard({
  activePlan,
  hasError,
  isLoading,
  onContinue,
  onRetry,
  onSeeHowItWorks,
  onStart,
  copy,
}: {
  activePlan: { title: string; totalTasks: number; completedTasks: number; progressPercent: number; remainingMinutes: number } | null;
  copy: LearningExecutionCopy;
  hasError: boolean;
  isLoading: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onSeeHowItWorks: () => void;
  onStart: () => void;
}) {
  const { theme } = useTheme();

  if (isLoading) {
    return <View style={[styles.card, getPremiumCardStyle('large'), styles.studyCard, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.primary[500], padding: theme.spacing[4] }]}><Text variant="label" color={theme.colors.primary[500]}>{copy.layerName}</Text><Skeleton width={180} height={20} /><Skeleton width="100%" height={16} /><Skeleton width={132} height={40} borderRadius={12} /></View>;
  }

  if (hasError) {
    return <View style={[styles.card, getPremiumCardStyle('large'), styles.studyCard, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.primary[500], padding: theme.spacing[4] }]}><Text variant="label" color={theme.colors.primary[500]}>{copy.layerName}</Text><Text variant="bodySmall" color={theme.colors.text.secondary}>We could not load your execution progress right now.</Text><Button variant="outline" onPress={onRetry}
  accessibilityLabel="Retry button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">Retry</Button></View>;
  }

  if (activePlan) {
    return <View style={[styles.card, getPremiumCardStyle('large'), styles.studyCard, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.primary[500], padding: theme.spacing[4] }]}><Text variant="label" color={theme.colors.primary[500]}>{`${copy.homeTitle}: "${activePlan.title}"`}</Text><View style={{ gap: theme.spacing[2] }}><View style={[styles.row, { alignItems: 'center' }]}><Text variant="bodySmall" color={theme.colors.text.primary}>{`Step ${Math.min(activePlan.completedTasks + 1, activePlan.totalTasks)}/${activePlan.totalTasks}`}</Text><Text variant="bodySmall" color={theme.colors.text.secondary}>{formatMinutes(activePlan.remainingMinutes)}</Text></View><View style={[styles.barTrack, { backgroundColor: theme.colors.background.primary, borderRadius: theme.borderRadius.full }]}><View style={[styles.barFill, { width: `${activePlan.progressPercent}%`, backgroundColor: theme.colors.primary[500], borderRadius: theme.borderRadius.full }]} /></View></View><Button onPress={onContinue}
  accessibilityLabel="`} button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">{`${copy.homeCta}: ${activePlan.title}`}</Button></View>;
  }

  return <View style={[styles.card, getPremiumCardStyle('large'), styles.studyCard, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.primary[500], padding: theme.spacing[4] }]}><Text variant="label" color={theme.colors.primary[500]}>{copy.layerName}</Text><Text variant="body" color={theme.colors.text.primary}>{copy.emptyTitle}</Text><View style={{ flexDirection: 'row', gap: theme.spacing[3], flexWrap: 'wrap' }}><Button onPress={onStart}
  accessibilityLabel="Get Started button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">{copy.emptyCta}</Button><Button variant="outline" onPress={onSeeHowItWorks}
  accessibilityLabel="See How It Works button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">See How It Works</Button></View></View>;
}

export function RecentSessionsEmpty({
  isFirstRun,
  onStart,
}: {
  isFirstRun: boolean;
  onStart: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  if (isFirstRun) {
    return <View style={[styles.card, getPremiumCardStyle('large'), styles.studyCard, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.border.light, padding: theme.spacing[4] }]}><Text variant="h4" color={theme.colors.text.primary}>Your first win unlocks the board</Text><Text variant="body" color={theme.colors.text.secondary}>Start a focus session or study from content to fill this feed with your last three runs.</Text><Button onPress={onStart}
  accessibilityLabel="Start session button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">Start session</Button></View>;
  }
  return <View style={[styles.card, getPremiumCardStyle('large'), { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.border.light }]}><EmptyState icon="⏱️" title="No sessions yet" body="Start a focus session to build your recent activity board and track your daily rhythm." actionLabel="Start session" onAction={onStart} /></View>;
}

const styles = createSheet({
  barFill: { height: '100%' },
  barTrack: { flex: 1, height: 10, overflow: 'hidden' },
  card: { borderWidth: 1 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  studyCard: { gap: 12 },
});

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
