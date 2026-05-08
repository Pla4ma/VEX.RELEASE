/**
 * Basic Challenges Management Service
 *
 * Handles creation, retrieval, and status of basic challenges.
 */

import * as Sentry from '@sentry/react-native';
import * as repository from './repository';
import { type UserChallenge } from './schemas';
import {
  BASIC_CHALLENGE_CONFIG,
  BASIC_DAILY_CHALLENGE,
  BASIC_WEEKLY_CHALLENGE,
} from './basic-challenges-constants';
import { eventBus } from '../../events';
import { trackRewardClaimed } from './analytics/events';

export async function getOrCreateBasicDailyChallenge(userId: string): Promise<UserChallenge | null> {
  const existingChallenges = await repository.fetchUserActiveChallenges(userId);
  const existing = existingChallenges.find(c => c.challengeId === BASIC_CHALLENGE_CONFIG.dailyChallengeId);

  if (existing) {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    if (existing.expiresAt < endOfDay.getTime()) {
      await repository.updateUserChallenge(existing.id, existing.challengeId, { status: 'EXPIRED' });
      return await createBasicDailyChallenge(userId);
    }
    return existing;
  }

  return await createBasicDailyChallenge(userId);
}

async function createBasicDailyChallenge(userId: string): Promise<UserChallenge> {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  const userChallenge = await repository.createUserChallenge(userId, BASIC_CHALLENGE_CONFIG.dailyChallengeId, endOfDay.getTime());

  return {
    ...userChallenge,
    requiredCount: BASIC_DAILY_CHALLENGE.targetValue,
    progressHistory: [],
  };
}

export async function getOrCreateBasicWeeklyChallenge(userId: string): Promise<UserChallenge | null> {
  const existingChallenges = await repository.fetchUserActiveChallenges(userId);
  const existing = existingChallenges.find(c => c.challengeId === BASIC_CHALLENGE_CONFIG.weeklyChallengeId);

  if (existing) {
    const now = new Date();
    const endOfWeek = new Date(now);
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    endOfWeek.setDate(now.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);

    if (existing.expiresAt < endOfWeek.getTime()) {
      await repository.updateUserChallenge(existing.id, existing.challengeId, { status: 'EXPIRED' });
      return await createBasicWeeklyChallenge(userId);
    }
    return existing;
  }

  return await createBasicWeeklyChallenge(userId);
}

async function createBasicWeeklyChallenge(userId: string): Promise<UserChallenge> {
  const now = new Date();
  const endOfWeek = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const userChallenge = await repository.createUserChallenge(userId, BASIC_CHALLENGE_CONFIG.weeklyChallengeId, endOfWeek.getTime());

  return {
    ...userChallenge,
    requiredCount: BASIC_WEEKLY_CHALLENGE.targetValue,
    progressHistory: [],
  };
}

export async function getBasicChallengesStatus(userId: string) {
  const dailyChallenge = await getOrCreateBasicDailyChallenge(userId);
  const weeklyChallenge = await getOrCreateBasicWeeklyChallenge(userId);

  return {
    daily: {
      hasActiveChallenge: !!dailyChallenge,
      progress: dailyChallenge?.currentValue ?? 0,
      required: BASIC_DAILY_CHALLENGE.targetValue,
      isCompleted: dailyChallenge?.status === 'COMPLETED',
      canClaim: dailyChallenge?.status === 'COMPLETED' && !dailyChallenge?.claimedAt,
    },
    weekly: {
      hasActiveChallenge: !!weeklyChallenge,
      progress: weeklyChallenge?.currentValue ?? 0,
      required: BASIC_WEEKLY_CHALLENGE.targetValue,
      isCompleted: weeklyChallenge?.status === 'COMPLETED',
      canClaim: weeklyChallenge?.status === 'COMPLETED' && !weeklyChallenge?.claimedAt,
    },
  };
}

export async function claimBasicChallengeReward(
  userId: string,
  challengeType: 'DAILY' | 'WEEKLY'
) {
  const challenge = challengeType === 'DAILY'
    ? await getOrCreateBasicDailyChallenge(userId)
    : await getOrCreateBasicWeeklyChallenge(userId);

  if (!challenge || challenge.status !== 'COMPLETED') {
    return { success: false, error: 'Challenge not completed' };
  }

  if (challenge.claimedAt) {
    return { success: false, error: 'Reward already claimed' };
  }

  const now = Date.now();
  const baseChallenge = challengeType === 'DAILY' ? BASIC_DAILY_CHALLENGE : BASIC_WEEKLY_CHALLENGE;

  await repository.updateUserChallenge(challenge.id, challenge.challengeId, {
    claimedAt: now,
  });

  const rewards = [
    { type: baseChallenge.rewardType, amount: baseChallenge.rewardAmount },
  ];

  Sentry.addBreadcrumb({
    category: 'challenges',
    message: 'Challenge reward claimed',
    data: { userId, challengeId: challenge.challengeId, challengeType },
    level: 'info',
  });

  trackRewardClaimed(
    userId,
    challenge.challengeId,
    baseChallenge.rewardType,
    baseChallenge.rewardAmount,
    now - (challenge.completedAt || now)
  );

  eventBus.publish('challenge:reward_claimed', {
    userId,
    challengeId: challenge.challengeId,
    challengeType,
    claimedAt: now,
    rewards,
  });

  return { success: true, rewards };
}
