import { describe, it, expect, jest } from '@jest/globals';
import {
  coachService,
  mockUserId,
  handleSessionCompleted,
  handleStreakRiskDetected,
  handleLevelUp,
} from './integration-test-helpers';

describe('Integration Failure Handling', () => {
  it('session completion continues even if coach fails', async () => {
    jest
      .spyOn(coachService, 'processBehaviorSignal')
      .mockRejectedValue(new Error('Coach down'));
    await expect(
      handleSessionCompleted({
        userId: mockUserId,
        sessionId: 'session-1',
        duration: 1800,
        qualityScore: 85,
        completedAt: Date.now(),
      }),
    ).resolves.not.toThrow();
  });

  it('streak risk detection attempts fallback notification', async () => {
    jest
      .spyOn(coachService, 'detectStreakRisk')
      .mockRejectedValue(new Error('Service down'));
    const payload = {
      userId: mockUserId,
      currentStreak: 5,
      hoursSinceLastSession: 30,
      riskLevel: 'HIGH' as const,
      hoursRemaining: 12,
    };
    await expect(
      handleStreakRiskDetected(payload),
    ).resolves.not.toThrow();
  });

  it('level up handles coach failure gracefully', async () => {
    jest
      .spyOn(coachService, 'generateMessage')
      .mockRejectedValue(new Error('AI unavailable'));
    const payload = {
      userId: mockUserId,
      oldLevel: 4,
      newLevel: 5,
      xpGained: 250,
      totalXp: 1250,
    };
    await expect(
      handleLevelUp(payload),
    ).resolves.not.toThrow();
  });
});
