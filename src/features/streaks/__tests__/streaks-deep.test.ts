/**
 * Deep Streaks Tests
 * Covers: service-comeback, streak-gamble, streak-insurance, streak-risk-assessment,
 * recovery, milestones edge cases, service-shields (mocked), riskHelpers.
 */

// ── Mocks ──────────────────────────────────────────────────────────────────

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../events/EventBus", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  }),
}));
jest.mock("../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));
jest.mock("../../../utils/uuid", () => ({
  v4: jest.fn(() => "mock-uuid-1234"),
}));
jest.mock("../../../persistence/MMKVStorageAdapter", () => ({
  MMKVStorageAdapter: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));
jest.mock("../repository", () => ({
  fetchStreak: jest.fn(),
  createStreak: jest.fn(),
  updateStreak: jest.fn(),
  recordShieldEarned: jest.fn(),
  recordShieldUsed: jest.fn(),
  getAvailableShield: jest.fn(),
}));
jest.mock("../restore-quest", () => ({
  hasUsedStreakRestoreThisMonth: jest.fn(() => Promise.resolve(false)),
}));
jest.mock("../repository-helpers", () => ({
  RepositoryError: class RepositoryError extends Error {},
}));

// ── Imports ────────────────────────────────────────────────────────────────

import {
  calculateRiskLevel,
  calculateNextDeadline,
  getStreakMultiplier,
} from "../service-comeback";

import {
  StreakGambleSchema,
  GAMBLE_CONFIGS,
  getGambleOptions,
} from "../streak-gamble";

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

import {
  settleGamble,
  assessStreakRisk,
  convertShieldsToInsurance,
  StreakInsuranceEvents,
} from "../streak-risk-assessment";

import {
  createRecoveryPlan,
  getRecoveryPlan,
  progressRecovery,
  clearRecoveryPlan,
} from "../recovery";

import {
  checkMilestones,
  getNextMilestone,
  getMilestoneProgress,
  getStreakDisplayText,
  getStreakCelebrationMessage,
} from "../milestones";

import { analyzePattern, calculateRecentQuality, getRiskLevel } from "../utils/riskHelpers";
import { WEIGHTS, CRITICAL_THRESHOLD, HIGH_THRESHOLD, MEDIUM_THRESHOLD } from "../utils/riskTypes";

import type { Streak } from "../schemas";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeStreak(overrides: Partial<Streak> = {}): Streak {
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    userId: "550e8400-e29b-41d4-a716-446655440001",
    currentDays: 5,
    longestDays: 10,
    lastQualifyingSessionAt: Date.now() - 2 * 60 * 60 * 1000,
    currentDayCompletedAt: null,
    frozenUntil: null,
    shieldsAvailable: 0,
    gracePeriodUsed: false,
    timezone: "UTC",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    ...overrides,
  };
}

// ============================================================================
// service-comeback
// ============================================================================

describe("service-comeback: calculateRiskLevel", () => {
  it("returns NONE for zero-day streak", () => {
    const streak = makeStreak({ currentDays: 0 });
    expect(calculateRiskLevel(streak)).toBe("NONE");
  });

  it("returns NONE for frozen streak", () => {
    const streak = makeStreak({
      currentDays: 5,
      frozenUntil: Date.now() + 3600000,
    });
    expect(calculateRiskLevel(streak)).toBe("NONE");
  });

  it("returns LOW for recent session", () => {
    const streak = makeStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 19 * 60 * 60 * 1000,
    });
    expect(calculateRiskLevel(streak)).toBe("LOW");
  });

  it("returns MEDIUM for 23-hour gap", () => {
    const streak = makeStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 23 * 60 * 60 * 1000,
    });
    expect(calculateRiskLevel(streak)).toBe("MEDIUM");
  });

  it("returns HIGH for 31-hour gap", () => {
    const streak = makeStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 31 * 60 * 60 * 1000,
    });
    expect(calculateRiskLevel(streak)).toBe("HIGH");
  });

  it("returns CRITICAL for 41-hour gap", () => {
    const streak = makeStreak({
      currentDays: 5,
      lastQualifyingSessionAt: Date.now() - 41 * 60 * 60 * 1000,
    });
    expect(calculateRiskLevel(streak)).toBe("CRITICAL");
  });

  it("returns LOW when no lastQualifyingSessionAt and active streak", () => {
    const streak = makeStreak({
      currentDays: 3,
      lastQualifyingSessionAt: null,
    });
    expect(calculateRiskLevel(streak)).toBe("LOW");
  });
});

