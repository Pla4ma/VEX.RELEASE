/**
 * Comprehensive tests for the Integration feature.
 *
 * Covers: index.ts, analytics.ts, progression-rewards.ts, streaks-rewards.ts,
 * boss-rewards.ts, sessions-feed.ts, economy-feed.ts, economy-feed-helpers.ts,
 * social-feed.ts, social-feed-helpers.ts, streaks-progression.ts
 */

/* ─── Mocks (must be inline factories, no external const refs) ── */

// Track subscribers for event-driven tests
const mockActiveSubscribers: Array<{
  event: string;
  handler: (...args: unknown[]) => void;
}> = [];

jest.mock("../../../events/EventBus", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(
      (event: string, handler: (...args: unknown[]) => void) => {
        mockActiveSubscribers.push({ event, handler });
        return jest.fn(() => {
          const idx = mockActiveSubscribers.findIndex(
            (s) => s.event === event && s.handler === handler,
          );
          if (idx >= 0) mockActiveSubscribers.splice(idx, 1);
        });
      },
    ),
  },
}));

jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  }),
}));

jest.mock("../../rewards/service", () => ({
  createReward: jest.fn().mockResolvedValue({ id: "reward-1" }),
}));

jest.mock("../../progression/service-xp-core", () => ({
  addXpEnhanced: jest.fn().mockResolvedValue({ xpAdded: 10 }),
  calculateXpBreakdown: jest.fn((input: { baseAmount: number }) => ({
    total: input.baseAmount,
    base: input.baseAmount,
    streakBonus: 0,
    difficultyBonus: 0,
  })),
}));

jest.mock("../../streaks/service", () => ({
  recordSession: jest
    .fn()
    .mockResolvedValue({ action: "recorded", milestoneReached: null }),
  checkMilestone: jest.fn().mockReturnValue(null),
}));

jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../focus-identity/integration-focus-score", () => ({
  initializeFocusScoreIntegration: jest.fn(() => jest.fn()),
}));

/* ─── Retrieve mocks ──────────────────────────────────────────── */

const mockEventBus = jest.requireMock("../../../events/EventBus") as {
  eventBus: { publish: jest.Mock; subscribe: jest.Mock };
};
const mockRewards = jest.requireMock("../../rewards/service") as {
  createReward: jest.Mock;
};
const mockProgression = jest.requireMock(
  "../../progression/service-xp-core",
) as {
  addXpEnhanced: jest.Mock;
  calculateXpBreakdown: jest.Mock;
};
const mockStreaks = jest.requireMock("../../streaks/service") as {
  recordSession: jest.Mock;
  checkMilestone: jest.Mock;
};
const mockSentry = jest.requireMock("@sentry/react-native") as {
  addBreadcrumb: jest.Mock;
  captureException: jest.Mock;
};
const mockFocusIdentity = jest.requireMock(
  "../../focus-identity/integration-focus-score",
) as { initializeFocusScoreIntegration: jest.Mock };

/* ─── Imports under test ──────────────────────────────────────── */

import { initializeFeatureIntegrations } from "../index";
import {
  trackSystemError,
  trackOrchestrationError,
  trackSessionComplete,
} from "../analytics";
import { isRareItem, getShopItemType } from "../economy-feed-helpers";
import {
  getNotificationTitle,
  getNotificationBody,
  generateId,
  awardCompetitionRewards,
} from "../social-feed-helpers";
import { initializeProgressionRewardsIntegration } from "../progression-rewards";
import { initializeStreaksRewardsIntegration } from "../streaks-rewards";
import { initializeBossRewardsIntegration } from "../boss-rewards";
import { initializeSessionsFeedIntegration } from "../sessions-feed";
import { initializeEconomyFeedIntegration } from "../economy-feed";
import { initializeSocialFeedIntegration } from "../social-feed";
import { initializeStreaksProgressionIntegration } from "../streaks-progression";

/* ─── Helpers ─────────────────────────────────────────────────── */

function fireEvent(event: string, data: unknown): void {
  for (const sub of mockActiveSubscribers.filter((s) => s.event === event)) {
    sub.handler(data);
  }
}

function activeEvents(): string[] {
  return [...new Set(mockActiveSubscribers.map((s) => s.event))];
}

/* ─── Tests ───────────────────────────────────────────────────── */

