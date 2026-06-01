/**
 * Tests for Challenges — Response Schemas
 */

import { describe, it, expect } from '@jest/globals';

import {
  ChallengeRewardSchema,
  ChallengeCompletionResultSchema,
  UserChallengeSummarySchema,
  ChallengeDetailSchema,
  RerollResultSchema,
  RerollEligibilitySchema,
  ChallengeSchema,
  UserChallengeSchema,
} from '../schemas';

const NOW = Date.now();

function makeChallenge(overrides: Record<string, unknown> = {}) {
  return ChallengeSchema.parse({
    id: 'c-1',
    seasonId: 'season-1',
    type: 'DAILY',
    category: 'SESSIONS',
    title: 'Test Challenge',
    description: 'Do the thing',
    targetValue: 5,
    targetType: 'SESSIONS',
    rewardType: 'XP',
    rewardAmount: 100,
    ...overrides,
  });
}

function makeUserChallenge(overrides: Record<string, unknown> = {}) {
  return UserChallengeSchema.parse({
    id: 'uc-1',
    userId: 'user-1',
    challengeId: 'c-1',
    currentValue: 0,
    status: 'ACTIVE',
    assignedAt: NOW - 10000,
    ...overrides,
  });
}

describe('Response Schemas', () => {
  it('ChallengeRewardSchema validates a reward', () => {
    const reward = ChallengeRewardSchema.parse({
      type: 'XP',
      amount: 100,
      itemId: null,
      delivered: false,
      deliveredAt: null,
    });
    expect(reward.type).toBe('XP');
  });

  it('ChallengeRewardSchema rejects negative amount', () => {
    expect(() =>
      ChallengeRewardSchema.parse({ type: 'XP', amount: -1, itemId: null, delivered: false, deliveredAt: null }),
    ).toThrow();
  });

  it('ChallengeCompletionResultSchema validates a result', () => {
    const result = ChallengeCompletionResultSchema.parse({
      success: true,
      challengeId: 'c-1',
      userId: 'u-1',
      completedAt: NOW,
      rewards: [],
      xpEarned: 100,
      seasonProgressAdvanced: false,
      newTierUnlocked: false,
      timeToComplete: 5000,
      wasRerolled: false,
    });
    expect(result.success).toBe(true);
    expect(result.xpEarned).toBe(100);
  });

  it('UserChallengeSummarySchema validates a summary', () => {
    const summary = UserChallengeSummarySchema.parse({
      challengeId: 'c-1',
      title: 'Test',
      description: 'desc',
      category: 'SESSIONS',
      type: 'DAILY',
      difficulty: 'MEDIUM',
      currentValue: 2,
      targetValue: 5,
      progressPercent: 40,
      status: 'ACTIVE',
      isClaimable: false,
      isExpired: false,
      expiresInMs: 3600000,
      rewardType: 'XP',
      rewardAmount: 100,
      canReroll: true,
      rerollCost: 10,
      freeRerollAvailable: true,
      rerollCount: 0,
    });
    expect(summary.progressPercent).toBe(40);
  });

  it('ChallengeDetailSchema validates a detail', () => {
    const detail = ChallengeDetailSchema.parse({
      challenge: makeChallenge(),
      userChallenge: makeUserChallenge(),
      xpReward: 100,
      coinReward: 50,
      requiredCount: 5,
    });
    expect(detail.xpReward).toBe(100);
    expect(detail.requiredCount).toBe(5);
  });

  it('RerollResultSchema validates a result', () => {
    const result = RerollResultSchema.parse({
      success: false,
      oldChallengeId: 'c-1',
      newChallengeId: '',
      newChallenge: null,
      gemsSpent: 0,
      freeRerollUsed: false,
      error: 'not eligible',
      remainingGems: 0,
      remainingFreeRerollsToday: 0,
    });
    expect(result.success).toBe(false);
  });

  it('RerollEligibilitySchema validates eligibility', () => {
    const eligibility = RerollEligibilitySchema.parse({
      canReroll: true,
      reason: null,
      freeRerollAvailable: true,
      gemsRequired: 0,
      currentGems: 50,
      rerollCountToday: 0,
      maxRerollsPerDay: 10,
    });
    expect(eligibility.canReroll).toBe(true);
  });
});
