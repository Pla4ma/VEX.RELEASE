/**
 * Streaks Comprehensive Tests — Settle & Assess
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect, jest } from '@jest/globals';

import type { Streak } from '../schemas';

import {
  settleGamble,
  assessStreakRisk,
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

describe('settleGamble', () => {
  const gamble = {
    id: 'gamble-1',
    userId: 'user-1',
    streakDaysAtRisk: 10,
    startedAt: Date.now(),
    sessionId: 'session-1',
    status: 'ACTIVE' as const,
    requiredGrade: 'A' as const,
    bonusXpIfWon: 500,
  };

  it('returns won=true when grade meets requirement', () => {
    const result = settleGamble(gamble, 'A', 90);
    expect(result.won).toBe(true);
    expect(result.streakSaved).toBe(true);
    expect(result.newStreakDays).toBe(10);
    expect(result.xpAwarded).toBeGreaterThan(0);
  });

  it('returns won=true when grade exceeds requirement', () => {
    const result = settleGamble(gamble, 'S', 100);
    expect(result.won).toBe(true);
  });

  it('returns won=false when grade is below requirement', () => {
    const result = settleGamble(gamble, 'C', 50);
    expect(result.won).toBe(false);
    expect(result.streakSaved).toBe(false);
    expect(result.newStreakDays).toBe(1);
    expect(result.xpAwarded).toBe(0);
  });

  it('scales XP with quality', () => {
    const highQuality = settleGamble(gamble, 'S', 100);
    const lowQuality = settleGamble(gamble, 'S', 50);
    expect(highQuality.xpAwarded).toBeGreaterThan(lowQuality.xpAwarded);
  });
});

// ============================================================================
// assessStreakRisk
// ============================================================================
describe('assessStreakRisk', () => {
  it('returns NONE risk when session was today', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00Z'));
    const oneHourAgo = Date.now() - 3600000;
    const assessment = assessStreakRisk(5, oneHourAgo, 'UTC', 1000, false, 0);
    expect(assessment.riskLevel).toBe('NONE');
    jest.useRealTimers();
  });

  it('calculates risk when no session today', () => {
    const yesterday = Date.now() - 25 * 60 * 60 * 1000;
    const assessment = assessStreakRisk(5, yesterday, 'UTC', 1000, false, 0);
    expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(assessment.riskLevel);
  });

  it('calculates insurance cost', () => {
    const assessment = assessStreakRisk(10, Date.now() - 25 * 60 * 60 * 1000, 'UTC', 5000, false, 0);
    expect(assessment.insuranceCost).toBeGreaterThan(0);
  });

  it('reports insurance not available if already has insurance', () => {
    const assessment = assessStreakRisk(10, Date.now() - 25 * 60 * 60 * 1000, 'UTC', 5000, true, 0);
    expect(assessment.insuranceAvailable).toBe(false);
  });

  it("reports insurance not available if can't afford", () => {
    const assessment = assessStreakRisk(10, Date.now() - 25 * 60 * 60 * 1000, 'UTC', 1, false, 0);
    expect(assessment.insuranceAvailable).toBe(false);
  });

  it('includes gamble options', () => {
    const assessment = assessStreakRisk(5, Date.now() - 25 * 60 * 60 * 1000, 'UTC', 1000, false, 0);
    expect(assessment.gambleOptions).toBeDefined();
  });
});
