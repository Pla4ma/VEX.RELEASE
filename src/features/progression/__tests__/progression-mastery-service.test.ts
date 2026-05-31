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

import { MASTERY_TRACKS } from '../mastery-types';
import { calculateMasteryXpFromSession, applyMasteryXp, createInitialMasteryState, migrateFromLegacyProgression } from '../mastery-service';

const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

describe('Mastery Service', () => {
  describe('createInitialMasteryState', () => {
    it('creates state with correct userId', () => {
      const state = createInitialMasteryState('user-1');
      expect(state.userId).toBe('user-1');
    });

    it('initializes all tracks at level 1', () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      for (const track of MASTERY_TRACKS) {
        expect(state.tracks[track].level).toBe(1);
        expect(state.tracks[track].xp).toBe(0);
      }
    });

    it('starts at APPRENTICE rank', () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      expect(state.overallRank).toBe('APPRENTICE');
      expect(state.prestigeLevel).toBe(0);
    });
  });

  describe('calculateMasteryXpFromSession', () => {
    it('returns XP across all tracks', () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      const result = calculateMasteryXpFromSession(state, {
        duration: 60,
        purityScore: 90,
        pauseCount: 0,
        wasInterrupted: false,
        streakDays: 5,
        sessionsToday: 1,
        daysActiveThisWeek: 3,
        isComeback: false,
        daysSinceLastSession: 0,
        previousStreak: 0,
        bossDefeated: false,
        bossHealthPercent: 0,
        damageDealt: 0,
        fightDuration: 0,
        criticalHits: 0,
      });
      expect(result.totalXp).toBeGreaterThan(0);
      expect(result.byTrack.DURATION).toBeGreaterThan(0);
      expect(result.byTrack.PURITY).toBeGreaterThan(0);
      expect(result.byTrack.CONSISTENCY).toBeGreaterThan(0);
    });

    it('returns 0 duration XP when interrupted', () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      const result = calculateMasteryXpFromSession(state, {
        duration: 60,
        purityScore: 90,
        pauseCount: 0,
        wasInterrupted: true,
        streakDays: 0,
        sessionsToday: 1,
        daysActiveThisWeek: 1,
        isComeback: false,
        daysSinceLastSession: 0,
        previousStreak: 0,
        bossDefeated: false,
        bossHealthPercent: 0,
        damageDealt: 0,
        fightDuration: 0,
        criticalHits: 0,
      });
      expect(result.byTrack.DURATION).toBe(0);
    });
  });

  describe('applyMasteryXp', () => {
    it('adds XP to tracks', () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      const result = applyMasteryXp(state, {
        DURATION: 100,
        PURITY: 0,
        CONSISTENCY: 0,
        COMEBACK: 0,
        BOSS: 0,
      });
      expect(result.newState.tracks.DURATION.totalXp).toBe(100);
    });

    it('levels up when XP exceeds threshold', () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      const result = applyMasteryXp(state, {
        DURATION: 200, // level 1 needs 100, level 2 needs 115
        PURITY: 0,
        CONSISTENCY: 0,
        COMEBACK: 0,
        BOSS: 0,
      });
      expect(result.newState.tracks.DURATION.level).toBeGreaterThan(1);
      expect(result.levelUps.length).toBeGreaterThan(0);
    });

    it('reports overall level up', () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      const result = applyMasteryXp(state, {
        DURATION: 500,
        PURITY: 500,
        CONSISTENCY: 500,
        COMEBACK: 500,
        BOSS: 500,
      });
      expect(result.newState.overallLevel).toBeGreaterThan(1);
    });

    it('ignores zero XP tracks', () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      const result = applyMasteryXp(state, {
        DURATION: 0,
        PURITY: 0,
        CONSISTENCY: 0,
        COMEBACK: 0,
        BOSS: 0,
      });
      expect(result.levelUps.length).toBe(0);
    });
  });

  describe('migrateFromLegacyProgression', () => {
    it('creates initial state from old level 1', () => {
      const state = migrateFromLegacyProgression(TEST_USER_ID, 1, 50);
      expect(state.userId).toBe(TEST_USER_ID);
      expect(state.overallRank).toBe('APPRENTICE');
    });

    it('distributes XP across tracks', () => {
      const state = migrateFromLegacyProgression(TEST_USER_ID, 5, 500);
      const totalXp = MASTERY_TRACKS.reduce((sum, t) => sum + state.tracks[t].totalXp, 0);
      expect(totalXp).toBeGreaterThanOrEqual(500); // 500/5 per track + applied
    });
  });
});
