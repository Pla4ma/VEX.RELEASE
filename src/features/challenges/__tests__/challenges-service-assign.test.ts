/**
 * Tests for Challenges — Service: assignChallenge
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
import { assignChallenge } from '../service';
import { ChallengeError } from '../errors';
import { UserChallengeSchema } from '../schemas';

const mockedRepo = jest.mocked(repository);
const NOW = Date.now();

function makeUserChallenge(overrides: Record<string, unknown> = {}) {
  return UserChallengeSchema.parse({
    id: 'uc-1', userId: 'user-1', challengeId: 'c-1',
    currentValue: 0, status: 'ACTIVE', assignedAt: NOW - 10000, ...overrides,
  });
}

describe('Service', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('assignChallenge', () => {
    it('assigns a challenge when challengeId is provided', async () => {
      const mockUC = makeUserChallenge();
      mockedRepo.createUserChallenge.mockResolvedValue(mockUC);
      const result = await assignChallenge({
        userId: 'user-1',
        seasonId: 'season-1',
        challengeType: 'DAILY',
        challengeId: 'c-1',
      });
      expect(result.id).toBe('uc-1');
      expect(mockedRepo.createUserChallenge).toHaveBeenCalledWith(
        'user-1',
        'c-1',
        expect.any(Number),
      );
    });

    it('throws ChallengeError when challengeId is missing', async () => {
      await expect(
        assignChallenge({
          userId: 'user-1',
          seasonId: 'season-1',
          challengeType: 'DAILY',
        }),
      ).rejects.toThrow(ChallengeError);
    });

    it('rejects invalid input (empty userId)', async () => {
      await expect(
        assignChallenge({
          userId: '',
          seasonId: 's-1',
          challengeType: 'DAILY',
          challengeId: 'c-1',
        }),
      ).rejects.toThrow();
    });
  });
});
