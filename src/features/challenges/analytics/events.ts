/**
 * Challenge Analytics - Event Tracking
 *
 * Individual event tracking functions for challenge engagement.
 */

import { getAnalyticsService } from '../../../analytics';

const analytics = getAnalyticsService();

/**
 * Track challenge view
 */
export function trackChallengeView(
  userId: string,
  challengeId: string,
  challengeType: string,
  difficulty: string
): void {
  analytics.track('challenge_viewed', {
    userId,
    challengeId,
    challengeType,
    difficulty,
    timestamp: Date.now(),
  });
}

/**
 * Track challenge assignment
 */
export function trackChallengeAssigned(
  userId: string,
  challengeId: string,
  challengeType: string,
  assignmentMethod: 'AUTO' | 'MANUAL' | 'REROLL'
): void {
  analytics.track('challenge_assigned', {
    userId,
    challengeId,
    challengeType,
    assignmentMethod,
    timestamp: Date.now(),
  });
}

/**
 * Track progress update
 */
export function trackProgressUpdate(
  userId: string,
  challengeId: string,
  delta: number,
  newValue: number,
  targetValue: number,
  source: string
): void {
  analytics.track('challenge_progress_updated', {
    userId,
    challengeId,
    delta,
    newValue,
    targetValue,
    progressPercent: (newValue / targetValue) * 100,
    source,
    timestamp: Date.now(),
  });
}

/**
 * Track challenge completion
 */
export function trackChallengeCompleted(
  userId: string,
  challengeId: string,
  challengeType: string,
  timeToComplete: number,
  rewardType: string,
  rewardAmount: number
): void {
  analytics.track('challenge_completed', {
    userId,
    challengeId,
    challengeType,
    timeToComplete,
    rewardType,
    rewardAmount,
    timestamp: Date.now(),
  });
}

/**
 * Track reward claim
 */
export function trackRewardClaimed(
  userId: string,
  challengeId: string,
  rewardType: string,
  rewardAmount: number,
  timeToClaim: number
): void {
  analytics.track('challenge_reward_claimed', {
    userId,
    challengeId,
    rewardType,
    rewardAmount,
    timeToClaim,
    timestamp: Date.now(),
  });
}

/**
 * Track challenge reroll
 */
export function trackChallengeReroll(
  userId: string,
  oldChallengeId: string,
  newChallengeId: string,
  rerollType: 'FREE' | 'PAID',
  gemsSpent: number
): void {
  analytics.track('challenge_rerolled', {
    userId,
    oldChallengeId,
    newChallengeId,
    rerollType,
    gemsSpent,
    timestamp: Date.now(),
  });
}

/**
 * Track challenge expiration
 */
export function trackChallengeExpired(
  userId: string,
  challengeId: string,
  challengeType: string,
  progressPercent: number
): void {
  analytics.track('challenge_expired', {
    userId,
    challengeId,
    challengeType,
    progressPercent,
    timestamp: Date.now(),
  });
}
