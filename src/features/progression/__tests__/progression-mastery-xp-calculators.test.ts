/**
 * Tests extracted from progression-comprehensive.test.ts
 */

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));
jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../events/EventBus', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../config/supabase', () => ({
  supabase: { from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })) })) })), rpc: jest.fn(() => ({ data: null, error: null })) },
  getSupabaseClient: jest.fn(() => ({ from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })) })), gte: jest.fn(() => ({})), lte: jest.fn(() => ({})), order: jest.fn(() => ({})), limit: jest.fn(() => ({})) })), rpc: jest.fn(() => ({ data: null, error: null })) })),
}));
jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));
jest.mock('../../../utils/uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).slice(2, 8),
}));
jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(), error: jest.fn(), warn: jest.fn(), log: jest.fn(),
  }),
}));
jest.mock('../../../utils/supabase-resilience', () => ({
  withResilience: (q: unknown) => q,
}));
jest.mock('@theme/tokens/colors', () => ({
  lightColors: {
    accent: { teal: '#008080', orange: '#FFA500', purple: '#800080', pink: '#FFC0CB' },
    primary: { 400: '#4A90D9', 600: '#2D5F8A' },
    error: { 500: '#FF0000' },
  },
}));
jest.mock('@theme/tokens/launch-colors', () => ({
  launchColors: {
    hex_8b4513: '#8b4513', hex_4a5568: '#4a5568', hex_4169e1: '#4169e1',
    hex_9400d3: '#9400d3', hex_ffd700: '#ffd700', hex_ff00ff: '#ff00ff',
  },
}));
jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest.fn(),
}));

import { calculateDurationMasteryXp, calculatePurityMasteryXp, calculateConsistencyMasteryXp, calculateComebackMasteryXp, calculateBossMasteryXp } from '../xp-calculators';

describe('Mastery XP Calculators', () => {
  describe('calculateDurationMasteryXp', () => {
    it('returns 0 if interrupted', () => {
      expect(calculateDurationMasteryXp(60, true, 90)).toBe(0);
    });

    it('calculates base XP from minutes', () => {
      const xp = calculateDurationMasteryXp(60, false, 100);
      expect(xp).toBeGreaterThan(0);
    });

    it('adds 50 bonus for 90+ minute sessions', () => {
      const with90 = calculateDurationMasteryXp(90, false, 80);
      const with60 = calculateDurationMasteryXp(60, false, 80);
      expect(with90).toBeGreaterThan(with60);
    });

    it('adds 30 bonus for 60+ min with high purity', () => {
      const highPurity = calculateDurationMasteryXp(60, false, 95);
      const lowPurity = calculateDurationMasteryXp(60, false, 50);
      expect(highPurity).toBeGreaterThan(lowPurity);
    });
  });

  describe('calculatePurityMasteryXp', () => {
    it('returns 0 for purity below 70', () => {
      expect(calculatePurityMasteryXp(69, 60, 0)).toBe(0);
    });

    it('doubles XP for zero pauses', () => {
      const noPause = calculatePurityMasteryXp(90, 60, 0);
      const withPause = calculatePurityMasteryXp(90, 60, 2);
      expect(noPause).toBeGreaterThan(withPause);
    });

    it('adds bonus for 95+ purity', () => {
      const high = calculatePurityMasteryXp(95, 60, 0);
      const normal = calculatePurityMasteryXp(80, 60, 0);
      expect(high).toBeGreaterThan(normal);
    });

    it('adds bonus for 45+ minute sessions', () => {
      const long = calculatePurityMasteryXp(90, 45, 0);
      const short = calculatePurityMasteryXp(90, 30, 0);
      expect(long).toBeGreaterThan(short);
    });
  });

  describe('calculateConsistencyMasteryXp', () => {
    it('returns base 10 XP', () => {
      const xp = calculateConsistencyMasteryXp(0, 1, 1);
      expect(xp).toBe(10);
    });

    it('increases with streak', () => {
      const noStreak = calculateConsistencyMasteryXp(0, 1, 1);
      const withStreak = calculateConsistencyMasteryXp(10, 1, 1);
      expect(withStreak).toBeGreaterThan(noStreak);
    });

    it('adds bonus for 2+ sessions today', () => {
      const one = calculateConsistencyMasteryXp(0, 1, 1);
      const two = calculateConsistencyMasteryXp(0, 2, 1);
      expect(two).toBeGreaterThan(one);
    });

    it('adds bonus for 3+ sessions today', () => {
      const two = calculateConsistencyMasteryXp(0, 2, 1);
      const three = calculateConsistencyMasteryXp(0, 3, 1);
      expect(three).toBeGreaterThan(two);
    });

    it('adds bonus for 5+ days active this week', () => {
      const normal = calculateConsistencyMasteryXp(0, 1, 3);
      const active = calculateConsistencyMasteryXp(0, 1, 5);
      expect(active).toBeGreaterThan(normal);
    });
  });

  describe('calculateComebackMasteryXp', () => {
    it('returns 0 if not a comeback', () => {
      expect(calculateComebackMasteryXp(false, 5, 10)).toBe(0);
    });

    it('returns base 25 XP for comeback', () => {
      const xp = calculateComebackMasteryXp(true, 5, 0);
      expect(xp).toBeGreaterThanOrEqual(25);
    });

    it('adds 50 bonus for 1 day since last session', () => {
      const oneDay = calculateComebackMasteryXp(true, 1, 0);
      const threeDays = calculateComebackMasteryXp(true, 3, 0);
      expect(oneDay).toBeGreaterThan(threeDays);
    });

    it('adds bonus for long previous streak', () => {
      const longStreak = calculateComebackMasteryXp(true, 5, 30);
      const noStreak = calculateComebackMasteryXp(true, 5, 0);
      expect(longStreak).toBeGreaterThan(noStreak);
    });
  });

  describe('calculateBossMasteryXp', () => {
    it('returns partial XP when boss not defeated', () => {
      const xp = calculateBossMasteryXp(false, 0.5, 500, 60, 0);
      expect(xp).toBe(5); // 500 / 100
    });

    it('returns base 100 XP for defeated boss', () => {
      const xp = calculateBossMasteryXp(true, 0.5, 500, 60, 0);
      expect(xp).toBeGreaterThanOrEqual(100);
    });

    it('adds speed bonus for fast kills', () => {
      // bossHealthPercent = 0 means boss fully dead (fastest kill)
      // speedBonus = floor((1 - bossHealthPercent) * 50)
      const fast = calculateBossMasteryXp(true, 0, 1000, 30, 0);
      const slow = calculateBossMasteryXp(true, 0.8, 1000, 30, 0);
      expect(fast).toBeGreaterThan(slow);
    });

    it('adds critical hit bonus', () => {
      const crits = calculateBossMasteryXp(true, 0.5, 500, 60, 3);
      const noCrits = calculateBossMasteryXp(true, 0.5, 500, 60, 0);
      expect(crits).toBeGreaterThan(noCrits);
    });
  });
});
