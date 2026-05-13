import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { createSheet } from '@/shared/ui/create-sheet';
import type { RewardDelivery } from '../delivery-tracking';

interface FailedRewardCardProps {
  delivery: RewardDelivery;
  onRetry: (deliveryId: string) => void;
  onDismiss: (deliveryId: string) => void;
}

const styles = createSheet({
  container: {
    backgroundColor: 'theme.colors.primary[500]',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: 'theme.colors.primary[500]',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'theme.colors.background.primary',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: 'theme.colors.primary[500]',
  },
  source: {
    fontSize: 14,
    color: 'theme.colors.primary[500]',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: 'theme.colors.primary[500]',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  attempts: {
    fontSize: 12,
    color: 'theme.colors.primary[500]',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  retryButton: {
    backgroundColor: 'theme.colors.primary[500]',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'theme.colors.background.primary',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dismissButtonText: {
    color: 'theme.colors.primary[500]',
    fontSize: 14,
  },
});

export function FailedRewardCard({ delivery, onRetry, onDismiss }: FailedRewardCardProps): JSX.Element {

  const isPermanentlyFailed = delivery.status === 'PERMANENTLY_FAILED';
  const canRetry = !isPermanentlyFailed && delivery.attemptCount < delivery.maxAttempts;

  const getRewardLabel = (type: RewardDelivery['rewardType']): string => {
    switch (type) {
      case 'XP':
        return 'XP';
      case 'COINS':
        return 'Coins';
      case 'GEMS':
        return 'Gems';
      case 'ITEM':
        return 'Item';
      case 'BADGE':
        return 'Badge';
      case 'STREAK_SHIELD':
        return 'Streak Shield';
      default:
        return 'Reward';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getRewardLabel(delivery.rewardType)}</Text>
        <Text style={styles.amount}>
          {delivery.amount > 0 ? `+${delivery.amount}` : delivery.amount}
        </Text>
      </View>

      <Text style={styles.source}>From: {delivery.source}</Text>

      {delivery.errorMessage && (
        <Text style={styles.errorMessage}>{delivery.errorMessage}</Text>
      )}

      <Text style={styles.attempts}>
        Attempt {delivery.attemptCount} of {delivery.maxAttempts}
        {isPermanentlyFailed ? ' (Permanently Failed)' : ''}
      </Text>

      <View style={styles.actions}>
        {canRetry && (
          <Pressable
            style={styles.retryButton}
            onPress={() => onRetry(delivery.id)}
            accessibilityRole="button"
            accessibilityLabel={`Retry claiming ${getRewardLabel(delivery.rewardType)}`}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        )}

        <Pressable
          style={styles.dismissButton}
          onPress={() => onDismiss(delivery.id)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss failed reward notification"
        >
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}
