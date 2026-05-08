/**
 * Basic Challenges Progress Service
 *
 * Handles challenge progress updates and completion.
 */

import * as Sentry from '@sentry/react-native';
import * as repository from './repository';
import { type UserChallenge } from './schemas';
import {
  BASIC_CHALLENGE_CONFIG,
  BASIC_DAILY_CHALLENGE,
  BASIC_WEEKLY_CHALLENGE,
} from './basic-challenges-constants';
import {
  getOrCreateBasicDailyChallenge,
  getOrCreateBasicWeeklyChallenge,
} from './basic-challenges-management-service';
import { getRewardService } from '../../rewards/RewardService';
import { eventBus } from '../../events';
import { trackProgressUpdate, trackChallengeCompleted } from './analytics/events';

export async function updateBasicChallengeProgressFromSession(
  userId: string,
  sessionId: string,
  _sessionDuration: number
) {
  const dailyChallenge = await getOrCreateBasicDailyChallenge(userId);
  const weeklyChallenge = await getOrCreateBasicWeeklyChallenge(userId);

  let dailyUpdated = false;
  let weeklyUpdated = false;
  let dailyCompleted = false;
  let weeklyCompleted = false;

  if (dailyChallenge && dailyChallenge.status === 'ACTIVE') {
    const isCompleted = dailyChallenge.currentValue + 1 >= dailyChallenge.requiredCount;
    await repository.addChallengeProgress(userId, dailyChallenge.challengeId, 1, `session:${sessionId}`);

    trackProgressUpdate(userId, dailyChallenge.challengeId, 1, dailyChallenge.currentValue + 1, dailyChallenge.requiredCount, `session:${sessionId}`);

    dailyUpdated = true;
    dailyCompleted = isCompleted;
    if (isCompleted) {
      await completeBasicChallenge(dailyChallenge, userId);
    }
  }

  if (weeklyChallenge && weeklyChallenge.status === 'ACTIVE') {
    const isCompleted = weeklyChallenge.currentValue + 1 >= weeklyChallenge.requiredCount;
    await repository.addChallengeProgress(userId, weeklyChallenge.challengeId, 1, `session:${sessionId}`);

    trackProgressUpdate(userId, weeklyChallenge.challengeId, 1, weeklyChallenge.currentValue + 1, weeklyChallenge.requiredCount, `session:${sessionId}`);

    weeklyUpdated = true;
    weeklyCompleted = isCompleted;
    if (isCompleted) {
      await completeBasicChallenge(weeklyChallenge, userId);
    }
  }

  return { dailyUpdated, weeklyUpdated, dailyCompleted, weeklyCompleted };
}

async function completeBasicChallenge(userChallenge: UserChallenge, userId: string): Promise<void> {
  const now = Date.now();
  const challenge = userChallenge.challengeId === BASIC_CHALLENGE_CONFIG.dailyChallengeId
    ? BASIC_DAILY_CHALLENGE
    : BASIC_WEEKLY_CHALLENGE;

  await repository.updateUserChallenge(userChallenge.id, userChallenge.challengeId, {
    status: 'COMPLETED',
    completedAt: now,
  });

  Sentry.addBreadcrumb({
    category: 'challenges',
    message: 'Challenge completed',
    data: { userId, challengeId: userChallenge.challengeId },
    level: 'info',
  });

  trackChallengeCompleted(
    userId,
    userChallenge.challengeId,
    challenge.type,
    now - userChallenge.assignedAt,
    challenge.rewardType,
    challenge.rewardAmount
  );

  const rewardService = getRewardService();
  const rewardAmount = challenge.rewardAmount;
  const rewardType = challenge.rewardType;

  if (rewardType === 'XP') {
    await rewardService.addXpReward(userId, rewardAmount, {
      source: 'challenge_completion',
      challengeId: userChallenge.challengeId,
      challengeType: challenge.type,
    });
  } else if (rewardType === 'COINS') {
    await rewardService.addCoinReward(userId, rewardAmount, {
      source: 'challenge_completion',
      challengeId: userChallenge.challengeId,
      challengeType: challenge.type,
    });
  }

  eventBus.publish('challenge:completed', {
    userId,
    challengeId: userChallenge.challengeId,
    challengeType: challenge.type,
    completedAt: now,
    rewards: [{ type: rewardType, amount: rewardAmount, itemId: null }],
  });
}
