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

import { calculateXpForLevel, calculateMasteryRank, MASTERY_TRACKS } from '../mastery-types';

describe('Mastery Types', () => {
  describe('calculateXpForLevel', () => {
    it('returns 100 for level 1', () => {
      expect(calculateXpForLevel(1)).toBe(100);
    });

    it('grows with level', () => {
      expect(calculateXpForLevel(5)).toBeGreaterThan(calculateXpForLevel(1));
      expect(calculateXpForLevel(10)).toBeGreaterThan(calculateXpForLevel(5));
    });

    it('uses 1.15 growth factor', () => {
      expect(calculateXpForLevel(2)).toBe(Math.floor(100 * 1.15));
    });
  });

  describe('calculateMasteryRank', () => {
    it('returns APPRENTICE for level 1', () => {
      expect(calculateMasteryRank(1, 0)).toBe('APPRENTICE');
    });

    it('returns ADEPT for level 11', () => {
      expect(calculateMasteryRank(11, 0)).toBe('ADEPT');
    });

    it('returns EXPERT for level 21', () => {
      expect(calculateMasteryRank(21, 0)).toBe('EXPERT');
    });

    it('returns MASTER for level 31', () => {
      expect(calculateMasteryRank(31, 0)).toBe('MASTER');
    });

    it('returns GRANDMASTER for level 41', () => {
      expect(calculateMasteryRank(41, 0)).toBe('GRANDMASTER');
    });

    it('returns TRANSCENDENT for any prestige > 0', () => {
      expect(calculateMasteryRank(1, 1)).toBe('TRANSCENDENT');
      expect(calculateMasteryRank(50, 5)).toBe('TRANSCENDENT');
    });

    it('returns TRANSCENDENT even at level 1 with prestige', () => {
      expect(calculateMasteryRank(1, 3)).toBe('TRANSCENDENT');
    });
  });

  it('MASTERY_TRACKS contains all 5 tracks', () => {
    expect(MASTERY_TRACKS).toEqual(['DURATION', 'PURITY', 'CONSISTENCY', 'COMEBACK', 'BOSS']);
  });
});
