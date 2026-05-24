/**
 * Rewards Analytics
 * Sentry breadcrumbs and custom event tracking
 */

import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import type { ChestResult } from './chest-engine';

// ============================================================================
// Event Tracking Functions
// ============================================================================

export function trackRewardCreated(
  rewardId: string,
  userId: string,
  type: string,
  amount: number | null,
  triggerType: string
): void {
  Sentry.addBreadcrumb({
    category: 'rewards',
    message: `Reward created: ${type}`,
    data: {
      rewardId,
      userId,
      type,
      amount,
      triggerType,
    },
    level: 'info',
  });
}

export function trackRewardClaimed(
  rewardId: string,
  userId: string,
  amount: number | null,
  success: boolean
): void {
  Sentry.addBreadcrumb({
    category: 'rewards',
    message: success ? 'Reward claimed' : 'Reward claim failed',
    data: {
      rewardId,
      userId,
      amount,
      success,
    },
    level: success ? 'info' : 'warning',
  });
}

export function trackRewardExpired(rewardId: string, userId: string): void {
  Sentry.addBreadcrumb({
    category: 'rewards',
    message: 'Reward expired',
    data: {
      rewardId,
      userId,
    },
    level: 'warning',
  });
}

export function trackBatchClaim(
  userId: string,
  attempted: number,
  succeeded: number
): void {
  Sentry.addBreadcrumb({
    category: 'rewards',
    message: `Batch claim: ${succeeded}/${attempted} succeeded`,
    data: {
      userId,
      attempted,
      succeeded,
    },
    level: 'info',
  });
}

export function trackRewardError(
  operation: string,
  error: unknown,
  userId?: string
): void {
  Sentry.addBreadcrumb({
    category: 'rewards',
    message: `Reward error: ${operation}`,
    data: {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    },
    level: 'error',
  });
}

export function trackChestRolled(userId: string, result: ChestResult): void {
  Sentry.addBreadcrumb({
    category: 'rewards',
    message: `Chest rolled: ${result.tier}`,
    data: {
      userId,
      tier: result.tier,
      xpReward: result.xpReward,
      coinReward: result.coinReward,
      gemReward: result.gemReward,
      hasBonusItem: Boolean(result.bonusItemId),
      isNearMiss: result.isNearMiss,
    },
    level: 'info',
  });

  eventBus.publish('analytics:track', {
    event: 'session_chest_rolled',
    properties: {
      userId,
      tier: result.tier,
      xpReward: result.xpReward,
      coinReward: result.coinReward,
      gemReward: result.gemReward,
      hasBonusItem: Boolean(result.bonusItemId),
      isNearMiss: result.isNearMiss,
    },
  });
}

export function trackChestRevealStarted(userId: string, result: ChestResult): void {
  eventBus.publish('analytics:track', {
    event: 'session_chest_reveal_started',
    properties: {
      userId,
      tier: result.tier,
      isNearMiss: result.isNearMiss,
    },
  });
}

export function trackChestRevealCompleted(userId: string, result: ChestResult): void {
  eventBus.publish('analytics:track', {
    event: 'session_chest_reveal_completed',
    properties: {
      userId,
      tier: result.tier,
      isNearMiss: result.isNearMiss,
      hasBonusItem: Boolean(result.bonusItemId),
    },
  });
}

export function trackDailyLoginClaimed(
  userId: string,
  dayNumber: number,
  rewardType: string,
  rewardAmount: number,
  streakAtClaim: number
): void {
  Sentry.addBreadcrumb({
    category: 'rewards',
    message: `Daily login claimed: Day ${dayNumber}`,
    data: {
      userId,
      dayNumber,
      rewardType,
      rewardAmount,
      streakAtClaim,
    },
    level: 'info',
  });

  eventBus.publish('analytics:track', {
    event: 'daily_login_reward_claimed',
    properties: {
      userId,
      dayNumber,
      rewardType,
      rewardAmount,
      streakAtClaim,
    },
  });
}
