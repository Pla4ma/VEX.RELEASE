/**
 * Streaks Comprehensive Tests — Insurance Store
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import type { Streak } from '../schemas';

import {
  awardInsurance,
  getAvailableInsuranceCount,
  getUserInsurance,
  canUseInsurance,
  useInsurance as consumeInsurance,
} from '../insurance';

// ============================================================================
// Mocks
// ============================================================================
const mockRepository = {
  fetchStreak: jest.fn<() => Promise<Streak | null>>(),
  createStreak: jest.fn<() => Promise<Streak>>(),
  updateStreak: jest.fn<() => Promise<Streak>>(),
  recordShieldEarned: jest.fn<() => Promise<void>>(),
  recordShieldUsed: jest.fn<() => Promise<void>>(),
  getAvailableShield: jest.fn<() => Promise<string | null>>(),
  fetchActiveRepairQuest: jest.fn(),
  saveRepairQuest: jest.fn(),
  updateRepairQuest: jest.fn(),
  fetchExpiredRepairQuests: jest.fn(),
  fetchUsersWithActiveStreaks: jest.fn(),
};

jest.mock('../repository', () => mockRepository);

jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(),
  },
}));

jest.mock('../../../utils/uuid', () => ({
  v4: () => 'mock-uuid-' + Math.random().toString(36).slice(2, 8),
}));

jest.mock('../restore-quest', () => ({
  hasUsedStreakRestoreThisMonth: jest.fn<() => Promise<boolean>>().mockResolvedValue(false),
}));

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } })),
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
          gt: jest.fn(() => Promise.resolve({ data: [], error: null })),
          lt: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ error: null })),
  })),
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

describe('Insurance In-Memory Store', () => {
  const userId = 'insurance-test-user';

  beforeEach(() => {
    // Clear by using all insurance
    while (getAvailableInsuranceCount(userId) > 0) {
      consumeInsurance(userId, 'test');
    }
  });

  describe('awardInsurance', () => {
    it('awards insurance successfully', () => {
      const result = awardInsurance(userId, 'test', 1);
      expect(result.success).toBe(true);
      expect(result.userInsurance.totalAvailable).toBe(1);
    });

    it('caps at MAX_INSURANCE (3)', () => {
      awardInsurance(userId, 'test', 5);
      expect(getAvailableInsuranceCount(userId)).toBeLessThanOrEqual(3);
    });

    it('accumulates insurance', () => {
      awardInsurance(userId, 'test', 1);
      awardInsurance(userId, 'test', 1);
      expect(getAvailableInsuranceCount(userId)).toBe(2);
    });
  });

  describe('getAvailableInsuranceCount', () => {
    it('returns 0 for new user', () => {
      expect(getAvailableInsuranceCount('brand-new-user')).toBe(0);
    });
  });

  describe('getUserInsurance', () => {
    it('returns null for user with no insurance history', () => {
      expect(getUserInsurance('no-history-user')).toBeNull();
    });

    it('returns insurance list for user with history', () => {
      awardInsurance(userId, 'test', 2);
      const result = getUserInsurance(userId);
      expect(result).not.toBeNull();
      expect(result!.insurances.length).toBeGreaterThan(0);
    });
  });

  describe('canUseInsurance', () => {
    it('returns canUse=false when no insurance', () => {
      const result = canUseInsurance('empty-user');
      expect(result.canUse).toBe(false);
    });

    it('returns canUse=true when insurance available', () => {
      awardInsurance(userId, 'test', 1);
      const result = canUseInsurance(userId);
      expect(result.canUse).toBe(true);
    });
  });

  describe('useInsurance', () => {
    it('consumes one insurance', () => {
      awardInsurance(userId, 'test', 2);
      const result = consumeInsurance(userId, 'test');
      expect(result.success).toBe(true);
      expect(result.remainingInsurance).toBe(1);
    });

    it('fails when no insurance', () => {
      const result = consumeInsurance('empty-user-2', 'test');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

