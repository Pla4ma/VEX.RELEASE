/**
 * AI Coach Service Tests
 */

import * as service from "../service";
import * as repository from "../repository";
import { CoachMessageSchema, BehaviorProfileSchema, CoachStateSchema, ComebackPlanSchema, SessionRecommendationSchema, type GenerateMessageInput, type ProcessBehaviorSignalInput, type ActivateComebackInput, type CoachUserState } from "../schemas";

// Mock repository
jest.mock("../repository");

describe("CoachService", () => {
  const mockUserId = "user-123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrCreateCoachState", () => {
    it("returns existing state if found", async () => {
      const existingState = {
        userId: mockUserId,
        currentState: "HIGH_CONFIDENCE" as CoachUserState,
        previousState: null,
        stateEnteredAt: Date.now(),
        personaId: "default",
        behaviorProfile: null,
        lastInterventionAt: null,
        interventionsToday: 0,
        muteUntil: null,
        reduceNotifications: false,
      };

      (repository.fetchCoachState as jest.Mock).mockResolvedValue(existingState);

      const result = await service.getOrCreateCoachState(mockUserId);

      expect(result).toEqual(existingState);
      expect(repository.fetchCoachState).toHaveBeenCalledWith(mockUserId);
    });

    it("creates new state if not found", async () => {
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(null);
      (repository.fetchRecentBehaviorSignals as jest.Mock).mockResolvedValue([]);
      (repository.upsertBehaviorProfile as jest.Mock).mockImplementation((p) => p);
      (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);

      const result = await service.getOrCreateCoachState(mockUserId);

      expect(result.userId).toBe(mockUserId);
      expect(result.currentState).toBe("COLD_START");
      expect(repository.upsertCoachState).toHaveBeenCalled();
    });
  });

  describe("generateMessage", () => {
    const input: GenerateMessageInput = {
      userId: mockUserId,
      category: "STREAK_RISK",
      context: { currentStreak: 5, hoursRemaining: 4 },
      preferredDelivery: "BOTH",
    };

    it("generates message for streak risk", async () => {
      (repository.fetchCoachState as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        currentState: "STREAK_AT_RISK",
        personaId: "default",
        muteUntil: null,
        reduceNotifications: false,
      });
      (repository.fetchMessageTemplates as jest.Mock).mockResolvedValue([]);

      const result = await service.generateMessage(input);

      expect(result).not.toBeNull();
      expect(result?.category).toBe("STREAK_RISK");
      expect(result?.userId).toBe(mockUserId);
    });

    it("returns null if user has muted category", async () => {
      (repository.fetchCoachState as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        currentState: "HIGH_CONFIDENCE",
        personaId: "default",
        muteUntil: Date.now() + 10000, // Future mute time
      });

      const result = await service.generateMessage(input);

      expect(result).toBeNull();
    });

    it("uses default templates when no matching templates found", async () => {
      (repository.fetchCoachState as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        currentState: "HIGH_CONFIDENCE",
        personaId: "default",
        muteUntil: null,
      });
      (repository.fetchMessageTemplates as jest.Mock).mockResolvedValue([]);

      const result = await service.generateMessage(input);

      expect(result).not.toBeNull();
      expect(result?.content).toContain("streak");
    });
  });

  describe("processBehaviorSignal", () => {
    const input: ProcessBehaviorSignalInput = {
      userId: mockUserId,
      signalType: "SESSION_QUALITY_TREND",
      value: 0.85,
    };

    it("adds behavior signal and updates profile", async () => {
      (repository.addBehaviorSignal as jest.Mock).mockImplementation((s) => s);
      (repository.fetchRecentBehaviorSignals as jest.Mock).mockResolvedValue([]);
      (repository.upsertBehaviorProfile as jest.Mock).mockImplementation((p) => p);

      const result = await service.processBehaviorSignal(input);

      expect(result).not.toBeNull();
      expect(result.userId).toBe(mockUserId);
      expect(repository.addBehaviorSignal).toHaveBeenCalled();
      expect(repository.upsertBehaviorProfile).toHaveBeenCalled();
    });

    it("correctly identifies cold start users", async () => {
      (repository.addBehaviorSignal as jest.Mock).mockImplementation((s) => s);
      (repository.fetchRecentBehaviorSignals as jest.Mock).mockResolvedValue([]);
      (repository.upsertBehaviorProfile as jest.Mock).mockImplementation((p) => p);

      const result = await service.processBehaviorSignal(input);

      expect(result.coldStart).toBe(true);
      expect(result.confidenceLevel).toBe("LOW");
    });
  });

  describe("detectStreakRisk", () => {
    it("detects streak risk for high hours since last session", async () => {
      (repository.fetchCoachState as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        currentState: "HIGH_CONFIDENCE",
        interventionsToday: 0,
      });
      (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);

      const result = await service.detectStreakRisk(mockUserId, 30, 5);

      expect(result).toBe(true);
    });

    it("does not detect risk for fresh sessions", async () => {
      const result = await service.detectStreakRisk(mockUserId, 10, 5);

      expect(result).toBe(false);
    });

    it("does not detect risk for zero streak", async () => {
      const result = await service.detectStreakRisk(mockUserId, 30, 0);

      expect(result).toBe(false);
    });
  });

  describe("activateComeback", () => {
    const input: ActivateComebackInput = {
      userId: mockUserId,
      previousStreak: 10,
      daysInactive: 5,
    };

    it("creates comeback plan", async () => {
      (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(null);
      (repository.upsertComebackPlan as jest.Mock).mockImplementation((p) => p);
      (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);

      const result = await service.activateComeback(input);

      expect(result).not.toBeNull();
      expect(result.userId).toBe(mockUserId);
      expect(result.previousStreak).toBe(10);
      expect(result.status).toBe("OFFERED");
      expect(result.bonusMultiplier).toBe(2.0);
    });

    it("throws if comeback was previously declined", async () => {
      (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue({
        id: "comeback-1",
        userId: mockUserId,
        status: "DECLINED",
      });

      await expect(service.activateComeback(input)).rejects.toThrow("Comeback was previously declined");
    });
  });

  describe("trackComebackSession", () => {
    it("tracks completed session in comeback", async () => {
      const plan = ComebackPlanSchema.parse({
        id: "comeback-1",
        userId: mockUserId,
        previousStreak: 10,
        daysInactive: 5,
        status: "ACTIVE",
        startedAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        sessionsCompleted: 1,
        targetSessions: 3,
        bonusMultiplier: 2.0,
        messages: [],
      });

      (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(plan);
      (repository.updateComebackPlanStatus as jest.Mock).mockImplementation((id, status, count) => ({
        ...plan,
        status,
        sessionsCompleted: count,
      }));
      (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);

      const result = await service.trackComebackSession(mockUserId, true);

      expect(result).not.toBeNull();
      expect(repository.updateComebackPlanStatus).toHaveBeenCalledWith("comeback-1", "ACTIVE", 2);
    });

    it("completes comeback when target reached", async () => {
      const plan = ComebackPlanSchema.parse({
        id: "comeback-1",
        userId: mockUserId,
        previousStreak: 10,
        daysInactive: 5,
        status: "ACTIVE",
        startedAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        sessionsCompleted: 2,
        targetSessions: 3,
        bonusMultiplier: 2.0,
        messages: [],
      });

      (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(plan);
      (repository.updateComebackPlanStatus as jest.Mock).mockImplementation((id, status, count) => ({
        ...plan,
        status,
        sessionsCompleted: count,
      }));
      (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);
      (repository.createCoachMessage as jest.Mock).mockImplementation((m) => m);

      const result = await service.trackComebackSession(mockUserId, true);

      expect(repository.updateComebackPlanStatus).toHaveBeenCalledWith("comeback-1", "COMPLETED", 3);
    });
  });

  describe("adjustDifficulty", () => {
    it("adjusts difficulty based on target", async () => {
      (repository.fetchDifficultyProfile as jest.Mock).mockResolvedValue(null);
      (repository.upsertDifficultyProfile as jest.Mock).mockImplementation((p) => p);

      const result = await service.adjustDifficulty({
        userId: mockUserId,
        reason: "Test adjustment",
        targetDifficulty: 7,
      });

      expect(result.recommendedDifficulty).toBe(7);
      expect(result.adjustmentReason).toBe("Test adjustment");
      expect(result.trend).toBe("IMPROVING");
    });

    it("auto-adjusts based on success rates", async () => {
      (repository.fetchDifficultyProfile as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        currentDifficulty: 5,
        recommendedDifficulty: 5,
        lastAdjustmentAt: Date.now() - 86400000,
        adjustmentReason: null,
        successRateRecent: 0.4, // Low success rate
        successRateOverall: 0.6,
        trend: "STABLE",
      });
      (repository.upsertDifficultyProfile as jest.Mock).mockImplementation((p) => p);

      const result = await service.adjustDifficulty({
        userId: mockUserId,
        reason: "Low success rate",
      });

      expect(result.recommendedDifficulty).toBe(4); // Decreased
      expect(result.trend).toBe("DECLINING");
    });
  });

  describe("createRecommendation", () => {
    it("creates session recommendation", async () => {
      (repository.fetchBehaviorProfile as jest.Mock).mockResolvedValue(null);
      (repository.fetchActiveRecommendations as jest.Mock).mockResolvedValue([]);
      (repository.updateRecommendationStatus as jest.Mock).mockImplementation((id, status) => ({
        id,
        status,
      }));
      (repository.createRecommendation as jest.Mock).mockImplementation((r) => r);

      const result = await service.createRecommendation({
        userId: mockUserId,
        type: "STREAK_PROTECTION",
        context: {},
      });

      expect(result).not.toBeNull();
      expect(result?.type).toBe("STREAK_PROTECTION");
      expect(result?.suggestedDuration).toBeLessThanOrEqual(15 * 60); // Max 15 min for streak protection
    });

    it("expires existing recommendations of same type", async () => {
      const existingRec = SessionRecommendationSchema.parse({
        id: "rec-1",
        userId: mockUserId,
        type: "STREAK_PROTECTION",
        suggestedDuration: 20 * 60,
        suggestedDifficulty: "EASY",
        reasoning: "Old recommendation",
        confidence: 0.7,
        basedOn: [],
        expiresAt: Date.now() + 10000,
        status: "ACTIVE",
      });

      (repository.fetchBehaviorProfile as jest.Mock).mockResolvedValue(null);
      (repository.fetchActiveRecommendations as jest.Mock).mockResolvedValue([existingRec]);
      (repository.updateRecommendationStatus as jest.Mock).mockResolvedValue({
        ...existingRec,
        status: "EXPIRED",
      });
      (repository.createRecommendation as jest.Mock).mockImplementation((r) => r);

      await service.createRecommendation({
        userId: mockUserId,
        type: "STREAK_PROTECTION",
        context: {},
      });

      expect(repository.updateRecommendationStatus).toHaveBeenCalledWith("rec-1", "EXPIRED");
    });
  });

  describe("generatePerformanceSummary", () => {
    it("generates daily summary", async () => {
      (repository.fetchCoachState as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        currentState: "HIGH_CONFIDENCE",
      });
      (repository.fetchCoachHistory as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        messages: [],
        totalMessages: 0,
        responseRate: 0,
        preferredCategories: [],
        mutedCategories: [],
        lastMessageAt: Date.now(),
      });

      const result = await service.generatePerformanceSummary(mockUserId, "daily");

      expect(result.period).toBe("daily");
      expect(result.coachMessage).toBeDefined();
    });

    it("generates weekly summary", async () => {
      (repository.fetchCoachState as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        currentState: "HIGH_CONFIDENCE",
      });
      (repository.fetchCoachHistory as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        messages: [],
        totalMessages: 0,
        responseRate: 0,
        preferredCategories: [],
        mutedCategories: [],
        lastMessageAt: Date.now(),
      });

      const result = await service.generatePerformanceSummary(mockUserId, "weekly");

      expect(result.period).toBe("weekly");
      expect(result.coachMessage).toContain("week");
    });
  });

  describe("suggestChallenges", () => {
    it("suggests challenges based on behavior profile", async () => {
      (repository.fetchBehaviorProfile as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        signals: [
          {
            id: "signal-1",
            userId: mockUserId,
            signalType: "CONSISTENCY_SCORE",
            value: 0.8,
            confidence: 0.9,
            timestamp: Date.now(),
            metadata: {},
            expiresAt: Date.now() + 86400000,
          },
        ],
        lastUpdated: Date.now(),
        confidenceLevel: "HIGH",
        coldStart: false,
        dataPoints: 50,
      });

      const result = await service.suggestChallenges(mockUserId);

      expect(result.suggestedChallenges.length).toBeGreaterThan(0);
    });

    it("returns empty suggestions without profile", async () => {
      (repository.fetchBehaviorProfile as jest.Mock).mockResolvedValue(null);

      const result = await service.suggestChallenges(mockUserId);

      expect(result.suggestedChallenges).toEqual([]);
    });
  });
});
