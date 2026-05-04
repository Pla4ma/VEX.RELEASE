/**
 * SeasonCard Component
 *
 * Displays a season overview card with progress, phase, and CTA.
 * Handles all UI states: loading, empty, error, active.
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../../../theme';
import { Text, Card, Button, Badge } from '../../../components';
import type { SeasonSummary, SeasonPhase } from '../types';
import { formatCountdown } from '../utils';
import { createSheet } from '@/shared/ui/create-sheet';

interface SeasonCardProps {
  season: SeasonSummary | null;
  onPress?: () => void;
  onClaimRewards?: () => void;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function SeasonCard({
  season,
  onPress,
  onClaimRewards,
  loading,
  error,
  onRetry,
}: SeasonCardProps): JSX.Element {
  const theme = useTheme();

  // Loading state
  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonProgress} />
        <View style={styles.skeletonButton} />
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card style={[styles.container, styles.errorContainer]}>
        <Text variant="body" color="error" style={styles.errorText}>
          Failed to load season data
        </Text>
        {onRetry && (
          <Button variant="secondary" onPress={onRetry} testID="season-card-retry"
  accessibilityLabel="Retry button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            Retry
          </Button>
        )}
      </Card>
    );
  }

  // Empty state - no active season
  if (!season) {
    return (
      <Card style={styles.container}>
        <Text style={styles.emptyTitle}>
          No Active Season
        </Text>
        <Text style={styles.emptyText}>
          Check back soon for the next season!
        </Text>
      </Card>
    );
  }

  const phaseStyles = getPhaseStyles(season.phase);
  const phaseLabel = PHASE_LABELS[season.phase];
  const countdown = formatCountdown(season.daysRemaining);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [pressed && { opacity: 0.8 }]}
      accessibilityLabel="Season card"
      accessibilityRole="button"
      accessibilityHint="View season details">
      <Card style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {season.name}
            </Text>
            <Badge
              variant={phaseStyles.badgeVariant}
            >
              {phaseLabel}
            </Badge>
          </View>
          <Text style={styles.caption}>
            Ends in {countdown}
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              Progress
            </Text>
            <Text style={styles.progressLabel}>
              {Math.round(season.progressPercent)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: '#E0E0E0' }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${season.progressPercent}%`, backgroundColor: '#4F46E5' },
              ]}
            />
          </View>
        </View>

        {/* Progress Info */}
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            {season.daysRemaining} days remaining of {season.totalDays}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

// Helper functions
const PHASE_LABELS: Record<SeasonPhase, string> = {
  PRESEASON: 'Preview',
  ACTIVE: 'Active',
  ALMOST_ENDING: 'Ending Soon',
  ENDED: 'Ended',
  ARCHIVED: 'Archived',
};

function getPhaseStyles(phase: SeasonPhase): { badgeVariant: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' } {
  switch (phase) {
    case 'PRESEASON':
      return { badgeVariant: 'info' };
    case 'ACTIVE':
      return { badgeVariant: 'success' };
    case 'ALMOST_ENDING':
      return { badgeVariant: 'warning' };
    case 'ENDED':
      return { badgeVariant: 'error' };
    case 'ARCHIVED':
      return { badgeVariant: 'default' };
    default:
      return { badgeVariant: 'default' };
  }
}

const styles = createSheet({
  container: {
    padding: 16,
  },
  skeletonHeader: {
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonProgress: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginVertical: 16,
  },
  skeletonButton: {
    height: 36,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    width: '40%',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoRow: {
    marginTop: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  caption: {
    fontSize: 12,
    color: '#6B7280',
  },
});
