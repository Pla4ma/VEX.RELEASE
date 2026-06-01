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

import { addTowerBlock, getTowerDisplay, getTowerHeightComparison } from '../focus-tower';
import type { FocusTower } from '../tower-constants';

const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

function makeTower(overrides?: Partial<FocusTower>): FocusTower {
  return {
    userId: TEST_USER_ID, currentTier: 1, totalBlocks: 0, blocksThisTier: 0,
    maxBlocksPerTier: 10, totalHeight: 0, towerName: 'Focus Tower', lastBlockEarnedAt: null,
    totalBonuses: {
      progressAcceleration: 0, momentumResistanceHours: 0, energyRegenBonus: 0,
      focusResilienceBonus: 0, focusDurationBonus: 0, xpBoostPercent: 0,
      streakResistanceHours: 0, bossDamageBonus: 0,
    },
    achievementsUnlocked: [], ...overrides,
  };
}

describe('Focus Tower', () => {
  describe('addTowerBlock', () => {
    it('adds a block and increments total', () => {
      const tower = makeTower();
      const result = addTowerBlock(tower, 'session-id', 80);
      expect(result.updatedTower.totalBlocks).toBe(1);
      expect(result.newBlock.tier).toBe(1);
      expect(result.tierUp).toBe(false);
    });

    it('triggers tier up at max blocks per tier', () => {
      const tower = makeTower({ blocksThisTier: 9, totalBlocks: 9 });
      const result = addTowerBlock(tower, 'session-id', 80);
      expect(result.tierUp).toBe(true);
      expect(result.updatedTower.currentTier).toBe(2);
    });

    it('marks milestone block', () => {
      const tower = makeTower({ totalBlocks: 9 });
      const result = addTowerBlock(tower, 'session-id', 80);
      expect(result.milestoneReached).toBe(10);
    });

    it('high quality gives 1.5x bonus value', () => {
      const tower = makeTower();
      const normal = addTowerBlock(tower, 'session-id', 50);
      const highQuality = addTowerBlock(tower, 'session-id', 95);
      expect(highQuality.newBlock.bonusValue).toBeGreaterThan(normal.newBlock.bonusValue);
    });
  });

  describe('getTowerDisplay', () => {
    it('returns correct tier name', () => {
      const tower = makeTower({ currentTier: 1 });
      const display = getTowerDisplay(tower);
      expect(display.tierName).toBe('Foundation');
    });

    it('returns height string', () => {
      const tower = makeTower({ totalHeight: 42 });
      const display = getTowerDisplay(tower);
      expect(display.height).toBe('42m');
    });

    it('returns default bonus text when no bonuses', () => {
      const tower = makeTower();
      const display = getTowerDisplay(tower);
      expect(display.totalBonusesText).toBe('Build your tower for bonuses!');
    });

    it('returns next milestone', () => {
      const tower = makeTower({ totalBlocks: 5 });
      const display = getTowerDisplay(tower);
      expect(display.nextMilestone).toBe(10);
    });
  });

  describe('getTowerHeightComparison', () => {
    it('returns Foundation for empty tower', () => {
      const tower = makeTower({ totalBlocks: 0 });
      expect(getTowerHeightComparison(tower)).toContain('Foundation');
    });

    it('returns House for 10 blocks', () => {
      const tower = makeTower({ totalBlocks: 10 });
      expect(getTowerHeightComparison(tower)).toContain('House');
    });

    it('returns Maximum Height for 1000+ blocks', () => {
      const tower = makeTower({ totalBlocks: 1000 });
      expect(getTowerHeightComparison(tower)).toContain('Maximum Height');
    });
  });
});