describe("service-comeback: calculateNextDeadline", () => {
  it("returns null for zero-day streak", () => {
    const streak = makeStreak({ currentDays: 0 });
    expect(calculateNextDeadline(streak)).toBeNull();
  });

  it("returns null when no lastQualifyingSessionAt", () => {
    const streak = makeStreak({ lastQualifyingSessionAt: null });
    expect(calculateNextDeadline(streak)).toBeNull();
  });

  it("returns last session + 24h for active streak", () => {
    const lastSession = Date.now() - 5 * 60 * 60 * 1000;
    const streak = makeStreak({ lastQualifyingSessionAt: lastSession });
    expect(calculateNextDeadline(streak)).toBe(lastSession + 86400000);
  });
});

describe("service-comeback: getStreakMultiplier", () => {
  it("returns 1.0 for streaks under 3 days", () => {
    expect(getStreakMultiplier(0)).toBe(1.0);
    expect(getStreakMultiplier(2)).toBe(1.0);
  });

  it("returns 1.25 for 3-6 day streaks", () => {
    expect(getStreakMultiplier(3)).toBe(1.25);
    expect(getStreakMultiplier(6)).toBe(1.25);
  });

  it("returns 1.5 for 7-13 day streaks", () => {
    expect(getStreakMultiplier(7)).toBe(1.5);
    expect(getStreakMultiplier(13)).toBe(1.5);
  });

  it("returns 1.75 for 14-29 day streaks", () => {
    expect(getStreakMultiplier(14)).toBe(1.75);
    expect(getStreakMultiplier(29)).toBe(1.75);
  });

  it("returns 2.0 for 30+ day streaks", () => {
    expect(getStreakMultiplier(30)).toBe(2.0);
    expect(getStreakMultiplier(100)).toBe(2.0);
  });
});

// ============================================================================
// streak-gamble
// ============================================================================

describe("streak-gamble", () => {
  describe("StreakGambleSchema", () => {
    it("parses valid gamble", () => {
      const result = StreakGambleSchema.parse({
        id: "g1",
        userId: "u1",
        streakDaysAtRisk: 5,
        startedAt: Date.now(),
        sessionId: "s1",
        status: "ACTIVE",
        requiredGrade: "A",
        bonusXpIfWon: 500,
      });
      expect(result.status).toBe("ACTIVE");
    });

    it("rejects invalid status", () => {
      expect(() =>
        StreakGambleSchema.parse({
          id: "g1",
          userId: "u1",
          streakDaysAtRisk: 5,
          startedAt: Date.now(),
          sessionId: "s1",
          status: "INVALID",
          requiredGrade: "A",
          bonusXpIfWon: 500,
        }),
      ).toThrow();
    });
  });

  describe("GAMBLE_CONFIGS", () => {
    it("has conservative, moderate, aggressive", () => {
      expect(GAMBLE_CONFIGS.conservative).toBeDefined();
      expect(GAMBLE_CONFIGS.moderate).toBeDefined();
      expect(GAMBLE_CONFIGS.aggressive).toBeDefined();
    });

    it("conservative requires B grade", () => {
      expect(GAMBLE_CONFIGS.conservative.requiredGrade).toBe("B");
    });

    it("aggressive requires S grade", () => {
      expect(GAMBLE_CONFIGS.aggressive.requiredGrade).toBe("S");
    });
  });

  describe("getGambleOptions", () => {
    it("returns options with availability based on hours remaining", () => {
      const result = getGambleOptions(5, 3);
      expect(result.options).toHaveLength(3);
      // aggressive needs <=6h, moderate needs <=12h, conservative needs <=24h
      expect(result.available).toBe(true);
    });

    it("returns no available options when plenty of time left", () => {
      const result = getGambleOptions(5, 48);
      expect(result.available).toBe(false);
    });

    it("all options available with 1h remaining", () => {
      const result = getGambleOptions(10, 1);
      expect(result.options.every((o) => o.available)).toBe(true);
    });
  });
});

