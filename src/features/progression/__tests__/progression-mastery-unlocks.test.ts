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
import { createInitialMasteryState } from '../mastery-service';
import { checkUnlocks, MASTERY_UNLOCKS } from '../mastery-unlocks';

const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

describe('Mastery Unlocks', () => {
  it('returns empty for initial state', () => {
    const state = createInitialMasteryState(TEST_USER_ID);
    const result = checkUnlocks(state, []);
    expect(result.newlyUnlocked).toEqual([]);
    expect(result.allUnlocks).toEqual([]);
  });

  it('unlocks features when track level meets requirement', () => {
    const state = createInitialMasteryState(TEST_USER_ID);
    state.tracks.DURATION.level = 5;
    const result = checkUnlocks(state, []);
    const sprintUnlock = result.newlyUnlocked.find((u) => u.id === 'mode_sprint');
    expect(sprintUnlock).toBeDefined();
    expect(sprintUnlock?.unlocked).toBe(true);
  });

  it('does not re-unlock already unlocked features', () => {
    const state = createInitialMasteryState(TEST_USER_ID);
    state.tracks.DURATION.level = 5;
    const result = checkUnlocks(state, ['mode_sprint']);
    expect(result.newlyUnlocked.find((u) => u.id === 'mode_sprint')).toBeUndefined();
  });

  it('MASTERY_UNLOCKS has valid entries', () => {
    expect(MASTERY_UNLOCKS.length).toBeGreaterThan(10);
    for (const unlock of MASTERY_UNLOCKS) {
      expect(MASTERY_TRACKS).toContain(unlock.requiredTrack);
      expect(unlock.requiredLevel).toBeGreaterThan(0);
    }
  });
});
