/**
 * Streaks Comprehensive Tests — Recovery
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import type { Streak } from '../schemas';

import {
  createRecoveryPlan,
  getRecoveryPlan,
  progressRecovery,
  clearRecoveryPlan,
} from '../recovery';

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

describe('Recovery', () => {
  beforeEach(() => {
    clearRecoveryPlan('user-recovery-test');
  });

  describe('createRecoveryPlan', () => {
    it('creates a plan with correct structure', () => {
      const plan = createRecoveryPlan('user-recovery-test', 10, 500);
      expect(plan.userId).toBe('user-recovery-test');
      expect(plan.daysLost).toBe(10);
      expect(plan.sessionsRequired).toBe(2); // 7 <= 10 <= 14
      expect(plan.completed).toBe(false);
      expect(plan.isRecovering).toBe(true);
      expect(plan.reward.value).toBeGreaterThan(0);
    });

    it('requires 1 session for <7 days lost', () => {
      const plan = createRecoveryPlan('user-recovery-test', 5, 500);
      expect(plan.sessionsRequired).toBe(1);
    });

    it('requires 3 sessions for >14 days lost', () => {
      const plan = createRecoveryPlan('user-recovery-test', 20, 500);
      expect(plan.sessionsRequired).toBe(3);
    });
  });

  describe('getRecoveryPlan', () => {
    it('returns null when no plan exists', () => {
      expect(getRecoveryPlan('no-such-user')).toBeNull();
    });

    it('returns plan after creation', () => {
      createRecoveryPlan('user-recovery-test', 5, 100);
      const plan = getRecoveryPlan('user-recovery-test');
      expect(plan).not.toBeNull();
      expect(plan!.daysLost).toBe(5);
    });

    it('returns null for expired plan', () => {
      // Create a plan and manually expire it
      createRecoveryPlan('user-recovery-test', 5, 100);
      const plan = getRecoveryPlan('user-recovery-test');
      if (plan) {
        // Force expiration
        (plan as { expiresAt: number }).expiresAt = Date.now() - 1000;
      }
      expect(getRecoveryPlan('user-recovery-test')).toBeNull();
    });
  });

  describe('progressRecovery', () => {
    it('returns progressed=false when no plan', () => {
      const result = progressRecovery('no-plan-user', 'session');
      expect(result.progressed).toBe(false);
      expect(result.currentProgress).toBe(0);
    });

    it('increments progress', () => {
      createRecoveryPlan('user-recovery-test', 5, 100);
      const result = progressRecovery('user-recovery-test', 'session');
      expect(result.progressed).toBe(true);
      expect(result.currentProgress).toBe(1);
    });

    it('marks plan complete when sessions met', () => {
      createRecoveryPlan('user-recovery-test', 5, 100);
      progressRecovery('user-recovery-test', 'session');
      const plan = getRecoveryPlan('user-recovery-test');
      // 1 session required for 5 days lost, so should be complete
      expect(plan!.completed).toBe(true);
      expect(plan!.isRecovering).toBe(false);
    });
  });

  describe('clearRecoveryPlan', () => {
    it('removes plan', () => {
      createRecoveryPlan('user-recovery-test', 5, 100);
      clearRecoveryPlan('user-recovery-test');
      expect(getRecoveryPlan('user-recovery-test')).toBeNull();
    });
  });
});

