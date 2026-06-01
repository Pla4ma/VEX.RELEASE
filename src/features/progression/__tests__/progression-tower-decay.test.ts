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

import { calculateTowerChurnRisk, applyTowerDecay, restoreTowerBlocks } from '../tower-decay';
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

describe('Tower Decay', () => {
  describe('calculateTowerChurnRisk', () => {
    it('returns NONE for < 3 days inactive', () => {
      const tower = makeTower();
      const result = calculateTowerChurnRisk(tower, 2);
      expect(result.riskLevel).toBe('NONE');
    });

    it('returns LOW for 3-4 days inactive', () => {
      const tower = makeTower();
      const result = calculateTowerChurnRisk(tower, 3);
      expect(result.riskLevel).toBe('LOW');
    });

    it('returns MEDIUM for 5-6 days inactive', () => {
      const tower = makeTower();
      const result = calculateTowerChurnRisk(tower, 6);
      expect(result.riskLevel).toBe('MEDIUM');
    });

    it('returns CRITICAL for 7+ days inactive', () => {
      const tower = makeTower({ totalBlocks: 100 });
      const result = calculateTowerChurnRisk(tower, 7);
      expect(result.riskLevel).toBe('CRITICAL');
    });
  });

  describe('applyTowerDecay', () => {
    it('no decay for < 7 days inactive', () => {
      const tower = makeTower({ totalBlocks: 50 });
      const result = applyTowerDecay(tower, 6);
      expect(result.blocksLost).toBe(0);
      expect(result.updatedTower.totalBlocks).toBe(50);
    });

    it('decays blocks after 7+ days inactive', () => {
      const tower = makeTower({ totalBlocks: 100 });
      const result = applyTowerDecay(tower, 10);
      expect(result.blocksLost).toBeGreaterThan(0);
      expect(result.updatedTower.totalBlocks).toBeLessThan(100);
      expect(result.canRestore).toBe(true);
      expect(result.restoreCost).toBeGreaterThan(0);
    });
  });

  describe('restoreTowerBlocks', () => {
    it('fails if not enough gems', () => {
      const tower = makeTower({ totalBlocks: 50 });
      const result = restoreTowerBlocks(tower, 10, 0);
      expect(result.success).toBe(false);
      expect(result.blocksRestored).toBe(0);
    });

    it('succeeds with enough gems', () => {
      const tower = makeTower({ totalBlocks: 50 });
      const cost = 10 * 25; // 250 gems for 10 blocks
      const result = restoreTowerBlocks(tower, 10, cost);
      expect(result.success).toBe(true);
      expect(result.blocksRestored).toBe(10);
    });
  });
});
