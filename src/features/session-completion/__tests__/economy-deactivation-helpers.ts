/**
 * Phase 6 — Economy Deactivation Verification — shared helpers
 */
import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import type { CompletionLedger } from '../schemas';

export const mockOrder: string[] = [];
export const mockAddXP = jest.fn(async (): Promise<void> => {
  mockOrder.push('progression');
});

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../features/focus-identity/update-focus-score.helper', () => ({
  updateFocusScoreFromSessionCompletion: jest.fn(async (): Promise<void> => {
    mockOrder.push('focus-identity');
  }),
}));

jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest.fn(() => ({ addXP: mockAddXP })),
}));

jest.mock('../../../streaks/StreakService', () => ({
  getStreakService: jest.fn(() => ({
    recordSession: jest.fn(async (): Promise<{ currentStreak: number }> => {
      mockOrder.push('streak');
      return { currentStreak: 5 };
    }),
  })),
}));

jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn(() => ({
    grantReward: jest.fn(async (): Promise<void> => {
      mockOrder.push('rewards');
    }),
  })),
}));

jest.mock('../../companion/service', () => ({
  getCompanionService: jest.fn(() => ({
    completeSession: jest.fn((): { evolved: boolean; leveledUp: boolean } => {
      mockOrder.push('companion');
      return { evolved: false, leveledUp: true };
    }),
  })),
}));

jest.mock('../../liveops-config/feature-access-store', () => ({
  getAvailabilityFor: jest.fn(() => ({ canUseBackend: true, canNavigate: true, canQuery: true })),
}));


export const baseLedger: CompletionLedger = {
  companionReactionId: null,
  completedAt: 2000000,
  completedDurationSeconds: 1500,
  createdAt: 2000000,
  dailyMissionResult: {
    missionId: null,
    progressDelta: 0,
    status: 'unchanged',
  },
  degradedSystems: [],
  effectiveFocusedSeconds: 1400,
  focusScoreDelta: 8,
  grade: 'A',
  gradeScore: 88,
  idempotencyKey: '55555555-5555-4555-8555-555555555500:completed',
  interruptionCount: 0,
  ledgerId: '55555555-5555-4555-8555-555555555501',
  mode: SessionMode.FLOW,
  offlineSyncStatus: 'synced',
  pauseCount: 0,
  qualityScore: 88,
  rewardIds: [],
  sessionId: '55555555-5555-4555-8555-555555555500',
  startedAt: 500000,
  streakResult: { action: 'extended', newDays: 4, previousDays: 3 },
  strictMode: false,
  targetDurationSeconds: 1500,
  timezone: 'UTC',
  userId: '55555555-5555-4555-8555-555555555555',
  xpDelta: 120,
};

export const baseSummary: SessionSummary = {
  actualDuration: 1500,
  baseScore: 100,
  bonuses: [],
  coinsEarned: 50,
  completionPercentage: 100,
  createdAt: 500000,
  damageTaken: 0,
  effectiveDuration: 1400,
  finalScore: 120,
  focusPurityScore: 95,
  focusQuality: 95,
  gemsEarned: 0,
  interruptions: 0,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1500,
  sessionId: '55555555-5555-4555-8555-555555555500',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakBonus: 10,
  streakDays: 4,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 10,
  userId: '55555555-5555-4555-8555-555555555555',
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 120,
};

export function resetEconomyMocks(): void {
  mockOrder.length = 0;
  jest.clearAllMocks();
}
