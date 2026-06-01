import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  coachService,
  mockUserId,
  handleBossTimeoutWarning,
} from './integration-test-helpers';

describe('Cross-System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Boss → Coach Integration', () => {
    it('boss timeout warning triggers intervention', async () => {
      const bossPayload = {
        userId: mockUserId,
        bossId: 'boss-1',
        bossName: 'Procrastination Dragon',
        hoursRemaining: 8,
        healthRemaining: 250,
        totalHealth: 1000,
        damageDealt: 750,
      };
      const mockEvaluateInterventions = jest.spyOn(
        coachService,
        'evaluateInterventions',
      );
      mockEvaluateInterventions.mockResolvedValue([]);
      await handleBossTimeoutWarning(bossPayload);
      expect(mockEvaluateInterventions).toHaveBeenCalledWith({
        userId: mockUserId,
        trigger: 'BOSS_TIMEOUT_WARNING',
        context: {
          bossId: 'boss-1',
          bossName: 'Procrastination Dragon',
          hoursRemaining: 8,
          healthRemaining: 250,
        },
      });
    });

    it('close boss battle prompts with victory chance', async () => {
      const bossPayload = {
        userId: mockUserId,
        bossId: 'boss-1',
        bossName: 'Distraction Demon',
        hoursRemaining: 6,
        healthRemaining: 100,
        totalHealth: 1000,
        damageDealt: 900,
      };
      const mockGenerateMessage = jest.spyOn(coachService, 'generateMessage');
      mockGenerateMessage.mockResolvedValue({
        id: 'msg-1',
        userId: mockUserId,
        personaId: 'default',
        category: 'CHALLENGE_PROMPT',
        content: 'So close to victory!',
        deliveryMethod: 'BOTH',
        priority: 9,
        status: 'SENT',
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: null,
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      });
      await handleBossTimeoutWarning(bossPayload);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'CHALLENGE_PROMPT',
          context: expect.objectContaining({
            closeToVictory: true,
            healthRemaining: 100,
          }),
        }),
      );
    });
  });
});
