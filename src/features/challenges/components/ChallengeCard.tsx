/**
 * ChallengeCard Component
 *
 * Displays a challenge with progress, status, and reroll/claim actions.
 */

import React from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';

import { Badge, Button, Card, Text } from '../../../components';
import { useTheme } from '../../../theme';
import { createSheet } from '@/shared/ui/create-sheet';

import type { UserChallengeSummary } from '../schemas';

interface ChallengeCardProps {
  challenge: UserChallengeSummary;
  onClaim?: () => void;
  onReroll?: () => void;
  loading?: boolean;
}

export function ChallengeCard({
  challenge,
  onClaim,
  onReroll,
  loading = false,
}: ChallengeCardProps): JSX.Element {
  const { theme } = useTheme();
  const isActionable = challenge.status === 'ACTIVE' || challenge.status === 'COMPLETED';
  const cardStyle: ViewStyle = challenge.isExpired
    ? { ...styles.container, ...styles.expiredContainer }
    : styles.container;

  const statusBadge = getStatusBadge(challenge.status);

  return (
    <Card style={cardStyle}>
      <View style={styles.header}>
        <View style={styles.categoryRow}>
          <Badge variant="outline" size="sm">
            {challenge.type}
          </Badge>
          <Badge variant={getDifficultyVariant(challenge.difficulty)} size="sm">
            {challenge.difficulty}
          </Badge>
          {statusBadge}
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {challenge.title}
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.text.secondary }]}
          numberOfLines={2}
        >
          {challenge.description}
        </Text>
      </View>

      {challenge.status === 'ACTIVE' && (
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {challenge.currentValue} / {challenge.targetValue}
            </Text>
            <Text style={[styles.progressPercent, { color: theme.colors.primary[500] }]}>
              {Math.round(challenge.progressPercent)}%
            </Text>
          </View>
          <View
            style={[styles.progressBarTrack, { backgroundColor: theme.colors.background.tertiary }]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: theme.colors.primary[500],
                  width: `${challenge.progressPercent}%`,
                },
              ]}
            />
          </View>
          {challenge.expiresInMs !== null && challenge.expiresInMs > 0 && (
            <Text style={[styles.expiresText, { color: theme.colors.error.DEFAULT }]}>
              Expires in {formatDuration(challenge.expiresInMs)}
            </Text>
          )}
        </View>
      )}

      <View style={[styles.rewardRow, { borderTopColor: theme.colors.border.light }]}>
        <Text style={[styles.rewardText, { color: theme.colors.success.DEFAULT }]}>
          Reward: {challenge.rewardAmount} {challenge.rewardType}
        </Text>
      </View>

      {isActionable && (
        <View style={[styles.actionsRow, { borderTopColor: theme.colors.border.light }]}>
          {challenge.status === 'COMPLETED' && onClaim && (
            <Button
              variant="primary"
              onPress={onClaim}
              style={styles.actionButton}
              isLoading={loading}
              isDisabled={loading}

            accessibilityLabel="Claim Reward button"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
              Claim Reward
            </Button>
          )}

          {challenge.status === 'ACTIVE' && challenge.canReroll && onReroll && (
            <Pressable
              onPress={onReroll}
              style={({ pressed }) => [styles.rerollButton, pressed && { opacity: 0.8 }]}
              disabled={loading}
              accessibilityLabel="Interactive control"
              accessibilityRole="button"
              accessibilityHint="Activates this control">
              <Badge variant="outline">
                {challenge.freeRerollAvailable ? 'Free Reroll' : `${challenge.rerollCost} Gems`}
              </Badge>
            </Pressable>
          )}
        </View>
      )}
    </Card>
  );
}

function getStatusBadge(status: UserChallengeSummary['status']): JSX.Element | null {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success">Ready to Claim</Badge>;
    case 'CLAIMED':
      return <Badge variant="secondary">Claimed</Badge>;
    case 'EXPIRED':
      return <Badge variant="error">Expired</Badge>;
    case 'REROLLED':
      return <Badge variant="secondary">Rerolled</Badge>;
    default:
      return null;
  }
}

function getDifficultyVariant(
  difficulty: string
): 'default' | 'primary' | 'success' | 'warning' | 'error' {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'success';
    case 'medium':
      return 'primary';
    case 'hard':
      return 'warning';
    case 'expert':
      return 'error';
    default:
      return 'default';
  }
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

const styles = createSheet({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  expiredContainer: {
    opacity: 0.6,
  },
  header: {
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  expiresText: {
    fontSize: 12,
    marginTop: 4,
  },
  rewardRow: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
  },
  rerollButton: {
    padding: 4,
  },
});
