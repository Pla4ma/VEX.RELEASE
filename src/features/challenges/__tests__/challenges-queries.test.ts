/**
 * Tests for Challenges — Queries
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ─── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../repository');
jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn(() => ({
    grantReward: jest.fn().mockResolvedValue(undefined),
  })),
}));
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));
jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(), lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(), or: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(), order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockReturnThis(), update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
  })),
}));
jest.mock('../../../analytics', () => ({
  getAnalyticsService: jest.fn(() => ({ track: jest.fn() })),
}));
jest.mock('../../../utils/debug', () => ({
  createDebugger: jest.fn(() => ({
    debug: jest.fn(), error: jest.fn(), log: jest.fn(), warn: jest.fn(),
  })),
}));
jest.mock('../../../store', () => ({
  useAuthStore: jest.fn(() => ({ user: { id: 'user-1' } })),
}));

// ─── Imports under test ─────────────────────────────────────────────────────

import * as repository from '../repository';
import {
  getActiveChallenges,
  getCompletedChallenges,
  getUserChallengeSummaries,
  checkRerollEligibility,
  rerollChallenge,
} from '../queries';
import { ChallengeSchema, UserChallengeSchema } from '../schemas';

const mockedRepo = jest.mocked(repository);
const NOW = Date.now();

function makeChallenge(overrides: Record<string, unknown> = {}) {
  return ChallengeSchema.parse({
    id: 'c-1', seasonId: 'season-1', type: 'DAILY', category: 'SESSIONS',
    title: 'Test Challenge', description: 'Do the thing', targetValue: 5,
    targetType: 'SESSIONS', rewardType: 'XP', rewardAmount: 100, ...overrides,
  });
}

function makeUserChallenge(overrides: Record<string, unknown> = {}) {
  return UserChallengeSchema.parse({
    id: 'uc-1', userId: 'user-1', challengeId: 'c-1',
    currentValue: 0, status: 'ACTIVE', assignedAt: NOW - 10000, ...overrides,
  });
}

describe('Queries', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('getActiveChallenges', () => {
    it('delegates to repository.fetchActiveChallengeDetails', async () => {
      mockedRepo.fetchActiveChallengeDetails.mockResolvedValue([]);
      const result = await getActiveChallenges('user-1');
      expect(result).toEqual([]);
      expect(mockedRepo.fetchActiveChallengeDetails).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getCompletedChallenges', () => {
    it('delegates to repository.fetchCompletedChallengeDetails with default limit', async () => {
      mockedRepo.fetchCompletedChallengeDetails.mockResolvedValue([]);
      await getCompletedChallenges('user-1');
      expect(mockedRepo.fetchCompletedChallengeDetails).toHaveBeenCalledWith('user-1', 10);
    });

    it('passes custom limit', async () => {
      mockedRepo.fetchCompletedChallengeDetails.mockResolvedValue([]);
      await getCompletedChallenges('user-1', 50);
      expect(mockedRepo.fetchCompletedChallengeDetails).toHaveBeenCalledWith('user-1', 50);
    });
  });

  describe('getUserChallengeSummaries', () => {
    it('maps active challenge details to summaries', async () => {
      const details = [{
        challenge: makeChallenge({ id: 'c-1', title: 'Test', description: 'Desc', category: 'SESSIONS', type: 'DAILY', difficulty: 'EASY', rewardAmount: 100 }),
        userChallenge: makeUserChallenge({ currentValue: 3, status: 'ACTIVE', expiresAt: NOW + 3600000, rerollCount: 0 }),
        xpReward: 100,
        coinReward: 50,
        requiredCount: 5,
      }];
      mockedRepo.fetchActiveChallengeDetails.mockResolvedValue(details as any);
      const summaries = await getUserChallengeSummaries('user-1');
      expect(summaries).toHaveLength(1);
      expect(summaries[0].challengeId).toBe('c-1');
      expect(summaries[0].progressPercent).toBe(60);
      expect(summaries[0].isClaimable).toBe(false);
      expect(summaries[0].canReroll).toBe(true);
    });
  });

  describe('checkRerollEligibility', () => {
    it('returns canReroll false when challenge not found', async () => {
      mockedRepo.fetchUserChallenge.mockResolvedValue(null);
      mockedRepo.getRerollCountToday.mockResolvedValue(0);
      mockedRepo.getFreeRerollCountToday.mockResolvedValue(0);
      const result = await checkRerollEligibility('user-1', 'c-missing');
      expect(result.canReroll).toBe(false);
      expect(result.reason).toBe('Challenge not found');
    });

    it('returns canReroll false when daily limit reached', async () => {
      mockedRepo.fetchUserChallenge.mockResolvedValue(makeUserChallenge() as any);
      mockedRepo.getRerollCountToday.mockResolvedValue(10);
      mockedRepo.getFreeRerollCountToday.mockResolvedValue(1);
      const result = await checkRerollEligibility('user-1', 'c-1');
      expect(result.canReroll).toBe(false);
      expect(result.reason).toBe('Daily reroll limit reached');
    });

    it('returns canReroll true for ACTIVE challenge with free reroll', async () => {
      mockedRepo.fetchUserChallenge.mockResolvedValue(makeUserChallenge({ status: 'ACTIVE' }) as any);
      mockedRepo.getRerollCountToday.mockResolvedValue(0);
      mockedRepo.getFreeRerollCountToday.mockResolvedValue(0);
      const result = await checkRerollEligibility('user-1', 'c-1');
      expect(result.canReroll).toBe(true);
      expect(result.freeRerollAvailable).toBe(true);
      expect(result.gemsRequired).toBe(0);
    });

    it('returns canReroll false for COMPLETED challenge', async () => {
      mockedRepo.fetchUserChallenge.mockResolvedValue(makeUserChallenge({ status: 'COMPLETED' }) as any);
      mockedRepo.getRerollCountToday.mockResolvedValue(0);
      mockedRepo.getFreeRerollCountToday.mockResolvedValue(0);
      const result = await checkRerollEligibility('user-1', 'c-1');
      expect(result.canReroll).toBe(false);
      expect(result.reason).toContain('completed');
    });
  });

  describe('rerollChallenge', () => {
    it('returns failure when not eligible', async () => {
      mockedRepo.fetchUserChallenge.mockResolvedValue(null);
      mockedRepo.getRerollCountToday.mockResolvedValue(0);
      mockedRepo.getFreeRerollCountToday.mockResolvedValue(0);
      const result = await rerollChallenge({
        userId: 'user-1', challengeId: 'c-1', usePaidReroll: false,
      });
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});
