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

import { calculateLevelThreshold, calculateTotalXpToLevel, calculateLevelFromTotalXp, calculateProgressPercent, calculateXpBreakdown } from '../service-xp-calculations';
import { configureProgressionService } from '../service-config';

describe('XP Calculations', () => {
  describe('calculateLevelThreshold', () => {
    it('returns 100 for level 1', () => {
      expect(calculateLevelThreshold(1)).toBe(100);
    });
    it('returns 125 for level 2 (1.25 growth factor)', () => {
      expect(calculateLevelThreshold(2)).toBe(125);
    });
    it('returns correct value for level 5', () => {
      expect(calculateLevelThreshold(5)).toBe(Math.floor(100 * Math.pow(1.25, 4)));
    });
    it('returns correct value for level 10', () => {
      expect(calculateLevelThreshold(10)).toBe(Math.floor(100 * Math.pow(1.25, 9)));
    });
    it('grows exponentially per level', () => {
      for (let i = 2; i <= 20; i++) {
        expect(calculateLevelThreshold(i)).toBeGreaterThan(calculateLevelThreshold(i - 1));
      }
    });
  });

  describe('calculateTotalXpToLevel', () => {
    it('returns 0 for level 1', () => {
      expect(calculateTotalXpToLevel(1)).toBe(0);
    });
    it('returns threshold of level 1 for level 2', () => {
      expect(calculateTotalXpToLevel(2)).toBe(100);
    });
    it('accumulates all previous thresholds', () => {
      const expected = calculateLevelThreshold(1) + calculateLevelThreshold(2) + calculateLevelThreshold(3) + calculateLevelThreshold(4);
      expect(calculateTotalXpToLevel(5)).toBe(expected);
    });
  });

  describe('calculateLevelFromTotalXp', () => {
    beforeEach(() => {
      configureProgressionService({ maxLevel: 100 });
    });

    it('returns 1 for 0 XP', () => {
      expect(calculateLevelFromTotalXp(0)).toBe(1);
    });
    it('returns 1 for XP below threshold', () => {
      expect(calculateLevelFromTotalXp(50)).toBe(1);
    });
    it('returns 2 at exactly threshold', () => {
      expect(calculateLevelFromTotalXp(100)).toBe(2);
    });
    it('returns 3 for enough XP to pass two levels', () => {
      expect(calculateLevelFromTotalXp(225)).toBe(3); // 100 + 125
    });
    it('caps at maxLevel', () => {
      expect(calculateLevelFromTotalXp(Number.MAX_SAFE_INTEGER)).toBe(100);
    });
    it('respects custom maxLevel', () => {
      configureProgressionService({ maxLevel: 10 });
      expect(calculateLevelFromTotalXp(Number.MAX_SAFE_INTEGER)).toBe(10);
      configureProgressionService({ maxLevel: 100 }); // restore
    });
  });

  describe('calculateProgressPercent', () => {
    it('returns 0 for 0 XP', () => {
      expect(calculateProgressPercent(0, 1)).toBe(0);
    });
    it('returns 50 at half threshold', () => {
      expect(calculateProgressPercent(50, 1)).toBe(50);
    });
    it('caps at 100', () => {
      expect(calculateProgressPercent(200, 1)).toBe(100);
    });
    it('returns 100 at exactly threshold', () => {
      expect(calculateProgressPercent(100, 1)).toBe(100);
    });
  });

  describe('calculateXpBreakdown', () => {
    it('returns valid breakdown with no bonuses when params have no bonuses', () => {
      const result =
        calculateXpBreakdown({
          baseAmount: 100,
          streakDays: 0,
          squadMultiplier: 1,
          bossActive: false,
          perfectSession: false,
          comebackActive: false,
        });
      expect(result.base).toBe(100);
      expect(result.momentumBonus).toBe(0);
      expect(result.collaborationBonus).toBe(0);
      expect(result.blockerResolvedBonus).toBe(0);
      expect(result.perfectBonus).toBe(0);
      expect(result.recoveryBonus).toBe(0);
      expect(result.total).toBe(100);
    });

    it('returns valid breakdown with all bonuses applied', () => {
      const result =
        calculateXpBreakdown({
          baseAmount: 50,
          streakDays: 10,
          squadMultiplier: 1.5,
          bossActive: true,
          perfectSession: true,
          comebackActive: true,
        });
      expect(result.base).toBe(50);
      expect(result.momentumBonus).toBeGreaterThanOrEqual(0);
      expect(result.collaborationBonus).toBeGreaterThanOrEqual(0);
      expect(result.blockerResolvedBonus).toBe(10);
      expect(result.perfectBonus).toBe(7);
      expect(result.recoveryBonus).toBe(5);
      expect(result.total).toBeGreaterThan(50);
    });

    it('BreakdownParams interface accepts all parameter types', () => {
      // Verify the function accepts the BreakdownParams shape
      const params = {
        baseAmount: 100,
        streakDays: 5,
        squadMultiplier: 1.25,
        bossActive: true,
        perfectSession: false,
        comebackActive: true,
      };
      const result = calculateXpBreakdown(params);
      expect(result).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
    });
  });
});
