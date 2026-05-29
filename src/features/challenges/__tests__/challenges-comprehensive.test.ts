/**
 * Comprehensive Tests for the Challenges Feature
 *
 * Covers: schemas, errors, helpers, service, queries, category-gate,
 * basic-challenge-types, analytics (metrics + health), validation,
 * session-integration helpers, and repository error class.
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// ─── Mocks (must come before imports under test) ────────────────────────────

jest.mock("../../../events", () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));

jest.mock("../repository");
jest.mock("../../../rewards/RewardService", () => ({
  getRewardService: jest.fn(() => ({
    grantReward: jest.fn().mockResolvedValue(undefined),
  })),
}));
jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
}));
jest.mock("../../../config/supabase", () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    })),
  })),
}));
jest.mock("../../../analytics", () => ({
  getAnalyticsService: jest.fn(() => ({
    track: jest.fn(),
  })),
}));
jest.mock("../../../utils/debug", () => ({
  createDebugger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  })),
}));
jest.mock("../../../store", () => ({
  useAuthStore: jest.fn(() => ({ user: { id: "user-1" } })),
}));

// ─── Imports under test ─────────────────────────────────────────────────────

import * as repository from "../repository";
import { eventBus } from "../../../events";
import {
  assignChallenge,
  updateChallengeProgress,
  claimChallengeReward,
  checkChallengeProgress,
} from "../service";
import {
  getActiveChallenges,
  getCompletedChallenges,
  getUserChallengeSummaries,
  checkRerollEligibility,
  rerollChallenge,
} from "../queries";
import {
  ChallengeError,
  ChallengeNotFoundError,
  ChallengeNotActiveError,
  RerollNotAllowedError,
  RerollLimitExceededError,
  InsufficientGemsForRerollError,
} from "../errors";
import { CONFIG, rewardBundleFor, inferTriggerDelta } from "../helpers";
import {
  isEconomyCategory,
  isBehaviorCategory,
  filterBehaviorCategories,
} from "../category-gate";
import {
  getRequiredCount,
  CONFIG as BasicConfig,
} from "../basic-challenge-types";
import {
  calculateChallengeMetrics,
  calculateDifficultyMetrics,
} from "../analytics/metrics";
import { checkChallengesHealth } from "../analytics/health";
import {
  validateChallengeCompletion,
  analyzeChallengeBalance,
  ChallengeDifficultySchema,
  ChallengeCompletionSchema,
} from "../utils/validation";
import {
  calculateChallengeContribution,
  getChallengeCTA,
} from "../session-challenges-integration";
import { RepositoryError } from "../repository-helpers";

// Schema imports
import {
  ChallengeTypeSchema,
  ChallengeStatusSchema,
  ChallengeCategorySchema,
  ChallengeDifficultySchema as MainDifficultySchema,
  DailyChallengeTriggerTypeSchema,
  ChallengeSchema,
  ChallengeTemplateSchema,
  UserChallengeSchema,
  ProgressHistoryEntrySchema,
  ChallengeRewardSchema,
  ChallengeCompletionResultSchema,
  UserChallengeSummarySchema,
  ChallengeDetailSchema,
  RerollResultSchema,
  RerollEligibilitySchema,
  AssignChallengeInputSchema,
  UpdateChallengeProgressInputSchema,
  RerollChallengeInputSchema,
  ClaimChallengeRewardInputSchema,
  ChallengeGenerationConfigSchema,
  DailyChallengeContextSchema,
} from "../schemas";

// Schema helpers
import { asRecord, readString, readNumber, readBoolean } from "../schemas/helpers";

const mockedRepo = jest.mocked(repository);
const mockedEventBus = jest.mocked(eventBus);

// ─── Shared fixtures ────────────────────────────────────────────────────────

const NOW = Date.now();

function makeChallenge(overrides: Record<string, unknown> = {}) {
  return ChallengeSchema.parse({
    id: "c-1",
    seasonId: "season-1",
    type: "DAILY",
    category: "SESSIONS",
    title: "Test Challenge",
    description: "Do the thing",
    targetValue: 5,
    targetType: "SESSIONS",
    rewardType: "XP",
    rewardAmount: 100,
    ...overrides,
  });
}

function makeUserChallenge(overrides: Record<string, unknown> = {}) {
  return UserChallengeSchema.parse({
    id: "uc-1",
    userId: "user-1",
    challengeId: "c-1",
    currentValue: 0,
    status: "ACTIVE",
    assignedAt: NOW - 10000,
    ...overrides,
  });
}

// ─── Test Suites ────────────────────────────────────────────────────────────

describe("Challenges Feature — Comprehensive Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. Enum Schemas
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Enum Schemas", () => {
    it("ChallengeTypeSchema accepts valid types", () => {
      expect(ChallengeTypeSchema.parse("DAILY")).toBe("DAILY");
      expect(ChallengeTypeSchema.parse("WEEKLY")).toBe("WEEKLY");
      expect(ChallengeTypeSchema.parse("EVENT")).toBe("EVENT");
    });

    it("ChallengeTypeSchema rejects invalid type", () => {
      expect(() => ChallengeTypeSchema.parse("HOURLY")).toThrow();
    });

    it("ChallengeStatusSchema accepts all statuses", () => {
      const statuses = ["ACTIVE", "COMPLETED", "CLAIMED", "EXPIRED", "REROLLED", "ABANDONED"];
      for (const s of statuses) {
        expect(ChallengeStatusSchema.parse(s)).toBe(s);
      }
    });

    it("ChallengeStatusSchema rejects invalid status", () => {
      expect(() => ChallengeStatusSchema.parse("PENDING")).toThrow();
    });

    it("ChallengeCategorySchema accepts all categories", () => {
      const cats = [
        "SESSIONS", "MINUTES", "STREAK", "BOSS_DAMAGE", "SQUAD_ACTIVITY",
        "SHOP_PURCHASE", "LEVEL_UP", "ACHIEVEMENT", "SOCIAL",
      ];
      for (const c of cats) {
        expect(ChallengeCategorySchema.parse(c)).toBe(c);
      }
    });

    it("ChallengeCategorySchema rejects unknown category", () => {
      expect(() => ChallengeCategorySchema.parse("MYSTERY")).toThrow();
    });

    it("ChallengeDifficultySchema accepts all difficulties", () => {
      for (const d of ["EASY", "MEDIUM", "HARD", "EXPERT"]) {
        expect(MainDifficultySchema.parse(d)).toBe(d);
      }
    });

    it("ChallengeDifficultySchema rejects invalid difficulty", () => {
      expect(() => MainDifficultySchema.parse("IMPOSSIBLE")).toThrow();
    });

    it("DailyChallengeTriggerTypeSchema accepts valid triggers", () => {
      const triggers = ["SESSION_COMPLETED", "MOOD_LOGGED", "STREAK_CHECKED", "PURITY_RECORDED", "STREAK_UPDATED"];
      for (const t of triggers) {
        expect(DailyChallengeTriggerTypeSchema.parse(t)).toBe(t);
      }
    });

    it("DailyChallengeTriggerTypeSchema rejects unknown trigger", () => {
      expect(() => DailyChallengeTriggerTypeSchema.parse("UNKNOWN")).toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. Core Schemas (with camelCase/snake_case preprocessing)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Core Schemas", () => {
    describe("ChallengeSchema", () => {
      it("parses a valid challenge with camelCase", () => {
        const challenge = ChallengeSchema.parse({
          id: "c-1",
          seasonId: "s-1",
          type: "DAILY",
          category: "SESSIONS",
          title: "Test",
          targetValue: 3,
          targetType: "SESSIONS",
          rewardType: "XP",
          rewardAmount: 50,
        });
        expect(challenge.id).toBe("c-1");
        expect(challenge.seasonId).toBe("s-1");
        expect(challenge.targetValue).toBe(3);
      });

      it("normalises snake_case keys from Supabase", () => {
        const challenge = ChallengeSchema.parse({
          id: "c-2",
          season_id: "s-2",
          type: "WEEKLY",
          category: "MINUTES",
          title: "Weekly",
          target_value: 120,
          target_type: "MINUTES",
          reward_type: "XP",
          reward_amount: 200,
          is_active: true,
          xp_bonus: 10,
          created_at: 1000,
        });
        expect(challenge.seasonId).toBe("s-2");
        expect(challenge.targetValue).toBe(120);
        expect(challenge.rewardType).toBe("XP");
        expect(challenge.isActive).toBe(true);
        expect(challenge.xpBonus).toBe(10);
        expect(challenge.createdAt).toBe(1000);
      });

      it("applies defaults for missing optional fields", () => {
        const challenge = ChallengeSchema.parse({
          id: "c-3",
          seasonId: "s-3",
          type: "EVENT",
          category: "STREAK",
          title: "Event",
          targetValue: 7,
          targetType: "DAYS",
        });
        expect(challenge.description).toBe("");
        expect(challenge.iconUrl).toBeNull();
        expect(challenge.rewardType).toBe("XP");
        expect(challenge.rewardAmount).toBe(0);
        expect(challenge.isActive).toBe(true);
        expect(challenge.difficulty).toBe("MEDIUM");
        expect(challenge.xpBonus).toBe(0);
      });

      it("rejects empty id", () => {
        expect(() =>
          ChallengeSchema.parse({ id: "", seasonId: "s", type: "DAILY", category: "SESSIONS", title: "T", targetValue: 1, targetType: "T" }),
        ).toThrow();
      });

      it("rejects negative targetValue", () => {
        expect(() =>
          ChallengeSchema.parse({ id: "c", seasonId: "s", type: "DAILY", category: "SESSIONS", title: "T", targetValue: -1, targetType: "T" }),
        ).toThrow();
      });
    });

    describe("UserChallengeSchema", () => {
      it("parses camelCase user challenge", () => {
        const uc = UserChallengeSchema.parse({
          id: "uc-1",
          userId: "u-1",
          challengeId: "c-1",
          currentValue: 3,
          status: "ACTIVE",
          assignedAt: NOW,
        });
        expect(uc.userId).toBe("u-1");
        expect(uc.currentValue).toBe(3);
        expect(uc.status).toBe("ACTIVE");
      });

      it("normalises snake_case from Supabase", () => {
        const uc = UserChallengeSchema.parse({
          id: "uc-2",
          user_id: "u-2",
          challenge_id: "c-2",
          current_value: 5,
          status: "COMPLETED",
          assigned_at: NOW,
          completed_at: NOW,
          claimed_at: null,
          expires_at: null,
          reroll_count: 0,
          rerolled_from_id: null,
          last_progress_at: NOW,
          progress_history: [],
          created_at: NOW,
        });
        expect(uc.userId).toBe("u-2");
        expect(uc.challengeId).toBe("c-2");
        expect(uc.currentValue).toBe(5);
        expect(uc.completedAt).toBe(NOW);
      });

      it("applies defaults for missing fields", () => {
        const uc = UserChallengeSchema.parse({
          id: "uc-3",
          userId: "u-3",
          challengeId: "c-3",
        });
        expect(uc.currentValue).toBe(0);
        expect(uc.status).toBe("ACTIVE");
        expect(uc.rerollCount).toBe(0);
        expect(uc.progressHistory).toEqual([]);
      });

      it("rejects empty userId", () => {
        expect(() =>
          UserChallengeSchema.parse({ id: "uc", userId: "", challengeId: "c" }),
        ).toThrow();
      });
    });

    describe("ChallengeTemplateSchema", () => {
      it("parses a valid template with camelCase", () => {
        const tpl = ChallengeTemplateSchema.parse({
          id: "tpl-1",
          category: "SESSIONS",
          type: "DAILY",
          titleTemplate: "Complete {count} sessions",
          descriptionTemplate: "Do sessions",
          minTarget: 1,
          maxTarget: 5,
          minReward: 10,
          maxReward: 100,
          rewardType: "XP",
          weight: 1,
        });
        expect(tpl.id).toBe("tpl-1");
        expect(tpl.minTarget).toBe(1);
      });

      it("normalises snake_case template fields", () => {
        const tpl = ChallengeTemplateSchema.parse({
          id: "tpl-2",
          category: "MINUTES",
          type: "WEEKLY",
          title_template: "Focus {minutes} min",
          description_template: "Focus time",
          min_target: 30,
          max_target: 120,
          min_reward: 25,
          max_reward: 200,
          reward_type: "XP",
          weight: 2,
          min_level: 5,
          requires_premium: true,
          requires_squad: false,
        });
        expect(tpl.titleTemplate).toBe("Focus {minutes} min");
        expect(tpl.minTarget).toBe(30);
        expect(tpl.requiresPremium).toBe(true);
        expect(tpl.requiresSquad).toBe(false);
      });
    });

    describe("ProgressHistoryEntrySchema", () => {
      it("parses a valid entry", () => {
        const entry = ProgressHistoryEntrySchema.parse({
          timestamp: NOW,
          value: 5,
          source: "session",
          delta: 1,
        });
        expect(entry.delta).toBe(1);
      });

      it("rejects negative value", () => {
        expect(() =>
          ProgressHistoryEntrySchema.parse({ timestamp: 0, value: -1, source: "test", delta: 0 }),
        ).toThrow();
      });

      it("rejects empty source", () => {
        expect(() =>
          ProgressHistoryEntrySchema.parse({ timestamp: 0, value: 0, source: "", delta: 0 }),
        ).toThrow();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. Input Schemas
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Input Schemas", () => {
    it("AssignChallengeInputSchema validates valid input", () => {
      const input = AssignChallengeInputSchema.parse({
        userId: "u-1",
        seasonId: "s-1",
        challengeType: "DAILY",
      });
      expect(input.challengeType).toBe("DAILY");
      expect(input.challengeId).toBeUndefined();
    });

    it("AssignChallengeInputSchema rejects empty userId", () => {
      expect(() =>
        AssignChallengeInputSchema.parse({ userId: "", seasonId: "s-1", challengeType: "DAILY" }),
      ).toThrow();
    });

    it("UpdateChallengeProgressInputSchema validates valid input", () => {
      const input = UpdateChallengeProgressInputSchema.parse({
        userId: "u-1",
        challengeId: "c-1",
        delta: 5,
        source: "session",
      });
      expect(input.delta).toBe(5);
    });

    it("UpdateChallengeProgressInputSchema rejects non-positive delta", () => {
      expect(() =>
        UpdateChallengeProgressInputSchema.parse({ userId: "u", challengeId: "c", delta: 0, source: "s" }),
      ).toThrow();
    });

    it("RerollChallengeInputSchema validates valid input", () => {
      const input = RerollChallengeInputSchema.parse({
        userId: "u-1",
        challengeId: "c-1",
        usePaidReroll: false,
      });
      expect(input.usePaidReroll).toBe(false);
    });

    it("ClaimChallengeRewardInputSchema validates valid input", () => {
      const input = ClaimChallengeRewardInputSchema.parse({
        userId: "u-1",
        challengeId: "c-1",
      });
      expect(input.userId).toBe("u-1");
    });

    it("ChallengeGenerationConfigSchema validates with defaults", () => {
      const config = ChallengeGenerationConfigSchema.parse({
        seasonId: "s-1",
        userId: "u-1",
        userLevel: 5,
        isPremium: false,
        hasSquad: false,
        challengeType: "DAILY",
      });
      expect(config.dailyChallengeCount).toBe(3);
      expect(config.weeklyChallengeCount).toBe(3);
    });

    it("DailyChallengeContextSchema accepts partial context", () => {
      const ctx = DailyChallengeContextSchema.parse({ minutesCompleted: 30 });
      expect(ctx.minutesCompleted).toBe(30);
      expect(ctx.sessionCount).toBeUndefined();
    });

    it("DailyChallengeContextSchema rejects out-of-range purity", () => {
      expect(() =>
        DailyChallengeContextSchema.parse({ purity: 150 }),
      ).toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. Response Schemas
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Response Schemas", () => {
    it("ChallengeRewardSchema validates a reward", () => {
      const reward = ChallengeRewardSchema.parse({
        type: "XP",
        amount: 100,
        itemId: null,
        delivered: false,
        deliveredAt: null,
      });
      expect(reward.type).toBe("XP");
    });

    it("ChallengeRewardSchema rejects negative amount", () => {
      expect(() =>
        ChallengeRewardSchema.parse({ type: "XP", amount: -1, itemId: null, delivered: false, deliveredAt: null }),
      ).toThrow();
    });

    it("ChallengeCompletionResultSchema validates a result", () => {
      const result = ChallengeCompletionResultSchema.parse({
        success: true,
        challengeId: "c-1",
        userId: "u-1",
        completedAt: NOW,
        rewards: [],
        xpEarned: 100,
        seasonProgressAdvanced: false,
        newTierUnlocked: false,
        timeToComplete: 5000,
        wasRerolled: false,
      });
      expect(result.success).toBe(true);
      expect(result.xpEarned).toBe(100);
    });

    it("UserChallengeSummarySchema validates a summary", () => {
      const summary = UserChallengeSummarySchema.parse({
        challengeId: "c-1",
        title: "Test",
        description: "desc",
        category: "SESSIONS",
        type: "DAILY",
        difficulty: "MEDIUM",
        currentValue: 2,
        targetValue: 5,
        progressPercent: 40,
        status: "ACTIVE",
        isClaimable: false,
        isExpired: false,
        expiresInMs: 3600000,
        rewardType: "XP",
        rewardAmount: 100,
        canReroll: true,
        rerollCost: 10,
        freeRerollAvailable: true,
        rerollCount: 0,
      });
      expect(summary.progressPercent).toBe(40);
    });

    it("ChallengeDetailSchema validates a detail", () => {
      const detail = ChallengeDetailSchema.parse({
        challenge: makeChallenge(),
        userChallenge: makeUserChallenge(),
        xpReward: 100,
        coinReward: 50,
        requiredCount: 5,
      });
      expect(detail.xpReward).toBe(100);
      expect(detail.requiredCount).toBe(5);
    });

    it("RerollResultSchema validates a result", () => {
      const result = RerollResultSchema.parse({
        success: false,
        oldChallengeId: "c-1",
        newChallengeId: "",
        newChallenge: null,
        gemsSpent: 0,
        freeRerollUsed: false,
        error: "not eligible",
        remainingGems: 0,
        remainingFreeRerollsToday: 0,
      });
      expect(result.success).toBe(false);
    });

    it("RerollEligibilitySchema validates eligibility", () => {
      const eligibility = RerollEligibilitySchema.parse({
        canReroll: true,
        reason: null,
        freeRerollAvailable: true,
        gemsRequired: 0,
        currentGems: 50,
        rerollCountToday: 0,
        maxRerollsPerDay: 10,
      });
      expect(eligibility.canReroll).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. Schema Helpers (asRecord, readString, readNumber, readBoolean)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Schema Helpers", () => {
    describe("asRecord", () => {
      it("returns the object if it is a record", () => {
        expect(asRecord({ a: 1 })).toEqual({ a: 1 });
      });

      it("returns empty object for null", () => {
        expect(asRecord(null)).toEqual({});
      });

      it("returns empty object for primitives", () => {
        expect(asRecord(42)).toEqual({});
        expect(asRecord("str")).toEqual({});
      });
    });

    describe("readString", () => {
      it("reads the first matching key", () => {
        expect(readString({ name: "Alice" }, "name")).toBe("Alice");
      });

      it("falls back to alternative key", () => {
        expect(readString({ full_name: "Bob" }, "name", "full_name")).toBe("Bob");
      });

      it("returns undefined if no key matches", () => {
        expect(readString({}, "name")).toBeUndefined();
      });

      it("returns undefined for empty string", () => {
        expect(readString({ name: "" }, "name")).toBeUndefined();
      });
    });

    describe("readNumber", () => {
      it("reads a numeric value", () => {
        expect(readNumber({ count: 42 }, "count")).toBe(42);
      });

      it("parses a string that can be parsed as a date", () => {
        // readNumber tries Date.parse first; any string parseable as a date returns the date value
        const result = readNumber({ count: "3.14" }, "count");
        // Date.parse("3.14") produces a valid timestamp in most engines
        expect(typeof result).toBe("number");
        expect(Number.isFinite(result!)).toBe(true);
      });

      it("returns undefined for non-numeric", () => {
        expect(readNumber({ count: "abc" }, "count")).toBeUndefined();
      });

      it("returns undefined for missing key", () => {
        expect(readNumber({}, "count")).toBeUndefined();
      });
    });

    describe("readBoolean", () => {
      it("reads a boolean value", () => {
        expect(readBoolean({ active: true }, "active")).toBe(true);
      });

      it("returns undefined for non-boolean", () => {
        expect(readBoolean({ active: "yes" }, "active")).toBeUndefined();
      });

      it("returns undefined for missing key", () => {
        expect(readBoolean({}, "active")).toBeUndefined();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. Error Classes
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Error Classes", () => {
    it("ChallengeError stores code and context", () => {
      const err = new ChallengeError("test msg", "TEST_CODE", { foo: "bar" });
      expect(err.message).toBe("test msg");
      expect(err.code).toBe("TEST_CODE");
      expect(err.context).toEqual({ foo: "bar" });
      expect(err.name).toBe("ChallengeError");
      expect(err).toBeInstanceOf(Error);
    });

    it("ChallengeNotFoundError includes challengeId", () => {
      const err = new ChallengeNotFoundError("c-123");
      expect(err.code).toBe("CHALLENGE_NOT_FOUND");
      expect(err.message).toContain("c-123");
      expect(err.context).toEqual({ challengeId: "c-123" });
    });

    it("ChallengeNotActiveError includes challengeId and status", () => {
      const err = new ChallengeNotActiveError("c-1", "CLAIMED");
      expect(err.code).toBe("CHALLENGE_NOT_ACTIVE");
      expect(err.context).toEqual({ challengeId: "c-1", status: "CLAIMED" });
    });

    it("RerollNotAllowedError is a ChallengeError", () => {
      const err = new RerollNotAllowedError("nope", "REROLL_NOT_ALLOWED");
      expect(err).toBeInstanceOf(ChallengeError);
    });

    it("RerollLimitExceededError is a ChallengeError", () => {
      const err = new RerollLimitExceededError("limit", "REROLL_LIMIT");
      expect(err).toBeInstanceOf(ChallengeError);
    });

    it("InsufficientGemsForRerollError is a ChallengeError", () => {
      const err = new InsufficientGemsForRerollError("gems", "INSUFFICIENT_GEMS");
      expect(err).toBeInstanceOf(ChallengeError);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Helpers", () => {
    describe("CONFIG", () => {
      it("has correct default values", () => {
        expect(CONFIG.FREE_REROLLS_PER_DAY).toBe(1);
        expect(CONFIG.PAID_REROLL_COST).toBe(10);
        expect(CONFIG.MAX_REROLLS_PER_DAY).toBe(10);
        expect(CONFIG.DAILY_CHALLENGE_EXPIRY_HOURS).toBe(24);
      });
    });

    describe("rewardBundleFor", () => {
      it("returns 50 coins for rewardAmount < 250", () => {
        const bundle = rewardBundleFor(makeChallenge({ rewardAmount: 100 }));
        expect(bundle.xpReward).toBe(100);
        expect(bundle.coinReward).toBe(50);
      });

      it("returns 100 coins for rewardAmount 250-499", () => {
        const bundle = rewardBundleFor(makeChallenge({ rewardAmount: 300 }));
        expect(bundle.xpReward).toBe(300);
        expect(bundle.coinReward).toBe(100);
      });

      it("returns 250 coins for rewardAmount >= 500", () => {
        const bundle = rewardBundleFor(makeChallenge({ rewardAmount: 600 }));
        expect(bundle.xpReward).toBe(600);
        expect(bundle.coinReward).toBe(250);
      });

      it("returns 250 coins for rewardAmount exactly 500", () => {
        const bundle = rewardBundleFor(makeChallenge({ rewardAmount: 500 }));
        expect(bundle.coinReward).toBe(250);
      });
    });

    describe("inferTriggerDelta", () => {
      it("returns minutesCompleted for MINUTES + SESSION_COMPLETED", () => {
        const challenge = makeChallenge({ category: "MINUTES" });
        expect(inferTriggerDelta(challenge, "SESSION_COMPLETED", { minutesCompleted: 30 })).toBe(30);
      });

      it("returns sessionCount for SESSIONS + SESSION_COMPLETED", () => {
        const challenge = makeChallenge({ category: "SESSIONS" });
        expect(inferTriggerDelta(challenge, "SESSION_COMPLETED", { sessionCount: 2 })).toBe(2);
      });

      it("defaults to 1 for SESSIONS + SESSION_COMPLETED when no sessionCount", () => {
        const challenge = makeChallenge({ category: "SESSIONS" });
        expect(inferTriggerDelta(challenge, "SESSION_COMPLETED", {})).toBe(1);
      });

      it("returns 1 for SOCIAL + MOOD_LOGGED when moodLogged is true", () => {
        const challenge = makeChallenge({ category: "SOCIAL" });
        expect(inferTriggerDelta(challenge, "MOOD_LOGGED", { moodLogged: true })).toBe(1);
      });

      it("returns 0 for SOCIAL + MOOD_LOGGED when moodLogged is false", () => {
        const challenge = makeChallenge({ category: "SOCIAL" });
        expect(inferTriggerDelta(challenge, "MOOD_LOGGED", { moodLogged: false })).toBe(0);
      });

      it("returns 1 for STREAK + STREAK_CHECKED when streakChecked is true", () => {
        const challenge = makeChallenge({ category: "STREAK" });
        expect(inferTriggerDelta(challenge, "STREAK_CHECKED", { streakChecked: true })).toBe(1);
      });

      it("returns 1 for BOSS_DAMAGE + PURITY_RECORDED when purity >= 80", () => {
        const challenge = makeChallenge({ category: "BOSS_DAMAGE" });
        expect(inferTriggerDelta(challenge, "PURITY_RECORDED", { purity: 90 })).toBe(1);
      });

      it("returns 0 for BOSS_DAMAGE + PURITY_RECORDED when purity < 80", () => {
        const challenge = makeChallenge({ category: "BOSS_DAMAGE" });
        expect(inferTriggerDelta(challenge, "PURITY_RECORDED", { purity: 50 })).toBe(0);
      });

      it("returns targetValue for ACHIEVEMENT + STREAK_UPDATED when streakDays >= target", () => {
        const challenge = makeChallenge({ category: "ACHIEVEMENT", targetValue: 7 });
        expect(inferTriggerDelta(challenge, "STREAK_UPDATED", { streakDays: 10 })).toBe(7);
      });

      it("returns 0 for ACHIEVEMENT + STREAK_UPDATED when streakDays < target", () => {
        const challenge = makeChallenge({ category: "ACHIEVEMENT", targetValue: 7 });
        expect(inferTriggerDelta(challenge, "STREAK_UPDATED", { streakDays: 3 })).toBe(0);
      });

      it("returns 0 for unmatched category/trigger combo", () => {
        const challenge = makeChallenge({ category: "SESSIONS" });
        expect(inferTriggerDelta(challenge, "MOOD_LOGGED", {})).toBe(0);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. Service Functions
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Service", () => {
    describe("assignChallenge", () => {
      it("assigns a challenge when challengeId is provided", async () => {
        const mockUC = makeUserChallenge();
        mockedRepo.createUserChallenge.mockResolvedValue(mockUC);
        const result = await assignChallenge({
          userId: "user-1",
          seasonId: "season-1",
          challengeType: "DAILY",
          challengeId: "c-1",
        });
        expect(result.id).toBe("uc-1");
        expect(mockedRepo.createUserChallenge).toHaveBeenCalledWith(
          "user-1",
          "c-1",
          expect.any(Number),
        );
      });

      it("throws ChallengeError when challengeId is missing", async () => {
        await expect(
          assignChallenge({
            userId: "user-1",
            seasonId: "season-1",
            challengeType: "DAILY",
          }),
        ).rejects.toThrow(ChallengeError);
      });

      it("rejects invalid input (empty userId)", async () => {
        await expect(
          assignChallenge({
            userId: "",
            seasonId: "s-1",
            challengeType: "DAILY",
            challengeId: "c-1",
          }),
        ).rejects.toThrow();
      });
    });

    describe("updateChallengeProgress", () => {
      it("returns null when target not yet reached", async () => {
        const challenge = makeChallenge({ targetValue: 10 });
        const uc = makeUserChallenge({ currentValue: 0, status: "ACTIVE" });
        mockedRepo.fetchUserChallenge.mockResolvedValue(uc);
        mockedRepo.fetchChallengeById.mockResolvedValue(challenge);
        mockedRepo.addChallengeProgress.mockResolvedValue(
          makeUserChallenge({ currentValue: 5, status: "ACTIVE" }),
        );

        const result = await updateChallengeProgress({
          userId: "user-1",
          challengeId: "c-1",
          delta: 5,
          source: "session",
        });
        expect(result).toBeNull();
      });

      it("returns completion result when target is reached", async () => {
        const challenge = makeChallenge({ targetValue: 5, rewardAmount: 200 });
        const uc = makeUserChallenge({ currentValue: 0, status: "ACTIVE", assignedAt: NOW - 10000 });
        mockedRepo.fetchUserChallenge.mockResolvedValue(uc);
        mockedRepo.fetchChallengeById.mockResolvedValue(challenge);
        mockedRepo.addChallengeProgress.mockResolvedValue(
          makeUserChallenge({ currentValue: 5, status: "ACTIVE" }),
        );
        mockedRepo.updateUserChallenge.mockResolvedValue(
          makeUserChallenge({ currentValue: 5, status: "COMPLETED" }),
        );

        const result = await updateChallengeProgress({
          userId: "user-1",
          challengeId: "c-1",
          delta: 5,
          source: "session",
        });
        expect(result).not.toBeNull();
        expect(result!.success).toBe(true);
        expect(result!.xpEarned).toBe(200);
        expect(result!.rewards.length).toBeGreaterThan(0);
      });

      it("throws ChallengeNotFoundError when challenge does not exist", async () => {
        mockedRepo.fetchUserChallenge.mockResolvedValue(null);
        mockedRepo.fetchChallengeById.mockResolvedValue(null);
        await expect(
          updateChallengeProgress({
            userId: "user-1",
            challengeId: "c-missing",
            delta: 1,
            source: "test",
          }),
        ).rejects.toThrow(ChallengeNotFoundError);
      });

      it("throws ChallengeNotActiveError when status is not ACTIVE", async () => {
        const uc = makeUserChallenge({ status: "COMPLETED" });
        const challenge = makeChallenge();
        mockedRepo.fetchUserChallenge.mockResolvedValue(uc);
        mockedRepo.fetchChallengeById.mockResolvedValue(challenge);
        await expect(
          updateChallengeProgress({
            userId: "user-1",
            challengeId: "c-1",
            delta: 1,
            source: "test",
          }),
        ).rejects.toThrow(ChallengeNotActiveError);
      });

      it("publishes challenge:progress event on update", async () => {
        const challenge = makeChallenge({ targetValue: 10 });
        const uc = makeUserChallenge({ currentValue: 0, status: "ACTIVE" });
        mockedRepo.fetchUserChallenge.mockResolvedValue(uc);
        mockedRepo.fetchChallengeById.mockResolvedValue(challenge);
        mockedRepo.addChallengeProgress.mockResolvedValue(
          makeUserChallenge({ currentValue: 3, status: "ACTIVE" }),
        );

        await updateChallengeProgress({
          userId: "user-1",
          challengeId: "c-1",
          delta: 3,
          source: "session",
        });
        expect(mockedEventBus.publish).toHaveBeenCalledWith(
          "challenge:progress",
          expect.objectContaining({
            userId: "user-1",
            challengeId: "c-1",
            progress: 3,
            target: 10,
          }),
        );
      });
    });

    describe("claimChallengeReward", () => {
      it("returns success false when challenge is not in completed list", async () => {
        mockedRepo.fetchCompletedChallengeDetails.mockResolvedValue([]);
        const result = await claimChallengeReward({
          userId: "user-1",
          challengeId: "c-nonexistent",
        });
        expect(result.success).toBe(false);
        expect(result.error).toBe("Challenge not completed");
      });

      it("returns success false when reward already claimed", async () => {
        const detail = {
          challenge: makeChallenge(),
          userChallenge: makeUserChallenge({ status: "CLAIMED" }),
          xpReward: 100,
          coinReward: 50,
          requiredCount: 5,
        };
        mockedRepo.fetchCompletedChallengeDetails.mockResolvedValue([detail] as any);
        const result = await claimChallengeReward({
          userId: "user-1",
          challengeId: "c-1",
        });
        expect(result.success).toBe(false);
        expect(result.error).toBe("Reward already claimed");
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. Queries
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Queries", () => {
    describe("getActiveChallenges", () => {
      it("delegates to repository.fetchActiveChallengeDetails", async () => {
        mockedRepo.fetchActiveChallengeDetails.mockResolvedValue([]);
        const result = await getActiveChallenges("user-1");
        expect(result).toEqual([]);
        expect(mockedRepo.fetchActiveChallengeDetails).toHaveBeenCalledWith("user-1");
      });
    });

    describe("getCompletedChallenges", () => {
      it("delegates to repository.fetchCompletedChallengeDetails with default limit", async () => {
        mockedRepo.fetchCompletedChallengeDetails.mockResolvedValue([]);
        await getCompletedChallenges("user-1");
        expect(mockedRepo.fetchCompletedChallengeDetails).toHaveBeenCalledWith("user-1", 10);
      });

      it("passes custom limit", async () => {
        mockedRepo.fetchCompletedChallengeDetails.mockResolvedValue([]);
        await getCompletedChallenges("user-1", 50);
        expect(mockedRepo.fetchCompletedChallengeDetails).toHaveBeenCalledWith("user-1", 50);
      });
    });

    describe("getUserChallengeSummaries", () => {
      it("maps active challenge details to summaries", async () => {
        const details = [{
          challenge: makeChallenge({ id: "c-1", title: "Test", description: "Desc", category: "SESSIONS", type: "DAILY", difficulty: "EASY", rewardAmount: 100 }),
          userChallenge: makeUserChallenge({ currentValue: 3, status: "ACTIVE", expiresAt: NOW + 3600000, rerollCount: 0 }),
          xpReward: 100,
          coinReward: 50,
          requiredCount: 5,
        }];
        mockedRepo.fetchActiveChallengeDetails.mockResolvedValue(details as any);
        const summaries = await getUserChallengeSummaries("user-1");
        expect(summaries).toHaveLength(1);
        expect(summaries[0].challengeId).toBe("c-1");
        expect(summaries[0].progressPercent).toBe(60);
        expect(summaries[0].isClaimable).toBe(false);
        expect(summaries[0].canReroll).toBe(true);
      });
    });

    describe("checkRerollEligibility", () => {
      it("returns canReroll false when challenge not found", async () => {
        mockedRepo.fetchUserChallenge.mockResolvedValue(null);
        mockedRepo.getRerollCountToday.mockResolvedValue(0);
        mockedRepo.getFreeRerollCountToday.mockResolvedValue(0);
        const result = await checkRerollEligibility("user-1", "c-missing");
        expect(result.canReroll).toBe(false);
        expect(result.reason).toBe("Challenge not found");
      });

      it("returns canReroll false when daily limit reached", async () => {
        mockedRepo.fetchUserChallenge.mockResolvedValue(makeUserChallenge() as any);
        mockedRepo.getRerollCountToday.mockResolvedValue(10);
        mockedRepo.getFreeRerollCountToday.mockResolvedValue(1);
        const result = await checkRerollEligibility("user-1", "c-1");
        expect(result.canReroll).toBe(false);
        expect(result.reason).toBe("Daily reroll limit reached");
      });

      it("returns canReroll true for ACTIVE challenge with free reroll", async () => {
        mockedRepo.fetchUserChallenge.mockResolvedValue(makeUserChallenge({ status: "ACTIVE" }) as any);
        mockedRepo.getRerollCountToday.mockResolvedValue(0);
        mockedRepo.getFreeRerollCountToday.mockResolvedValue(0);
        const result = await checkRerollEligibility("user-1", "c-1");
        expect(result.canReroll).toBe(true);
        expect(result.freeRerollAvailable).toBe(true);
        expect(result.gemsRequired).toBe(0);
      });

      it("returns canReroll false for COMPLETED challenge", async () => {
        mockedRepo.fetchUserChallenge.mockResolvedValue(makeUserChallenge({ status: "COMPLETED" }) as any);
        mockedRepo.getRerollCountToday.mockResolvedValue(0);
        mockedRepo.getFreeRerollCountToday.mockResolvedValue(0);
        const result = await checkRerollEligibility("user-1", "c-1");
        expect(result.canReroll).toBe(false);
        expect(result.reason).toContain("completed");
      });
    });

    describe("rerollChallenge", () => {
      it("returns failure when not eligible", async () => {
        mockedRepo.fetchUserChallenge.mockResolvedValue(null);
        mockedRepo.getRerollCountToday.mockResolvedValue(0);
        mockedRepo.getFreeRerollCountToday.mockResolvedValue(0);
        const result = await rerollChallenge({
          userId: "user-1",
          challengeId: "c-1",
          usePaidReroll: false,
        });
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. RepositoryError
  // ═══════════════════════════════════════════════════════════════════════════

  describe("RepositoryError", () => {
    it("stores operation and originalError", () => {
      const original = new Error("db fail");
      const err = new RepositoryError("fetchChallengeById", original);
      expect(err.operation).toBe("fetchChallengeById");
      expect(err.originalError).toBe(original);
      expect(err.name).toBe("RepositoryError");
      expect(err.message).toContain("fetchChallengeById");
    });

    it("handles non-Error originalError", () => {
      const err = new RepositoryError("test", "string error");
      expect(err.message).toContain("string error");
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. Category Gate
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Category Gate", () => {
    it("isEconomyCategory returns true for SHOP_PURCHASE", () => {
      expect(isEconomyCategory("SHOP_PURCHASE")).toBe(true);
    });

    it("isEconomyCategory returns false for SESSIONS", () => {
      expect(isEconomyCategory("SESSIONS")).toBe(false);
    });

    it("isBehaviorCategory is the inverse of isEconomyCategory", () => {
      expect(isBehaviorCategory("SESSIONS")).toBe(true);
      expect(isBehaviorCategory("SHOP_PURCHASE")).toBe(false);
    });

    it("filterBehaviorCategories removes SHOP_PURCHASE", () => {
      const input: Array<"SESSIONS" | "SHOP_PURCHASE" | "STREAK"> = ["SESSIONS", "SHOP_PURCHASE", "STREAK"];
      const result = filterBehaviorCategories(input);
      expect(result).toEqual(["SESSIONS", "STREAK"]);
    });

    it("filterBehaviorCategories returns empty when all are economy", () => {
      const result = filterBehaviorCategories(["SHOP_PURCHASE"]);
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. Basic Challenge Types
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Basic Challenge Types", () => {
    it("CONFIG has correct daily values", () => {
      expect(BasicConfig.dailyChallengeId).toBe("basic-daily-001");
      expect(BasicConfig.dailyTarget).toBe(1);
      expect(BasicConfig.dailyRewardXp).toBe(25);
    });

    it("CONFIG has correct weekly values", () => {
      expect(BasicConfig.weeklyChallengeId).toBe("basic-weekly-001");
      expect(BasicConfig.weeklyTarget).toBe(5);
      expect(BasicConfig.weeklyRewardXp).toBe(100);
    });

    it("getRequiredCount returns dailyTarget for daily challenge", () => {
      expect(getRequiredCount("basic-daily-001")).toBe(1);
    });

    it("getRequiredCount returns weeklyTarget for weekly challenge", () => {
      expect(getRequiredCount("basic-weekly-001")).toBe(5);
    });

    it("getRequiredCount returns weeklyTarget for unknown challenge", () => {
      expect(getRequiredCount("unknown-id")).toBe(5);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. Analytics — Metrics
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Analytics — Metrics", () => {
    describe("calculateChallengeMetrics", () => {
      it("returns zeros for empty input", () => {
        const result = calculateChallengeMetrics([], []);
        expect(result.totalIssued).toBe(0);
        expect(result.completionRate).toBe(0);
        expect(result.claimRate).toBe(0);
        expect(result.rerollRate).toBe(0);
        expect(result.expirationRate).toBe(0);
      });

      it("calculates completion rate correctly", () => {
        const ucs = [
          makeUserChallenge({ id: "uc1", status: "COMPLETED", completedAt: NOW, assignedAt: NOW - 5000 }),
          makeUserChallenge({ id: "uc2", status: "ACTIVE" }),
          makeUserChallenge({ id: "uc3", status: "CLAIMED", completedAt: NOW, assignedAt: NOW - 3000, claimedAt: NOW }),
        ];
        const challenges = [makeChallenge({ id: "c-1" })];
        const result = calculateChallengeMetrics(ucs as any, challenges as any);
        expect(result.totalIssued).toBe(3);
        expect(result.completionRate).toBeCloseTo(2 / 3, 2);
      });

      it("calculates expiration rate", () => {
        const ucs = [
          makeUserChallenge({ id: "uc1", status: "EXPIRED" }),
          makeUserChallenge({ id: "uc2", status: "ACTIVE" }),
        ];
        const result = calculateChallengeMetrics(ucs as any, []);
        expect(result.expirationRate).toBeCloseTo(0.5, 2);
      });

      it("calculates reroll rate", () => {
        const ucs = [
          makeUserChallenge({ id: "uc1", rerollCount: 1 }),
          makeUserChallenge({ id: "uc2", rerollCount: 0 }),
          makeUserChallenge({ id: "uc3", rerollCount: 0 }),
        ];
        const result = calculateChallengeMetrics(ucs as any, []);
        expect(result.rerollRate).toBeCloseTo(1 / 3, 2);
      });
    });

    describe("calculateDifficultyMetrics", () => {
      it("returns zero rates for empty data", () => {
        const result = calculateDifficultyMetrics([], []);
        expect(result.easy.completionRate).toBe(0);
        expect(result.medium.completionRate).toBe(0);
        expect(result.hard.completionRate).toBe(0);
      });

      it("groups challenges by difficulty", () => {
        const challenges = [
          makeChallenge({ id: "c-easy", difficulty: "EASY" }),
          makeChallenge({ id: "c-medium", difficulty: "MEDIUM" }),
          makeChallenge({ id: "c-hard", difficulty: "HARD" }),
        ];
        const ucs = [
          makeUserChallenge({ id: "uc1", challengeId: "c-easy", status: "COMPLETED", completedAt: NOW, assignedAt: NOW - 1000 }),
          makeUserChallenge({ id: "uc2", challengeId: "c-medium", status: "ACTIVE" }),
          makeUserChallenge({ id: "uc3", challengeId: "c-hard", status: "ACTIVE" }),
        ];
        const result = calculateDifficultyMetrics(ucs as any, challenges as any);
        expect(result.easy.completionRate).toBe(1);
        expect(result.medium.completionRate).toBe(0);
        expect(result.hard.completionRate).toBe(0);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 14. Analytics — Health
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Analytics — Health", () => {
    it("returns healthy status by default", async () => {
      const result = await checkChallengesHealth();
      expect(result.status).toBe("healthy");
      expect(result.issues).toEqual([]);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.activeChallenges).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 15. Validation (utils/validation.ts)
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Validation", () => {
    describe("validateChallengeCompletion", () => {
      const baseChallenge = {
        id: "c-1",
        difficulty: "MEDIUM" as const,
        expectedDuration: 300,
        minDuration: 60,
        maxDuration: 600,
      };

      it("returns valid for normal completion", () => {
        const result = validateChallengeCompletion(
          { challengeId: "c-1", userId: "u-1", completedAt: NOW, timeSpent: 300, attempts: 1, score: 100 },
          baseChallenge,
          { previousCompletions: [], avgTimeForDifficulty: 300 },
        );
        expect(result.valid).toBe(true);
        expect(result.suspicious).toBe(false);
        expect(result.errors).toHaveLength(0);
      });

      it("flags suspicious when time is below minDuration", () => {
        const result = validateChallengeCompletion(
          { challengeId: "c-1", userId: "u-1", completedAt: NOW, timeSpent: 5, attempts: 1, score: 100 },
          baseChallenge,
          { previousCompletions: [], avgTimeForDifficulty: 300 },
        );
        expect(result.suspicious).toBe(true);
        expect(result.errors.some((e) => e.includes("too fast"))).toBe(true);
      });

      it("flags invalid when time exceeds maxDuration", () => {
        const result = validateChallengeCompletion(
          { challengeId: "c-1", userId: "u-1", completedAt: NOW, timeSpent: 700, attempts: 1, score: 100 },
          baseChallenge,
          { previousCompletions: [], avgTimeForDifficulty: 300 },
        );
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("Exceeded"))).toBe(true);
      });

      it("flags suspicious for excessive attempts", () => {
        const result = validateChallengeCompletion(
          { challengeId: "c-1", userId: "u-1", completedAt: NOW, timeSpent: 300, attempts: 150, score: 100 },
          baseChallenge,
          { previousCompletions: [], avgTimeForDifficulty: 300 },
        );
        expect(result.suspicious).toBe(true);
      });

      it("detects duplicate completion", () => {
        const result = validateChallengeCompletion(
          { challengeId: "c-1", userId: "u-1", completedAt: NOW, timeSpent: 300, attempts: 1, score: 100 },
          baseChallenge,
          {
            previousCompletions: [
              { challengeId: "c-1", userId: "u-1", completedAt: NOW + 5000, timeSpent: 300, attempts: 1, score: 100 },
            ],
            avgTimeForDifficulty: 300,
          },
        );
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.includes("Duplicate"))).toBe(true);
      });

      it("flags when user is much faster than their average", () => {
        const result = validateChallengeCompletion(
          { challengeId: "c-1", userId: "u-1", completedAt: NOW, timeSpent: 30, attempts: 1, score: 100 },
          baseChallenge,
          { previousCompletions: [], avgTimeForDifficulty: 300 },
        );
        expect(result.suspicious).toBe(true);
      });
    });

    describe("ChallengeCompletionSchema", () => {
      it("validates a valid completion object", () => {
        const data = {
          challengeId: "c1",
          userId: "u1",
          completedAt: NOW,
          timeSpent: 120,
          attempts: 1,
          score: 100,
        };
        expect(ChallengeCompletionSchema.parse(data)).toEqual(data);
      });

      it("rejects negative timeSpent", () => {
        expect(() =>
          ChallengeCompletionSchema.parse({
            challengeId: "c1", userId: "u1", completedAt: NOW,
            timeSpent: -10, attempts: 1, score: 100,
          }),
        ).toThrow();
      });
    });

    describe("ChallengeDifficultySchema (validation)", () => {
      it("accepts all valid difficulties", () => {
        expect(ChallengeDifficultySchema.parse("EASY")).toBe("EASY");
        expect(ChallengeDifficultySchema.parse("EXPERT")).toBe("EXPERT");
      });

      it("rejects unknown difficulty", () => {
        expect(() => ChallengeDifficultySchema.parse("LEGENDARY")).toThrow();
      });
    });

    describe("analyzeChallengeBalance", () => {
      it("returns balanced for metrics within target", () => {
        const result = analyzeChallengeBalance(
          { completionRate: 0.65, avgTimeSpent: 300, avgAttempts: 3, abandonmentRate: 0.1 },
          { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
        );
        expect(result.balanced).toBe(true);
        expect(result.recommendations).toHaveLength(0);
        expect(result.difficultyAdjustment).toBe(0);
      });

      it("recommends increasing difficulty for too-easy challenge", () => {
        const result = analyzeChallengeBalance(
          { completionRate: 0.99, avgTimeSpent: 300, avgAttempts: 2, abandonmentRate: 0.05 },
          { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
        );
        expect(result.balanced).toBe(false);
        expect(result.difficultyAdjustment).toBeGreaterThan(0);
      });

      it("recommends decreasing difficulty for too-hard challenge", () => {
        const result = analyzeChallengeBalance(
          { completionRate: 0.1, avgTimeSpent: 600, avgAttempts: 8, abandonmentRate: 0.5 },
          { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
        );
        expect(result.balanced).toBe(false);
        expect(result.difficultyAdjustment).toBeLessThan(0);
      });

      it("flags high abandonment rate", () => {
        const result = analyzeChallengeBalance(
          { completionRate: 0.65, avgTimeSpent: 300, avgAttempts: 3, abandonmentRate: 0.5 },
          { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
        );
        expect(result.balanced).toBe(false);
        expect(result.recommendations.some((r) => r.includes("abandonment"))).toBe(true);
      });

      it("notes high retry count", () => {
        const result = analyzeChallengeBalance(
          { completionRate: 0.65, avgTimeSpent: 300, avgAttempts: 15, abandonmentRate: 0.1 },
          { targetCompletionRate: 0.65, targetTimeSpent: 300, maxAbandonmentRate: 0.2 },
        );
        expect(result.recommendations.some((r) => r.includes("retry"))).toBe(true);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 16. Session Integration Helpers
  // ═══════════════════════════════════════════════════════════════════════════

  describe("Session Integration Helpers", () => {
    describe("calculateChallengeContribution", () => {
      it("returns contribution of 1 for daily and weekly", () => {
        const result = calculateChallengeContribution({
          durationSeconds: 1200,
          qualityScore: 85,
        });
        expect(result.dailyContribution).toBe(1);
        expect(result.weeklyContribution).toBe(1);
        expect(result.canCompleteDaily).toBe(true);
        expect(result.canCompleteWeekly).toBe(false);
      });
    });

    describe("getChallengeCTA", () => {
      it("returns 'Claim Rewards' when both completed", () => {
        const result = getChallengeCTA({
          dailyProgress: 1, dailyRequired: 1, dailyCompleted: true,
          weeklyProgress: 5, weeklyRequired: 5, weeklyCompleted: true,
        });
        expect(result.primaryCTA).toBe("Claim Rewards");
        expect(result.secondaryCTA).toBeNull();
      });

      it("returns weekly CTA when only daily is completed", () => {
        const result = getChallengeCTA({
          dailyProgress: 1, dailyRequired: 1, dailyCompleted: true,
          weeklyProgress: 2, weeklyRequired: 5, weeklyCompleted: false,
        });
        expect(result.primaryCTA).toBe("Complete Weekly Challenge");
        expect(result.secondaryCTA).toBe("Claim Daily Reward");
        expect(result.motivationMessage).toContain("3 more sessions");
      });

      it("returns daily CTA when only weekly is completed", () => {
        const result = getChallengeCTA({
          dailyProgress: 0, dailyRequired: 1, dailyCompleted: false,
          weeklyProgress: 5, weeklyRequired: 5, weeklyCompleted: true,
        });
        expect(result.primaryCTA).toBe("Complete Daily Challenge");
        expect(result.secondaryCTA).toBe("Claim Weekly Reward");
      });

      it("returns 'Start Focus Session' when neither completed", () => {
        const result = getChallengeCTA({
          dailyProgress: 0, dailyRequired: 1, dailyCompleted: false,
          weeklyProgress: 0, weeklyRequired: 5, weeklyCompleted: false,
        });
        expect(result.primaryCTA).toBe("Start Focus Session");
        expect(result.motivationMessage).toContain("1 daily");
        expect(result.motivationMessage).toContain("5 weekly");
      });

      it("uses singular 'session' when 1 remaining", () => {
        const result = getChallengeCTA({
          dailyProgress: 1, dailyRequired: 1, dailyCompleted: true,
          weeklyProgress: 4, weeklyRequired: 5, weeklyCompleted: false,
        });
        expect(result.motivationMessage).toContain("1 more session");
        expect(result.motivationMessage).not.toContain("sessions");
      });
    });
  });
});
