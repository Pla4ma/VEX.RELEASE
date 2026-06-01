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

import { validateLevelUp, validatePrestige } from '../utils/validation/level-validation';
import { validateXPTransaction } from '../utils/validation/xp-validation';
import { validateSourceSpecific } from '../utils/validation/source-validators';
import { validateXPBatch } from '../utils/validation/batch-validation';
import { MAX_XP_PER_SESSION, MAX_XP_PER_HOUR, MAX_STREAK_BONUS_MULTIPLIER, MAX_QUALITY_BONUS } from '../utils/validation/types';
import type { XPTransaction, ValidationResult } from '../utils/validation/types';

const TEST_USER_ID = '12345678-1234-1234-1234-123456789abc';

function makeTxn(overrides?: Partial<XPTransaction>): XPTransaction {
  return {
    id: '00000000-0000-0000-0000-000000000001', userId: TEST_USER_ID,
    amount: 100, source: 'SESSION_COMPLETE', timestamp: Date.now(), applied: false, ...overrides,
  };
}

describe('XP Validation', () => {
  const emptyHistory = {
    recentTransactions: [] as XPTransaction[],
    currentLevel: 1,
    currentXP: 0,
    sessionHistory: [] as { duration: number; xp: number; timestamp: number }[],
  };

  describe('validateXPTransaction', () => {
    it('validates a clean transaction', () => {
      const txn = makeTxn({ amount: 50 });
      const result = validateXPTransaction(txn, emptyHistory);
      expect(result.valid).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it('flags XP exceeding per-session max', () => {
      const txn = makeTxn({ amount: MAX_XP_PER_SESSION + 1 });
      const result = validateXPTransaction(txn, emptyHistory);
      expect(result.violations.some((v) => v.type === 'IMPOSSIBLE')).toBe(true);
    });

    it('flags duplicate transactions', () => {
      const existing = makeTxn({ sourceId: 'src-1', source: 'SESSION_COMPLETE' });
      const txn = makeTxn({ sourceId: 'src-1', source: 'SESSION_COMPLETE' });
      const result = validateXPTransaction(txn, { ...emptyHistory, recentTransactions: [existing] });
      expect(result.violations.some((v) => v.message.includes('Duplicate'))).toBe(true);
    });
  });

  describe('validateSourceSpecific', () => {
    it('warns on session XP without matching session', () => {
      const txn = makeTxn({ source: 'SESSION_COMPLETE' });
      const result: ValidationResult<XPTransaction> = { valid: true, violations: [], warnings: [], riskScore: 0 };
      validateSourceSpecific(txn, { sessionHistory: [] }, result);
      expect(result.warnings.some((w) => w.code === 'ORPHAN_SESSION_XP')).toBe(true);
    });

    it('flags streak bonus multiplier exceeding max', () => {
      const txn = makeTxn({ source: 'STREAK_BONUS', metadata: { multiplier: MAX_STREAK_BONUS_MULTIPLIER + 1 } });
      const result: ValidationResult<XPTransaction> = { valid: true, violations: [], warnings: [], riskScore: 0 };
      validateSourceSpecific(txn, { sessionHistory: [] }, result);
      expect(result.violations.some((v) => v.field === 'metadata.multiplier')).toBe(true);
    });

    it('flags quality bonus multiplier exceeding max', () => {
      const txn = makeTxn({ source: 'SESSION_QUALITY', metadata: { qualityMultiplier: MAX_QUALITY_BONUS + 1 } });
      const result: ValidationResult<XPTransaction> = { valid: true, violations: [], warnings: [], riskScore: 0 };
      validateSourceSpecific(txn, { sessionHistory: [] }, result);
      expect(result.violations.some((v) => v.field === 'metadata.qualityMultiplier')).toBe(true);
    });

    it('flags suspicious boss damage ratio', () => {
      const txn = makeTxn({ source: 'BOSS_DAMAGE', amount: 500, metadata: { damage: 100 } });
      const result: ValidationResult<XPTransaction> = { valid: true, violations: [], warnings: [], riskScore: 0 };
      validateSourceSpecific(txn, { sessionHistory: [] }, result);
      expect(result.violations.some((v) => v.type === 'SUSPICIOUS')).toBe(true);
    });
  });

  describe('validateLevelUp', () => {
    it('validates normal level up', () => {
      const result = validateLevelUp(1, 0, 150, [100, 125, 150]);
      expect(result.valid).toBe(true);
      expect(result.data?.newLevel).toBeGreaterThan(1);
    });

    it('flags negative current level', () => {
      const result = validateLevelUp(-1, 0, 100, [100]);
      expect(result.valid).toBe(false);
      expect(result.violations[0]?.severity).toBe('CRITICAL');
    });

    it('flags negative XP', () => {
      const result = validateLevelUp(1, -10, 100, [100]);
      expect(result.valid).toBe(false);
    });

    it('flags newXP less than currentXP', () => {
      const result = validateLevelUp(5, 500, 100, [100, 125, 150, 175, 200]);
      expect(result.violations.some((v) => v.message.includes('rollback'))).toBe(true);
    });

    it('caps at MAX_LEVEL 100', () => {
      const hugeCurve = Array(200).fill(1);
      const result = validateLevelUp(1, 0, 200, hugeCurve);
      expect(result.data?.newLevel).toBeLessThanOrEqual(100);
    });
  });

  describe('validatePrestige', () => {
    it('allows prestige at level 100', () => {
      const result = validatePrestige(100, 0);
      expect(result.data?.canPrestige).toBe(true);
    });

    it('blocks prestige below min level', () => {
      const result = validatePrestige(50, 0);
      expect(result.data?.canPrestige).toBe(false);
    });

    it('blocks prestige at max prestige', () => {
      const result = validatePrestige(100, 10);
      expect(result.data?.canPrestige).toBe(false);
    });
  });

  describe('validateXPBatch', () => {
    it('accepts clean batch', () => {
      const txns = [makeTxn({ amount: 50 }), makeTxn({ amount: 30 })];
      const result = validateXPBatch(txns, emptyHistory);
      expect(result.valid).toBe(true);
      expect(result.data?.valid.length).toBe(2);
      expect(result.data?.rejected.length).toBe(0);
    });

    it('rejects transactions with high risk', () => {
      const txns = [makeTxn({ amount: MAX_XP_PER_SESSION + 1 })];
      const result = validateXPBatch(txns, emptyHistory);
      expect(result.data?.rejected.length).toBe(1);
    });

    it('flags batch exceeding hourly limit', () => {
      const txns = Array.from({ length: 5 }, (_, i) =>
        makeTxn({ amount: 9000, id: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`, timestamp: Date.now() }),
      );
      const result = validateXPBatch(txns, emptyHistory);
      expect(result.violations.some((v) => v.type === 'RATE_LIMIT')).toBe(true);
    });
  });
});
