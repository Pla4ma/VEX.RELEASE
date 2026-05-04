/**
 * Milestones Analytics
 * Sentry breadcrumbs and custom event tracking
 */

import * as Sentry from '@sentry/react-native';

// ============================================================================
// Milestone Tracking Functions
// ============================================================================

export function trackMilestoneCompleted(
  userId: string,
  milestoneId: string,
  milestoneType: string,
  threshold: number
): void {
  Sentry.addBreadcrumb({
    category: 'milestones',
    message: `Milestone completed: ${milestoneId}`,
    data: {
      userId,
      milestoneId,
      milestoneType,
      threshold,
    },
    level: 'info',
  });
}

export function trackMilestoneProgressUpdated(
  userId: string,
  milestoneId: string,
  previousValue: number,
  newValue: number,
  threshold: number
): void {
  const percentComplete = Math.min(100, Math.floor((newValue / threshold) * 100));

  Sentry.addBreadcrumb({
    category: 'milestones',
    message: `Milestone progress updated: ${milestoneId}`,
    data: {
      userId,
      milestoneId,
      previousValue,
      newValue,
      threshold,
      percentComplete,
    },
    level: 'info',
  });
}

export function trackMilestoneUnlockGranted(
  userId: string,
  milestoneId: string,
  rewardType: string,
  rewardAmount: number
): void {
  Sentry.addBreadcrumb({
    category: 'milestones',
    message: `Milestone unlock granted: ${milestoneId}`,
    data: {
      userId,
      milestoneId,
      rewardType,
      rewardAmount,
    },
    level: 'info',
  });
}

export function trackMilestoneRewardClaimed(
  userId: string,
  milestoneId: string,
  unlockId: string
): void {
  Sentry.addBreadcrumb({
    category: 'milestones',
    message: `Milestone reward claimed: ${milestoneId}`,
    data: {
      userId,
      milestoneId,
      unlockId,
    },
    level: 'info',
  });
}

export function trackFeatureUnlocked(
  userId: string,
  featureId: string,
  userLevel: number
): void {
  Sentry.addBreadcrumb({
    category: 'milestones',
    message: `Feature unlocked: ${featureId}`,
    data: {
      userId,
      featureId,
      userLevel,
    },
    level: 'info',
  });
}

export function trackMilestoneError(
  operation: string,
  error: unknown,
  userId?: string,
  milestoneId?: string
): void {
  Sentry.addBreadcrumb({
    category: 'milestones',
    message: `Milestone error: ${operation}`,
    data: {
      userId,
      milestoneId,
      error: error instanceof Error ? error.message : 'Unknown error',
    },
    level: 'error',
  });
}

// ============================================================================
// Timeline Analytics
// ============================================================================

export function trackTimelineViewed(
  userId: string,
  totalMilestones: number,
  completedCount: number
): void {
  Sentry.addBreadcrumb({
    category: 'milestones',
    message: 'Milestone timeline viewed',
    data: {
      userId,
      totalMilestones,
      completedCount,
      completionRate: Math.floor((completedCount / totalMilestones) * 100),
    },
    level: 'info',
  });
}

export function trackNextMilestoneViewed(
  userId: string,
  nextMilestoneId: string,
  percentComplete: number
): void {
  Sentry.addBreadcrumb({
    category: 'milestones',
    message: `Next milestone viewed: ${nextMilestoneId}`,
    data: {
      userId,
      nextMilestoneId,
      percentComplete,
    },
    level: 'info',
  });
}