// ============================================================================
// streak-insurance
// ============================================================================

describe("streak-insurance", () => {
  describe("calculateInsuranceCost", () => {
    it("returns minimum cost for low streak days", () => {
      const cost = calculateInsuranceCost(1);
      expect(cost).toBe(
        INSURANCE_PRICING.baseCost +
          INSURANCE_PRICING.minDays * INSURANCE_PRICING.perDayMultiplier,
      );
    });

    it("scales with streak days", () => {
      const cost5 = calculateInsuranceCost(5);
      const cost10 = calculateInsuranceCost(10);
      expect(cost10).toBeGreaterThan(cost5);
    });

    it("caps at maxDays", () => {
      const cost30 = calculateInsuranceCost(30);
      const cost50 = calculateInsuranceCost(50);
      expect(cost30).toBe(cost50);
    });
  });

  describe("calculateInsurancePayout", () => {
    it("restores at least 3 days", () => {
      const payout = calculateInsurancePayout(5, 1);
      expect(payout.restoredDays).toBeGreaterThanOrEqual(3);
    });

    it("increases with user level", () => {
      const low = calculateInsurancePayout(20, 1);
      const high = calculateInsurancePayout(20, 50);
      expect(high.restoredDays).toBeGreaterThanOrEqual(low.restoredDays);
    });

    it("xpBonus is 10 per restored day", () => {
      const payout = calculateInsurancePayout(10, 10);
      expect(payout.xpBonus).toBe(payout.restoredDays * 10);
    });
  });

  describe("calculateComebackTokensEarned", () => {
    it("returns at least 1 token", () => {
      expect(calculateComebackTokensEarned(5)).toBeGreaterThanOrEqual(1);
    });

    it("returns more tokens for longer broken streaks", () => {
      const short = calculateComebackTokensEarned(5);
      const long = calculateComebackTokensEarned(50);
      expect(long).toBeGreaterThanOrEqual(short);
    });

    it("scales roughly by 10 days per token", () => {
      expect(calculateComebackTokensEarned(15)).toBe(2);
      expect(calculateComebackTokensEarned(30)).toBe(3);
    });
  });

  describe("calculateTokenRestoreValue", () => {
    it("returns 5 per token", () => {
      expect(calculateTokenRestoreValue(1)).toBe(5);
      expect(calculateTokenRestoreValue(3)).toBe(15);
    });
  });

  describe("canPurchaseInsurance", () => {
    it("allows purchase when all conditions met", () => {
      const result = canPurchaseInsurance("u1", 10, 10000, false);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeNull();
    });

    it("blocks when already has active insurance", () => {
      const result = canPurchaseInsurance("u1", 10, 10000, true);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("active");
    });

    it("blocks when streak too short", () => {
      const result = canPurchaseInsurance("u1", 2, 10000, false);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("minimum");
    });

    it("blocks when insufficient balance", () => {
      const result = canPurchaseInsurance("u1", 10, 0, false);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("progress");
    });

    it("includes cost in result", () => {
      const result = canPurchaseInsurance("u1", 10, 10000, false);
      expect(result.cost).toBe(calculateInsuranceCost(10));
    });
  });

  describe("createInsurance", () => {
    it("creates insurance with correct fields", () => {
      const ins = createInsurance("user-1", 10, 750);
      expect(ins.userId).toBe("user-1");
      expect(ins.streakDaysProtected).toBe(10);
      expect(ins.cost).toBe(750);
      expect(ins.used).toBe(false);
      expect(ins.expiresAt).toBeGreaterThan(Date.now());
    });
  });

  describe("StreakInsuranceSchema", () => {
    it("parses valid insurance", () => {
      const result = StreakInsuranceSchema.parse({
        id: "ins1",
        userId: "u1",
        streakDaysProtected: 10,
        cost: 750,
        purchasedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        used: false,
      });
      expect(result.used).toBe(false);
    });
  });

  describe("ComebackTokenSchema", () => {
    it("parses valid token", () => {
      const result = ComebackTokenSchema.parse({
        id: "tok1",
        userId: "u1",
        sourceStreak: 15,
        earnedAt: Date.now(),
        used: false,
        restoreValue: 5,
      });
      expect(result.restoreValue).toBe(5);
    });
  });
});

