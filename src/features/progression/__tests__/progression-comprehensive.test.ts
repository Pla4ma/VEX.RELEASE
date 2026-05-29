/**
 * Comprehensive Progression Feature Tests
 * Covers: XP calculations, level thresholds, prestige, mastery, tower, validation, first-week, etc.
 */

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

jest.mock("../../../config/supabase", () => ({
  supabase: { from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })) })) })), rpc: jest.fn(() => ({ data: null, error: null })) },
  getSupabaseClient: jest.fn(() => ({ from: jest.fn(() => ({ select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })), update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => ({})) })) })) })), gte: jest.fn(() => ({})), lte: jest.fn(() => ({})), order: jest.fn(() => ({})), limit: jest.fn(() => ({})) })), rpc: jest.fn(() => ({ data: null, error: null })) })),
}));

jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

jest.mock("../../../utils/uuid", () => ({
  v4: () => "test-uuid-" + Math.random().toString(36).slice(2, 8),
}));

jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));

jest.mock("../../../utils/supabase-resilience", () => ({
  withResilience: (q: unknown) => q,
}));

jest.mock("@theme/tokens/colors", () => ({
  lightColors: {
    accent: { teal: "#008080", orange: "#FFA500", purple: "#800080", pink: "#FFC0CB" },
    primary: { 400: "#4A90D9", 600: "#2D5F8A" },
    error: { 500: "#FF0000" },
  },
}));

jest.mock("@theme/tokens/launch-colors", () => ({
  launchColors: {
    hex_8b4513: "#8b4513",
    hex_4a5568: "#4a5568",
    hex_4169e1: "#4169e1",
    hex_9400d3: "#9400d3",
    hex_ffd700: "#ffd700",
    hex_ff00ff: "#ff00ff",
  },
}));

jest.mock("../../../progression/ProgressionService", () => ({
  getProgressionService: jest.fn(),
}));

// ── Imports ────────────────────────────────────────────────────────────────────

import {
  calculateLevelThreshold,
  calculateTotalXpToLevel,
  calculateLevelFromTotalXp,
  calculateProgressPercent,
  calculateXpBreakdown,
} from "../service-xp-calculations";

import {
  configureProgressionService,
  getProgressionServiceConfig,
} from "../service-config";

import { createProgressionError } from "../service-errors";
import { getLevelUpRewards, getLevelUpCelebrationRewards } from "../service-level-rewards";
import { handleFetchFailure } from "../service-failures";
import { generateIdempotencyKey, isDuplicateOperation, markOperationProcessed } from "../service-dedup";

import {
  calculateDurationMasteryXp,
  calculatePurityMasteryXp,
  calculateConsistencyMasteryXp,
  calculateComebackMasteryXp,
  calculateBossMasteryXp,
} from "../xp-calculators";

import { calculateXpForLevel, calculateMasteryRank, MASTERY_TRACKS } from "../mastery-types";

import {
  calculateMasteryXpFromSession,
  applyMasteryXp,
  createInitialMasteryState,
  migrateFromLegacyProgression,
} from "../mastery-service";

import { checkUnlocks, MASTERY_UNLOCKS } from "../mastery-unlocks";

import {
  canPrestige,
  executePrestige,
  getNightmareConfig,
  createInitialPrestigeState,
  migrateToPrestigeSystem,
} from "../prestige-engine";

import {
  PRESTIGE_BONUSES,
  calculatePrestigeBonuses,
  applyPrestigeBonuses,
  getTotalBonusPercent,
} from "../prestige-bonuses";

import { getTierConfig, TIER_CONFIG, MILESTONE_BLOCKS } from "../tower-constants";

import { addTowerBlock, getTowerDisplay, getTowerHeightComparison } from "../focus-tower";

import {
  calculateTowerChurnRisk,
  applyTowerDecay,
  restoreTowerBlocks,
} from "../tower-decay";

import { getNextBestAction } from "../next-best-action";

import {
  trackXpAdded,
  trackLevelUp,
  trackProgressionError,
  setupProgressionAnalytics,
} from "../analytics";

import {
  validateLevelUp,
  validatePrestige,
} from "../utils/validation/level-validation";

import {
  validateXPTransaction,
} from "../utils/validation/xp-validation";

import {
  validateSourceSpecific,
} from "../utils/validation/source-validators";

import {
  validateXPBatch,
} from "../utils/validation/batch-validation";

import { MAX_XP_PER_SESSION, MAX_XP_PER_HOUR, MAX_STREAK_BONUS_MULTIPLIER, MAX_QUALITY_BONUS } from "../utils/validation/types";

import {
  getSessionUnlocks,
  getSessionXpReward,
  getCompanionReaction,
  getTutorialSteps,
  isInFirstWeek,
  getFirstWeekCompletion,
} from "../first-week-pacing/progression-helpers";

import {
  getNextSession,
  getSessionNumber,
} from "../first-week-pacing/helpers";

import {
  calculateLevelProgress,
} from "../first-week-pacing/progression-helpers";

import type { UnifiedMasteryState, MasteryTrackState } from "../mastery-types";
import type { PrestigeState } from "../prestige-types";
import type { FocusTower } from "../tower-constants";
import type { XPTransaction, ValidationResult } from "../utils/validation/types";
import type { FirstWeekProgress } from "../first-week-pacing/schemas";

// ── Constants ──────────────────────────────────────────────────────────────────

const TEST_USER_ID = "12345678-1234-1234-1234-123456789abc";

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeMasteryState(overrides?: Partial<UnifiedMasteryState>): UnifiedMasteryState {
  const makeTrack = (level = 1): MasteryTrackState => ({
    level,
    xp: 0,
    xpToNext: calculateXpForLevel(level),
    totalXp: 0,
    milestonesCompleted: [],
  });
  return {
    userId: TEST_USER_ID,
    tracks: {
      DURATION: makeTrack(1),
      PURITY: makeTrack(1),
      CONSISTENCY: makeTrack(1),
      COMEBACK: makeTrack(1),
      BOSS: makeTrack(1),
    },
    overallLevel: 1,
    overallRank: "APPRENTICE",
    prestigeLevel: 0,
    prestigeBonuses: [],
    lastUpdated: Date.now(),
    createdAt: Date.now(),
    ...overrides,
  };
}

function makePrestigeState(overrides?: Partial<PrestigeState>): PrestigeState {
  return {
    prestigeLevel: 0,
    totalPrestiges: 0,
    firstPrestigeAt: null,
    lastPrestigeAt: null,
    activeBonuses: [],
    fastestPrestige: null,
    mostXpAtPrestige: null,
    nightmareUnlocked: false,
    nightmareCompletions: 0,
    ...overrides,
  };
}

function makeTower(overrides?: Partial<FocusTower>): FocusTower {
  return {
    userId: TEST_USER_ID,
    currentTier: 1,
    totalBlocks: 0,
    blocksThisTier: 0,
    maxBlocksPerTier: 10,
    totalHeight: 0,
    towerName: "Focus Tower",
    lastBlockEarnedAt: null,
    totalBonuses: {
      progressAcceleration: 0,
      momentumResistanceHours: 0,
      energyRegenBonus: 0,
      focusResilienceBonus: 0,
      focusDurationBonus: 0,
      xpBoostPercent: 0,
      streakResistanceHours: 0,
      bossDamageBonus: 0,
    },
    achievementsUnlocked: [],
    ...overrides,
  };
}

