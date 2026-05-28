import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  coachService,
  mockUserId,
  handleChallengeExpiring,
} from "./integration-test-helpers";

describe("Cross-System Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Challenges → Coach Integration", () => {
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
      await handleChallengeExpiring(expiringPayload);
      expect(mockEvaluateInterventions).toHaveBeenCalledWith({
        userId: mockUserId,
        trigger: "CHALLENGE_EXPIRING",
        context: {
          challengeId: "challenge-1",
          challengeName: "7-Day Focus Streak",
          hoursRemaining: 12,
          progress: 85,
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
      await handleChallengeExpiring(expiringPayload);
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
});