// ============================================================================
// streak-risk-assessment
// ============================================================================

describe("streak-risk-assessment", () => {
  describe("settleGamble", () => {
    const gamble = {
      id: "g1",
      userId: "u1",
      streakDaysAtRisk: 7,
      startedAt: Date.now(),
      sessionId: "s1",
      status: "ACTIVE" as const,
      requiredGrade: "A" as const,
      bonusXpIfWon: 500,
    };

    it("wins when grade meets requirement", () => {
      const result = settleGamble(gamble, "S", 90);
      expect(result.won).toBe(true);
      expect(result.streakSaved).toBe(true);
      expect(result.newStreakDays).toBe(7);
    });

    it("wins when grade equals requirement", () => {
      const result = settleGamble(gamble, "A", 80);
      expect(result.won).toBe(true);
    });

    it("loses when grade below requirement", () => {
      const result = settleGamble(gamble, "C", 50);
      expect(result.won).toBe(false);
      expect(result.streakSaved).toBe(false);
      expect(result.newStreakDays).toBe(1);
    });

    it("awards XP based on quality when won", () => {
      const result = settleGamble(gamble, "S", 100);
      expect(result.xpAwarded).toBe(500);
    });

    it("scales XP by quality percentage", () => {
      const result = settleGamble(gamble, "A", 50);
      expect(result.xpAwarded).toBe(250);
    });
  });

  describe("assessStreakRisk", () => {
    it("returns NONE risk when session completed today", () => {
      const assessment = assessStreakRisk(
        5,
        Date.now(),
        "UTC",
        10000,
        false,
        0,
      );
      expect(assessment.riskLevel).toBe("NONE");
    });

    it("returns elevated risk based on time of day", () => {
      const assessment = assessStreakRisk(
        5,
        null,
        "UTC",
        10000,
        false,
        0,
      );
      expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(
        assessment.riskLevel,
      );
    });

    it("includes insurance cost in result", () => {
      const assessment = assessStreakRisk(10, null, "UTC", 10000, false, 0);
      expect(assessment.insuranceCost).toBe(calculateInsuranceCost(10));
    });

    it("insurance not available when already active", () => {
      const assessment = assessStreakRisk(10, null, "UTC", 10000, true, 0);
      expect(assessment.insuranceAvailable).toBe(false);
    });
  });

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

    it("converts extra shields to tokens", () => {
      const result = convertShieldsToInsurance(3, 10);
      expect(result.insurance).toHaveLength(1);
      expect(result.tokens).toHaveLength(2);
    });
  });

  describe("StreakInsuranceEvents", () => {
    it("defines all event types", () => {
      expect(StreakInsuranceEvents.INSURANCE_PURCHASED).toBeTruthy();
      expect(StreakInsuranceEvents.INSURANCE_USED).toBeTruthy();
      expect(StreakInsuranceEvents.GAMBLE_STARTED).toBeTruthy();
      expect(StreakInsuranceEvents.GAMBLE_WON).toBeTruthy();
      expect(StreakInsuranceEvents.GAMBLE_LOST).toBeTruthy();
      expect(StreakInsuranceEvents.TOKEN_EARNED).toBeTruthy();
      expect(StreakInsuranceEvents.TOKEN_USED).toBeTruthy();
    });
  });
});

// ============================================================================
// recovery
// ============================================================================

