/**
 * Streaks Comprehensive Tests — Convert & Events
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect, jest } from '@jest/globals';

import type { Streak } from '../schemas';

import {
  convertShieldsToInsurance,
  StreakInsuranceEvents,
} from '../streak-risk-assessment';

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

describe('convertShieldsToInsurance', () => {
  it('converts 0 shields to empty arrays', () => {
    const result = convertShieldsToInsurance(0, 10);
    expect(result.insurance).toHaveLength(0);
    expect(result.tokens).toHaveLength(0);
  });

  it('converts 1 shield to 1 insurance', () => {
    const result = convertShieldsToInsurance(1, 10);
    expect(result.insurance).toHaveLength(1);
    expect(result.tokens).toHaveLength(0);
  });

  it('converts multiple shields to insurance + tokens', () => {
    const result = convertShieldsToInsurance(3, 10);
    expect(result.insurance).toHaveLength(1);
    expect(result.tokens).toHaveLength(2);
  });

  it('generates message', () => {
    const result = convertShieldsToInsurance(2, 10);
    expect(result.message).toContain('Converted');
  });
});

// ============================================================================
// StreakInsuranceEvents
// ============================================================================
describe('StreakInsuranceEvents', () => {
  it('defines all expected events', () => {
    expect(StreakInsuranceEvents.INSURANCE_PURCHASED).toBe('streak:insurance_purchased');
    expect(StreakInsuranceEvents.INSURANCE_USED).toBe('streak:insurance_used');
    expect(StreakInsuranceEvents.GAMBLE_STARTED).toBe('streak:gamble_started');
    expect(StreakInsuranceEvents.GAMBLE_WON).toBe('streak:gamble_won');
    expect(StreakInsuranceEvents.GAMBLE_LOST).toBe('streak:gamble_lost');
    expect(StreakInsuranceEvents.TOKEN_EARNED).toBe('streak:token_earned');
    expect(StreakInsuranceEvents.TOKEN_USED).toBe('streak:token_used');
  });
});
