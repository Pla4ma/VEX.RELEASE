/**
 * Tests for Challenges — Service: updateChallengeProgress
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ─── Mocks ─────────────────────────────────────────────────────────────────

jest.mock('../../../events/EventBus', () => ({
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
import { eventBus } from '../../../events/EventBus';
import { updateChallengeProgress } from '../service';
import { ChallengeSchema, UserChallengeSchema } from '../schemas';
import { ChallengeNotFoundError, ChallengeNotActiveError } from '../errors';

const mockedRepo = jest.mocked(repository);
const mockedEventBus = jest.mocked(eventBus);
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

describe('Service', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('updateChallengeProgress', () => {
    it('returns null when target not yet reached', async () => {
      const challenge = makeChallenge({ targetValue: 10 });
      const uc = makeUserChallenge({ currentValue: 0, status: 'ACTIVE' });
      mockedRepo.fetchUserChallenge.mockResolvedValue(uc);
      mockedRepo.fetchChallengeById.mockResolvedValue(challenge);
      mockedRepo.addChallengeProgress.mockResolvedValue(
        makeUserChallenge({ currentValue: 5, status: 'ACTIVE' }),
      );

      const result = await updateChallengeProgress({
        userId: 'user-1', challengeId: 'c-1', delta: 5, source: 'session',
      });
      expect(result).toBeNull();
    });

    it('returns completion result when target is reached', async () => {
      const challenge = makeChallenge({ targetValue: 5, rewardAmount: 200 });
      const uc = makeUserChallenge({ currentValue: 0, status: 'ACTIVE', assignedAt: NOW - 10000 });
      mockedRepo.fetchUserChallenge.mockResolvedValue(uc);
      mockedRepo.fetchChallengeById.mockResolvedValue(challenge);
      mockedRepo.addChallengeProgress.mockResolvedValue(
        makeUserChallenge({ currentValue: 5, status: 'ACTIVE' }),
      );
      mockedRepo.updateUserChallenge.mockResolvedValue(
        makeUserChallenge({ currentValue: 5, status: 'COMPLETED' }),
      );

      const result = await updateChallengeProgress({
        userId: 'user-1', challengeId: 'c-1', delta: 5, source: 'session',
      });
      expect(result).not.toBeNull();
      expect(result!.success).toBe(true);
      expect(result!.xpEarned).toBe(200);
      expect(result!.rewards.length).toBeGreaterThan(0);
    });

    it('throws ChallengeNotFoundError when challenge does not exist', async () => {
      mockedRepo.fetchUserChallenge.mockResolvedValue(null);
      mockedRepo.fetchChallengeById.mockResolvedValue(null);
      await expect(
        updateChallengeProgress({
          userId: 'user-1', challengeId: 'c-missing', delta: 1, source: 'test',
        }),
      ).rejects.toThrow(ChallengeNotFoundError);
    });

    it('throws ChallengeNotActiveError when status is not ACTIVE', async () => {
      const uc = makeUserChallenge({ status: 'COMPLETED' });
      const challenge = makeChallenge();
      mockedRepo.fetchUserChallenge.mockResolvedValue(uc);
      mockedRepo.fetchChallengeById.mockResolvedValue(challenge);
      await expect(
        updateChallengeProgress({
          userId: 'user-1', challengeId: 'c-1', delta: 1, source: 'test',
        }),
      ).rejects.toThrow(ChallengeNotActiveError);
    });

    it('publishes challenge:progress event on update', async () => {
      const challenge = makeChallenge({ targetValue: 10 });
      const uc = makeUserChallenge({ currentValue: 0, status: 'ACTIVE' });
      mockedRepo.fetchUserChallenge.mockResolvedValue(uc);
      mockedRepo.fetchChallengeById.mockResolvedValue(challenge);
      mockedRepo.addChallengeProgress.mockResolvedValue(
        makeUserChallenge({ currentValue: 3, status: 'ACTIVE' }),
      );

      await updateChallengeProgress({
        userId: 'user-1', challengeId: 'c-1', delta: 3, source: 'session',
      });
      expect(mockedEventBus.publish).toHaveBeenCalledWith(
        'challenge:progress',
        expect.objectContaining({
          userId: 'user-1', challengeId: 'c-1', progress: 3, target: 10,
        }),
      );
    });
  });
});
