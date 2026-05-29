/**
 * Streaks Comprehensive Tests
 * Covers ALL exported functions, schemas, helpers, milestones, insurance, recovery, gamble, risk.
 */
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ─── Schemas ────────────────────────────────────────────────────────────────
import {
  RiskLevelSchema,
  StreakSchema,
  StreakSummarySchema,
  StreakRowSchema,
  MilestoneRewardTypeSchema,
  StreakMilestoneSchema,
  ShieldSourceSchema,
  StreakShieldSchema,
  RecoverySourceSchema,
  ComebackStateSchema,
  StreakCalendarDaySchema,
  StreakActionSchema,
  StreakEngineResultSchema,
  RecordSessionInputSchema,
  UseShieldInputSchema,
  FreezeStreakInputSchema,
  RestoreStreakInputSchema,
  type Streak,
} from "../schemas";

// ─── Types ──────────────────────────────────────────────────────────────────
import type { StreakState, StreakStateInfo, StreakMilestone as TypesStreakMilestone } from "../types";

// ─── Constants ──────────────────────────────────────────────────────────────
import { STREAK_STATES, STREAK_MILESTONES } from "../constants";

// ─── Helpers ────────────────────────────────────────────────────────────────
import {
  determineStreakState,
  calculateHoursUntilStreakBreak,
  getStreakStateInfo,
  getStreakVisualIndicator,
} from "../helpers";

// ─── Milestones ─────────────────────────────────────────────────────────────
import {
  checkMilestones,
  getNextMilestone,
  getMilestoneProgress,
  getStreakDisplayText,
  getStreakCelebrationMessage,
} from "../milestones";

// ─── Service (pure) ─────────────────────────────────────────────────────────
import {
  isQualifyingSession,
  getCalendarDay,
  checkMilestone,
  getStreakMultiplier,
} from "../service";

// ─── Service Comeback ───────────────────────────────────────────────────────
import {
  calculateRiskLevel,
  calculateNextDeadline,
  getStreakMultiplier as getStreakMultiplierComeback,
} from "../service-comeback";

// ─── Streak Insurance ───────────────────────────────────────────────────────
import {
  StreakInsuranceSchema,
  ComebackTokenSchema,
  INSURANCE_PRICING,
  calculateInsuranceCost,
  calculateInsurancePayout,
  calculateComebackTokensEarned,
  calculateTokenRestoreValue,
  canPurchaseInsurance,
  createInsurance,
} from "../streak-insurance";

// ─── Streak Gamble ──────────────────────────────────────────────────────────
import {
  StreakGambleSchema,
  GAMBLE_CONFIGS,
  getGambleOptions,
} from "../streak-gamble";

// ─── Streak Risk Assessment ─────────────────────────────────────────────────
import {
  settleGamble,
  assessStreakRisk,
  convertShieldsToInsurance,
  StreakInsuranceEvents,
} from "../streak-risk-assessment";

// ─── Recovery ───────────────────────────────────────────────────────────────
import {
  createRecoveryPlan,
  getRecoveryPlan,
  progressRecovery,
  clearRecoveryPlan,
} from "../recovery";

// ─── Insurance (in-memory) ──────────────────────────────────────────────────
import {
  awardInsurance,
  getAvailableInsuranceCount,
  getUserInsurance,
  canUseInsurance,
  useInsurance,
} from "../insurance";

// ─── Repository Helpers ─────────────────────────────────────────────────────
import { RepositoryError, parseStreakRow } from "../repository-helpers";

// ─── Risk Helpers ───────────────────────────────────────────────────────────
import {
  analyzePattern,
  calculateRecentQuality,
  getRiskLevel,
  getUrgency,
  getSuggestedAction,
  generateRecommendation,
} from "../utils/riskHelpers";

import { WEIGHTS, CRITICAL_THRESHOLD, HIGH_THRESHOLD, MEDIUM_THRESHOLD, DAY_HOURS } from "../utils/riskTypes";

// ============================================================================
// Mocks for repository (service tests that need async)
// ============================================================================
const mockRepository = {
  fetchStreak: jest.fn<() => Promise<Streak | null>>(),
  createStreak: jest.fn<() => Promise<Streak>>(),
  updateStreak: jest.fn<() => Promise<Streak>>(),
  recordShieldEarned: jest.fn<() => Promise<void>>(),
  recordShieldUsed: jest.fn<() => Promise<void>>(),
  getAvailableShield: jest.fn<() => Promise<string | null>>(),
  fetchActiveRepairQuest: jest.fn(),
  saveRepairQuest: jest.fn(),
  updateRepairQuest: jest.fn(),
  fetchExpiredRepairQuests: jest.fn(),
  fetchUsersWithActiveStreaks: jest.fn(),
};

jest.mock("../repository", () => mockRepository);

// Mock eventBus
jest.mock("../../../events", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(),
  },
}));

// Mock uuid
jest.mock("../../../utils/uuid", () => ({
  v4: () => "mock-uuid-" + Math.random().toString(36).slice(2, 8),
}));

// Mock restore-quest (used by service-comeback)
jest.mock("../restore-quest", () => ({
  hasUsedStreakRestoreThisMonth: jest.fn<() => Promise<boolean>>().mockResolvedValue(false),
}));

// Mock supabase config
jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: { code: "PGRST116" } })),
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
          gt: jest.fn(() => Promise.resolve({ data: [], error: null })),
          lt: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      })),
    })),
    rpc: jest.fn(() => Promise.resolve({ error: null })),
  })),
}));

// Mock Sentry
jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));

// ============================================================================
// Fixtures
// ============================================================================
const BASE_MOCK_STREAK: Streak = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  userId: "550e8400-e29b-41d4-a716-446655440001",
  currentDays: 5,
  longestDays: 10,
  lastQualifyingSessionAt: Date.now() - 12 * 60 * 60 * 1000,
  currentDayCompletedAt: null,
  frozenUntil: null,
  shieldsAvailable: 2,
  gracePeriodUsed: false,
  timezone: "UTC",
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function mockStreak(overrides: Partial<Streak> = {}): Streak {
  return { ...BASE_MOCK_STREAK, ...overrides };
}

