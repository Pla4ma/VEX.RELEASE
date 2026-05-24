/**
 * Basic Challenges Service
 *
 * Simplified challenges system for PHASE 8 launch scope.
 * Focuses on daily and weekly challenges only.
 */

import { eventBus } from '../../events';
import * as repository from './repository';
import {
  UserChallengeSchema,
  type UserChallenge,
} from './schemas';

interface BasicChallengeConfig {
  dailyChallengeId: string;
  weeklyChallengeId: string;
  dailyTarget: number;
  weeklyTarget: number;
  dailyRewardXp: number;
  weeklyRewardXp: number;
}

const CONFIG: BasicChallengeConfig = {
  dailyChallengeId: 'basic-daily-001',
  weeklyChallengeId: 'basic-weekly-001',
  dailyTarget: 1,
  weeklyTarget: 5,
  dailyRewardXp: 25,
  weeklyRewardXp: 100,
};

export function getRequiredCount(challengeId: string): number {
  return challengeId === CONFIG.dailyChallengeId ? CONFIG.dailyTarget : CONFIG.weeklyTarget;
}

export async function getOrCreateBasicDailyChallenge(userId: string): Promise<UserChallenge | null> {
  const existingChallenges = await repository.fetchUserActiveChallenges(userId);
  const existing = existingChallenges.find(c => c.challengeId === CONFIG.dailyChallengeId);

  if (existing) {
    const now = Date.now();
    if (existing.expiresAt !== null && existing.expiresAt < now) {
      await repository.updateUserChallenge(existing.id, existing.challengeId, { status: 'EXPIRED' });
      return createBasicChallenge(userId, CONFIG.dailyChallengeId, 86400000);
    }
    return UserChallengeSchema.parse(existing);
  }

  return createBasicChallenge(userId, CONFIG.dailyChallengeId, 86400000);
}

export async function getOrCreateBasicWeeklyChallenge(userId: string): Promise<UserChallenge | null> {
  const existingChallenges = await repository.fetchUserActiveChallenges(userId);
  const existing = existingChallenges.find(c => c.challengeId === CONFIG.weeklyChallengeId);

  if (existing) {
    const now = Date.now();
    if (existing.expiresAt !== null && existing.expiresAt < now) {
      await repository.updateUserChallenge(existing.id, existing.challengeId, { status: 'EXPIRED' });
      return createBasicChallenge(userId, CONFIG.weeklyChallengeId, 604800000);
    }
    return UserChallengeSchema.parse(existing);
  }

  return createBasicChallenge(userId, CONFIG.weeklyChallengeId, 604800000);
}

async function createBasicChallenge(userId: string, challengeId: string, durationMs: number): Promise<UserChallenge> {
  const expiresAt = Date.now() + durationMs;
  const userChallenge = await repository.createUserChallenge(userId, challengeId, expiresAt);
  return UserChallengeSchema.parse(userChallenge);
}

export interface BasicChallengesStatus {
  daily: { progress: number; required: number; isCompleted: boolean; canClaim: boolean; hasActiveChallenge: boolean };
  weekly: { progress: number; required: number; isCompleted: boolean; canClaim: boolean; hasActiveChallenge: boolean };
}

export async function getBasicChallengesStatus(userId: string): Promise<BasicChallengesStatus> {
  const daily = await getOrCreateBasicDailyChallenge(userId);
  const weekly = await getOrCreateBasicWeeklyChallenge(userId);

  const dailyProgress = daily?.currentValue ?? 0;
  const weeklyProgress = weekly?.currentValue ?? 0;
  const dailyCompleted = daily?.status === 'COMPLETED';
  const weeklyCompleted = weekly?.status === 'COMPLETED';
  const dailyClaimed = daily?.status === 'CLAIMED';
  const weeklyClaimed = weekly?.status === 'CLAIMED';

  return {
    daily: {
      progress: dailyProgress,
      required: CONFIG.dailyTarget,
      isCompleted: dailyCompleted || dailyClaimed,
      canClaim: dailyCompleted && !dailyClaimed,
      hasActiveChallenge: daily !== null && !dailyClaimed,
    },
    weekly: {
      progress: weeklyProgress,
      required: CONFIG.weeklyTarget,
      isCompleted: weeklyCompleted || weeklyClaimed,
      canClaim: weeklyCompleted && !weeklyClaimed,
      hasActiveChallenge: weekly !== null && !weeklyClaimed,
    },
  };
}

export interface BasicChallengeProgressResult {
  dailyUpdated: boolean;
  weeklyUpdated: boolean;
  dailyCompleted: boolean;
  weeklyCompleted: boolean;
}

export async function updateBasicChallengeProgressFromSession(
  userId: string,
  _sessionId: string,
  _sessionDuration: number,
): Promise<BasicChallengeProgressResult> {
  void _sessionId;
  void _sessionDuration;

  const daily = await getOrCreateBasicDailyChallenge(userId);
  const weekly = await getOrCreateBasicWeeklyChallenge(userId);

  let dailyUpdated = false;
  let dailyCompleted = false;
  let weeklyUpdated = false;
  let weeklyCompleted = false;

  if (daily && daily.status === 'ACTIVE') {
    const newValue = daily.currentValue + 1;
    if (newValue >= CONFIG.dailyTarget && !dailyCompleted) {
      await repository.updateUserChallenge(daily.id, daily.challengeId, { currentValue: newValue, status: 'COMPLETED', completedAt: Date.now() });
      eventBus.publish('challenge:completed', { userId, challengeId: daily.challengeId, completedAt: Date.now() });
      dailyUpdated = true;
      dailyCompleted = true;
    } else {
      await repository.updateUserChallenge(daily.id, daily.challengeId, { currentValue: newValue });
      dailyUpdated = true;
    }
  }

  if (weekly && weekly.status === 'ACTIVE') {
    const newValue = weekly.currentValue + 1;
    if (newValue >= CONFIG.weeklyTarget && !weeklyCompleted) {
      await repository.updateUserChallenge(weekly.id, weekly.challengeId, { currentValue: newValue, status: 'COMPLETED', completedAt: Date.now() });
      eventBus.publish('challenge:completed', { userId, challengeId: weekly.challengeId, completedAt: Date.now() });
      weeklyUpdated = true;
      weeklyCompleted = true;
    } else {
      await repository.updateUserChallenge(weekly.id, weekly.challengeId, { currentValue: newValue });
      weeklyUpdated = true;
    }
  }

  return { dailyUpdated, weeklyUpdated, dailyCompleted, weeklyCompleted };
}

export interface BasicChallengeClaimResult {
  success: boolean;
  xpEarned: number;
}

export async function claimBasicChallengeReward(userId: string, challengeType: 'DAILY' | 'WEEKLY'): Promise<BasicChallengeClaimResult> {
  const challenge = challengeType === 'DAILY'
    ? await getOrCreateBasicDailyChallenge(userId)
    : await getOrCreateBasicWeeklyChallenge(userId);

  if (!challenge || challenge.status !== 'COMPLETED') {
    return { success: false, xpEarned: 0 };
  }

  await repository.updateUserChallenge(challenge.id, challenge.challengeId, { status: 'CLAIMED', claimedAt: Date.now() });

  const xpEarned = challengeType === 'DAILY' ? CONFIG.dailyRewardXp : CONFIG.weeklyRewardXp;

  eventBus.publish('challenge:reward_claimed', { challengeId: challenge.challengeId, claimedAt: Date.now() });

  return { success: true, xpEarned };
}
