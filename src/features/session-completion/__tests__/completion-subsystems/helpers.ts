import { SessionMode } from '../../../../session/modes';
import type { SessionSummary } from '../../../../session/types';
import { applyCompletionSubsystems } from '../../completion-subsystems';
import type { CompletionLedger } from '../../schemas';
import { setFeatureAccessMap } from '../../../liveops-config/feature-access-store';
import type { FeatureAccessMap } from '../../../liveops-config/feature-access';

export { applyCompletionSubsystems, setFeatureAccessMap };
export type { CompletionLedger, FeatureAccessMap, SessionSummary };

export const mockOrder: string[] = [];
export const mockCaptureException = jest.fn();
export const mockAddBreadcrumb = jest.fn();
export const mockRecordSession = jest.fn(
  async (): Promise<{ currentStreak: number }> => {
    mockOrder.push('streak');
    return { currentStreak: 5 };
  },
);
export const mockAddXP = jest.fn(async (): Promise<void> => {
  mockOrder.push('progression');
});
export const mockGrantReward = jest.fn(async (): Promise<void> => {
  mockOrder.push('rewards');
});
export const mockCompleteSession = jest.fn(
  (): { evolved: boolean; leveledUp: boolean } => {
    mockOrder.push('companion');
    return { evolved: false, leveledUp: true };
  },
);

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

jest.mock(
  '../../../../features/focus-identity/update-focus-score.helper',
  () => ({
    updateFocusScoreFromSessionCompletion: jest.fn(async (): Promise<void> => {
      mockOrder.push('focus-identity');
    }),
  }),
);

jest.mock('../../../../progression/ProgressionService', () => ({
  getProgressionService: jest.fn(() => ({ addXP: mockAddXP })),
}));

jest.mock('../../../../streaks/StreakService', () => ({
  getStreakService: jest.fn(() => ({ recordSession: mockRecordSession })),
}));

jest.mock('../../../../rewards/RewardService', () => ({
  getRewardService: jest.fn(() => ({ grantReward: mockGrantReward })),
}));

jest.mock('../../../../features/companion/service', () => ({
  getCompanionService: jest.fn(() => ({
    completeSession: mockCompleteSession,
  })),
}));

jest.mock('../../analytics', () => ({
  trackSessionCompleted: jest.fn(),
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
  idempotencyKey: '550e8400-e29b-41d4-a716-446655440000:completed',
  interruptionCount: 0,
  ledgerId: '550e8400-e29b-41d4-a716-446655440001',
  mode: SessionMode.FLOW,
  offlineSyncStatus: 'synced',
  pauseCount: 0,
  qualityScore: 88,
  rewardIds: [],
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  startedAt: 500000,
  streakResult: { action: 'extended', newDays: 4, previousDays: 3 },
  strictMode: false,
  targetDurationSeconds: 1500,
  timezone: 'UTC',
  userId: 'user-123',
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
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakBonus: 10,
  streakDays: 4,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 10,
  userId: 'user-123',
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 120,
};

export function resetMocks(): void {
  mockOrder.length = 0;
  jest.clearAllMocks();
  setFeatureAccessMap({
    companion_detail: {
      isUnlocked: true,
      isVisible: true,
      lockedDescription: '',
      recommendedUnlockMoment: '',
      unlockReason: 'test',
      releaseState: 'final_release_core',
    },
    challenges: {
      isUnlocked: true,
      isVisible: true,
      lockedDescription: '',
      recommendedUnlockMoment: '',
      unlockReason: 'test',
      releaseState: 'final_release_core',
    },
  } as FeatureAccessMap);
}