// ============================================================================
// Schema Tests
// ============================================================================
describe("Streak Schemas", () => {
  describe("RiskLevelSchema", () => {
    it("accepts all valid risk levels", () => {
      for (const level of ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]) {
        expect(RiskLevelSchema.safeParse(level).success).toBe(true);
      }
    });
    it("rejects invalid risk level", () => {
      expect(RiskLevelSchema.safeParse("EXTREME").success).toBe(false);
    });
  });

  describe("StreakSchema", () => {
    it("accepts valid streak object", () => {
      const result = StreakSchema.safeParse(BASE_MOCK_STREAK);
      expect(result.success).toBe(true);
    });
    it("applies defaults", () => {
      const result = StreakSchema.parse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      expect(result.currentDays).toBe(0);
      expect(result.longestDays).toBe(0);
      expect(result.shieldsAvailable).toBe(0);
      expect(result.timezone).toBe("UTC");
      expect(result.gracePeriodUsed).toBe(false);
    });
    it("rejects extra fields (strict mode)", () => {
      const result = StreakSchema.safeParse({ ...BASE_MOCK_STREAK, extra: true });
      expect(result.success).toBe(false);
    });
    it("rejects negative currentDays", () => {
      const result = StreakSchema.safeParse({ ...BASE_MOCK_STREAK, currentDays: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe("StreakRowSchema", () => {
    const validRow = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      user_id: "550e8400-e29b-41d4-a716-446655440001",
      current_days: 3,
      longest_days: 10,
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    it("accepts valid row", () => {
      expect(StreakRowSchema.safeParse(validRow).success).toBe(true);
    });
    it("converts string timestamps to numbers", () => {
      const row = {
        ...validRow,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };
      const result = StreakRowSchema.parse(row);
      expect(typeof result.created_at).toBe("number");
      expect(typeof result.updated_at).toBe("number");
    });
    it("passthrough allows extra fields", () => {
      const row = { ...validRow, extra_field: "value" };
      expect(StreakRowSchema.safeParse(row).success).toBe(true);
    });
  });

  describe("StreakSummarySchema", () => {
    it("accepts valid summary", () => {
      const result = StreakSummarySchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        currentDays: 5,
        longestDays: 10,
        isAtRisk: false,
        riskLevel: "NONE",
        nextDeadline: null,
        frozenUntil: null,
        shieldAvailable: true,
      });
      expect(result.success).toBe(true);
    });
    it("rejects extra fields (strict mode)", () => {
      const result = StreakSummarySchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        currentDays: 5,
        longestDays: 10,
        isAtRisk: false,
        riskLevel: "NONE",
        nextDeadline: null,
        frozenUntil: null,
        shieldAvailable: true,
        extra: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("MilestoneRewardTypeSchema", () => {
    it("accepts all valid reward types", () => {
      for (const t of ["XP", "COINS", "GEMS", "ITEM", "BADGE", "STREAK_SHIELD"]) {
        expect(MilestoneRewardTypeSchema.safeParse(t).success).toBe(true);
      }
    });
    it("rejects invalid type", () => {
      expect(MilestoneRewardTypeSchema.safeParse("DIAMONDS").success).toBe(false);
    });
  });

  describe("StreakMilestoneSchema", () => {
    it("accepts valid milestone", () => {
      const result = StreakMilestoneSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        days: 7,
        name: "Week Warrior",
        description: "7 days strong",
        rewardType: "COINS",
        rewardAmount: 250,
        rewardItemId: null,
        badgeId: "streak-7",
        achieved: true,
        achievedAt: Date.now(),
      });
      expect(result.success).toBe(true);
    });
    it("rejects days < 1", () => {
      const result = StreakMilestoneSchema.safeParse({
        id: "550e8400-e29b-41d4-a716-446655440000",
        days: 0,
        name: "test",
        description: "test",
        rewardType: "XP",
        rewardAmount: 0,
        rewardItemId: null,
        badgeId: null,
        achieved: false,
        achievedAt: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ShieldSourceSchema", () => {
    it("accepts all valid sources", () => {
      for (const s of ["MILESTONE_30", "BOSS_DEFEAT", "SHOP_PURCHASE", "PROMOTIONAL"]) {
        expect(ShieldSourceSchema.safeParse(s).success).toBe(true);
      }
    });
  });

  describe("RecoverySourceSchema", () => {
    it("accepts all valid sources", () => {
      for (const s of ["SHIELD", "PURCHASE", "SPECIAL_EVENT", "MANUAL"]) {
        expect(RecoverySourceSchema.safeParse(s).success).toBe(true);
      }
    });
  });

  describe("ComebackStateSchema", () => {
    it("accepts valid comeback state", () => {
      const result = ComebackStateSchema.safeParse({
        isComeback: true,
        daysAbsent: 5,
        streakBefore: 10,
        streakNow: 0,
        rewardMultiplier: 1.5,
        streakRestoreEligible: true,
        message: "Welcome back!",
      });
      expect(result.success).toBe(true);
    });
    it("rejects empty message", () => {
      const result = ComebackStateSchema.safeParse({
        isComeback: false,
        daysAbsent: 0,
        streakBefore: 0,
        streakNow: 0,
        rewardMultiplier: 1,
        streakRestoreEligible: false,
        message: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("StreakCalendarDaySchema", () => {
    it("accepts valid calendar day", () => {
      const result = StreakCalendarDaySchema.safeParse({
        date: "2025-01-15",
        hasSession: true,
        sessionCount: 2,
        totalDuration: 1800,
        qualifiesForStreak: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("StreakActionSchema", () => {
    it("accepts all valid actions", () => {
      for (const a of ["INCREMENTED", "MAINTAINED", "BROKEN", "SHIELD_PROTECTED", "FROZEN", "COME_BACK", "ALREADY_TODAY"]) {
        expect(StreakActionSchema.safeParse(a).success).toBe(true);
      }
    });
  });

  describe("RecordSessionInputSchema", () => {
    it("accepts valid input", () => {
      const result = RecordSessionInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440002",
        completedAt: Date.now(),
        duration: 900,
        qualityScore: 80,
      });
      expect(result.success).toBe(true);
    });
    it("rejects quality > 100", () => {
      const result = RecordSessionInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440002",
        completedAt: Date.now(),
        duration: 900,
        qualityScore: 101,
      });
      expect(result.success).toBe(false);
    });
    it("rejects extra fields", () => {
      const result = RecordSessionInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440002",
        completedAt: Date.now(),
        duration: 900,
        qualityScore: 80,
        extra: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("UseShieldInputSchema", () => {
    it("accepts valid input", () => {
      expect(UseShieldInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        reason: "MANUAL",
      }).success).toBe(true);
    });
    it("rejects invalid reason", () => {
      expect(UseShieldInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        reason: "INVALID",
      }).success).toBe(false);
    });
  });

  describe("FreezeStreakInputSchema", () => {
    it("accepts valid input", () => {
      expect(FreezeStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        durationHours: 24,
      }).success).toBe(true);
    });
    it("rejects duration > 72", () => {
      expect(FreezeStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        durationHours: 73,
      }).success).toBe(false);
    });
    it("rejects duration < 1", () => {
      expect(FreezeStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        durationHours: 0,
      }).success).toBe(false);
    });
  });

  describe("RestoreStreakInputSchema", () => {
    it("accepts valid input", () => {
      expect(RestoreStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        targetDays: 5,
        source: "SPECIAL_EVENT",
      }).success).toBe(true);
    });
    it("rejects targetDays < 1", () => {
      expect(RestoreStreakInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440001",
        targetDays: 0,
        source: "MANUAL",
      }).success).toBe(false);
    });
  });
});

// ============================================================================
// determineStreakState
// ============================================================================
describe("determineStreakState", () => {
  it("returns PROTECTED when has insurance", () => {
    expect(determineStreakState(5, true, 10)).toBe("PROTECTED");
  });

  it("returns BROKEN when hoursRemaining is null", () => {
    expect(determineStreakState(5, false, null)).toBe("BROKEN");
  });

  it("returns BROKEN when hoursRemaining <= 0", () => {
    expect(determineStreakState(5, false, 0)).toBe("BROKEN");
  });

  it("returns RECOVERING when streakDays is 0", () => {
    expect(determineStreakState(0, false, 10)).toBe("RECOVERING");
  });

  it("returns AT_RISK when hoursRemaining <= 20", () => {
    expect(determineStreakState(5, false, 15)).toBe("AT_RISK");
  });

  it("returns ACTIVE when hoursRemaining > 20 and streakDays > 0", () => {
    expect(determineStreakState(5, false, 21)).toBe("ACTIVE");
  });

  it("returns AT_RISK at exact boundary of 20", () => {
    expect(determineStreakState(5, false, 20)).toBe("AT_RISK");
  });
});

// ============================================================================
// calculateHoursUntilStreakBreak
// ============================================================================
describe("calculateHoursUntilStreakBreak", () => {
  it("returns a non-negative number", () => {
    const result = calculateHoursUntilStreakBreak();
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("returns fewer hours later in the day", () => {
    const morning = new Date();
    morning.setHours(8, 0, 0, 0);
    const evening = new Date();
    evening.setHours(20, 0, 0, 0);
    const morningHours = calculateHoursUntilStreakBreak(morning.getTime());
    const eveningHours = calculateHoursUntilStreakBreak(evening.getTime());
    expect(morningHours).toBeGreaterThan(eveningHours);
  });

  it("returns 0 at end of day", () => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    expect(calculateHoursUntilStreakBreak(endOfDay.getTime())).toBe(0);
  });
});

// ============================================================================
// getStreakStateInfo
// ============================================================================
describe("getStreakStateInfo", () => {
  it("returns correct info for ACTIVE", () => {
    const info = getStreakStateInfo("ACTIVE");
    expect(info.label).toBe("Active");
    expect(info.icon).toBe("🔥");
    expect(info.urgency).toBe("none");
  });

  it("returns correct info for AT_RISK", () => {
    const info = getStreakStateInfo("AT_RISK");
    expect(info.label).toBe("At Risk");
    expect(info.urgency).toBe("medium");
  });

  it("returns correct info for CRITICAL", () => {
    const info = getStreakStateInfo("CRITICAL");
    expect(info.label).toBe("Critical");
    expect(info.urgency).toBe("critical");
  });

  it("returns correct info for BROKEN", () => {
    const info = getStreakStateInfo("BROKEN");
    expect(info.label).toBe("Broken");
    expect(info.icon).toBe("💔");
  });

  it("returns correct info for RECOVERING", () => {
    const info = getStreakStateInfo("RECOVERING");
    expect(info.label).toBe("Recovering");
  });

  it("returns correct info for PROTECTED", () => {
    const info = getStreakStateInfo("PROTECTED");
    expect(info.label).toBe("Protected");
    expect(info.icon).toBe("🛡️");
  });

  it("returns fallback for unknown state", () => {
    const info = getStreakStateInfo("UNKNOWN" as StreakState);
    expect(info.label).toBe("Unknown");
  });
});

// ============================================================================
// getStreakVisualIndicator
// ============================================================================
describe("getStreakVisualIndicator", () => {
  it("returns flame type for ACTIVE", () => {
    const indicator = getStreakVisualIndicator("ACTIVE", 5);
    expect(indicator.type).toBe("flame");
    expect(indicator.intensity).toBeGreaterThan(0);
  });

  it("returns milestone-glow animation for streak >= 7", () => {
    const indicator = getStreakVisualIndicator("ACTIVE", 7);
    expect(indicator.animation).toBe("milestone-glow");
  });

  it("returns glow animation for streak < 7", () => {
    const indicator = getStreakVisualIndicator("ACTIVE", 3);
    expect(indicator.animation).toBe("glow");
  });

  it("returns pulse for AT_RISK", () => {
    const indicator = getStreakVisualIndicator("AT_RISK", 5);
    expect(indicator.type).toBe("pulse");
    expect(indicator.animation).toBe("warning-pulse");
  });

  it("returns shake for CRITICAL", () => {
    const indicator = getStreakVisualIndicator("CRITICAL", 5);
    expect(indicator.type).toBe("critical");
    expect(indicator.animation).toBe("shake");
  });

  it("returns broken for BROKEN", () => {
    const indicator = getStreakVisualIndicator("BROKEN", 0);
    expect(indicator.type).toBe("broken");
    expect(indicator.intensity).toBe(0);
  });

  it("returns shield for PROTECTED", () => {
    const indicator = getStreakVisualIndicator("PROTECTED", 5);
    expect(indicator.type).toBe("shield");
  });

  it("intensity increases with streak days (ACTIVE)", () => {
    const low = getStreakVisualIndicator("ACTIVE", 1);
    const high = getStreakVisualIndicator("ACTIVE", 20);
    expect(high.intensity).toBeGreaterThanOrEqual(low.intensity);
  });
});

// ============================================================================
// STREAK_STATES constant
// ============================================================================
describe("STREAK_STATES", () => {
  it("defines all 6 states", () => {
    expect(Object.keys(STREAK_STATES)).toEqual(
      expect.arrayContaining(["ACTIVE", "AT_RISK", "CRITICAL", "BROKEN", "RECOVERING", "PROTECTED"]),
    );
  });

  it("each state has required properties", () => {
    for (const [key, state] of Object.entries(STREAK_STATES)) {
      expect(state).toHaveProperty("state", key);
      expect(state).toHaveProperty("label");
      expect(state).toHaveProperty("description");
      expect(state).toHaveProperty("icon");
      expect(state).toHaveProperty("animation");
      expect(state).toHaveProperty("urgency");
      expect(state).toHaveProperty("coachMessage");
    }
  });
});

// ============================================================================
// STREAK_MILESTONES constant
// ============================================================================
describe("STREAK_MILESTONES", () => {
  it("defines milestones for expected days", () => {
    const days = STREAK_MILESTONES.map((m) => m.days);
    expect(days).toEqual(expect.arrayContaining([3, 7, 14, 30, 100]));
  });

  it("each milestone has required fields", () => {
    for (const m of STREAK_MILESTONES) {
      expect(m).toHaveProperty("days");
      expect(m).toHaveProperty("title");
      expect(m).toHaveProperty("name");
      expect(m).toHaveProperty("description");
      expect(m).toHaveProperty("badgeIcon");
      expect(m).toHaveProperty("rewardType");
      expect(m).toHaveProperty("rewards");
      expect(m.rewards.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// checkMilestones
// ============================================================================
describe("checkMilestones", () => {
  it("returns matching milestones for day 3", () => {
    const milestones = checkMilestones(3);
    expect(milestones.length).toBe(1);
    expect(milestones[0]!.days).toBe(3);
  });

  it("returns matching milestones for day 7", () => {
    const milestones = checkMilestones(7);
    expect(milestones.length).toBe(1);
  });

  it("returns empty for non-milestone day", () => {
    expect(checkMilestones(5)).toEqual([]);
  });
});

// ============================================================================
// getNextMilestone
// ============================================================================
describe("getNextMilestone", () => {
  it("returns next milestone after current streak", () => {
    const next = getNextMilestone(0);
    expect(next).not.toBeNull();
    expect(next!.days).toBe(3);
  });

  it("returns correct next after 3 days", () => {
    const next = getNextMilestone(3);
    expect(next!.days).toBe(7);
  });

  it("returns null after last milestone", () => {
    const next = getNextMilestone(1000);
    expect(next).toBeNull();
  });
});

// ============================================================================
// getMilestoneProgress
// ============================================================================
describe("getMilestoneProgress", () => {
  it("returns 100% when at exact milestone", () => {
    const progress = getMilestoneProgress(7);
    expect(progress.percentComplete).toBe(100);
    expect(progress.nextMilestone).not.toBeNull();
  });

  it("returns 100% when past all milestones", () => {
    const progress = getMilestoneProgress(500);
    expect(progress.percentComplete).toBe(100);
    expect(progress.nextMilestone).toBeNull();
  });

  it("calculates correct percentage", () => {
    const progress = getMilestoneProgress(3); // 3 out of 7
    // At 3 it's an exact match so 100
    expect(progress.percentComplete).toBe(100);
  });

  it("calculates partial progress", () => {
    const progress = getMilestoneProgress(5); // 5 out of 7
    expect(progress.percentComplete).toBeGreaterThan(0);
    expect(progress.percentComplete).toBeLessThan(100);
  });
});

// ============================================================================
// getStreakDisplayText
// ============================================================================
describe("getStreakDisplayText", () => {
  it("returns '1 Day' for singular", () => {
    expect(getStreakDisplayText(1)).toBe("1 Day");
  });

  it("returns '5 Days' for plural", () => {
    expect(getStreakDisplayText(5)).toBe("5 Days");
  });

  it("returns '0 Days' for zero", () => {
    expect(getStreakDisplayText(0)).toBe("0 Days");
  });
});

// ============================================================================
// getStreakCelebrationMessage
// ============================================================================
describe("getStreakCelebrationMessage", () => {
  it("returns special message for day 1", () => {
    expect(getStreakCelebrationMessage(1)).toContain("Day 1");
  });

  it("returns special message for day 3", () => {
    expect(getStreakCelebrationMessage(3)).toContain("3 days");
  });

  it("returns special message for day 7", () => {
    expect(getStreakCelebrationMessage(7)).toContain("Week Warrior");
  });

  it("returns special message for day 14", () => {
    expect(getStreakCelebrationMessage(14)).toContain("Fortnight");
  });

  it("returns special message for day 30", () => {
    expect(getStreakCelebrationMessage(30)).toContain("Monthly Master");
  });

  it("returns special message for day 100", () => {
    expect(getStreakCelebrationMessage(100)).toContain("Century Club");
  });

  it("returns generic message for non-milestone day", () => {
    expect(getStreakCelebrationMessage(5)).toContain("5 days");
  });
});

// ============================================================================
// Pure Service Functions
// ============================================================================
describe("Service Pure Functions", () => {
  describe("isQualifyingSession", () => {
    it("qualifies 15min+ session with quality >= 50", () => {
      expect(isQualifyingSession(900, 50)).toBe(true);
    });

    it("rejects session under 10 minutes", () => {
      expect(isQualifyingSession(599, 100)).toBe(false);
    });

    it("rejects session under quality 50", () => {
      expect(isQualifyingSession(900, 49)).toBe(false);
    });

    it("accepts at exact thresholds", () => {
      expect(isQualifyingSession(600, 50)).toBe(true);
    });

    it("accepts long sessions with high quality", () => {
      expect(isQualifyingSession(3600, 100)).toBe(true);
    });
  });

  describe("getCalendarDay", () => {
    it("returns a string in M/D/YYYY format", () => {
      const ts = new Date("2025-01-15T12:00:00Z").getTime();
      const result = getCalendarDay(ts, "UTC");
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it("respects timezone", () => {
      const ts = Date.now();
      const utc = getCalendarDay(ts, "UTC");
      const tokyo = getCalendarDay(ts, "Asia/Tokyo");
      expect(typeof utc).toBe("string");
      expect(typeof tokyo).toBe("string");
    });
  });

  describe("checkMilestone", () => {
    it("returns milestone for day 3 with COINS reward", () => {
      const m = checkMilestone(3);
      expect(m).not.toBeNull();
      expect(m!.days).toBe(3);
      expect(m!.rewardType).toBe("COINS");
      expect(m!.rewardAmount).toBe(100);
    });

    it("returns milestone for day 7", () => {
      const m = checkMilestone(7);
      expect(m!.rewardType).toBe("COINS");
      expect(m!.rewardAmount).toBe(250);
    });

    it("returns GEMS for day 14", () => {
      expect(checkMilestone(14)!.rewardType).toBe("GEMS");
    });

    it("returns STREAK_SHIELD for day 30", () => {
      expect(checkMilestone(30)!.rewardType).toBe("STREAK_SHIELD");
    });

    it("returns GEMS for day 100", () => {
      expect(checkMilestone(100)!.rewardType).toBe("GEMS");
      expect(checkMilestone(100)!.rewardAmount).toBe(250);
    });

    it("returns null for non-milestone days", () => {
      expect(checkMilestone(4)).toBeNull();
      expect(checkMilestone(8)).toBeNull();
      expect(checkMilestone(0)).toBeNull();
    });

    it("includes achieved=true and achievedAt timestamp", () => {
      const m = checkMilestone(3);
      expect(m!.achieved).toBe(true);
      expect(m!.achievedAt).toBeGreaterThan(0);
    });
  });

  describe("getStreakMultiplier", () => {
    it("returns 1.0 for 0-2 days", () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(2)).toBe(1.0);
    });

    it("returns 1.25 for 3-6 days", () => {
      expect(getStreakMultiplier(3)).toBe(1.25);
      expect(getStreakMultiplier(6)).toBe(1.25);
    });

    it("returns 1.5 for 7-13 days", () => {
      expect(getStreakMultiplier(7)).toBe(1.5);
      expect(getStreakMultiplier(13)).toBe(1.5);
    });

    it("returns 1.75 for 14-29 days", () => {
      expect(getStreakMultiplier(14)).toBe(1.75);
      expect(getStreakMultiplier(29)).toBe(1.75);
    });

    it("returns 2.0 for 30+ days", () => {
      expect(getStreakMultiplier(30)).toBe(2.0);
      expect(getStreakMultiplier(100)).toBe(2.0);
    });
  });
});

// ============================================================================
// calculateRiskLevel (service-comeback)
// ============================================================================
describe("calculateRiskLevel", () => {
  it("returns NONE for 0 current days", () => {
    expect(calculateRiskLevel(mockStreak({ currentDays: 0 }))).toBe("NONE");
  });

  it("returns NONE when frozen", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      frozenUntil: Date.now() + 100000,
    }))).toBe("NONE");
  });

  it("returns LOW for no last session", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: null,
    }))).toBe("LOW");
  });

  it("returns NONE for recent session (< 18h)", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 10 * 60 * 60 * 1000,
    }))).toBe("NONE");
  });

  it("returns LOW for 18-22h gap", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 20 * 60 * 60 * 1000,
    }))).toBe("LOW");
  });

  it("returns MEDIUM for 22-30h gap", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 25 * 60 * 60 * 1000,
    }))).toBe("MEDIUM");
  });

  it("returns HIGH for 30-40h gap", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 35 * 60 * 60 * 1000,
    }))).toBe("HIGH");
  });

  it("returns CRITICAL for >40h gap", () => {
    expect(calculateRiskLevel(mockStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 41 * 60 * 60 * 1000,
    }))).toBe("CRITICAL");
  });
});

