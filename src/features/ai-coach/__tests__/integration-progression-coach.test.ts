import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  coachService,
  mockUserId,
  handleLevelUp,
} from "./integration-test-helpers";

describe("Cross-System Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Progression → Coach Integration", () => {
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
      await handleLevelUp(levelUpPayload);
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
      const payload = {
        userId: mockUserId,
        oldLevel: 4,
        newLevel: 5,
        xpGained: 250,
        totalXp: 1250,
      };
      await handleLevelUp(payload);
      expect(mockAdjustDifficulty).toHaveBeenCalledWith({
        userId: mockUserId,
        reason: "Level up to 5 - periodic review",
      });
    });
  });
});
