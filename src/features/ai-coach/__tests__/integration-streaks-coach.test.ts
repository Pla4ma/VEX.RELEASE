import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  coachService,
  mockUserId,
  handleStreakRiskDetected,
  handleStreakBroken,
} from './integration-test-helpers';
import type { CoachState, ComebackPlan } from '../schemas';

describe('Cross-System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Streaks → Coach Integration', () => {
    it('streak risk detection triggers appropriate intervention', async () => {
      const riskPayload = {
        userId: mockUserId,
        currentStreak: 7,
        hoursSinceLastSession: 36,
        riskLevel: 'HIGH' as const,
        hoursRemaining: 12,
      };
      const mockDetectRisk = jest.spyOn(coachService, 'detectStreakRisk');
      mockDetectRisk.mockResolvedValue({} as CoachState);
      const mockGenerateMessage = jest.spyOn(coachService, 'generateMessage');
      mockGenerateMessage.mockResolvedValue({
        id: 'msg-1',
        userId: mockUserId,
        personaId: 'default',
        category: 'STREAK_RISK',
        content: 'Your streak is at risk!',
        deliveryMethod: 'BOTH',
        priority: 10,
        status: 'SENT',
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: null,
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      });
      await handleStreakRiskDetected(riskPayload);
      expect(mockDetectRisk).toHaveBeenCalledWith(mockUserId, 36, 7);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUserId,
          category: 'STREAK_RISK',
          context: expect.objectContaining({
            urgency: 'high',
            riskLevel: 'HIGH',
          }),
        }),
      );
    });

    it('critical streak risk triggers modal message', async () => {
      const riskPayload = {
        userId: mockUserId,
        currentStreak: 10,
        hoursSinceLastSession: 44,
        riskLevel: 'CRITICAL' as const,
        hoursRemaining: 4,
      };
      const mockGenerateMessage = jest.spyOn(coachService, 'generateMessage');
      mockGenerateMessage.mockResolvedValue({
        id: 'msg-1',
        userId: mockUserId,
        personaId: 'default',
        category: 'STREAK_RISK',
        content: 'CRITICAL: Save your streak!',
        deliveryMethod: 'BOTH',
        priority: 10,
        status: 'SENT',
        createdAt: Date.now(),
        scheduledFor: null,
        deliveredAt: null,
        readAt: null,
        dismissedAt: null,
        actionTaken: null,
        actionTakenAt: null,
      });
      await handleStreakRiskDetected(riskPayload);
      expect(mockGenerateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            urgency: 'critical',
            deliveryMethod: 'MODAL',
          }),
        }),
      );
    });

    it('streak break with 3+ days triggers comeback activation', async () => {
      const breakPayload = {
        userId: mockUserId,
        previousStreak: 5,
        daysInactive: 2,
        brokenAt: Date.now(),
      };
      const mockActivateComeback = jest.spyOn(coachService, 'activateComeback');
      mockActivateComeback.mockResolvedValue({
        id: 'comeback-1',
        userId: mockUserId,
        previousStreak: 5,
        daysInactive: 2,
        status: 'ACTIVE',
        startedAt: Date.now(),
        expiresAt: Date.now() + 7 * 86400000,
        sessionsCompleted: 0,
        targetSessions: 3,
        bonusMultiplier: 2,
        messages: [],
      } as ComebackPlan);
      await handleStreakBroken(breakPayload);
      expect(mockActivateComeback).toHaveBeenCalledWith({
        userId: mockUserId,
        previousStreak: 5,
        daysInactive: 2,
      });
    });
  });
});
