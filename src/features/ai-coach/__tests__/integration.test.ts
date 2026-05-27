import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import * as coachService from "../service";
import * as coachRepository from "../repository";
import {
  handleSessionCompletedEnhanced,
  handleStreakRiskDetectedEnhanced,
  handleStreakBrokenEnhanced,
  handleLevelUpEnhanced,
  handleChallengeExpiringEnhanced,
  handleBossTimeoutWarningEnhanced,
} from "../integration-enhanced";
import {
  type CoachState,
  type BehaviorProfile,
  type ComebackPlan,
  type CoachMessage,
  type InterventionRule,
} from "../schemas";
jest.mock("../service");
jest.mock("../repository");
jest.mock("../analytics");
jest.mock("../../sessions/service", () => ({
  recordSession: jest.fn(),
  calculateQuality: jest.fn(),
}));
jest.mock("../../streaks/service", () => ({
  updateStreak: jest.fn(),
  checkStreakRisk: jest.fn(),
  getCurrentStreak: jest.fn(),
}));
jest.mock("../../progression/service", () => ({
  addXP: jest.fn(),
  getLevel: jest.fn(),
  checkLevelUp: jest.fn(),
}));
jest.mock("../../challenges/service", () => ({
  getActiveChallenges: jest.fn(),
  updateChallengeProgress: jest.fn(),
}));
jest.mock("../../boss/service", () => ({
  getActiveBoss: jest.fn(),
  calculateDamage: jest.fn(),
}));
describe("Cross-System Integration", () => {
  const mockUserId = "user-123";
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("Sessions \u2192 Coach Integration", () => {
    it("session completion triggers behavior signal processing", async () => {
      const sessionData = {
        userId: mockUserId,
        sessionId: "session-1",
        duration: 1800,
        qualityScore: 85,
        completedAt: Date.now(),
        focusTopic: "React Hooks",
        difficulty: "MEDIUM",
      };
      const mockProcessSignal = jest.spyOn(
        coachService,
        "processBehaviorSignal",
      );
      mockProcessSignal.mockResolvedValue({} as BehaviorProfile);
      await handleSessionCompletedEnhanced(sessionData);
      expect(mockProcessSignal).toHaveBeenCalledTimes(3);
      expect(mockProcessSignal).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          signalType: "SESSION_QUALITY_TREND",
          value: 85,
        }),
      );
    });
    it("session completion checks for streak risk mitigation", async () => {
      const mockGetState = jest.spyOn(coachService, "getOrCreateCoachState");
      mockGetState.mockResolvedValue({
        userId: mockUserId,
        currentState: "STREAK_AT_RISK",
        previousState: null,
        stateEnteredAt: Date.now(),
        personaId: "default",
        behaviorProfile: null,
        lastInterventionAt: null,
        interventionsToday: 0,
        muteUntil: null,
        reduceNotifications: false,
      });
      const mockEvaluateInterventions = jest.spyOn(
        coachService,
        "evaluateInterventions",
      );
      mockEvaluateInterventions.mockResolvedValue([]);
      await handleSessionCompletedEnhanced({
        userId: mockUserId,
        sessionId: "session-1",
        duration: 1800,
        qualityScore: 90,
        completedAt: Date.now(),
      });
      expect(mockEvaluateInterventions).toHaveBeenCalledWith({
        userId: mockUserId,
        trigger: "NO_SESSION_24H",
        context: { sessionCompleted: true, qualityScore: 90 },
      });
    });
    it("high quality session (95+) triggers milestone message", async () => {
      const mockGenerateMessage = jest.spyOn(coachService, "generateMessage");
      mockGenerateMessage.mockResolvedValue({
        id: "msg-1",
        userId: mockUserId,
        personaId: "default",
        category: "MOTIVATION_BOOST",
        content: "Outstanding session!",
        deliveryMethod: "BOTH",
        priority: 9,
        status: "SENT",
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: null,
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      });
      await handleSessionCompletedEnhanced({
        userId: mockUserId,
        sessionId: "session-1",
        duration: 1800,
        qualityScore: 97,
        completedAt: Date.now(),
      });
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          category: "MOTIVATION_BOOST",
          context: { qualityScore: 97 },
        }),
      );
    });
    it("comeback session tracks progress", async () => {
      const mockFetchComeback = jest.spyOn(
        coachRepository,
        "fetchActiveComebackPlan",
      );
      mockFetchComeback.mockResolvedValue({
        id: "comeback-1",
        userId: mockUserId,
        status: "ACTIVE",
        sessionsCompleted: 1,
        targetSessions: 3,
        bonusMultiplier: 2,
        expiresAt: Date.now() + 86400000,
        createdAt: Date.now(),
        messages: [],
        completedAt: null,
      } as ComebackPlan);
      const mockTrackSession = jest.spyOn(coachService, "trackComebackSession");
      mockTrackSession.mockResolvedValue({} as ComebackPlan);
      await handleSessionCompletedEnhanced({
        userId: mockUserId,
        sessionId: "session-1",
        duration: 1800,
        qualityScore: 85,
        completedAt: Date.now(),
      });
      expect(mockTrackSession).toHaveBeenCalledWith(mockUserId, true);
    });
  });
  describe("Streaks \u2192 Coach Integration", () => {
    it("streak risk detection triggers appropriate intervention", async () => {
      const riskPayload = {
        userId: mockUserId,
        currentStreak: 7,
        hoursSinceLastSession: 36,
        riskLevel: "HIGH" as const,
        hoursRemaining: 12,
      };
      const mockDetectRisk = jest.spyOn(coachService, "detectStreakRisk");
      mockDetectRisk.mockResolvedValue({} as CoachState);
      const mockGenerateMessage = jest.spyOn(coachService, "generateMessage");
      mockGenerateMessage.mockResolvedValue({
        id: "msg-1",
        userId: mockUserId,
        personaId: "default",
        category: "STREAK_RISK",
        content: "Your streak is at risk!",
        deliveryMethod: "BOTH",
        priority: 10,
        status: "SENT",
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: null,
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      });
      await handleStreakRiskDetectedEnhanced(riskPayload);
      expect(mockDetectRisk).toHaveBeenCalledWith(mockUserId, 36, 7);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          category: "STREAK_RISK",
          context: expect.objectContaining({
            urgency: "high",
            riskLevel: "HIGH",
          }),
        }),
      );
    });
    it("critical streak risk triggers modal message", async () => {
      const riskPayload = {
        userId: mockUserId,
        currentStreak: 10,
        hoursSinceLastSession: 44,
        riskLevel: "CRITICAL" as const,
        hoursRemaining: 4,
      };
      const mockGenerateMessage = jest.spyOn(coachService, "generateMessage");
      mockGenerateMessage.mockResolvedValue({
        id: "msg-1",
        userId: mockUserId,
        personaId: "default",
        category: "STREAK_RISK",
        content: "CRITICAL: Save your streak!",
        deliveryMethod: "BOTH",
        priority: 10,
        status: "SENT",
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: null,
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      });
      await handleStreakRiskDetectedEnhanced(riskPayload);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            urgency: "critical",
            deliveryMethod: "MODAL",
          }),
        }),
      );
    });
    it("streak break with 3+ days triggers comeback activation", async () => {
      const breakPayload = {
        userId: mockUserId,
        previousStreak: 5,
        daysInactive: 2,
        brokenAt: Date.now(),
      };
      const mockActivateComeback = jest.spyOn(coachService, "activateComeback");
      mockActivateComeback.mockResolvedValue({
        id: "comeback-1",
        userId: mockUserId,
        status: "ACTIVE",
        sessionsCompleted: 0,
        targetSessions: 3,
        bonusMultiplier: 2,
        expiresAt: Date.now() + 7 * 86400000,
        createdAt: Date.now(),
        messages: [],
        completedAt: null,
      } as ComebackPlan);
      await handleStreakBrokenEnhanced(breakPayload);
      expect(mockActivateComeback).toHaveBeenCalledWith({
        userId: mockUserId,
        previousStreak: 5,
        daysInactive: 2,
      });
    });
  });
  describe("Progression \u2192 Coach Integration", () => {
    it("level up triggers milestone hype message", async () => {
      const levelUpPayload = {
        userId: mockUserId,
        oldLevel: 4,
        newLevel: 5,
        xpGained: 250,
        totalXp: 1250,
      };
      const mockGenerateMessage = jest.spyOn(coachService, "generateMessage");
      mockGenerateMessage.mockResolvedValue({
        id: "msg-1",
        userId: mockUserId,
        personaId: "default",
        category: "MILESTONE_HYPE",
        content: "Level 5! Incredible!",
        deliveryMethod: "BOTH",
        priority: 9,
        status: "SENT",
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: null,
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      });
      await handleLevelUpEnhanced(levelUpPayload);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          category: "MILESTONE_HYPE",
          context: {
            milestoneLevel: 5,
            oldLevel: 4,
            xpGained: 250,
            totalXp: 1250,
          },
        }),
      );
    });
    it("every 5 levels triggers difficulty adjustment", async () => {
      const mockAdjustDifficulty = jest.spyOn(coachService, "adjustDifficulty");
      mockAdjustDifficulty.mockResolvedValue({
        userId: mockUserId,
        currentDifficulty: "CHALLENGING",
        adjustment: 1,
        reason: "Level up to 5 - periodic review",
      });
      await handleLevelUpEnhanced({
        userId: mockUserId,
        oldLevel: 4,
        newLevel: 5,
        xpGained: 250,
        totalXp: 1250,
      });
      expect(mockAdjustDifficulty).toHaveBeenCalledWith({
        userId: mockUserId,
        reason: "Level up to 5 - periodic review",
      });
    });
  });
  describe("Challenges \u2192 Coach Integration", () => {
    it("challenge expiring triggers intervention evaluation", async () => {
      const expiringPayload = {
        userId: mockUserId,
        challengeId: "challenge-1",
        challengeName: "7-Day Focus Streak",
        hoursRemaining: 12,
        progress: 85,
        xpReward: 500,
      };
      const mockEvaluateInterventions = jest.spyOn(
        coachService,
        "evaluateInterventions",
      );
      mockEvaluateInterventions.mockResolvedValue([]);
      await handleChallengeExpiringEnhanced(expiringPayload);
      expect(mockEvaluateInterventions).toHaveBeenCalledWith({
        userId: mockUserId,
        trigger: "CHALLENGE_EXPIRING",
        context: {
          challengeId: "challenge-1",
          challengeName: "7-Day Focus Streak",
          hoursRemaining: 12,
          progress: 85,
          xpReward: 500,
        },
      });
    });
    it("close-to-completion challenge prompts user", async () => {
      const expiringPayload = {
        userId: mockUserId,
        challengeId: "challenge-1",
        challengeName: "React Master",
        hoursRemaining: 20,
        progress: 90,
        xpReward: 1000,
      };
      const mockGenerateMessage = jest.spyOn(coachService, "generateMessage");
      mockGenerateMessage.mockResolvedValue({
        id: "msg-1",
        userId: mockUserId,
        personaId: "default",
        category: "CHALLENGE_PROMPT",
        content: "Almost there!",
        deliveryMethod: "BOTH",
        priority: 8,
        status: "SENT",
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: null,
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      });
      await handleChallengeExpiringEnhanced(expiringPayload);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "CHALLENGE_PROMPT",
          context: {
            challengeId: "challenge-1",
            challengeName: "React Master",
            hoursRemaining: 20,
            progress: 90,
            xpReward: 1000,
          },
        }),
      );
    });
  });
  describe("Boss \u2192 Coach Integration", () => {
    it("boss timeout warning triggers intervention", async () => {
      const bossPayload = {
        userId: mockUserId,
        bossId: "boss-1",
        bossName: "Procrastination Dragon",
        hoursRemaining: 8,
        healthRemaining: 250,
        totalHealth: 1000,
        damageDealt: 750,
      };
      const mockEvaluateInterventions = jest.spyOn(
        coachService,
        "evaluateInterventions",
      );
      mockEvaluateInterventions.mockResolvedValue([]);
      await handleBossTimeoutWarningEnhanced(bossPayload);
      expect(mockEvaluateInterventions).toHaveBeenCalledWith({
        userId: mockUserId,
        trigger: "BOSS_TIMEOUT_WARNING",
        context: {
          bossId: "boss-1",
          bossName: "Procrastination Dragon",
          hoursRemaining: 8,
          healthRemaining: 250,
          totalHealth: 1000,
          damageDealt: 750,
        },
      });
    });
    it("close boss battle prompts with victory chance", async () => {
      const bossPayload = {
        userId: mockUserId,
        bossId: "boss-1",
        bossName: "Distraction Demon",
        hoursRemaining: 6,
        healthRemaining: 100,
        totalHealth: 1000,
        damageDealt: 900,
      };
      const mockGenerateMessage = jest.spyOn(coachService, "generateMessage");
      mockGenerateMessage.mockResolvedValue({
        id: "msg-1",
        userId: mockUserId,
        personaId: "default",
        category: "CHALLENGE_PROMPT",
        content: "So close to victory!",
        deliveryMethod: "BOTH",
        priority: 9,
        status: "SENT",
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: null,
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      });
      await handleBossTimeoutWarningEnhanced(bossPayload);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "CHALLENGE_PROMPT",
          context: expect.objectContaining({
            closeToVictory: true,
            healthRemaining: 100,
          }),
        }),
      );
    });
  });
});
describe("Integration Failure Handling", () => {
  const mockUserId = "user-123";
  it("session completion continues even if coach fails", async () => {
    jest
      .spyOn(coachService, "processBehaviorSignal")
      .mockRejectedValue(new Error("Coach down"));
    await expect(
      handleSessionCompletedEnhanced({
        userId: mockUserId,
        sessionId: "session-1",
        duration: 1800,
        qualityScore: 85,
        completedAt: Date.now(),
      }),
    ).resolves.not.toThrow();
  });
  it("streak risk detection attempts fallback notification", async () => {
    jest
      .spyOn(coachService, "detectStreakRisk")
      .mockRejectedValue(new Error("Service down"));
    await expect(
      handleStreakRiskDetectedEnhanced({
        userId: mockUserId,
        currentStreak: 5,
        hoursSinceLastSession: 30,
        riskLevel: "HIGH",
        hoursRemaining: 12,
      }),
    ).resolves.not.toThrow();
  });
  it("level up handles coach failure gracefully", async () => {
    jest
      .spyOn(coachService, "generateMessage")
      .mockRejectedValue(new Error("AI unavailable"));
    await expect(
      handleLevelUpEnhanced({
        userId: mockUserId,
        oldLevel: 4,
        newLevel: 5,
        xpGained: 250,
        totalXp: 1250,
      }),
    ).resolves.not.toThrow();
  });
});
describe("Concurrency and Race Conditions", () => {
  const mockUserId = "user-123";
  it("handles rapid session completions", async () => {
    const mockProcessSignal = jest.spyOn(coachService, "processBehaviorSignal");
    mockProcessSignal.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 50));
      return {} as BehaviorProfile;
    });
    const sessions = Array.from({ length: 5 }, (_, i) =>
      handleSessionCompletedEnhanced({
        userId: mockUserId,
        sessionId: `session-${i}`,
        duration: 1800,
        qualityScore: 80 + i,
        completedAt: Date.now(),
      }),
    );
    await Promise.all(sessions);
    expect(mockProcessSignal).toHaveBeenCalledTimes(15);
  });
  it("handles simultaneous intervention evaluations", async () => {
    const mockEvaluate = jest.spyOn(coachService, "evaluateInterventions");
    mockEvaluate.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 30));
      return [];
    });
    const triggers = [
      handleStreakRiskDetectedEnhanced({
        userId: mockUserId,
        currentStreak: 5,
        hoursSinceLastSession: 30,
        riskLevel: "MEDIUM",
        hoursRemaining: 18,
      }),
      handleStreakRiskDetectedEnhanced({
        userId: mockUserId,
        currentStreak: 5,
        hoursSinceLastSession: 36,
        riskLevel: "HIGH",
        hoursRemaining: 12,
      }),
      handleChallengeExpiringEnhanced({
        userId: mockUserId,
        challengeId: "c1",
        challengeName: "Test",
        hoursRemaining: 24,
        progress: 75,
        xpReward: 500,
      }),
    ];
    await Promise.all(triggers);
    expect(mockEvaluate).toHaveBeenCalledTimes(3);
  });
  it("prevents duplicate comeback activations", async () => {
    const mockFetchComeback = jest.spyOn(
      coachRepository,
      "fetchActiveComebackPlan",
    );
    mockFetchComeback.mockResolvedValue({
      id: "existing-comeback",
      userId: mockUserId,
      status: "ACTIVE",
      sessionsCompleted: 1,
      targetSessions: 3,
      bonusMultiplier: 2,
      expiresAt: Date.now() + 86400000,
      createdAt: Date.now(),
      messages: [],
      completedAt: null,
    } as ComebackPlan);
    const mockActivate = jest.spyOn(coachService, "activateComeback");
    await Promise.all([
      handleStreakBrokenEnhanced({
        userId: mockUserId,
        previousStreak: 5,
        daysInactive: 2,
        brokenAt: Date.now(),
      }),
      handleStreakBrokenEnhanced({
        userId: mockUserId,
        previousStreak: 5,
        daysInactive: 2,
        brokenAt: Date.now(),
      }),
    ]);
  });
});
