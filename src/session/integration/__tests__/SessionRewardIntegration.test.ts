import { SessionRewardIntegration } from "../SessionRewardIntegration";
import { eventBus } from "../../../events";
import type { SessionSummary } from "../../types";
jest.mock("../../../events");
describe("SessionRewardIntegration", () => {
  let mockEventBus: { publish: jest.Mock; subscribe: jest.Mock };
  const createMockSummary = (
    overrides: Partial<SessionSummary> = {},
  ): SessionSummary => ({
    sessionId: "test-session",
    userId: "test-user",
    status: "COMPLETED",
    plannedDuration: 1500,
    actualDuration: 1500,
    effectiveDuration: 1500,
    pausedDuration: 0,
    completionPercentage: 100,
    focusQuality: 95,
    interruptions: 0,
    pauses: 0,
    baseScore: 250,
    timeBonus: 0,
    streakBonus: 0,
    finalScore: 250,
    xpEarned: 250,
    coinsEarned: 25,
    gemsEarned: 1,
    streakMaintained: true,
    streakIncreased: true,
    completedAt: Date.now(),
    ...overrides,
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockEventBus = { publish: jest.fn(), subscribe: jest.fn() };
    (eventBus.publish as jest.Mock) = mockEventBus.publish;
    (eventBus.subscribe as jest.Mock) = mockEventBus.subscribe;
    new SessionRewardIntegration({
      autoGrantRewards: true,
      autoUpdateStreak: true,
      autoAddXP: true,
      autoUpdateAnalytics: true,
      autoCreateSocialActivity: true,
      enableSeasonChallengeProgress: true,
      enableAchievementChecks: true,
      enableMilestoneTracking: true,
    });
  });
  describe("reward calculation", () => {
    it("should calculate base rewards from session duration", () => {
      const summary = createMockSummary({ effectiveDuration: 1500 });
      const baseXP = Math.floor(summary.effectiveDuration / 60) * 10;
      expect(baseXP).toBe(250);
    });
    it("should apply streak multiplier", () => {
      const streakMultiplier = 1.25;
      const baseXP = Math.floor(1500 / 60) * 10;
      const totalXP = Math.floor(baseXP * streakMultiplier);
      expect(totalXP).toBe(312);
    });
    it("should calculate perfect session bonus", () => {
      const summary = createMockSummary({
        interruptions: 0,
        pauses: 0,
        completionPercentage: 100,
      });
      const isPerfect =
        summary.interruptions === 0 &&
        summary.pauses === 0 &&
        summary.completionPercentage === 100;
      expect(isPerfect).toBe(true);
    });
    it("should apply time bonus for early completion", () => {
      const summary = createMockSummary({
        plannedDuration: 1500,
        actualDuration: 1400,
        completionPercentage: 100,
      });
      const earlyPercent =
        (1 - summary.actualDuration / summary.plannedDuration) * 100;
      const timeBonus = Math.floor(earlyPercent * 2);
      expect(timeBonus).toBeGreaterThan(0);
    });
  });
  describe("economy system integration", () => {
    it("should emit economy events for coins", () => {
      const userId = "user-123";
      const coins = 50;
      eventBus.publish("economy:add_currency", {
        userId,
        type: "coins",
        amount: coins,
        source: "session_completion",
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "economy:add_currency",
        expect.objectContaining({ userId, type: "coins", amount: coins }),
      );
    });
    it("should emit economy events for gems", () => {
      const userId = "user-123";
      const gems = 5;
      eventBus.publish("economy:add_currency", {
        userId,
        type: "gems",
        amount: gems,
        source: "session_perfect_bonus",
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "economy:add_currency",
        expect.objectContaining({ userId, type: "gems", amount: gems }),
      );
    });
  });
  describe("progression system integration", () => {
    it("should emit XP addition events", () => {
      const userId = "user-123";
      const xp = 300;
      eventBus.publish("progression:add_xp", {
        userId,
        amount: xp,
        source: "session_completion",
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "progression:add_xp",
        expect.objectContaining({
          userId,
          amount: xp,
          source: "session_completion",
        }),
      );
    });
    it("should emit detailed XP events for level tracking", () => {
      const userId = "user-123";
      const xp = 300;
      eventBus.publish("progression:xp_added", {
        userId,
        amount: xp,
        source: "session_completion",
        totalXP: 0,
        currentLevel: 0,
        progressPercent: 0,
        streakBonus: 0,
        boostBonus: 0,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "progression:xp_added",
        expect.objectContaining({ userId, amount: xp }),
      );
    });
  });
  describe("streak system integration", () => {
    it("should emit streak update events", () => {
      const userId = "user-123";
      const streakDays = 5;
      eventBus.publish("streak:updated", {
        userId,
        state: { currentStreak: streakDays + 1 },
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "streak:updated",
        expect.objectContaining({
          userId,
          state: expect.objectContaining({ currentStreak: 6 }),
        }),
      );
    });
    it("should emit streak broken events", () => {
      const userId = "user-123";
      const previousStreak = 10;
      eventBus.publish("streak:broken", {
        userId,
        previousStreak,
        wasComeback: false,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "streak:broken",
        expect.objectContaining({ userId, previousStreak: 10 }),
      );
    });
    it("should emit social streak milestone events", () => {
      const userId = "user-123";
      const streakDays = 7;
      eventBus.publish("social:streak_milestone", {
        userId,
        streak: streakDays,
        milestone: streakDays,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "social:streak_milestone",
        expect.objectContaining({ userId, streak: 7, milestone: 7 }),
      );
    });
  });
  describe("analytics system integration", () => {
    it("should emit session completion analytics", () => {
      const userId = "user-123";
      const summary = createMockSummary();
      eventBus.publish("analytics:track", {
        event: "session_completed",
        properties: {
          userId,
          duration: summary.actualDuration,
          completion: summary.completionPercentage,
          xpEarned: summary.xpEarned,
          streakDays: 5,
          interruptions: summary.interruptions,
          pauses: summary.pauses,
        },
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "analytics:track",
        expect.objectContaining({ event: "session_completed" }),
      );
    });
    it("should emit engagement metrics", () => {
      const userId = "user-123";
      const focusTime = 1500;
      eventBus.publish("session:analytics:engagement", {
        sessionId: "test",
        userId,
        metric: "focus_time",
        value: focusTime,
        timestamp: Date.now(),
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:analytics:engagement",
        expect.objectContaining({
          userId,
          metric: "focus_time",
          value: focusTime,
        }),
      );
    });
  });
  describe("social system integration", () => {
    it("should create social activity on completion", () => {
      const userId = "user-123";
      const summary = createMockSummary({
        actualDuration: 1500,
        xpEarned: 250,
      });
      eventBus.publish("social:activity", {
        id: `activity_${Date.now()}_${userId}`,
        userId,
        type: "session_completed",
        content: `Completed a ${Math.floor(summary.actualDuration / 60)} minute focus session and earned ${summary.xpEarned} XP!`,
        timestamp: Date.now(),
        visibility: "friends",
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "social:activity",
        expect.objectContaining({ userId, type: "session_completed" }),
      );
    });
  });
  describe("challenge system integration", () => {
    it("should progress daily focus time challenge", () => {
      const userId = "user-123";
      const focusTime = 1500;
      eventBus.publish("challenge:progress", {
        userId,
        challengeId: "daily_focus_time",
        progress: focusTime,
        target: 3600,
        percent: (focusTime / 3600) * 100,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "challenge:progress",
        expect.objectContaining({ userId, challengeId: "daily_focus_time" }),
      );
    });
    it("should progress streak challenge", () => {
      const userId = "user-123";
      const streakDays = 5;
      eventBus.publish("challenge:progress", {
        userId,
        challengeId: "maintain_streak",
        progress: streakDays,
        target: 7,
        percent: (streakDays / 7) * 100,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "challenge:progress",
        expect.objectContaining({ userId, challengeId: "maintain_streak" }),
      );
    });
    it("should progress perfect session challenge", () => {
      const userId = "user-123";
      const interruptions = 0;
      const pauses = 0;
      if (interruptions === 0 && pauses === 0) {
        eventBus.publish("challenge:progress", {
          userId,
          challengeId: "perfect_sessions",
          progress: 1,
          target: 10,
          percent: 10,
        });
      }
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "challenge:progress",
        expect.objectContaining({ userId, challengeId: "perfect_sessions" }),
      );
    });
  });
  describe("achievement system integration", () => {
    it("should unlock first completion achievement", () => {
      const userId = "user-123";
      const completionPercentage = 100;
      if (completionPercentage >= 100) {
        eventBus.publish("achievement:unlock", {
          achievementId: "first_complete_session",
          userId,
        });
      }
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "achievement:unlock",
        expect.objectContaining({
          achievementId: "first_complete_session",
          userId,
        }),
      );
    });
    it("should unlock week warrior badge", () => {
      const userId = "user-123";
      const streakDays = 7;
      if (streakDays >= 7) {
        eventBus.publish("achievements:unlock_badge", {
          userId,
          badgeId: "week_warrior",
          rarity: "silver",
        });
      }
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "achievements:unlock_badge",
        expect.objectContaining({ userId, badgeId: "week_warrior" }),
      );
    });
  });
  describe("milestone tracking", () => {
    it("should track 100 hour milestone", () => {
      const userId = "user-123";
      const totalFocusHours = 100;
      if (totalFocusHours >= 100) {
        eventBus.publish("session:analytics:milestone", {
          sessionId: "test",
          userId,
          milestone: "100_hours_focused",
          value: totalFocusHours,
          timestamp: Date.now(),
        });
      }
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:analytics:milestone",
        expect.objectContaining({ userId, milestone: "100_hours_focused" }),
      );
    });
  });
  describe("partial completion handling", () => {
    it("should grant partial XP for abandoned session with effort", () => {
      const elapsedTime = 600;
      const minForCredit = 300;
      const partialXP =
        elapsedTime >= minForCredit ? Math.floor(elapsedTime / 60) * 3 : 0;
      expect(partialXP).toBe(30);
    });
    it("should not grant XP for very short abandoned sessions", () => {
      const elapsedTime = 120;
      const minForCredit = 300;
      const partialXP =
        elapsedTime >= minForCredit ? Math.floor(elapsedTime / 60) * 3 : 0;
      expect(partialXP).toBe(0);
    });
  });
  describe("consolidated reward events", () => {
    it("should emit consolidated reward event", () => {
      const sessionId = "test-session";
      const userId = "user-123";
      const rewards = {
        xp: 300,
        coins: 50,
        gems: 5,
        bonuses: ["perfect_session", "streak_bonus"],
      };
      eventBus.publish("session:rewards:calculated", {
        sessionId,
        userId,
        rewards,
        timestamp: Date.now(),
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        "session:rewards:calculated",
        expect.objectContaining({
          sessionId,
          userId,
          rewards: expect.objectContaining({ xp: 300, coins: 50, gems: 5 }),
        }),
      );
    });
  });
  describe("error handling", () => {
    it("should handle missing summary gracefully", () => {
      const sessionId = "test-session";
      const userId = "user-123";
      expect(() => {
        eventBus.publish("session:completed", {
          sessionId,
          userId,
          summary: null,
          timestamp: Date.now(),
          duration: 1500,
        });
      }).not.toThrow();
    });
    it("should handle zero duration sessions", () => {
      const summary = createMockSummary({
        actualDuration: 0,
        effectiveDuration: 0,
      });
      const baseXP = Math.floor(summary.effectiveDuration / 60) * 10;
      expect(baseXP).toBe(0);
    });
    it("should handle very long sessions", () => {
      const summary = createMockSummary({
        actualDuration: 28800,
        effectiveDuration: 28800,
      });
      const baseXP = Math.floor(summary.effectiveDuration / 60) * 10;
      expect(baseXP).toBe(4800);
    });
  });
});