describe("recovery", () => {
  beforeEach(() => {
    clearRecoveryPlan("user-r1");
    clearRecoveryPlan("user-r2");
  });

  describe("createRecoveryPlan", () => {
    it("creates a plan with correct fields", () => {
      const plan = createRecoveryPlan("user-r1", 5, 100);
      expect(plan.userId).toBe("user-r1");
      expect(plan.daysLost).toBe(5);
      expect(plan.completed).toBe(false);
      expect(plan.isRecovering).toBe(true);
      expect(plan.sessionsRequired).toBe(1);
      expect(plan.expiresAt).toBeGreaterThan(Date.now());
    });

    it("requires 2 sessions for 7-14 days lost", () => {
      const plan = createRecoveryPlan("user-r2", 10, 200);
      expect(plan.sessionsRequired).toBe(2);
    });

    it("requires 3 sessions for 15+ days lost", () => {
      const plan = createRecoveryPlan("user-r1", 20, 300);
      expect(plan.sessionsRequired).toBe(3);
    });

    it("calculates reward based on days lost", () => {
      const plan = createRecoveryPlan("user-r1", 5, 100);
      expect(plan.reward.value).toBe(Math.max(100, 5 * 50));
    });
  });

  describe("getRecoveryPlan", () => {
    it("returns null when no plan exists", () => {
      expect(getRecoveryPlan("no-plan")).toBeNull();
    });

    it("returns plan after creation", () => {
      createRecoveryPlan("user-r1", 3, 50);
      const plan = getRecoveryPlan("user-r1");
      expect(plan).not.toBeNull();
      expect(plan!.daysLost).toBe(3);
    });
  });

  describe("progressRecovery", () => {
    it("returns not progressed when no plan", () => {
      const result = progressRecovery("nobody", "session_complete");
      expect(result.progressed).toBe(false);
      expect(result.currentProgress).toBe(0);
    });

    it("increments progress", () => {
      createRecoveryPlan("user-r1", 5, 100);
      const result = progressRecovery("user-r1", "session_complete");
      expect(result.progressed).toBe(true);
      expect(result.currentProgress).toBe(1);
    });

    it("marks completed when enough sessions", () => {
      createRecoveryPlan("user-r1", 5, 100);
      progressRecovery("user-r1", "session_complete");
      const plan = getRecoveryPlan("user-r1");
      expect(plan!.completed).toBe(true);
      expect(plan!.isRecovering).toBe(false);
    });
  });

  describe("clearRecoveryPlan", () => {
    it("removes the plan", () => {
      createRecoveryPlan("user-r1", 3, 50);
      clearRecoveryPlan("user-r1");
      expect(getRecoveryPlan("user-r1")).toBeNull();
    });
  });
});

// ============================================================================
// milestones edge cases
// ============================================================================

describe("milestones edge cases", () => {
  describe("checkMilestones", () => {
    it("returns empty for non-milestone days", () => {
      expect(checkMilestones(4)).toHaveLength(0);
      expect(checkMilestones(10)).toHaveLength(0);
    });

    it("returns milestone for day 7", () => {
      const result = checkMilestones(7);
      expect(result).toHaveLength(1);
      expect(result[0]!.days).toBe(7);
    });

    it("returns milestone for day 30", () => {
      const result = checkMilestones(30);
      expect(result).toHaveLength(1);
    });
  });

  describe("getNextMilestone", () => {
    it("returns first milestone for day 0", () => {
      const next = getNextMilestone(0);
      expect(next).not.toBeNull();
      expect(next!.days).toBe(3);
    });

    it("returns null when all milestones passed", () => {
      const next = getNextMilestone(400);
      expect(next).toBeNull();
    });
  });

  describe("getMilestoneProgress", () => {
    it("returns 100% at exact milestone", () => {
      const result = getMilestoneProgress(7);
      expect(result.percentComplete).toBe(100);
      expect(result.nextMilestone).not.toBeNull();
    });

    it("returns 100% when past all milestones", () => {
      const result = getMilestoneProgress(400);
      expect(result.percentComplete).toBe(100);
      expect(result.nextMilestone).toBeNull();
    });

    it("calculates correct percentage between milestones", () => {
      const result = getMilestoneProgress(5);
      // next milestone is 7
      expect(result.percentComplete).toBeGreaterThan(0);
      expect(result.percentComplete).toBeLessThan(100);
    });
  });

  describe("getStreakDisplayText", () => {
    it("singular for 1 day", () => {
      expect(getStreakDisplayText(1)).toBe("1 Day");
    });

    it("plural for multiple days", () => {
      expect(getStreakDisplayText(5)).toBe("5 Days");
    });

    it("handles zero", () => {
      expect(getStreakDisplayText(0)).toBe("0 Days");
    });
  });

  describe("getStreakCelebrationMessage", () => {
    it("returns special message for day 1", () => {
      expect(getStreakCelebrationMessage(1)).toContain("Day 1");
    });

    it("returns special message for day 7", () => {
      expect(getStreakCelebrationMessage(7)).toContain("Week Warrior");
    });

    it("returns special message for day 100", () => {
      expect(getStreakCelebrationMessage(100)).toContain("Century Club");
    });

    it("returns generic message for non-milestone days", () => {
      expect(getStreakCelebrationMessage(5)).toContain("5 days");
    });
  });
});