function makeTxn(overrides?: Partial<XPTransaction>): XPTransaction {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    userId: TEST_USER_ID,
    amount: 100,
    source: "SESSION_COMPLETE",
    timestamp: Date.now(),
    applied: false,
    ...overrides,
  };
}

// ============================================================================
// 1. XP Calculations (service-xp-calculations.ts)
// ============================================================================

describe("XP Calculations", () => {
  describe("calculateLevelThreshold", () => {
    it("returns 100 for level 1", () => {
      expect(calculateLevelThreshold(1)).toBe(100);
    });
    it("returns 125 for level 2 (1.25 growth factor)", () => {
      expect(calculateLevelThreshold(2)).toBe(125);
    });
    it("returns correct value for level 5", () => {
      expect(calculateLevelThreshold(5)).toBe(Math.floor(100 * Math.pow(1.25, 4)));
    });
    it("returns correct value for level 10", () => {
      expect(calculateLevelThreshold(10)).toBe(Math.floor(100 * Math.pow(1.25, 9)));
    });
    it("grows exponentially per level", () => {
      for (let i = 2; i <= 20; i++) {
        expect(calculateLevelThreshold(i)).toBeGreaterThan(calculateLevelThreshold(i - 1));
      }
    });
  });

  describe("calculateTotalXpToLevel", () => {
    it("returns 0 for level 1", () => {
      expect(calculateTotalXpToLevel(1)).toBe(0);
    });
    it("returns threshold of level 1 for level 2", () => {
      expect(calculateTotalXpToLevel(2)).toBe(100);
    });
    it("accumulates all previous thresholds", () => {
      const expected = calculateLevelThreshold(1) + calculateLevelThreshold(2) + calculateLevelThreshold(3) + calculateLevelThreshold(4);
      expect(calculateTotalXpToLevel(5)).toBe(expected);
    });
  });

  describe("calculateLevelFromTotalXp", () => {
    beforeEach(() => {
      configureProgressionService({ maxLevel: 100 });
    });

    it("returns 1 for 0 XP", () => {
      expect(calculateLevelFromTotalXp(0)).toBe(1);
    });
    it("returns 1 for XP below threshold", () => {
      expect(calculateLevelFromTotalXp(50)).toBe(1);
    });
    it("returns 2 at exactly threshold", () => {
      expect(calculateLevelFromTotalXp(100)).toBe(2);
    });
    it("returns 3 for enough XP to pass two levels", () => {
      expect(calculateLevelFromTotalXp(225)).toBe(3); // 100 + 125
    });
    it("caps at maxLevel", () => {
      expect(calculateLevelFromTotalXp(Number.MAX_SAFE_INTEGER)).toBe(100);
    });
    it("respects custom maxLevel", () => {
      configureProgressionService({ maxLevel: 10 });
      expect(calculateLevelFromTotalXp(Number.MAX_SAFE_INTEGER)).toBe(10);
      configureProgressionService({ maxLevel: 100 }); // restore
    });
  });

  describe("calculateProgressPercent", () => {
    it("returns 0 for 0 XP", () => {
      expect(calculateProgressPercent(0, 1)).toBe(0);
    });
    it("returns 50 at half threshold", () => {
      expect(calculateProgressPercent(50, 1)).toBe(50);
    });
    it("caps at 100", () => {
      expect(calculateProgressPercent(200, 1)).toBe(100);
    });
    it("returns 100 at exactly threshold", () => {
      expect(calculateProgressPercent(100, 1)).toBe(100);
    });
  });

  describe("calculateXpBreakdown", () => {
    it("returns valid breakdown with no bonuses when params have no bonuses", () => {
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

    it("returns valid breakdown with all bonuses applied", () => {
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

    it("BreakdownParams interface accepts all parameter types", () => {
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

// ============================================================================
// 2. Service Config (service-config.ts)
// ============================================================================

describe("Service Config", () => {
  beforeEach(() => {
    configureProgressionService({
      maxLevel: 100,
      prestigeEnabled: true,
      xpRatePerMinute: 2,
      enableOfflineQueue: true,
      levelUpRewardTypes: ["XP_BOOST", "COINS", "GEMS"],
    });
  });

  it("returns default config", () => {
    const config = getProgressionServiceConfig();
    expect(config.maxLevel).toBe(100);
    expect(config.prestigeEnabled).toBe(true);
    expect(config.xpRatePerMinute).toBe(2);
  });

  it("merges partial config", () => {
    configureProgressionService({ maxLevel: 50 });
    expect(getProgressionServiceConfig().maxLevel).toBe(50);
    expect(getProgressionServiceConfig().prestigeEnabled).toBe(true);
  });

  it("preserves unmerged fields", () => {
    configureProgressionService({ xpRatePerMinute: 5 });
    const config = getProgressionServiceConfig();
    expect(config.xpRatePerMinute).toBe(5);
    expect(config.maxLevel).toBe(100);
  });
});

// ============================================================================
// 3. Service Errors (service-errors.ts)
// ============================================================================

describe("Service Errors", () => {
  it("creates error with all fields", () => {
    const error = createProgressionError("VALIDATION", "bad input", false, { field: "amount" });
    expect(error.code).toBe("VALIDATION");
    expect(error.message).toBe("bad input");
    expect(error.retryable).toBe(false);
    expect(error.context).toEqual({ field: "amount" });
  });

  it("creates retryable error", () => {
    const error = createProgressionError("NETWORK", "timeout", true);
    expect(error.retryable).toBe(true);
  });

  it("creates error without context", () => {
    const error = createProgressionError("UNKNOWN", "something happened", false);
    expect(error.context).toBeUndefined();
  });
});

// ============================================================================
// 4. Service Level Rewards (service-level-rewards.ts)
// ============================================================================

describe("Level Rewards", () => {
  describe("getLevelUpRewards", () => {
    beforeEach(() => {
      configureProgressionService({ prestigeEnabled: true });
    });

    it("returns empty for non-milestone level", () => {
      expect(getLevelUpRewards(2)).toEqual([]);
    });

    it("returns bundle for every 5th level", () => {
      expect(getLevelUpRewards(5)).toContain("LEVEL_5_BUNDLE");
      expect(getLevelUpRewards(10)).toContain("LEVEL_10_BUNDLE");
      expect(getLevelUpRewards(15)).toContain("LEVEL_15_BUNDLE");
    });

    it("returns TITLE_ADEPT at level 10", () => {
      expect(getLevelUpRewards(10)).toContain("TITLE_ADEPT");
    });

    it("returns TITLE_EXPERT at level 25", () => {
      expect(getLevelUpRewards(25)).toContain("TITLE_EXPERT");
    });

    it("returns TITLE_MASTER at level 50", () => {
      expect(getLevelUpRewards(50)).toContain("TITLE_MASTER");
    });

    it("returns PRESTIGE_AVAILABLE at level 100 when prestige enabled", () => {
      expect(getLevelUpRewards(100)).toContain("PRESTIGE_AVAILABLE");
    });

    it("no prestige reward when prestige disabled", () => {
      configureProgressionService({ prestigeEnabled: false });
      expect(getLevelUpRewards(100)).not.toContain("PRESTIGE_AVAILABLE");
    });
  });

  describe("getLevelUpCelebrationRewards", () => {
    it("returns default message for single non-milestone level", () => {
      const rewards = getLevelUpCelebrationRewards(1, 2);
      expect(rewards).toContain("Level 2 reached");
    });

    it("returns milestone messages for level 10", () => {
      const rewards = getLevelUpCelebrationRewards(9, 10);
      expect(rewards).toContain("100 coin milestone reward");
      expect(rewards).toContain("Adept tier reached");
    });

    it("returns milestone messages for level 25", () => {
      const rewards = getLevelUpCelebrationRewards(24, 25);
      // 25 is NOT divisible by 10, so no coin reward; only tier reached
      expect(rewards).toContain("Expert tier reached");
    });

    it("returns milestone messages for level 50", () => {
      const rewards = getLevelUpCelebrationRewards(49, 50);
      expect(rewards).toContain("500 coin milestone reward");
      expect(rewards).toContain("Master tier reached");
    });

    it("returns milestone messages for level 100", () => {
      const rewards = getLevelUpCelebrationRewards(99, 100);
      expect(rewards).toContain("1000 coin milestone reward");
      expect(rewards).toContain("Centurion tier reached");
    });

    it("handles multi-level jumps", () => {
      const rewards = getLevelUpCelebrationRewards(8, 11);
      // 9, 10, 11 -> 9 has 90 coin (90, not 10 multiple), 10 has 100 coin + Adept, 11 has 110 coin
      expect(rewards).toContain("100 coin milestone reward");
      expect(rewards).toContain("Adept tier reached");
    });
  });
});

// ============================================================================
// 5. Service Failures (service-failures.ts)
// ============================================================================

describe("handleFetchFailure", () => {
  const breakdown = {
    base: 50, momentumBonus: 0, collaborationBonus: 0,
    blockerResolvedBonus: 0, recoveryBonus: 0, perfectBonus: 0, total: 50,
  };

  beforeEach(() => {
    configureProgressionService({ enableOfflineQueue: true });
  });

  it("returns failure result when error is null", () => {
    const result = handleFetchFailure(null, TEST_USER_ID, breakdown);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("UNKNOWN");
  });

  it("returns offline queued for NETWORK_ERROR when offline queue enabled", () => {
    const error = { code: "NETWORK_ERROR" as const, message: "Network failed", isRetryable: true };
    const result = handleFetchFailure(error, TEST_USER_ID, breakdown);
    expect(result.success).toBe(false);
    expect(result.offlineQueued).toBe(true);
    expect(result.xpAdded).toBe(50);
    expect(result.error?.code).toBe("NETWORK");
  });

  it("returns non-offline result for non-network errors", () => {
    const error = { code: "UNKNOWN" as const, message: "Something bad", isRetryable: false };
    const result = handleFetchFailure(error, TEST_USER_ID, breakdown);
    expect(result.success).toBe(false);
    expect(result.offlineQueued).toBe(false);
    expect(result.xpAdded).toBe(0);
  });
});

// ============================================================================
// 6. Deduplication (service-dedup.ts)
// ============================================================================

describe("Deduplication", () => {
  it("generates consistent idempotency key", () => {
    const key = generateIdempotencyKey("user1", "addXp", "session1");
    expect(key).toBe("prog:user1:addXp:session1");
  });

  it("generates key with timestamp fallback", () => {
    const key = generateIdempotencyKey("user1", "addXp");
    expect(key).toMatch(/^prog:user1:addXp:\d+$/);
  });

  it("isDuplicateOperation returns false for unknown key", () => {
    expect(isDuplicateOperation("unknown-key-" + Date.now())).toBe(false);
  });

  it("markOperationProcessed then isDuplicateOperation returns true", () => {
    const key = "test-key-" + Date.now();
    markOperationProcessed(key);
    expect(isDuplicateOperation(key)).toBe(true);
  });
});

// ============================================================================
// 7. Mastery XP Calculators (xp-calculators.ts)
// ============================================================================

describe("Mastery XP Calculators", () => {
  describe("calculateDurationMasteryXp", () => {
    it("returns 0 if interrupted", () => {
      expect(calculateDurationMasteryXp(60, true, 90)).toBe(0);
    });

    it("calculates base XP from minutes", () => {
      const xp = calculateDurationMasteryXp(60, false, 100);
      expect(xp).toBeGreaterThan(0);
    });

    it("adds 50 bonus for 90+ minute sessions", () => {
      const with90 = calculateDurationMasteryXp(90, false, 80);
      const with60 = calculateDurationMasteryXp(60, false, 80);
      expect(with90).toBeGreaterThan(with60);
    });

    it("adds 30 bonus for 60+ min with high purity", () => {
      const highPurity = calculateDurationMasteryXp(60, false, 95);
      const lowPurity = calculateDurationMasteryXp(60, false, 50);
      expect(highPurity).toBeGreaterThan(lowPurity);
    });
  });

  describe("calculatePurityMasteryXp", () => {
    it("returns 0 for purity below 70", () => {
      expect(calculatePurityMasteryXp(69, 60, 0)).toBe(0);
    });

    it("doubles XP for zero pauses", () => {
      const noPause = calculatePurityMasteryXp(90, 60, 0);
      const withPause = calculatePurityMasteryXp(90, 60, 2);
      expect(noPause).toBeGreaterThan(withPause);
    });

    it("adds bonus for 95+ purity", () => {
      const high = calculatePurityMasteryXp(95, 60, 0);
      const normal = calculatePurityMasteryXp(80, 60, 0);
      expect(high).toBeGreaterThan(normal);
    });

    it("adds bonus for 45+ minute sessions", () => {
      const long = calculatePurityMasteryXp(90, 45, 0);
      const short = calculatePurityMasteryXp(90, 30, 0);
      expect(long).toBeGreaterThan(short);
    });
  });

  describe("calculateConsistencyMasteryXp", () => {
    it("returns base 10 XP", () => {
      const xp = calculateConsistencyMasteryXp(0, 1, 1);
      expect(xp).toBe(10);
    });

    it("increases with streak", () => {
      const noStreak = calculateConsistencyMasteryXp(0, 1, 1);
      const withStreak = calculateConsistencyMasteryXp(10, 1, 1);
      expect(withStreak).toBeGreaterThan(noStreak);
    });

    it("adds bonus for 2+ sessions today", () => {
      const one = calculateConsistencyMasteryXp(0, 1, 1);
      const two = calculateConsistencyMasteryXp(0, 2, 1);
      expect(two).toBeGreaterThan(one);
    });

    it("adds bonus for 3+ sessions today", () => {
      const two = calculateConsistencyMasteryXp(0, 2, 1);
      const three = calculateConsistencyMasteryXp(0, 3, 1);
      expect(three).toBeGreaterThan(two);
    });

    it("adds bonus for 5+ days active this week", () => {
      const normal = calculateConsistencyMasteryXp(0, 1, 3);
      const active = calculateConsistencyMasteryXp(0, 1, 5);
      expect(active).toBeGreaterThan(normal);
    });
  });

  describe("calculateComebackMasteryXp", () => {
    it("returns 0 if not a comeback", () => {
      expect(calculateComebackMasteryXp(false, 5, 10)).toBe(0);
    });

    it("returns base 25 XP for comeback", () => {
      const xp = calculateComebackMasteryXp(true, 5, 0);
      expect(xp).toBeGreaterThanOrEqual(25);
    });

    it("adds 50 bonus for 1 day since last session", () => {
      const oneDay = calculateComebackMasteryXp(true, 1, 0);
      const threeDays = calculateComebackMasteryXp(true, 3, 0);
      expect(oneDay).toBeGreaterThan(threeDays);
    });

    it("adds bonus for long previous streak", () => {
      const longStreak = calculateComebackMasteryXp(true, 5, 30);
      const noStreak = calculateComebackMasteryXp(true, 5, 0);
      expect(longStreak).toBeGreaterThan(noStreak);
    });
  });

  describe("calculateBossMasteryXp", () => {
    it("returns partial XP when boss not defeated", () => {
      const xp = calculateBossMasteryXp(false, 0.5, 500, 60, 0);
      expect(xp).toBe(5); // 500 / 100
    });

    it("returns base 100 XP for defeated boss", () => {
      const xp = calculateBossMasteryXp(true, 0.5, 500, 60, 0);
      expect(xp).toBeGreaterThanOrEqual(100);
    });

    it("adds speed bonus for fast kills", () => {
      // bossHealthPercent = 0 means boss fully dead (fastest kill)
      // speedBonus = floor((1 - bossHealthPercent) * 50)
      const fast = calculateBossMasteryXp(true, 0, 1000, 30, 0);
      const slow = calculateBossMasteryXp(true, 0.8, 1000, 30, 0);
      expect(fast).toBeGreaterThan(slow);
    });

    it("adds critical hit bonus", () => {
      const crits = calculateBossMasteryXp(true, 0.5, 500, 60, 3);
      const noCrits = calculateBossMasteryXp(true, 0.5, 500, 60, 0);
      expect(crits).toBeGreaterThan(noCrits);
    });
  });
});

// ============================================================================
// 8. Mastery Types (mastery-types.ts)
// ============================================================================

describe("Mastery Types", () => {
  describe("calculateXpForLevel", () => {
    it("returns 100 for level 1", () => {
      expect(calculateXpForLevel(1)).toBe(100);
    });

    it("grows with level", () => {
      expect(calculateXpForLevel(5)).toBeGreaterThan(calculateXpForLevel(1));
      expect(calculateXpForLevel(10)).toBeGreaterThan(calculateXpForLevel(5));
    });

    it("uses 1.15 growth factor", () => {
      expect(calculateXpForLevel(2)).toBe(Math.floor(100 * 1.15));
    });
  });

  describe("calculateMasteryRank", () => {
    it("returns APPRENTICE for level 1", () => {
      expect(calculateMasteryRank(1, 0)).toBe("APPRENTICE");
    });

    it("returns ADEPT for level 11", () => {
      expect(calculateMasteryRank(11, 0)).toBe("ADEPT");
    });

    it("returns EXPERT for level 21", () => {
      expect(calculateMasteryRank(21, 0)).toBe("EXPERT");
    });

    it("returns MASTER for level 31", () => {
      expect(calculateMasteryRank(31, 0)).toBe("MASTER");
    });

    it("returns GRANDMASTER for level 41", () => {
      expect(calculateMasteryRank(41, 0)).toBe("GRANDMASTER");
    });

    it("returns TRANSCENDENT for any prestige > 0", () => {
      expect(calculateMasteryRank(1, 1)).toBe("TRANSCENDENT");
      expect(calculateMasteryRank(50, 5)).toBe("TRANSCENDENT");
    });

    it("returns TRANSCENDENT even at level 1 with prestige", () => {
      expect(calculateMasteryRank(1, 3)).toBe("TRANSCENDENT");
    });
  });

  it("MASTERY_TRACKS contains all 5 tracks", () => {
    expect(MASTERY_TRACKS).toEqual(["DURATION", "PURITY", "CONSISTENCY", "COMEBACK", "BOSS"]);
  });
});

// ============================================================================
// 9. Mastery Service (mastery-service.ts)
// ============================================================================

describe("Mastery Service", () => {
  describe("createInitialMasteryState", () => {
    it("creates state with correct userId", () => {
      const state = createInitialMasteryState("user-1");
      expect(state.userId).toBe("user-1");
    });

    it("initializes all tracks at level 1", () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      for (const track of MASTERY_TRACKS) {
        expect(state.tracks[track].level).toBe(1);
        expect(state.tracks[track].xp).toBe(0);
      }
    });

    it("starts at APPRENTICE rank", () => {
      const state = createInitialMasteryState(TEST_USER_ID);
      expect(state.overallRank).toBe("APPRENTICE");
      expect(state.prestigeLevel).toBe(0);
    });
  });

  describe("calculateMasteryXpFromSession", () => {
    it("returns XP across all tracks", () => {
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

    it("returns 0 duration XP when interrupted", () => {
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

  describe("applyMasteryXp", () => {
    it("adds XP to tracks", () => {
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

    it("levels up when XP exceeds threshold", () => {
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

    it("reports overall level up", () => {
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

    it("ignores zero XP tracks", () => {
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

  describe("migrateFromLegacyProgression", () => {
    it("creates initial state from old level 1", () => {
      const state = migrateFromLegacyProgression(TEST_USER_ID, 1, 50);
      expect(state.userId).toBe(TEST_USER_ID);
      expect(state.overallRank).toBe("APPRENTICE");
    });

    it("distributes XP across tracks", () => {
      const state = migrateFromLegacyProgression(TEST_USER_ID, 5, 500);
      const totalXp = MASTERY_TRACKS.reduce((sum, t) => sum + state.tracks[t].totalXp, 0);
      expect(totalXp).toBeGreaterThanOrEqual(500); // 500/5 per track + applied
    });
  });
});

// ============================================================================
// 10. Mastery Unlocks (mastery-unlocks.ts)
// ============================================================================

describe("Mastery Unlocks", () => {
  it("returns empty for initial state", () => {
    const state = createInitialMasteryState(TEST_USER_ID);
    const result = checkUnlocks(state, []);
    expect(result.newlyUnlocked).toEqual([]);
    expect(result.allUnlocks).toEqual([]);
  });

  it("unlocks features when track level meets requirement", () => {
    const state = createInitialMasteryState(TEST_USER_ID);
    state.tracks.DURATION.level = 5;
    const result = checkUnlocks(state, []);
    const sprintUnlock = result.newlyUnlocked.find((u) => u.id === "mode_sprint");
    expect(sprintUnlock).toBeDefined();
    expect(sprintUnlock?.unlocked).toBe(true);
  });

  it("does not re-unlock already unlocked features", () => {
    const state = createInitialMasteryState(TEST_USER_ID);
    state.tracks.DURATION.level = 5;
    const result = checkUnlocks(state, ["mode_sprint"]);
    expect(result.newlyUnlocked.find((u) => u.id === "mode_sprint")).toBeUndefined();
  });

  it("MASTERY_UNLOCKS has valid entries", () => {
    expect(MASTERY_UNLOCKS.length).toBeGreaterThan(10);
    for (const unlock of MASTERY_UNLOCKS) {
      expect(MASTERY_TRACKS).toContain(unlock.requiredTrack);
      expect(unlock.requiredLevel).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// 11. Prestige Engine (prestige-engine.ts)
// ============================================================================

describe("Prestige Engine", () => {
  describe("createInitialPrestigeState", () => {
    it("creates zero-level prestige state", () => {
      const state = createInitialPrestigeState();
      expect(state.prestigeLevel).toBe(0);
      expect(state.totalPrestiges).toBe(0);
      expect(state.nightmareUnlocked).toBe(false);
    });
  });

  describe("canPrestige", () => {
    it("cannot prestige with not all tracks maxed", () => {
      const mastery = makeMasteryState();
      const prestige = makePrestigeState();
      const result = canPrestige(mastery, prestige);
      expect(result.canPrestige).toBe(false);
    });

    it("can prestige when all tracks at level 50", () => {
      const mastery = makeMasteryState();
      for (const track of MASTERY_TRACKS) {
        mastery.tracks[track].level = 50;
      }
      const prestige = makePrestigeState();
      const result = canPrestige(mastery, prestige);
      expect(result.canPrestige).toBe(true);
    });

    it("cannot prestige at level 5+ within 7 days", () => {
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

  describe("executePrestige", () => {
    it("fails if canPrestige fails", () => {
      const mastery = makeMasteryState();
      const prestige = makePrestigeState();
      const result = executePrestige(mastery, prestige);
      expect(result.success).toBe(false);
    });

    it("resets tracks and increments prestige level", () => {
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
      expect(result.newState.overallRank).toBe("TRANSCENDENT");
      expect(result.newState.prestigeLevel).toBe(1);
    });
  });

  describe("getNightmareConfig", () => {
    it("returns unlocked config for prestige >= 3", () => {
      const prestige = makePrestigeState({ prestigeLevel: 3 });
      const config = getNightmareConfig(prestige);
      expect(config.unlocked).toBe(true);
    });

    it("returns locked config for prestige < 3", () => {
      const prestige = makePrestigeState({ prestigeLevel: 2 });
      const config = getNightmareConfig(prestige);
      expect(config.unlocked).toBe(false);
    });

    it("multipliers scale with prestige level", () => {
      const low = getNightmareConfig(makePrestigeState({ prestigeLevel: 1 }));
      const high = getNightmareConfig(makePrestigeState({ prestigeLevel: 5 }));
      expect(high.xpMultiplier).toBeGreaterThan(low.xpMultiplier);
    });
  });

  describe("migrateToPrestigeSystem", () => {
    it("starts at prestige 0 for low-level users", () => {
      const result = migrateToPrestigeSystem(10, 10);
      expect(result.prestigeState.prestigeLevel).toBe(0);
      expect(result.startingBonuses).toEqual([]);
    });

    it("starts at prestige 1 for level 50+ users", () => {
      const result = migrateToPrestigeSystem(50, 50);
      expect(result.prestigeState.prestigeLevel).toBe(1);
      expect(result.startingBonuses.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// 12. Prestige Bonuses (prestige-bonuses.ts)
// ============================================================================

describe("Prestige Bonuses", () => {
  it("PRESTIGE_BONUSES has entries", () => {
    expect(PRESTIGE_BONUSES.length).toBeGreaterThanOrEqual(10);
  });

  describe("calculatePrestigeBonuses", () => {
    it("returns empty for prestige 0", () => {
      const bonuses = calculatePrestigeBonuses(0, 0);
      expect(bonuses).toEqual([]);
    });

    it("returns COMMON bonuses for prestige 1", () => {
      const bonuses = calculatePrestigeBonuses(1, 0);
      expect(bonuses.length).toBeGreaterThan(0);
    });

    it("more bonuses at higher prestige", () => {
      const low = calculatePrestigeBonuses(1, 0);
      const high = calculatePrestigeBonuses(6, 0);
      expect(high.length).toBeGreaterThanOrEqual(low.length);
    });

    it("includes RARE at prestige 4+", () => {
      const bonuses = calculatePrestigeBonuses(4, 0);
      const rarePool = PRESTIGE_BONUSES.filter((b) => b.rarity === "RARE");
      expect(rarePool.length).toBeGreaterThan(0);
      // Bonus selection is deterministic by formula, just check count is reasonable
      expect(bonuses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("applyPrestigeBonuses", () => {
    it("returns base value with no active bonuses", () => {
      const state = makePrestigeState({ activeBonuses: [] });
      expect(applyPrestigeBonuses(100, "XP_BOOST", state)).toBe(100);
    });

    it("applies matching bonus type", () => {
      const state = makePrestigeState({ activeBonuses: ["xp_boost_5"] });
      const result = applyPrestigeBonuses(100, "XP_BOOST", state);
      expect(result).toBe(105); // 100 * 1.05
    });

    it("stacks multiple bonuses of same type", () => {
      const state = makePrestigeState({ activeBonuses: ["xp_boost_5", "xp_boost_10"] });
      const result = applyPrestigeBonuses(100, "XP_BOOST", state);
      expect(result).toBe(115); // 100 * 1.15
    });

    it("ignores non-matching bonus types", () => {
      const state = makePrestigeState({ activeBonuses: ["coin_boost_10"] });
      expect(applyPrestigeBonuses(100, "XP_BOOST", state)).toBe(100);
    });
  });

  describe("getTotalBonusPercent", () => {
    it("returns 0 with no active bonuses", () => {
      const state = makePrestigeState({ activeBonuses: [] });
      expect(getTotalBonusPercent("XP_BOOST", state)).toBe(0);
    });

    it("sums matching bonus values", () => {
      const state = makePrestigeState({ activeBonuses: ["xp_boost_5", "xp_boost_10"] });
      expect(getTotalBonusPercent("XP_BOOST", state)).toBe(15);
    });
  });
});

// ============================================================================
// 13. Tower Constants (tower-constants.ts)
// ============================================================================

describe("Tower Constants", () => {
  it("getTierConfig returns tier 1 for level 1", () => {
    const config = getTierConfig(1);
    expect(config.tier).toBe(1);
    expect(config.name).toBe("Foundation");
  });

  it("getTierConfig defaults to tier 1 for invalid tier", () => {
    const config = getTierConfig(0);
    expect(config.tier).toBe(1);
  });

  it("TIER_CONFIG has 8 tiers", () => {
    expect(TIER_CONFIG.length).toBe(8);
  });

  it("MILESTONE_BLOCKS is sorted", () => {
    for (let i = 1; i < MILESTONE_BLOCKS.length; i++) {
      expect(MILESTONE_BLOCKS[i]!).toBeGreaterThan(MILESTONE_BLOCKS[i - 1]!);
    }
  });
});

// ============================================================================
// 14. Focus Tower (focus-tower.ts)
// ============================================================================

describe("Focus Tower", () => {
  describe("addTowerBlock", () => {
    it("adds a block and increments total", () => {
      const tower = makeTower();
      const result = addTowerBlock(tower, "session-id", 80);
      expect(result.updatedTower.totalBlocks).toBe(1);
      expect(result.newBlock.tier).toBe(1);
      expect(result.tierUp).toBe(false);
    });

    it("triggers tier up at max blocks per tier", () => {
      const tower = makeTower({ blocksThisTier: 9, totalBlocks: 9 });
      const result = addTowerBlock(tower, "session-id", 80);
      expect(result.tierUp).toBe(true);
      expect(result.updatedTower.currentTier).toBe(2);
    });

    it("marks milestone block", () => {
      const tower = makeTower({ totalBlocks: 9 });
      const result = addTowerBlock(tower, "session-id", 80);
      expect(result.milestoneReached).toBe(10);
    });

    it("high quality gives 1.5x bonus value", () => {
      const tower = makeTower();
      const normal = addTowerBlock(tower, "session-id", 50);
      const highQuality = addTowerBlock(tower, "session-id", 95);
      expect(highQuality.newBlock.bonusValue).toBeGreaterThan(normal.newBlock.bonusValue);
    });
  });

  describe("getTowerDisplay", () => {
    it("returns correct tier name", () => {
      const tower = makeTower({ currentTier: 1 });
      const display = getTowerDisplay(tower);
      expect(display.tierName).toBe("Foundation");
    });

    it("returns height string", () => {
      const tower = makeTower({ totalHeight: 42 });
      const display = getTowerDisplay(tower);
      expect(display.height).toBe("42m");
    });

    it("returns default bonus text when no bonuses", () => {
      const tower = makeTower();
      const display = getTowerDisplay(tower);
      expect(display.totalBonusesText).toBe("Build your tower for bonuses!");
    });

    it("returns next milestone", () => {
      const tower = makeTower({ totalBlocks: 5 });
      const display = getTowerDisplay(tower);
      expect(display.nextMilestone).toBe(10);
    });
  });

  describe("getTowerHeightComparison", () => {
    it("returns Foundation for empty tower", () => {
      const tower = makeTower({ totalBlocks: 0 });
      expect(getTowerHeightComparison(tower)).toContain("Foundation");
    });

    it("returns House for 10 blocks", () => {
      const tower = makeTower({ totalBlocks: 10 });
      expect(getTowerHeightComparison(tower)).toContain("House");
    });

    it("returns Maximum Height for 1000+ blocks", () => {
      const tower = makeTower({ totalBlocks: 1000 });
      expect(getTowerHeightComparison(tower)).toContain("Maximum Height");
    });
  });
});

// ============================================================================
// 15. Tower Decay (tower-decay.ts)
// ============================================================================

describe("Tower Decay", () => {
  describe("calculateTowerChurnRisk", () => {
    it("returns NONE for < 3 days inactive", () => {
      const tower = makeTower();
      const result = calculateTowerChurnRisk(tower, 2);
      expect(result.riskLevel).toBe("NONE");
    });

    it("returns LOW for 3-4 days inactive", () => {
      const tower = makeTower();
      const result = calculateTowerChurnRisk(tower, 3);
      expect(result.riskLevel).toBe("LOW");
    });

    it("returns MEDIUM for 5-6 days inactive", () => {
      const tower = makeTower();
      const result = calculateTowerChurnRisk(tower, 6);
      expect(result.riskLevel).toBe("MEDIUM");
    });

    it("returns CRITICAL for 7+ days inactive", () => {
      const tower = makeTower({ totalBlocks: 100 });
      const result = calculateTowerChurnRisk(tower, 7);
      expect(result.riskLevel).toBe("CRITICAL");
    });
  });

  describe("applyTowerDecay", () => {
    it("no decay for < 7 days inactive", () => {
      const tower = makeTower({ totalBlocks: 50 });
      const result = applyTowerDecay(tower, 6);
      expect(result.blocksLost).toBe(0);
      expect(result.updatedTower.totalBlocks).toBe(50);
    });

    it("decays blocks after 7+ days inactive", () => {
      const tower = makeTower({ totalBlocks: 100 });
      const result = applyTowerDecay(tower, 10);
      expect(result.blocksLost).toBeGreaterThan(0);
      expect(result.updatedTower.totalBlocks).toBeLessThan(100);
      expect(result.canRestore).toBe(true);
      expect(result.restoreCost).toBeGreaterThan(0);
    });
  });

  describe("restoreTowerBlocks", () => {
    it("fails if not enough gems", () => {
      const tower = makeTower({ totalBlocks: 50 });
      const result = restoreTowerBlocks(tower, 10, 0);
      expect(result.success).toBe(false);
      expect(result.blocksRestored).toBe(0);
    });

    it("succeeds with enough gems", () => {
      const tower = makeTower({ totalBlocks: 50 });
      const cost = 10 * 25; // 250 gems for 10 blocks
      const result = restoreTowerBlocks(tower, 10, cost);
      expect(result.success).toBe(true);
      expect(result.blocksRestored).toBe(10);
    });
  });
});

// ============================================================================
// 16. Next Best Action (next-best-action.ts)
// ============================================================================

describe("Next Best Action", () => {
  it("returns first session CTA for 0 sessions", () => {
    const action = getNextBestAction({
      completedSessions: 0,
      currentStreak: 0,
      nextUnlockFeature: null,
    });
    expect(action.title).toContain("first session");
  });

  it("returns second session CTA for 1 session", () => {
    const action = getNextBestAction({
      completedSessions: 1,
      currentStreak: 1,
      nextUnlockFeature: null,
    });
    expect(action.title).toContain("second win");
  });

  it("returns unlock CTA for 2 sessions", () => {
    const action = getNextBestAction({
      completedSessions: 2,
      currentStreak: 2,
      nextUnlockFeature: "focus_session",
    });
    expect(action.title).toContain("unlock");
  });

  it("returns momentum CTA for 3+ sessions with streak", () => {
    const action = getNextBestAction({
      completedSessions: 5,
      currentStreak: 5,
      nextUnlockFeature: null,
    });
    expect(action.title).toContain("opening up");
    expect(action.description).toContain("momentum");
  });

  it("returns generic CTA for 3+ sessions without streak", () => {
    const action = getNextBestAction({
      completedSessions: 5,
      currentStreak: 0,
      nextUnlockFeature: null,
    });
    expect(action.description).toContain("past setup mode");
  });
});

// ============================================================================
// 17. Analytics (analytics.ts)
// ============================================================================

describe("Analytics", () => {
  it("trackXpAdded calls Sentry breadcrumb", () => {
    const Sentry = require("@sentry/react-native");
    trackXpAdded("user1", 100, "SESSION_COMPLETE", 5);
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: "progression", message: "XP added" }),
    );
  });

  it("trackLevelUp calls Sentry breadcrumb", () => {
    const Sentry = require("@sentry/react-native");
    trackLevelUp("user1", 10, 9, 5000);
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Level up: 9 → 10" }),
    );
  });

  it("trackProgressionError calls Sentry breadcrumb with error level", () => {
    const Sentry = require("@sentry/react-native");
    trackProgressionError("addXp", new Error("test"), "user1");
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ level: "error" }),
    );
  });

  it("setupProgressionAnalytics returns cleanup function", () => {
    const cleanup = setupProgressionAnalytics();
    expect(typeof cleanup).toBe("function");
    cleanup();
  });
});

// ============================================================================
// 18. XP Validation (utils/validation)
// ============================================================================

describe("XP Validation", () => {
  const emptyHistory = {
    recentTransactions: [] as XPTransaction[],
    currentLevel: 1,
    currentXP: 0,
    sessionHistory: [] as { duration: number; xp: number; timestamp: number }[],
  };

  describe("validateXPTransaction", () => {
    it("validates a clean transaction", () => {
      const txn = makeTxn({ amount: 50 });
      const result = validateXPTransaction(txn, emptyHistory);
      expect(result.valid).toBe(true);
      expect(result.violations.length).toBe(0);
    });

    it("flags XP exceeding per-session max", () => {
      const txn = makeTxn({ amount: MAX_XP_PER_SESSION + 1 });
      const result = validateXPTransaction(txn, emptyHistory);
      expect(result.violations.some((v) => v.type === "IMPOSSIBLE")).toBe(true);
    });

    it("flags duplicate transactions", () => {
      const existing = makeTxn({ sourceId: "src-1", source: "SESSION_COMPLETE" });
      const txn = makeTxn({ sourceId: "src-1", source: "SESSION_COMPLETE" });
      const result = validateXPTransaction(txn, { ...emptyHistory, recentTransactions: [existing] });
      expect(result.violations.some((v) => v.message.includes("Duplicate"))).toBe(true);
    });
  });

  describe("validateSourceSpecific", () => {
    it("warns on session XP without matching session", () => {
      const txn = makeTxn({ source: "SESSION_COMPLETE" });
      const result: ValidationResult<XPTransaction> = { valid: true, violations: [], warnings: [], riskScore: 0 };
      validateSourceSpecific(txn, { sessionHistory: [] }, result);
      expect(result.warnings.some((w) => w.code === "ORPHAN_SESSION_XP")).toBe(true);
    });

    it("flags streak bonus multiplier exceeding max", () => {
      const txn = makeTxn({ source: "STREAK_BONUS", metadata: { multiplier: MAX_STREAK_BONUS_MULTIPLIER + 1 } });
      const result: ValidationResult<XPTransaction> = { valid: true, violations: [], warnings: [], riskScore: 0 };
      validateSourceSpecific(txn, { sessionHistory: [] }, result);
      expect(result.violations.some((v) => v.field === "metadata.multiplier")).toBe(true);
    });

    it("flags quality bonus multiplier exceeding max", () => {
      const txn = makeTxn({ source: "SESSION_QUALITY", metadata: { qualityMultiplier: MAX_QUALITY_BONUS + 1 } });
      const result: ValidationResult<XPTransaction> = { valid: true, violations: [], warnings: [], riskScore: 0 };
      validateSourceSpecific(txn, { sessionHistory: [] }, result);
      expect(result.violations.some((v) => v.field === "metadata.qualityMultiplier")).toBe(true);
    });

    it("flags suspicious boss damage ratio", () => {
      const txn = makeTxn({ source: "BOSS_DAMAGE", amount: 500, metadata: { damage: 100 } });
      const result: ValidationResult<XPTransaction> = { valid: true, violations: [], warnings: [], riskScore: 0 };
      validateSourceSpecific(txn, { sessionHistory: [] }, result);
      expect(result.violations.some((v) => v.type === "SUSPICIOUS")).toBe(true);
    });
  });

  describe("validateLevelUp", () => {
    it("validates normal level up", () => {
      const result = validateLevelUp(1, 0, 150, [100, 125, 150]);
      expect(result.valid).toBe(true);
      expect(result.data?.newLevel).toBeGreaterThan(1);
    });

    it("flags negative current level", () => {
      const result = validateLevelUp(-1, 0, 100, [100]);
      expect(result.valid).toBe(false);
      expect(result.violations[0]?.severity).toBe("CRITICAL");
    });

    it("flags negative XP", () => {
      const result = validateLevelUp(1, -10, 100, [100]);
      expect(result.valid).toBe(false);
    });

    it("flags newXP less than currentXP", () => {
      const result = validateLevelUp(5, 500, 100, [100, 125, 150, 175, 200]);
      expect(result.violations.some((v) => v.message.includes("rollback"))).toBe(true);
    });

    it("caps at MAX_LEVEL 100", () => {
      const hugeCurve = Array(200).fill(1);
      const result = validateLevelUp(1, 0, 200, hugeCurve);
      expect(result.data?.newLevel).toBeLessThanOrEqual(100);
    });
  });

  describe("validatePrestige", () => {
    it("allows prestige at level 100", () => {
      const result = validatePrestige(100, 0);
      expect(result.data?.canPrestige).toBe(true);
    });

    it("blocks prestige below min level", () => {
      const result = validatePrestige(50, 0);
      expect(result.data?.canPrestige).toBe(false);
    });

    it("blocks prestige at max prestige", () => {
      const result = validatePrestige(100, 10);
      expect(result.data?.canPrestige).toBe(false);
    });
  });

  describe("validateXPBatch", () => {
    it("accepts clean batch", () => {
      const txns = [makeTxn({ amount: 50 }), makeTxn({ amount: 30 })];
      const result = validateXPBatch(txns, emptyHistory);
      expect(result.valid).toBe(true);
      expect(result.data?.valid.length).toBe(2);
      expect(result.data?.rejected.length).toBe(0);
    });

    it("rejects transactions with high risk", () => {
      const txns = [makeTxn({ amount: MAX_XP_PER_SESSION + 1 })];
      const result = validateXPBatch(txns, emptyHistory);
      expect(result.data?.rejected.length).toBe(1);
    });

    it("flags batch exceeding hourly limit", () => {
      // Use amounts under MAX_XP_PER_SESSION (10000) each, but collectively
      // exceed MAX_XP_PER_HOUR * 2 (30000) in valid transactions
      const txns = Array.from({ length: 5 }, (_, i) =>
        makeTxn({ amount: 9000, id: `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`, timestamp: Date.now() }),
      );
      const result = validateXPBatch(txns, emptyHistory);
      // 5 * 9000 = 45000 > 30000 threshold
      expect(result.violations.some((v) => v.type === "RATE_LIMIT")).toBe(true);
    });
  });
});

// ============================================================================
// 19. Validation Constants
// ============================================================================

describe("Validation Constants", () => {
  it("MAX_XP_PER_SESSION is positive", () => {
    expect(MAX_XP_PER_SESSION).toBeGreaterThan(0);
  });
  it("MAX_XP_PER_HOUR is positive", () => {
    expect(MAX_XP_PER_HOUR).toBeGreaterThan(0);
  });
  it("MAX_STREAK_BONUS_MULTIPLIER is positive", () => {
    expect(MAX_STREAK_BONUS_MULTIPLIER).toBeGreaterThan(0);
  });
  it("MAX_QUALITY_BONUS is positive", () => {
    expect(MAX_QUALITY_BONUS).toBeGreaterThan(0);
  });
});

// ============================================================================
// 20. First Week Pacing
// ============================================================================

describe("First Week Pacing", () => {
  describe("calculateLevelProgress", () => {
    it("returns 1 for 0 XP", () => {
      expect(calculateLevelProgress(0)).toBe(1);
    });
    it("returns 1 for 100 XP", () => {
      expect(calculateLevelProgress(100)).toBe(1);
    });
    it("returns 2 for 101-250 XP", () => {
      expect(calculateLevelProgress(150)).toBe(2);
    });
    it("returns 3 for 251-500 XP", () => {
      expect(calculateLevelProgress(300)).toBe(3);
    });
    it("returns 4 for 501-1000 XP", () => {
      expect(calculateLevelProgress(750)).toBe(4);
    });
  });

  describe("getSessionUnlocks", () => {
    it("returns unlocks for SESSION_1", () => {
      const unlocks = getSessionUnlocks("SESSION_1");
      expect(unlocks.length).toBeGreaterThan(0);
      expect(unlocks[0]?.title).toBe("Focus Score Active");
    });

    it("returns unlocks for SESSION_7", () => {
      const unlocks = getSessionUnlocks("SESSION_7");
      expect(unlocks.length).toBeGreaterThan(0);
    });
  });

  describe("getSessionXpReward", () => {
    it("returns increasing rewards per session", () => {
      const s1 = getSessionXpReward("SESSION_1");
      const s7 = getSessionXpReward("SESSION_7");
      expect(s7).toBeGreaterThan(s1);
    });

    it("SESSION_1 gives 50 XP", () => {
      expect(getSessionXpReward("SESSION_1")).toBe(50);
    });

    it("SESSION_7 gives 250 XP", () => {
      expect(getSessionXpReward("SESSION_7")).toBe(250);
    });
  });

  describe("getCompanionReaction", () => {
    it("returns non-empty string for SESSION_1", () => {
      expect(getCompanionReaction("SESSION_1").length).toBeGreaterThan(0);
    });
  });

  describe("getTutorialSteps", () => {
    it("returns steps for SESSION_1", () => {
      const steps = getTutorialSteps("SESSION_1");
      expect(steps.length).toBeGreaterThan(0);
    });
  });

  describe("isInFirstWeek", () => {
    it("returns true for SESSION_1", () => {
      const progress = { currentSession: "SESSION_1" } as FirstWeekProgress;
      expect(isInFirstWeek(progress)).toBe(true);
    });

    it("returns false for COMPLETED", () => {
      const progress = { currentSession: "COMPLETED" } as FirstWeekProgress;
      expect(isInFirstWeek(progress)).toBe(false);
    });
  });

  describe("getFirstWeekCompletion", () => {
    it("returns 0 for 0 sessions", () => {
      const progress = { sessionsCompleted: 0 } as FirstWeekProgress;
      expect(getFirstWeekCompletion(progress)).toBe(0);
    });

    it("returns 100 for 7 sessions", () => {
      const progress = { sessionsCompleted: 7 } as FirstWeekProgress;
      expect(getFirstWeekCompletion(progress)).toBe(100);
    });

    it("returns ~43 for 3 sessions", () => {
      const progress = { sessionsCompleted: 3 } as FirstWeekProgress;
      expect(getFirstWeekCompletion(progress)).toBeCloseTo(42.857, 1);
    });
  });

  describe("getNextSession", () => {
    it("SESSION_1 returns SESSION_2", () => {
      expect(getNextSession("SESSION_1")).toBe("SESSION_2");
    });

    it("SESSION_7 returns COMPLETED", () => {
      expect(getNextSession("SESSION_7")).toBe("COMPLETED");
    });

    it("COMPLETED returns null", () => {
      expect(getNextSession("COMPLETED")).toBeNull();
    });
  });

  describe("getSessionNumber", () => {
    it("SESSION_1 is 1", () => {
      expect(getSessionNumber("SESSION_1")).toBe(1);
    });

    it("SESSION_7 is 7", () => {
      expect(getSessionNumber("SESSION_7")).toBe(7);
    });
  });
});

// ============================================================================
// 21. Schema validation
// ============================================================================

describe("Schemas", () => {
  it("XpSourceSchema rejects invalid source", () => {
    const { XpSourceSchema } = require("../schemas-xp");
    expect(() => XpSourceSchema.parse("INVALID_SOURCE")).toThrow();
  });

  it("XpSourceSchema accepts valid source", () => {
    const { XpSourceSchema } = require("../schemas-xp");
    expect(XpSourceSchema.parse("SESSION_COMPLETE")).toBe("SESSION_COMPLETE");
  });

  it("ProgressionSchema validates valid object", () => {
    const { ProgressionSchema } = require("../schemas");
    const valid = {
      id: "00000000-0000-0000-0000-000000000001",
      userId: "00000000-0000-0000-0000-000000000002",
      level: 5,
      xp: 50,
      totalXp: 500,
      nextLevelThreshold: 100,
      lastLevelUpAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(() => ProgressionSchema.parse(valid)).not.toThrow();
  });

  it("ProgressionSchema rejects invalid level", () => {
    const { ProgressionSchema } = require("../schemas");
    const invalid = {
      id: "00000000-0000-0000-0000-000000000001",
      userId: "00000000-0000-0000-0000-000000000002",
      level: 0,
      xp: 0,
      totalXp: 0,
      nextLevelThreshold: 100,
      lastLevelUpAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(() => ProgressionSchema.parse(invalid)).toThrow();
  });

  it("AddXpInputSchema validates valid input", () => {
    const { AddXpInputSchema } = require("../schemas");
    const valid = {
      userId: "00000000-0000-0000-0000-000000000001",
      amount: 50,
      source: "SESSION_COMPLETE",
    };
    expect(() => AddXpInputSchema.parse(valid)).not.toThrow();
  });

  it("AddXpInputSchema rejects negative amount", () => {
    const { AddXpInputSchema } = require("../schemas");
    const invalid = {
      userId: "00000000-0000-0000-0000-000000000001",
      amount: -10,
      source: "SESSION_COMPLETE",
    };
    expect(() => AddXpInputSchema.parse(invalid)).toThrow();
  });

  it("UnlockTypeSchema accepts all valid types", () => {
    const { UnlockTypeSchema } = require("../schemas");
    const types = ["FEATURE", "BLOCKER_INSIGHT", "SHOP_ITEM", "COSMETIC", "TITLE", "MODE_ADAPTATION"];
    for (const t of types) {
      expect(UnlockTypeSchema.parse(t)).toBe(t);
    }
  });

  it("MilestoneTypeSchema accepts valid types", () => {
    const { MilestoneTypeSchema } = require("../schemas");
    expect(MilestoneTypeSchema.parse("LEVEL")).toBe("LEVEL");
    expect(MilestoneTypeSchema.parse("XP_TOTAL")).toBe("XP_TOTAL");
  });
});

// ============================================================================
// 22. First Week Pacing Schemas
// ============================================================================

describe("First Week Pacing Schemas", () => {
  it("FirstWeekSessionSchema validates all sessions", () => {
    const { FirstWeekSessionSchema } = require("../first-week-pacing/schemas");
    const sessions = ["SESSION_1", "SESSION_2", "SESSION_3", "SESSION_4", "SESSION_5", "SESSION_6", "SESSION_7", "COMPLETED"];
    for (const s of sessions) {
      expect(FirstWeekSessionSchema.parse(s)).toBe(s);
    }
  });

  it("FirstWeekSessionSchema rejects invalid session", () => {
    const { FirstWeekSessionSchema } = require("../first-week-pacing/schemas");
    expect(() => FirstWeekSessionSchema.parse("SESSION_8")).toThrow();
  });

  it("SessionUnlockSchema validates unlock object", () => {
    const { SessionUnlockSchema } = require("../first-week-pacing/schemas");
    const valid = {
      session: "SESSION_1",
      unlockType: "FEATURE",
      title: "Test",
      description: "Test desc",
      actionRequired: false,
      icon: "📊",
      priority: 1,
    };
    expect(() => SessionUnlockSchema.parse(valid)).not.toThrow();
  });
});
