/**
 * Tests for Challenges — Service: claimChallengeReward
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
import { claimChallengeReward } from '../service';
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

describe('Service', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe('claimChallengeReward', () => {
    it('returns success false when challenge is not in completed list', async () => {
      mockedRepo.fetchCompletedChallengeDetails.mockResolvedValue([]);
      const result = await claimChallengeReward({
        userId: 'user-1',
        challengeId: 'c-nonexistent',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Challenge not completed');
    });

    it('returns success false when reward already claimed', async () => {
      const detail = {
        challenge: makeChallenge(),
        userChallenge: makeUserChallenge({ status: 'CLAIMED' }),
        xpReward: 100,
        coinReward: 50,
        requiredCount: 5,
      };
      mockedRepo.fetchCompletedChallengeDetails.mockResolvedValue([detail] as unknown);
      const result = await claimChallengeReward({
        userId: 'user-1',
        challengeId: 'c-1',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Reward already claimed');
    });
  });
});
