import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  coachService,
  coachRepository,
  mockUserId,
  handleSessionCompleted,
} from "./integration-test-helpers";
import type { BehaviorProfile, ComebackPlan } from "../schemas";

describe("Cross-System Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Sessions → Coach Integration", () => {
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
      await handleSessionCompleted(sessionData);
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
      await handleSessionCompleted({
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
      await handleSessionCompleted({
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
        previousStreak: 3,
        daysInactive: 2,
        status: "ACTIVE",
        startedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        sessionsCompleted: 1,
        targetSessions: 3,
        bonusMultiplier: 2,
        messages: [],
      } as ComebackPlan);
      const mockTrackSession = jest.spyOn(coachService, "trackComebackSession");
      mockTrackSession.mockResolvedValue({} as ComebackPlan);
      await handleSessionCompleted({
        userId: mockUserId,
        sessionId: "session-1",
        duration: 1800,
        qualityScore: 85,
        completedAt: Date.now(),
      });
      expect(mockTrackSession).toHaveBeenCalledWith(mockUserId, true);
    });
  });
});
