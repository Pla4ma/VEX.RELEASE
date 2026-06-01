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

import { calculateXpForLevel, MASTERY_TRACKS } from '../mastery-types';
import type { UnifiedMasteryState, MasteryTrackState } from '../mastery-types';
import { canPrestige, executePrestige, getNightmareConfig, createInitialPrestigeState, migrateToPrestigeSystem } from '../prestige-engine';
import type { PrestigeState } from '../prestige-types';

const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

function makeMasteryState(overrides?: Partial<UnifiedMasteryState>): UnifiedMasteryState {
  const makeTrack = (level = 1): MasteryTrackState => ({
    level, xp: 0, xpToNext: calculateXpForLevel(level), totalXp: 0, milestonesCompleted: [],
  });
  return {
    userId: TEST_USER_ID,
    tracks: { DURATION: makeTrack(1), PURITY: makeTrack(1), CONSISTENCY: makeTrack(1), COMEBACK: makeTrack(1), BOSS: makeTrack(1) },
    overallLevel: 1, overallRank: 'APPRENTICE', prestigeLevel: 0, prestigeBonuses: [],
    lastUpdated: Date.now(), createdAt: Date.now(), ...overrides,
  };
}

function makePrestigeState(overrides?: Partial<PrestigeState>): PrestigeState {
  return {
    prestigeLevel: 0, totalPrestiges: 0, firstPrestigeAt: null, lastPrestigeAt: null,
    activeBonuses: [], fastestPrestige: null, mostXpAtPrestige: null,
    nightmareUnlocked: false, nightmareCompletions: 0, ...overrides,
  };
}

describe('Prestige Engine', () => {
  describe('createInitialPrestigeState', () => {
    it('creates zero-level prestige state', () => {
      const state = createInitialPrestigeState();
      expect(state.prestigeLevel).toBe(0);
      expect(state.totalPrestiges).toBe(0);
      expect(state.nightmareUnlocked).toBe(false);
    });
  });

  describe('canPrestige', () => {
    it('cannot prestige with not all tracks maxed', () => {
      const mastery = makeMasteryState();
      const prestige = makePrestigeState();
      const result = canPrestige(mastery, prestige);
      expect(result.canPrestige).toBe(false);
    });

    it('can prestige when all tracks at level 50', () => {
      const mastery = makeMasteryState();
      for (const track of MASTERY_TRACKS) {
        mastery.tracks[track].level = 50;
      }
      const prestige = makePrestigeState();
      const result = canPrestige(mastery, prestige);
      expect(result.canPrestige).toBe(true);
    });

    it('cannot prestige at level 5+ within 7 days', () => {
      const mastery = makeMasteryState();
      for (const track of MASTERY_TRACKS) {
        mastery.tracks[track].level = 50;
      }
      const prestige = makePrestigeState({
        prestigeLevel: 5,
        lastPrestigeAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
      });
      const result = canPrestige(mastery, prestige);
      expect(result.canPrestige).toBe(false);
    });
  });

  describe('executePrestige', () => {
    it('fails if canPrestige fails', () => {
      const mastery = makeMasteryState();
      const prestige = makePrestigeState();
      const result = executePrestige(mastery, prestige);
      expect(result.success).toBe(false);
    });

    it('resets tracks and increments prestige level', () => {
      const mastery = makeMasteryState();
      for (const track of MASTERY_TRACKS) {
        mastery.tracks[track].level = 50;
        mastery.tracks[track].totalXp = 10000;
      }
      const prestige = makePrestigeState();
      const result = executePrestige(mastery, prestige);
      expect(result.success).toBe(true);
      expect(result.prestigeState.prestigeLevel).toBe(1);
      expect(result.newState.tracks.DURATION.level).toBe(1);
      // executePrestige computes overallRank via calculateMasteryRank — prestige > 0 returns TRANSCENDENT
      expect(result.newState.overallRank).toBe('TRANSCENDENT');
      expect(result.newState.prestigeLevel).toBe(1);
    });
  });

  describe('getNightmareConfig', () => {
    it('returns unlocked config for prestige >= 3', () => {
      const prestige = makePrestigeState({ prestigeLevel: 3 });
      const config = getNightmareConfig(prestige);
      expect(config.unlocked).toBe(true);
    });

    it('returns locked config for prestige < 3', () => {
      const prestige = makePrestigeState({ prestigeLevel: 2 });
      const config = getNightmareConfig(prestige);
      expect(config.unlocked).toBe(false);
    });

    it('multipliers scale with prestige level', () => {
      const low = getNightmareConfig(makePrestigeState({ prestigeLevel: 1 }));
      const high = getNightmareConfig(makePrestigeState({ prestigeLevel: 5 }));
      expect(high.xpMultiplier).toBeGreaterThan(low.xpMultiplier);
    });
  });

  describe('migrateToPrestigeSystem', () => {
    it('starts at prestige 0 for low-level users', () => {
      const result = migrateToPrestigeSystem(10, 10);
      expect(result.prestigeState.prestigeLevel).toBe(0);
      expect(result.startingBonuses).toEqual([]);
    });

    it('starts at prestige 1 for level 50+ users', () => {
      const result = migrateToPrestigeSystem(50, 50);
      expect(result.prestigeState.prestigeLevel).toBe(1);
      expect(result.startingBonuses.length).toBeGreaterThan(0);
    });
  });
});
