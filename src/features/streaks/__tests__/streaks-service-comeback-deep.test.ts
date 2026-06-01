/**
 * Deep Streaks Tests — service-comeback
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../events/EventBus', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));
jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));
jest.mock('../../../utils/uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));
jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));
jest.mock('../repository', () => ({
  fetchStreak: jest.fn(),
  createStreak: jest.fn(),
  updateStreak: jest.fn(),
  recordShieldEarned: jest.fn(),
  recordShieldUsed: jest.fn(),
  getAvailableShield: jest.fn(),
}));
jest.mock('../restore-quest', () => ({
  hasUsedStreakRestoreThisMonth: jest.fn(() => Promise.resolve(false)),
}));
jest.mock('../repository-helpers', () => ({
  RepositoryError: class RepositoryError extends Error {},
}));

// ── Imports ────────────────────────────────────────────────────────────────

import {
  calculateRiskLevel,
  calculateNextDeadline,
  getStreakMultiplier,
} from '../service-comeback';

import type { Streak } from '../schemas';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeStreak(overrides: Partial<Streak> = {}): Streak {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: '550e8400-e29b-41d4-a716-446655440001',
    currentDays: 5,
    longestDays: 10,
    lastQualifyingSessionAt: Date.now() - 2 * 60 * 60 * 1000,
    currentDayCompletedAt: null,
    frozenUntil: null,
    shieldsAvailable: 0,
    gracePeriodUsed: false,
    timezone: 'UTC',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    ...overrides,
  };
}

// ============================================================================
// service-comeback
// ============================================================================

describe('service-comeback: calculateRiskLevel', () => {
  it('returns NONE for zero-day streak', () => {
    const streak = makeStreak({ currentDays: 0 });
    expect(calculateRiskLevel(streak)).toBe('NONE');
  });

  it('returns NONE for frozen streak', () => {
    const streak = makeStreak({
      currentDays: 5,
      frozenUntil: Date.now() + 3600000,
    });
    expect(calculateRiskLevel(streak)).toBe('NONE');
  });

  it('returns LOW for recent session', () => {
    const streak = makeStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 19 * 60 * 60 * 1000,
    });
    expect(calculateRiskLevel(streak)).toBe('LOW');
  });

  it('returns MEDIUM for 23-hour gap', () => {
    const streak = makeStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 23 * 60 * 60 * 1000,
    });
    expect(calculateRiskLevel(streak)).toBe('MEDIUM');
  });

  it('returns HIGH for 31-hour gap', () => {
    const streak = makeStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 31 * 60 * 60 * 1000,
    });
    expect(calculateRiskLevel(streak)).toBe('HIGH');
  });

  it('returns CRITICAL for 41-hour gap', () => {
    const streak = makeStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 41 * 60 * 60 * 1000,
    });
    expect(calculateRiskLevel(streak)).toBe('CRITICAL');
  });

  it('returns LOW when no lastQualifyingSessionAt and active streak', () => {
    const streak = makeStreak({
      currentDays: 3,
      lastQualifyingSessionAt: null,
    });
    expect(calculateRiskLevel(streak)).toBe('LOW');
  });
});

describe('service-comeback: calculateNextDeadline', () => {
  it('returns null for zero-day streak', () => {
    const streak = makeStreak({ currentDays: 0 });
    expect(calculateNextDeadline(streak)).toBeNull();
  });

  it('returns null when no lastQualifyingSessionAt', () => {
    const streak = makeStreak({ lastQualifyingSessionAt: null });
    expect(calculateNextDeadline(streak)).toBeNull();
  });

  it('returns last session + 24h for active streak', () => {
    const lastSession = Date.now() - 5 * 60 * 60 * 1000;
    const streak = makeStreak({ lastQualifyingSessionAt: lastSession });
    expect(calculateNextDeadline(streak)).toBe(lastSession + 86400000);
  });
});

describe('service-comeback: getStreakMultiplier', () => {
  it('returns 1.0 for streaks under 3 days', () => {
    expect(getStreakMultiplier(0)).toBe(1.0);
    expect(getStreakMultiplier(2)).toBe(1.0);
  });

  it('returns 1.25 for 3-6 day streaks', () => {
    expect(getStreakMultiplier(3)).toBe(1.25);
    expect(getStreakMultiplier(6)).toBe(1.25);
  });

  it('returns 1.5 for 7-13 day streaks', () => {
    expect(getStreakMultiplier(7)).toBe(1.5);
    expect(getStreakMultiplier(13)).toBe(1.5);
  });

  it('returns 1.75 for 14-29 day streaks', () => {
    expect(getStreakMultiplier(14)).toBe(1.75);
    expect(getStreakMultiplier(29)).toBe(1.75);
  });

  it('returns 2.0 for 30+ day streaks', () => {
    expect(getStreakMultiplier(30)).toBe(2.0);
    expect(getStreakMultiplier(100)).toBe(2.0);
  });
});