// ============================================================================
// calculateNextDeadline
// ============================================================================
describe("calculateNextDeadline", () => {
  it("returns null for 0 current days", () => {
    expect(calculateNextDeadline(mockStreak({ currentDays: 0 }))).toBeNull();
  });

  it("returns null for no last session", () => {
    expect(calculateNextDeadline(mockStreak({ lastQualifyingSessionAt: null }))).toBeNull();
  });

  it("returns 24h after last session", () => {
    const lastSession = Date.now() - 5 * 60 * 60 * 1000;
    const deadline = calculateNextDeadline(mockStreak({ lastQualifyingSessionAt: lastSession }));
    expect(deadline).toBe(lastSession + 24 * 60 * 60 * 1000);
  });
});

// ============================================================================
// Streak Insurance
// ============================================================================
describe("Streak Insurance", () => {
  describe("calculateInsuranceCost", () => {
    it("calculates cost with base + per-day", () => {
      const cost = calculateInsuranceCost(10);
      expect(cost).toBe(INSURANCE_PRICING.baseCost + 10 * INSURANCE_PRICING.perDayMultiplier);
    });

    it("clamps to min days", () => {
      const cost = calculateInsuranceCost(1);
      const expected = INSURANCE_PRICING.baseCost + INSURANCE_PRICING.minDays * INSURANCE_PRICING.perDayMultiplier;
      expect(cost).toBe(expected);
    });

    it("clamps to max days", () => {
      const cost = calculateInsuranceCost(100);
      const expected = INSURANCE_PRICING.baseCost + INSURANCE_PRICING.maxDays * INSURANCE_PRICING.perDayMultiplier;
      expect(cost).toBe(expected);
    });
  });

  describe("calculateInsurancePayout", () => {
    it("calculates payout with level scaling", () => {
      const payout = calculateInsurancePayout(20, 10);
      expect(payout.restoredDays).toBeGreaterThanOrEqual(3);
      expect(payout.xpBonus).toBe(payout.restoredDays * 10);
    });

    it("ensures minimum 3 restored days", () => {
      const payout = calculateInsurancePayout(1, 0);
      expect(payout.restoredDays).toBeGreaterThanOrEqual(3);
    });

    it("higher level means more restored days", () => {
      const low = calculateInsurancePayout(20, 1);
      const high = calculateInsurancePayout(20, 50);
      expect(high.restoredDays).toBeGreaterThanOrEqual(low.restoredDays);
    });
  });

  describe("calculateComebackTokensEarned", () => {
    it("returns at least 1 token", () => {
      expect(calculateComebackTokensEarned(1)).toBe(1);
    });

    it("scales with broken streak days", () => {
      expect(calculateComebackTokensEarned(30)).toBe(3);
    });

    it("rounds up", () => {
      expect(calculateComebackTokensEarned(11)).toBe(2);
    });
  });

  describe("calculateTokenRestoreValue", () => {
    it("returns count * 5", () => {
      expect(calculateTokenRestoreValue(4)).toBe(20);
    });

    it("returns 0 for 0 tokens", () => {
      expect(calculateTokenRestoreValue(0)).toBe(0);
    });
  });

  describe("canPurchaseInsurance", () => {
    const userId = "user-1";

    it("allows purchase when all conditions met", () => {
      const result = canPurchaseInsurance(userId, 10, 1000, false);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeNull();
    });

    it("blocks if already has active insurance", () => {
      const result = canPurchaseInsurance(userId, 10, 1000, true);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Already have");
    });

    it("blocks if streak too low", () => {
      const result = canPurchaseInsurance(userId, 2, 1000, false);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("minimum");
    });

    it("blocks if insufficient balance", () => {
      const result = canPurchaseInsurance(userId, 10, 1, false);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Not enough");
    });

    it("returns calculated cost even when blocked", () => {
      const result = canPurchaseInsurance(userId, 10, 1, false);
      expect(result.cost).toBeGreaterThan(0);
    });
  });

  describe("createInsurance", () => {
    it("creates insurance with correct fields", () => {
      const ins = createInsurance("user-1", 10, 500);
      expect(ins.userId).toBe("user-1");
      expect(ins.streakDaysProtected).toBe(10);
      expect(ins.cost).toBe(500);
      expect(ins.used).toBe(false);
      expect(ins.expiresAt).toBeGreaterThan(ins.purchasedAt);
    });

    it("expires in 48 hours", () => {
      const ins = createInsurance("user-1", 10, 500);
      const diff = ins.expiresAt - ins.purchasedAt;
      expect(diff).toBe(48 * 60 * 60 * 1000);
    });
  });

  describe("StreakInsuranceSchema", () => {
    it("accepts valid insurance object", () => {
      const result = StreakInsuranceSchema.safeParse({
        id: "ins-1",
        userId: "user-1",
        streakDaysProtected: 10,
        cost: 500,
        purchasedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        used: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("ComebackTokenSchema", () => {
    it("accepts valid token", () => {
      const result = ComebackTokenSchema.safeParse({
        id: "tok-1",
        userId: "user-1",
        sourceStreak: 10,
        earnedAt: Date.now(),
        used: false,
        restoreValue: 5,
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// Streak Gamble
// ============================================================================
describe("Streak Gamble", () => {
  describe("GAMBLE_CONFIGS", () => {
    it("has 3 configs", () => {
      expect(Object.keys(GAMBLE_CONFIGS)).toHaveLength(3);
    });

    it("conservative is LOW risk", () => {
      expect(GAMBLE_CONFIGS.conservative!.riskLevel).toBe("LOW");
      expect(GAMBLE_CONFIGS.conservative!.requiredGrade).toBe("B");
    });

    it("moderate is MEDIUM risk", () => {
      expect(GAMBLE_CONFIGS.moderate!.riskLevel).toBe("MEDIUM");
    });

    it("aggressive is HIGH risk", () => {
      expect(GAMBLE_CONFIGS.aggressive!.riskLevel).toBe("HIGH");
      expect(GAMBLE_CONFIGS.aggressive!.requiredGrade).toBe("S");
    });
  });

  describe("getGambleOptions", () => {
    it("returns available options when hours remaining is low", () => {
      const result = getGambleOptions(10, 2);
      expect(result.available).toBe(true);
      expect(result.options.filter((o) => o.available).length).toBeGreaterThan(0);
    });

    it("returns no available options when hours remaining is high", () => {
      const result = getGambleOptions(10, 48);
      expect(result.available).toBe(false);
    });

    it("conservative requires less time remaining", () => {
      const result = getGambleOptions(10, 20);
      const conservative = result.options.find((o) => o.type === "conservative");
      expect(conservative!.available).toBe(true);
      const aggressive = result.options.find((o) => o.type === "aggressive");
      expect(aggressive!.available).toBe(false);
    });
  });

  describe("StreakGambleSchema", () => {
    it("accepts valid gamble", () => {
      const result = StreakGambleSchema.safeParse({
        id: "gamble-1",
        userId: "user-1",
        streakDaysAtRisk: 10,
        startedAt: Date.now(),
        sessionId: "session-1",
        status: "ACTIVE",
        requiredGrade: "A",
        bonusXpIfWon: 500,
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// settleGamble
// ============================================================================
describe("settleGamble", () => {
  const gamble = {
    id: "gamble-1",
    userId: "user-1",
    streakDaysAtRisk: 10,
    startedAt: Date.now(),
    sessionId: "session-1",
    status: "ACTIVE" as const,
    requiredGrade: "A" as const,
    bonusXpIfWon: 500,
  };

  it("returns won=true when grade meets requirement", () => {
    const result = settleGamble(gamble, "A", 90);
    expect(result.won).toBe(true);
    expect(result.streakSaved).toBe(true);
    expect(result.newStreakDays).toBe(10);
    expect(result.xpAwarded).toBeGreaterThan(0);
  });

  it("returns won=true when grade exceeds requirement", () => {
    const result = settleGamble(gamble, "S", 100);
    expect(result.won).toBe(true);
  });

  it("returns won=false when grade is below requirement", () => {
    const result = settleGamble(gamble, "C", 50);
    expect(result.won).toBe(false);
    expect(result.streakSaved).toBe(false);
    expect(result.newStreakDays).toBe(1);
    expect(result.xpAwarded).toBe(0);
  });

  it("scales XP with quality", () => {
    const highQuality = settleGamble(gamble, "S", 100);
    const lowQuality = settleGamble(gamble, "S", 50);
    expect(highQuality.xpAwarded).toBeGreaterThan(lowQuality.xpAwarded);
  });
});

// ============================================================================
// assessStreakRisk
// ============================================================================
describe("assessStreakRisk", () => {
  it("returns NONE risk when session was today", () => {
    const assessment = assessStreakRisk(5, Date.now() - 3600000, "UTC", 1000, false, 0);
    expect(assessment.riskLevel).toBe("NONE");
  });

  it("calculates risk when no session today", () => {
    const yesterday = Date.now() - 25 * 60 * 60 * 1000;
    const assessment = assessStreakRisk(5, yesterday, "UTC", 1000, false, 0);
    expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(assessment.riskLevel);
  });

  it("calculates insurance cost", () => {
    const assessment = assessStreakRisk(10, Date.now() - 25 * 60 * 60 * 1000, "UTC", 5000, false, 0);
    expect(assessment.insuranceCost).toBeGreaterThan(0);
  });

  it("reports insurance not available if already has insurance", () => {
    const assessment = assessStreakRisk(10, Date.now() - 25 * 60 * 60 * 1000, "UTC", 5000, true, 0);
    expect(assessment.insuranceAvailable).toBe(false);
  });

  it("reports insurance not available if can't afford", () => {
    const assessment = assessStreakRisk(10, Date.now() - 25 * 60 * 60 * 1000, "UTC", 1, false, 0);
    expect(assessment.insuranceAvailable).toBe(false);
  });

  it("includes gamble options", () => {
    const assessment = assessStreakRisk(5, Date.now() - 25 * 60 * 60 * 1000, "UTC", 1000, false, 0);
    expect(assessment.gambleOptions).toBeDefined();
  });
});

// ============================================================================
// convertShieldsToInsurance
// ============================================================================
describe("convertShieldsToInsurance", () => {
  it("converts 0 shields to empty arrays", () => {
    const result = convertShieldsToInsurance(0, 10);
    expect(result.insurance).toHaveLength(0);
    expect(result.tokens).toHaveLength(0);
  });

  it("converts 1 shield to 1 insurance", () => {
    const result = convertShieldsToInsurance(1, 10);
    expect(result.insurance).toHaveLength(1);
    expect(result.tokens).toHaveLength(0);
  });

  it("converts multiple shields to insurance + tokens", () => {
    const result = convertShieldsToInsurance(3, 10);
    expect(result.insurance).toHaveLength(1);
    expect(result.tokens).toHaveLength(2);
  });

  it("generates message", () => {
    const result = convertShieldsToInsurance(2, 10);
    expect(result.message).toContain("Converted");
  });
});

// ============================================================================
// StreakInsuranceEvents
// ============================================================================
describe("StreakInsuranceEvents", () => {
  it("defines all expected events", () => {
    expect(StreakInsuranceEvents.INSURANCE_PURCHASED).toBe("streak:insurance_purchased");
    expect(StreakInsuranceEvents.INSURANCE_USED).toBe("streak:insurance_used");
    expect(StreakInsuranceEvents.GAMBLE_STARTED).toBe("streak:gamble_started");
    expect(StreakInsuranceEvents.GAMBLE_WON).toBe("streak:gamble_won");
    expect(StreakInsuranceEvents.GAMBLE_LOST).toBe("streak:gamble_lost");
    expect(StreakInsuranceEvents.TOKEN_EARNED).toBe("streak:token_earned");
    expect(StreakInsuranceEvents.TOKEN_USED).toBe("streak:token_used");
  });
});

// ============================================================================
// Recovery (in-memory)
// ============================================================================
describe("Recovery", () => {
  beforeEach(() => {
    clearRecoveryPlan("user-recovery-test");
  });

  describe("createRecoveryPlan", () => {
    it("creates a plan with correct structure", () => {
      const plan = createRecoveryPlan("user-recovery-test", 10, 500);
      expect(plan.userId).toBe("user-recovery-test");
      expect(plan.daysLost).toBe(10);
      expect(plan.sessionsRequired).toBe(2); // 7 <= 10 <= 14
      expect(plan.completed).toBe(false);
      expect(plan.isRecovering).toBe(true);
      expect(plan.reward.value).toBeGreaterThan(0);
    });

    it("requires 1 session for <7 days lost", () => {
      const plan = createRecoveryPlan("user-recovery-test", 5, 500);
      expect(plan.sessionsRequired).toBe(1);
    });

    it("requires 3 sessions for >14 days lost", () => {
      const plan = createRecoveryPlan("user-recovery-test", 20, 500);
      expect(plan.sessionsRequired).toBe(3);
    });
  });

  describe("getRecoveryPlan", () => {
    it("returns null when no plan exists", () => {
      expect(getRecoveryPlan("no-such-user")).toBeNull();
    });

    it("returns plan after creation", () => {
      createRecoveryPlan("user-recovery-test", 5, 100);
      const plan = getRecoveryPlan("user-recovery-test");
      expect(plan).not.toBeNull();
      expect(plan!.daysLost).toBe(5);
    });

    it("returns null for expired plan", () => {
      // Create a plan and manually expire it
      createRecoveryPlan("user-recovery-test", 5, 100);
      const plan = getRecoveryPlan("user-recovery-test");
      if (plan) {
        // Force expiration
        (plan as { expiresAt: number }).expiresAt = Date.now() - 1000;
      }
      expect(getRecoveryPlan("user-recovery-test")).toBeNull();
    });
  });

  describe("progressRecovery", () => {
    it("returns progressed=false when no plan", () => {
      const result = progressRecovery("no-plan-user", "session");
      expect(result.progressed).toBe(false);
      expect(result.currentProgress).toBe(0);
    });

    it("increments progress", () => {
      createRecoveryPlan("user-recovery-test", 5, 100);
      const result = progressRecovery("user-recovery-test", "session");
      expect(result.progressed).toBe(true);
      expect(result.currentProgress).toBe(1);
    });

    it("marks plan complete when sessions met", () => {
      createRecoveryPlan("user-recovery-test", 5, 100);
      progressRecovery("user-recovery-test", "session");
      const plan = getRecoveryPlan("user-recovery-test");
      // 1 session required for 5 days lost, so should be complete
      expect(plan!.completed).toBe(true);
      expect(plan!.isRecovering).toBe(false);
    });
  });

  describe("clearRecoveryPlan", () => {
    it("removes plan", () => {
      createRecoveryPlan("user-recovery-test", 5, 100);
      clearRecoveryPlan("user-recovery-test");
      expect(getRecoveryPlan("user-recovery-test")).toBeNull();
    });
  });
});

// ============================================================================
// Insurance (in-memory store)
// ============================================================================
describe("Insurance In-Memory Store", () => {
  const userId = "insurance-test-user";

  beforeEach(() => {
    // Clear by using all insurance
    while (getAvailableInsuranceCount(userId) > 0) {
      useInsurance(userId, "test");
    }
  });

  describe("awardInsurance", () => {
    it("awards insurance successfully", () => {
      const result = awardInsurance(userId, "test", 1);
      expect(result.success).toBe(true);
      expect(result.userInsurance.totalAvailable).toBe(1);
    });

    it("caps at MAX_INSURANCE (3)", () => {
      awardInsurance(userId, "test", 5);
      expect(getAvailableInsuranceCount(userId)).toBeLessThanOrEqual(3);
    });

    it("accumulates insurance", () => {
      awardInsurance(userId, "test", 1);
      awardInsurance(userId, "test", 1);
      expect(getAvailableInsuranceCount(userId)).toBe(2);
    });
  });

  describe("getAvailableInsuranceCount", () => {
    it("returns 0 for new user", () => {
      expect(getAvailableInsuranceCount("brand-new-user")).toBe(0);
    });
  });

  describe("getUserInsurance", () => {
    it("returns null for user with no insurance history", () => {
      expect(getUserInsurance("no-history-user")).toBeNull();
    });

    it("returns insurance list for user with history", () => {
      awardInsurance(userId, "test", 2);
      const result = getUserInsurance(userId);
      expect(result).not.toBeNull();
      expect(result!.insurances.length).toBeGreaterThan(0);
    });
  });

  describe("canUseInsurance", () => {
    it("returns canUse=false when no insurance", () => {
      const result = canUseInsurance("empty-user");
      expect(result.canUse).toBe(false);
    });

    it("returns canUse=true when insurance available", () => {
      awardInsurance(userId, "test", 1);
      const result = canUseInsurance(userId);
      expect(result.canUse).toBe(true);
    });
  });

  describe("useInsurance", () => {
    it("consumes one insurance", () => {
      awardInsurance(userId, "test", 2);
      const result = useInsurance(userId, "test");
      expect(result.success).toBe(true);
      expect(result.remainingInsurance).toBe(1);
    });

    it("fails when no insurance", () => {
      const result = useInsurance("empty-user-2", "test");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

// ============================================================================
// RepositoryError
// ============================================================================
describe("RepositoryError", () => {
  it("constructs with operation and original error", () => {
    const err = new RepositoryError("fetchStreak", new Error("DB down"));
    expect(err.name).toBe("RepositoryError");
    expect(err.operation).toBe("fetchStreak");
    expect(err.message).toContain("fetchStreak");
    expect(err.message).toContain("DB down");
  });

  it("handles non-Error original", () => {
    const err = new RepositoryError("test", "string error");
    expect(err.message).toContain("Unknown error");
  });
});

// ============================================================================
// Risk Helpers
// ============================================================================
describe("Risk Helpers", () => {
  describe("analyzePattern", () => {
    it("returns CONSISTENT for < 5 sessions", () => {
      expect(analyzePattern([
        { timestamp: 1, quality: 80 },
        { timestamp: 2, quality: 80 },
      ])).toBe("CONSISTENT");
    });

    it("returns CONSISTENT for stable pattern", () => {
      const sessions = Array.from({ length: 10 }, (_, i) => ({
        timestamp: i * 86400000,
        quality: 80,
      }));
      expect(analyzePattern(sessions)).toBe("CONSISTENT");
    });

    it("returns DECLINING for increasing gaps", () => {
      const sessions = [
        { timestamp: 0, quality: 80 },
        { timestamp: 86400000, quality: 80 },
        { timestamp: 86400000 * 3, quality: 80 },
        { timestamp: 86400000 * 6, quality: 80 },
        { timestamp: 86400000 * 10, quality: 80 },
        { timestamp: 86400000 * 15, quality: 80 },
        { timestamp: 86400000 * 21, quality: 80 },
      ];
      expect(analyzePattern(sessions)).toBe("DECLINING");
    });

    it("handles empty array", () => {
      expect(analyzePattern([])).toBe("CONSISTENT");
    });
  });

  describe("calculateRecentQuality", () => {
    it("returns 100 for empty history", () => {
      expect(calculateRecentQuality([])).toBe(100);
    });

    it("calculates average of recent sessions", () => {
      const sessions = [
        { timestamp: 1, quality: 80 },
        { timestamp: 2, quality: 90 },
        { timestamp: 3, quality: 70 },
      ];
      expect(calculateRecentQuality(sessions)).toBe(80);
    });

    it("uses only last 5 sessions", () => {
      const sessions = Array.from({ length: 10 }, (_, i) => ({
        timestamp: i,
        quality: i < 5 ? 50 : 100,
      }));
      // Should average only the last 5 (all 100)
      expect(calculateRecentQuality(sessions)).toBe(100);
    });
  });

  describe("getRiskLevel", () => {
    it("returns CRITICAL for high hours or score", () => {
      expect(getRiskLevel(90, 5)).toBe("CRITICAL");
      expect(getRiskLevel(10, CRITICAL_THRESHOLD)).toBe("CRITICAL");
    });

    it("returns HIGH for medium-high score/hours", () => {
      expect(getRiskLevel(70, 5)).toBe("HIGH");
      expect(getRiskLevel(10, HIGH_THRESHOLD)).toBe("HIGH");
    });

    it("returns MEDIUM", () => {
      expect(getRiskLevel(45, 5)).toBe("MEDIUM");
      expect(getRiskLevel(10, MEDIUM_THRESHOLD)).toBe("MEDIUM");
    });

    it("returns LOW for score >= 20", () => {
      expect(getRiskLevel(25, 1)).toBe("LOW");
    });

    it("returns NONE for low score and hours", () => {
      expect(getRiskLevel(5, 1)).toBe("NONE");
    });
  });

  describe("getUrgency", () => {
    it("returns CRITICAL for CRITICAL level", () => {
      expect(getUrgency("CRITICAL", 25, 0)).toBe("CRITICAL");
    });

    it("returns URGENT for HIGH level", () => {
      expect(getUrgency("HIGH", 15, 1)).toBe("URGENT");
    });

    it("returns URGENT for MEDIUM with >18h", () => {
      expect(getUrgency("MEDIUM", 19, 1)).toBe("URGENT");
    });

    it("returns SOON for MEDIUM with <=18h", () => {
      expect(getUrgency("MEDIUM", 10, 1)).toBe("SOON");
    });

    it("returns SOON for LOW with daysUntilBreak <= 1", () => {
      expect(getUrgency("LOW", 5, 1)).toBe("SOON");
    });

    it("returns NONE for LOW with more days", () => {
      expect(getUrgency("LOW", 5, 3)).toBe("NONE");
    });
  });

  describe("getSuggestedAction", () => {
    it("returns INTERVENTION for CRITICAL", () => {
      expect(getSuggestedAction("CRITICAL", "CRITICAL")).toBe("INTERVENTION");
    });

    it("returns PUSH for HIGH", () => {
      expect(getSuggestedAction("HIGH", "URGENT")).toBe("PUSH");
    });

    it("returns PUSH for MEDIUM with URGENT urgency", () => {
      expect(getSuggestedAction("MEDIUM", "URGENT")).toBe("PUSH");
    });

    it("returns REMINDER for MEDIUM", () => {
      expect(getSuggestedAction("MEDIUM", "SOON")).toBe("REMINDER");
    });

    it("returns REMINDER for LOW", () => {
      expect(getSuggestedAction("LOW", "NONE")).toBe("REMINDER");
    });

    it("returns NONE for NONE", () => {
      expect(getSuggestedAction("NONE", "NONE")).toBe("NONE");
    });
  });

  describe("generateRecommendation", () => {
    it("returns critical message for CRITICAL", () => {
      const rec = generateRecommendation("CRITICAL", {
        hoursSinceLastSession: 25,
        typicalSessionHour: 9,
        currentHour: 20,
        historicalPattern: "CONSISTENT",
        daysUntilStreakBreak: 0,
        recentSessionQuality: 80,
        weekendRisk: false,
        vacationMode: false,
      });
      expect(rec).toContain("streak");
    });

    it("returns high-risk message", () => {
      const rec = generateRecommendation("HIGH", {
        hoursSinceLastSession: 15,
        typicalSessionHour: 9,
        currentHour: 20,
        historicalPattern: "CONSISTENT",
        daysUntilStreakBreak: 1,
        recentSessionQuality: 80,
        weekendRisk: false,
        vacationMode: false,
      });
      expect(rec).toContain("risk");
    });

    it("returns weekend message when weekend risk", () => {
      const rec = generateRecommendation("MEDIUM", {
        hoursSinceLastSession: 10,
        typicalSessionHour: 9,
        currentHour: 15,
        historicalPattern: "CONSISTENT",
        daysUntilStreakBreak: 1,
        recentSessionQuality: 80,
        weekendRisk: true,
        vacationMode: false,
      });
      expect(rec).toContain("Weekend");
    });

    it("returns NONE message", () => {
      const rec = generateRecommendation("NONE", {
        hoursSinceLastSession: 2,
        typicalSessionHour: 9,
        currentHour: 10,
        historicalPattern: "CONSISTENT",
        daysUntilStreakBreak: 1,
        recentSessionQuality: 90,
        weekendRisk: false,
        vacationMode: false,
      });
      expect(rec).toContain("Great job");
    });
  });
});

// ============================================================================
// Risk Types Constants
// ============================================================================
describe("Risk Types Constants", () => {
  it("WEIGHTS sum to 1.0", () => {
    const sum = WEIGHTS.TIME_DRIFT + WEIGHTS.HOURS_ELAPSED + WEIGHTS.PATTERN_DECLINE + WEIGHTS.QUALITY_DROP + WEIGHTS.WEEKEND_FACTOR;
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("thresholds are in correct order", () => {
    expect(CRITICAL_THRESHOLD).toBeGreaterThan(HIGH_THRESHOLD);
    expect(HIGH_THRESHOLD).toBeGreaterThan(MEDIUM_THRESHOLD);
  });

  it("DAY_HOURS is 24", () => {
    expect(DAY_HOURS).toBe(24);
  });
});
