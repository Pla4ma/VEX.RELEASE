import { jest } from '@jest/globals';
import { SessionRewardIntegration } from '../../SessionRewardIntegration';
import { eventBus } from '../../../../events';
import type { SessionSummary } from '../../../types';

jest.mock('../../../../events');

export { SessionRewardIntegration, eventBus };
export type { SessionSummary };


export function createMockSummary(
  overrides: Partial<SessionSummary> = {},
): any {
  return {
    sessionId: 'test-session',
    userId: 'test-user',
    status: 'COMPLETED',
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
  };
}

export function setupMocks(): { publish: jest.Mock; subscribe: jest.Mock } {
  jest.clearAllMocks();
  const mockEventBus = { publish: jest.fn(), subscribe: jest.fn() };
  (eventBus.publish as jest.Mock) = mockEventBus.publish;
  (eventBus.subscribe as jest.Mock) = mockEventBus.subscribe;
  void new SessionRewardIntegration({
    autoGrantRewards: true,
    autoUpdateStreak: true,
    autoAddXP: true,
    autoUpdateAnalytics: true,
    autoCreateSocialActivity: true,
    enableSeasonChallengeProgress: true,
    enableAchievementChecks: true,
    enableMilestoneTracking: true,
  });
  return mockEventBus;
}