describe("integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  // ====================================================================
  // index.ts — initializeFeatureIntegrations / cleanupIntegrations
  // ====================================================================
  describe("index.ts – initialization and cleanup", () => {
    it("default config enables progression, streaks, boss, sessions, focus; disables economy and social", () => {
      const cleanup = initializeFeatureIntegrations();
      expect(activeEvents()).toContain("progression:level_up");
      expect(activeEvents()).toContain("social:streak_milestone");
      expect(activeEvents()).toContain("boss:defeated");
      expect(activeEvents()).toContain("sessions:completed");
      expect(activeEvents()).not.toContain("economy:transaction");
      expect(activeEvents()).not.toContain("social:activity");
      cleanup();
    });

    it("respects partial config overrides — disabling progression", () => {
      const cleanup = initializeFeatureIntegrations({
        enableProgressionRewards: false,
      });
      expect(activeEvents()).not.toContain("progression:level_up");
      expect(activeEvents()).toContain("social:streak_milestone");
      expect(activeEvents()).toContain("boss:defeated");
      cleanup();
    });

    it("respects partial config overrides — disabling streaks and boss", () => {
      const cleanup = initializeFeatureIntegrations({
        enableStreaksRewards: false,
        enableBossRewards: false,
      });
      expect(activeEvents()).toContain("progression:level_up");
      expect(activeEvents()).not.toContain("social:streak_milestone");
      expect(activeEvents()).not.toContain("boss:defeated");
      cleanup();
    });

    it("disabling all options produces zero subscriptions", () => {
      const cleanup = initializeFeatureIntegrations({
        enableProgressionRewards: false,
        enableStreaksRewards: false,
        enableBossRewards: false,
        enableSessionsFeed: false,
        enableEconomyFeed: false,
        enableSocialFeed: false,
        enableFocusIdentity: false,
      });
      expect(mockEventBus.eventBus.subscribe).not.toHaveBeenCalled();
      cleanup();
    });

    it("cleanup removes all event subscriptions", () => {
      const cleanup = initializeFeatureIntegrations();
      const countBefore = mockActiveSubscribers.length;
      expect(countBefore).toBeGreaterThan(0);
      cleanup();
      expect(mockActiveSubscribers.length).toBe(0);
    });

    it("returns a cleanup function", () => {
      const cleanup = initializeFeatureIntegrations();
      expect(typeof cleanup).toBe("function");
      cleanup();
    });
  });

  // ====================================================================
  // analytics.ts
  // ====================================================================
  describe("analytics.ts – Sentry breadcrumbs", () => {
    it("trackSystemError sends breadcrumb with Error instance", () => {
      trackSystemError("progression", "addXp", new Error("boom"));
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "System error: progression.addXp",
          category: "integration.error",
          level: "error",
          data: expect.objectContaining({
            system: "progression",
            operation: "addXp",
            error: "boom",
          }),
        }),
      );
    });

    it("trackSystemError stringifies non-Error values", () => {
      trackSystemError("rewards", "create", "string error");
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ error: "string error" }),
        }),
      );
    });

    it("trackSystemError handles undefined error", () => {
      trackSystemError("system", "op", undefined);
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ error: "undefined" }),
        }),
      );
    });

    it("trackOrchestrationError sends breadcrumb", () => {
      trackOrchestrationError("user-1", "session-1", new Error("fail"));
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Session orchestration failed",
          category: "integration.orchestration",
          data: { userId: "user-1", sessionId: "session-1" },
          level: "error",
        }),
      );
    });

    it("trackSessionComplete sends breadcrumb with all data", () => {
      const data = {
        sessionId: "s1",
        userId: "u1",
        duration: 1800,
        completionPercentage: 100,
        xpAwarded: 50,
        coinsAwarded: 0,
        streakBonus: 5,
        difficultyBonus: 0,
        levelUp: false,
        achievementsUnlocked: 0,
        challengesProgressed: 0,
      };
      trackSessionComplete(data);
      expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Session orchestration complete",
          category: "integration.session",
          data,
          level: "info",
        }),
      );
    });
  });

  // ====================================================================
  // economy-feed-helpers.ts — pure functions
  // ====================================================================
  describe("economy-feed-helpers.ts – pure functions", () => {
    it("isRareItem returns true for legendary_ prefix", () => {
      expect(isRareItem("legendary_sword")).toBe(true);
    });

    it("isRareItem returns true for mythic_ prefix", () => {
      expect(isRareItem("mythic_shield")).toBe(true);
    });

    it("isRareItem returns true for epic_ prefix", () => {
      expect(isRareItem("epic_hat")).toBe(true);
    });

    it("isRareItem returns false for normal items", () => {
      expect(isRareItem("basic_sword")).toBe(false);
      expect(isRareItem("common_hat")).toBe(false);
      expect(isRareItem("")).toBe(false);
    });

    it("getShopItemType returns BOOST for items containing 'boost'", () => {
      expect(getShopItemType("xp_boost")).toBe("BOOST");
      expect(getShopItemType("speed_boost")).toBe("BOOST");
    });

    it("getShopItemType returns SHIELD for items containing 'shield'", () => {
      expect(getShopItemType("streak_shield")).toBe("SHIELD");
    });

    it("getShopItemType returns THEME for items containing 'theme'", () => {
      expect(getShopItemType("dark_theme")).toBe("THEME");
    });

    it("getShopItemType returns COSMETIC as default", () => {
      expect(getShopItemType("hat_blue")).toBe("COSMETIC");
      expect(getShopItemType("")).toBe("COSMETIC");
    });
  });

  // ====================================================================
  // social-feed-helpers.ts — pure utility functions
  // ====================================================================
  describe("social-feed-helpers.ts – notification titles / bodies / generateId", () => {
    const base = {
      userId: "u",
      visibility: "PUBLIC" as const,
      data: {},
    };

    it("getNotificationTitle returns correct title for known types", () => {
      expect(
        getNotificationTitle({ ...base, activityType: "STREAK_MILESTONE" }),
      ).toContain("Streak");
      expect(
        getNotificationTitle({ ...base, activityType: "LEVEL_UP" }),
      ).toContain("Level");
      expect(
        getNotificationTitle({ ...base, activityType: "BOSS_DEFEAT" }),
      ).toContain("Boss");
      expect(
        getNotificationTitle({ ...base, activityType: "PODIUM_FINISH" }),
      ).toContain("Podium");
      expect(
        getNotificationTitle({ ...base, activityType: "RARE_ITEM_ACQUIRED" }),
      ).toContain("Rare");
    });

    it("getNotificationTitle returns default for unknown types", () => {
      expect(
        getNotificationTitle({ ...base, activityType: "UNKNOWN" }),
      ).toBe("New Activity");
    });

    it("getNotificationBody returns streak-specific body", () => {
      expect(
        getNotificationBody({
          ...base,
          activityType: "STREAK_MILESTONE",
          data: { streakDays: 7 },
        }),
      ).toContain("7-day streak");
    });

    it("getNotificationBody returns level-specific body", () => {
      expect(
        getNotificationBody({
          ...base,
          activityType: "LEVEL_UP",
          data: { level: 5 },
        }),
      ).toContain("5");
    });

    it("getNotificationBody returns boss-specific body", () => {
      expect(
        getNotificationBody({
          ...base,
          activityType: "BOSS_DEFEAT",
          data: { bossName: "Shadow Dragon" },
        }),
      ).toContain("Shadow Dragon");
    });

    it("getNotificationBody returns default for unknown types", () => {
      expect(
        getNotificationBody({ ...base, activityType: "SOMETHING_ELSE" }),
      ).toBe("Check out the app for details!");
    });

    it("generateId returns a unique non-empty string", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(typeof id1).toBe("string");
      expect(id1.length).toBeGreaterThan(0);
      expect(id1).not.toBe(id2);
    });
  });

  // ====================================================================
  // progression-rewards.ts
  // ====================================================================
  describe("progression-rewards.ts", () => {
    it("subscribes to progression:level_up and progression:xp_added", () => {
      const unsub = initializeProgressionRewardsIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "progression:level_up",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "progression:xp_added",
        expect.any(Function),
      );
      unsub();
    });

    it("creates reward on level up event with rewards", () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent("progression:level_up", {
        userId: "u1",
        newLevel: 5,
        rewards: ["COINS"],
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).toHaveBeenCalledWith(
            expect.objectContaining({
              userId: "u1",
              type: "XP",
              amount: 250,
              triggerType: "LEVEL_UP",
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("does NOT create reward when rewards array is empty", () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent("progression:level_up", {
        userId: "u1",
        newLevel: 3,
        rewards: [],
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });

    it("does NOT create reward when rewards is missing", () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent("progression:level_up", { userId: "u1", newLevel: 3 });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });

    it("applies 2x multiplier for XP_BOOST reward type", () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent("progression:level_up", {
        userId: "u1",
        newLevel: 4,
        rewards: ["XP_BOOST"],
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 400 }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("applies base reward for GEMS type", () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent("progression:level_up", {
        userId: "u1",
        newLevel: 3,
        rewards: ["GEMS"],
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 150 }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("unsubscribes cleanly", () => {
      const unsub = initializeProgressionRewardsIntegration();
      const countBefore = mockActiveSubscribers.length;
      unsub();
      expect(mockActiveSubscribers.length).toBeLessThan(countBefore);
    });
  });

  // ====================================================================
  // streaks-rewards.ts
  // ====================================================================
  describe("streaks-rewards.ts", () => {
    it("subscribes to social:streak_milestone and streak:broken", () => {
      const unsub = initializeStreaksRewardsIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "social:streak_milestone",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "streak:broken",
        expect.any(Function),
      );
      unsub();
    });

    it("handles streak:broken event without throwing", () => {
      const unsub = initializeStreaksRewardsIntegration();
      expect(() =>
        fireEvent("streak:broken", { userId: "u1" }),
      ).not.toThrow();
      unsub();
    });

    it("ignores streak_milestone with null event", () => {
      const unsub = initializeStreaksRewardsIntegration();
      fireEvent("social:streak_milestone", null);
      expect(mockStreaks.checkMilestone).not.toHaveBeenCalled();
      unsub();
    });

    it("ignores streak_milestone with no streak field", () => {
      const unsub = initializeStreaksRewardsIntegration();
      fireEvent("social:streak_milestone", { userId: "u1" });
      expect(mockStreaks.checkMilestone).not.toHaveBeenCalled();
      unsub();
    });

    it("ignores streak_milestone with no userId", () => {
      const unsub = initializeStreaksRewardsIntegration();
      fireEvent("social:streak_milestone", { streak: 5 });
      expect(mockStreaks.checkMilestone).not.toHaveBeenCalled();
      unsub();
    });

    it("calls checkMilestone when streak and userId present", () => {
      const unsub = initializeStreaksRewardsIntegration();
      fireEvent("social:streak_milestone", { userId: "u1", streak: 7 });
      expect(mockStreaks.checkMilestone).toHaveBeenCalledWith(7);
      unsub();
    });
  });

  // ====================================================================
  // boss-rewards.ts
  // ====================================================================
  describe("boss-rewards.ts", () => {
    it("subscribes to boss:defeated event", () => {
      const unsub = initializeBossRewardsIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "boss:defeated",
        expect.any(Function),
      );
      unsub();
    });

    it("creates XP reward when boss defeated with xp > 0", () => {
      const unsub = initializeBossRewardsIntegration();
      fireEvent("boss:defeated", {
        userId: "u1",
        bossId: "boss-1",
        won: true,
        rewards: { xp: 200 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).toHaveBeenCalledWith(
            expect.objectContaining({
              userId: "u1",
              type: "XP",
              amount: 200,
              triggerType: "BOSS_DEFEAT",
              triggerId: "boss-1",
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("skips reward when won is false", () => {
      const unsub = initializeBossRewardsIntegration();
      fireEvent("boss:defeated", {
        userId: "u1",
        bossId: "boss-1",
        won: false,
        rewards: { xp: 200 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });

    it("skips reward when xp is 0", () => {
      const unsub = initializeBossRewardsIntegration();
      fireEvent("boss:defeated", {
        userId: "u1",
        bossId: "boss-1",
        won: true,
        rewards: { xp: 0 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });
  });

  // ====================================================================
  // sessions-feed.ts — cross-system integration
  // ====================================================================
  describe("sessions-feed.ts", () => {
    it("subscribes to sessions:completed event", () => {
      const unsub = initializeSessionsFeedIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "sessions:completed",
        expect.any(Function),
      );
      unsub();
    });

    it("processes session completion → recordSession + addXpEnhanced + breadcrumb", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", {
        userId: "u1",
        sessionId: "s1",
        duration: 1800,
        qualityScore: 80,
        streakDays: 3,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStreaks.recordSession).toHaveBeenCalledWith(
            expect.objectContaining({
              userId: "u1",
              sessionId: "s1",
              duration: 1800,
              qualityScore: 80,
            }),
          );
          expect(mockProgression.addXpEnhanced).toHaveBeenCalled();
          expect(mockSentry.addBreadcrumb).toHaveBeenCalledWith(
            expect.objectContaining({ category: "sessions:integration" }),
          );
          unsub();
          resolve();
        }, 20);
      });
    });

    it("ignores null event", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", null);
      expect(mockStreaks.recordSession).not.toHaveBeenCalled();
      unsub();
    });

    it("ignores event with missing sessionId", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", { userId: "u1" });
      expect(mockStreaks.recordSession).not.toHaveBeenCalled();
      unsub();
    });

    it("ignores event with missing userId", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", { sessionId: "s1" });
      expect(mockStreaks.recordSession).not.toHaveBeenCalled();
      unsub();
    });

    it("defaults qualityScore and streakDays to 0 when omitted", () => {
      const unsub = initializeSessionsFeedIntegration();
      fireEvent("sessions:completed", {
        userId: "u1",
        sessionId: "s1",
        duration: 1200,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockStreaks.recordSession).toHaveBeenCalledWith(
            expect.objectContaining({ qualityScore: 0 }),
          );
          unsub();
          resolve();
        }, 20);
      });
    });
  });

  // ====================================================================
  // economy-feed.ts
  // ====================================================================
  describe("economy-feed.ts", () => {
    it("subscribes to economy:transaction, economy:purchase, events:reward_earned", () => {
      const unsub = initializeEconomyFeedIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "economy:transaction",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "economy:purchase",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "events:reward_earned",
        expect.any(Function),
      );
      unsub();
    });

    it("ignores economy:transaction with null event", () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent("economy:transaction", null);
      expect(mockEventBus.eventBus.publish).not.toHaveBeenCalled();
      unsub();
    });

    it("ignores economy:transaction with empty userId", () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent("economy:transaction", {
        userId: "",
        currency: "COINS",
        type: "earn",
        amount: 10,
        source: "test",
      });
      expect(mockEventBus.eventBus.publish).not.toHaveBeenCalled();
      unsub();
    });

    it("publishes challenge progress on positive transaction", () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent("economy:transaction", {
        userId: "u1",
        currency: "COINS",
        type: "earn",
        amount: 50,
        source: "session",
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            "seasons:challenge_progress",
            expect.objectContaining({
              userId: "u1",
              challengeId: "currency_earned",
              progress: 50,
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("publishes social activity for large transactions (>= 1000)", () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent("economy:transaction", {
        userId: "u1",
        currency: "COINS",
        type: "earn",
        amount: 1500,
        source: "bonus",
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            "social:activity",
            expect.objectContaining({
              userId: "u1",
              activityType: "BIG_EARN",
              visibility: "FRIENDS",
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("publishes BIG_SPEND for large negative transactions", () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent("economy:transaction", {
        userId: "u1",
        currency: "COINS",
        type: "spend",
        amount: -2000,
        source: "shop",
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            "social:activity",
            expect.objectContaining({
              userId: "u1",
              activityType: "BIG_SPEND",
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("publishes progression:add_xp for positive XP transaction", () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent("economy:transaction", {
        userId: "u1",
        currency: "XP",
        type: "earn",
        amount: 25,
        source: "session",
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            "progression:add_xp",
            expect.objectContaining({ userId: "u1", amount: 25 }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("does NOT publish progression:add_xp for non-XP currency", () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent("economy:transaction", {
        userId: "u1",
        currency: "COINS",
        type: "earn",
        amount: 25,
        source: "session",
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const xpCalls = mockEventBus.eventBus.publish.mock.calls.filter(
            (c: unknown[]) => c[0] === "progression:add_xp",
          );
          expect(xpCalls).toHaveLength(0);
          unsub();
          resolve();
        }, 10);
      });
    });

    it("ignores economy:purchase with null or missing userId", () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent("economy:purchase", null);
      expect(mockEventBus.eventBus.publish).not.toHaveBeenCalled();
      unsub();
    });
  });

  // ====================================================================
  // social-feed.ts
  // ====================================================================
  describe("social-feed.ts", () => {
    it("subscribes to all social events", () => {
      const unsub = initializeSocialFeedIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "social:activity",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "leaderboards:result",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "squads:challenge_update",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "sessions:completed",
        expect.any(Function),
      );
      unsub();
    });

    it("ignores social:activity with null event", () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent("social:activity", null);
      unsub();
    });

    it("publishes social:activity for podium finishes (rank <= 3)", () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent("leaderboards:result", {
        userId: "u1",
        leaderboardId: "lb-1",
        rank: 2,
        score: 500,
        participants: 20,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            "social:activity",
            expect.objectContaining({
              userId: "u1",
              activityType: "PODIUM_FINISH",
              visibility: "PUBLIC",
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("publishes squads:leaderboard_update for squad leaderboards", () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent("leaderboards:result", {
        userId: "u1",
        leaderboardId: "squad:alpha",
        rank: 5,
        score: 300,
        participants: 10,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            "squads:leaderboard_update",
            expect.objectContaining({
              squadId: "alpha",
              userId: "u1",
              score: 300,
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("does NOT publish podium finish for rank > 3", () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent("leaderboards:result", {
        userId: "u1",
        leaderboardId: "lb-1",
        rank: 10,
        score: 200,
        participants: 50,
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const podiumCalls =
            mockEventBus.eventBus.publish.mock.calls.filter(
              (c: unknown[]) =>
                c[0] === "social:activity" &&
                (c[1] as { activityType?: string })?.activityType ===
                  "PODIUM_FINISH",
            );
          expect(podiumCalls).toHaveLength(0);
          unsub();
          resolve();
        }, 10);
      });
    });

    it("ignores squads:challenge_update with null event", () => {
      const unsub = initializeSocialFeedIntegration();
      fireEvent("squads:challenge_update", null);
      unsub();
    });
  });

  // ====================================================================
  // social-feed-helpers.ts — awardCompetitionRewards
  // ====================================================================
  describe("social-feed-helpers.ts – awardCompetitionRewards", () => {
    it("awards GEMS + TITLE for rank 1", async () => {
      await awardCompetitionRewards({
        userId: "u1",
        leaderboardId: "lb-1",
        rank: 1,
        score: 1000,
        participants: 50,
      });
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u1",
          rewardType: "GEMS",
          amount: 100,
          source: "COMPETITION",
        }),
      );
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u1",
          rewardType: "TITLE",
          amount: 1,
          source: "COMPETITION",
        }),
      );
    });

    it("awards 50 GEMS for rank 2", async () => {
      await awardCompetitionRewards({
        userId: "u2",
        leaderboardId: "lb-1",
        rank: 2,
        score: 900,
        participants: 50,
      });
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u2",
          rewardType: "GEMS",
          amount: 50,
        }),
      );
    });

    it("awards 25 GEMS for rank 3", async () => {
      await awardCompetitionRewards({
        userId: "u3",
        leaderboardId: "lb-1",
        rank: 3,
        score: 800,
        participants: 50,
      });
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u3",
          rewardType: "GEMS",
          amount: 25,
        }),
      );
    });

    it("awards 10 GEMS for top 10% (rank 4 of 50)", async () => {
      await awardCompetitionRewards({
        userId: "u4",
        leaderboardId: "lb-1",
        rank: 4,
        score: 700,
        participants: 50,
      });
      expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
        "economy:grant_reward",
        expect.objectContaining({
          userId: "u4",
          rewardType: "GEMS",
          amount: 10,
        }),
      );
    });

    it("awards no rewards for rank below top 10%", async () => {
      await awardCompetitionRewards({
        userId: "u5",
        leaderboardId: "lb-1",
        rank: 20,
        score: 400,
        participants: 50,
      });
      const grantCalls = mockEventBus.eventBus.publish.mock.calls.filter(
        (c: unknown[]) => c[0] === "economy:grant_reward",
      );
      expect(grantCalls).toHaveLength(0);
    });
  });

  // ====================================================================
  // streaks-progression.ts
  // ====================================================================
  describe("streaks-progression.ts", () => {
    it("subscribes to social:streak_milestone and streak:updated", () => {
      const unsub = initializeStreaksProgressionIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "social:streak_milestone",
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        "streak:updated",
        expect.any(Function),
      );
      unsub();
    });

    it("awards streak XP on streak:updated when streak > 0", () => {
      const unsub = initializeStreaksProgressionIntegration();
      fireEvent("streak:updated", {
        userId: "u1",
        state: { currentStreak: 5 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockProgression.addXpEnhanced).toHaveBeenCalledWith(
            "u1",
            expect.objectContaining({ amount: 5, source: "STREAK_BONUS" }),
            { skipEvents: true },
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it("does NOT award XP on streak:updated when streak is 0", () => {
      const unsub = initializeStreaksProgressionIntegration();
      fireEvent("streak:updated", {
        userId: "u1",
        state: { currentStreak: 0 },
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockProgression.addXpEnhanced).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });

    it("calls addXpEnhanced on streak_milestone with calculated XP", () => {
      const unsub = initializeStreaksProgressionIntegration();
      fireEvent("social:streak_milestone", { userId: "u1", streak: 7 });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockProgression.calculateXpBreakdown).toHaveBeenCalled();
          expect(mockProgression.addXpEnhanced).toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });
  });
});