// ============================================================================
// riskHelpers
// ============================================================================

describe("riskHelpers: analyzePattern", () => {
  it("returns CONSISTENT for fewer than 5 sessions", () => {
    expect(
      analyzePattern([
        { timestamp: 1000, quality: 80 },
        { timestamp: 2000, quality: 85 },
      ]),
    ).toBe("CONSISTENT");
  });

  it("returns CONSISTENT for evenly spaced sessions", () => {
    const now = Date.now();
    const sessions = Array.from({ length: 6 }, (_, i) => ({
      timestamp: now - (5 - i) * 86400000,
      quality: 80,
    }));
    expect(analyzePattern(sessions)).toBe("CONSISTENT");
  });

  it("returns DECLINING for increasing gaps", () => {
    const now = Date.now();
    const d = 86400000;
    const sessions = [
      { timestamp: now - 20 * d, quality: 80 },
      { timestamp: now - 19 * d, quality: 80 },
      { timestamp: now - 17 * d, quality: 80 },
      { timestamp: now - 14 * d, quality: 80 },
      { timestamp: now - 10 * d, quality: 80 },
      { timestamp: now - 5 * d, quality: 80 },
    ];
    // gaps: 1, 2, 3, 4, 5 → 4/4 increasing → 1.0 > 0.7 → DECLINING
    expect(analyzePattern(sessions)).toBe("DECLINING");
  });
});

describe("riskHelpers: calculateRecentQuality", () => {
  it("returns 100 for empty history", () => {
    expect(calculateRecentQuality([])).toBe(100);
  });

  it("averages last 5 sessions", () => {
    const sessions = [
      { timestamp: 1, quality: 80 },
      { timestamp: 2, quality: 90 },
      { timestamp: 3, quality: 70 },
    ];
    expect(calculateRecentQuality(sessions)).toBe(80);
  });

  it("only uses last 5 when more exist", () => {
    const sessions = [
      { timestamp: 1, quality: 100 },
      { timestamp: 2, quality: 100 },
      { timestamp: 3, quality: 100 },
      { timestamp: 4, quality: 100 },
      { timestamp: 5, quality: 100 },
      { timestamp: 6, quality: 80 },
      { timestamp: 7, quality: 80 },
    ];
    // last 5: 100, 100, 100, 80, 80 -> avg = 92
    expect(calculateRecentQuality(sessions)).toBe(92);
  });
});

describe("riskHelpers: getRiskLevel", () => {
  it("returns CRITICAL for high hours", () => {
    expect(getRiskLevel(0, CRITICAL_THRESHOLD)).toBe("CRITICAL");
  });

  it("returns CRITICAL for high score", () => {
    expect(getRiskLevel(85, 0)).toBe("CRITICAL");
  });

  it("returns HIGH for moderate-high values", () => {
    expect(getRiskLevel(65, 0)).toBe("HIGH");
  });

  it("returns MEDIUM for moderate values", () => {
    expect(getRiskLevel(40, 0)).toBe("MEDIUM");
  });

  it("returns LOW for low-moderate values", () => {
    expect(getRiskLevel(20, 2)).toBe("LOW");
  });

  it("returns NONE for safe values", () => {
    expect(getRiskLevel(0, 0)).toBe("NONE");
  });
});

// ============================================================================
// riskTypes constants
// ============================================================================

describe("riskTypes constants", () => {
  it("WEIGHTS sum to 1.0", () => {
    const sum =
      WEIGHTS.TIME_DRIFT +
      WEIGHTS.HOURS_ELAPSED +
      WEIGHTS.PATTERN_DECLINE +
      WEIGHTS.QUALITY_DROP +
      WEIGHTS.WEEKEND_FACTOR;
    expect(sum).toBeCloseTo(1.0, 5);
  });

  it("thresholds are in correct order", () => {
    expect(CRITICAL_THRESHOLD).toBeGreaterThan(HIGH_THRESHOLD);
    expect(HIGH_THRESHOLD).toBeGreaterThan(MEDIUM_THRESHOLD);
  });
});
