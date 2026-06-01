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

import { getSessionUnlocks, getSessionXpReward, getCompanionReaction, getTutorialSteps, isInFirstWeek, getFirstWeekCompletion, calculateLevelProgress } from '../first-week-pacing/progression-helpers';
import { getNextSession, getSessionNumber } from '../first-week-pacing/helpers';
import type { FirstWeekProgress } from '../first-week-pacing/schemas';

describe('First Week Pacing', () => {
  describe('calculateLevelProgress', () => {
    it('returns 1 for 0 XP', () => {
      expect(calculateLevelProgress(0)).toBe(1);
    });
    it('returns 1 for 100 XP', () => {
      expect(calculateLevelProgress(100)).toBe(1);
    });
    it('returns 2 for 101-250 XP', () => {
      expect(calculateLevelProgress(150)).toBe(2);
    });
    it('returns 3 for 251-500 XP', () => {
      expect(calculateLevelProgress(300)).toBe(3);
    });
    it('returns 4 for 501-1000 XP', () => {
      expect(calculateLevelProgress(750)).toBe(4);
    });
  });

  describe('getSessionUnlocks', () => {
    it('returns unlocks for SESSION_1', () => {
      const unlocks = getSessionUnlocks('SESSION_1');
      expect(unlocks.length).toBeGreaterThan(0);
      expect(unlocks[0]?.title).toBe('Focus Score Active');
    });

    it('returns unlocks for SESSION_7', () => {
      const unlocks = getSessionUnlocks('SESSION_7');
      expect(unlocks.length).toBeGreaterThan(0);
    });
  });

  describe('getSessionXpReward', () => {
    it('returns increasing rewards per session', () => {
      const s1 = getSessionXpReward('SESSION_1');
      const s7 = getSessionXpReward('SESSION_7');
      expect(s7).toBeGreaterThan(s1);
    });

    it('SESSION_1 gives 50 XP', () => {
      expect(getSessionXpReward('SESSION_1')).toBe(50);
    });

    it('SESSION_7 gives 250 XP', () => {
      expect(getSessionXpReward('SESSION_7')).toBe(250);
    });
  });

  describe('getCompanionReaction', () => {
    it('returns non-empty string for SESSION_1', () => {
      expect(getCompanionReaction('SESSION_1').length).toBeGreaterThan(0);
    });
  });

  describe('getTutorialSteps', () => {
    it('returns steps for SESSION_1', () => {
      const steps = getTutorialSteps('SESSION_1');
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe('isInFirstWeek', () => {
    it('returns true for SESSION_1', () => {
      const progress = { currentSession: 'SESSION_1' } as FirstWeekProgress;
      expect(isInFirstWeek(progress)).toBe(true);
    });

    it('returns false for COMPLETED', () => {
      const progress = { currentSession: 'COMPLETED' } as FirstWeekProgress;
      expect(isInFirstWeek(progress)).toBe(false);
    });
  });

  describe('getFirstWeekCompletion', () => {
    it('returns 0 for 0 sessions', () => {
      const progress = { sessionsCompleted: 0 } as FirstWeekProgress;
      expect(getFirstWeekCompletion(progress)).toBe(0);
    });

    it('returns 100 for 7 sessions', () => {
      const progress = { sessionsCompleted: 7 } as FirstWeekProgress;
      expect(getFirstWeekCompletion(progress)).toBe(100);
    });

    it('returns ~43 for 3 sessions', () => {
      const progress = { sessionsCompleted: 3 } as FirstWeekProgress;
      expect(getFirstWeekCompletion(progress)).toBeCloseTo(42.857, 1);
    });
  });

  describe('getNextSession', () => {
    it('SESSION_1 returns SESSION_2', () => {
      expect(getNextSession('SESSION_1')).toBe('SESSION_2');
    });

    it('SESSION_7 returns COMPLETED', () => {
      expect(getNextSession('SESSION_7')).toBe('COMPLETED');
    });

    it('COMPLETED returns null', () => {
      expect(getNextSession('COMPLETED')).toBeNull();
    });
  });

  describe('getSessionNumber', () => {
    it('SESSION_1 is 1', () => {
      expect(getSessionNumber('SESSION_1')).toBe(1);
    });

    it('SESSION_7 is 7', () => {
      expect(getSessionNumber('SESSION_7')).toBe(7);
    });
  });
});
