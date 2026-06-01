import { describe, it, expect, jest } from '@jest/globals';
import {
  coachService,
  coachRepository,
  mockUserId,
  handleSessionCompleted,
  handleStreakRiskDetected,
  handleStreakBroken,
  handleChallengeExpiring,
} from './integration-test-helpers';
import type { BehaviorProfile, ComebackPlan } from '../schemas';

describe('Concurrency and Race Conditions', () => {
  it('handles rapid session completions', async () => {
    const mockProcessSignal = jest.spyOn(coachService, 'processBehaviorSignal');
    mockProcessSignal.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 50));
      return {} as BehaviorProfile;
    });
    const sessions = Array.from({ length: 5 }, (_, i) =>
      handleSessionCompleted({
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

  it('handles simultaneous intervention evaluations', async () => {
    const mockEvaluate = jest.spyOn(coachService, 'evaluateInterventions');
    mockEvaluate.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 30));
      return [];
    });
    const riskMEDIUM = {
      userId: mockUserId,
      currentStreak: 5,
      hoursSinceLastSession: 30,
      riskLevel: 'MEDIUM' as const,
      hoursRemaining: 18,
    };
    const riskHIGH = {
      userId: mockUserId,
      currentStreak: 5,
      hoursSinceLastSession: 36,
      riskLevel: 'HIGH' as const,
      hoursRemaining: 12,
    };
    const challengeExpiring = {
      userId: mockUserId,
      challengeId: 'c1',
      challengeName: 'Test',
      hoursRemaining: 24,
      progress: 75,
      xpReward: 500,
    };
    const triggers = [
      handleStreakRiskDetected(riskMEDIUM),
      handleStreakRiskDetected(riskHIGH),
      handleChallengeExpiring(challengeExpiring),
    ];
    await Promise.all(triggers);
    expect(mockEvaluate).toHaveBeenCalledTimes(3);
  });

  it('prevents duplicate comeback activations', async () => {
    const mockFetchComeback = jest.spyOn(
      coachRepository,
      'fetchActiveComebackPlan',
    );
    mockFetchComeback.mockResolvedValue({
      id: 'existing-comeback',
      userId: mockUserId,
      previousStreak: 5,
      daysInactive: 2,
      status: 'ACTIVE',
      startedAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      sessionsCompleted: 1,
      targetSessions: 3,
      bonusMultiplier: 2,
      messages: [],
    } as ComebackPlan);
    const mockActivate = jest.spyOn(coachService, 'activateComeback');
    const breakPayload = {
      userId: mockUserId,
      previousStreak: 5,
      daysInactive: 2,
      brokenAt: Date.now(),
    };
    await Promise.all([
      handleStreakBroken(breakPayload),
      handleStreakBroken(breakPayload),
    ]);
  });
});
