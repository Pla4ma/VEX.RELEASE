import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import { applyCompletionSubsystems } from '../completion-subsystems';
import type { CompletionLedger } from '../schemas';
import { setFeatureAccessMap } from '../../liveops-config/feature-access-store';
import type { FeatureAccessMap } from '../../liveops-config/feature-access';

const mockOrder: string[] = [];
const mockCaptureException = jest.fn();
const mockAddBreadcrumb = jest.fn();
const mockRecordSession = jest.fn(async (): Promise<{ currentStreak: number }> => {
  mockOrder.push('streak');
  return { currentStreak: 5 };
});
const mockAddXP = jest.fn(async (): Promise<void> => {
  mockOrder.push('progression');
});
const mockGrantReward = jest.fn(async (): Promise<void> => {
  mockOrder.push('rewards');
});
const mockCompleteSession = jest.fn((): { evolved: boolean; leveledUp: boolean } => {
  mockOrder.push('companion');
  return { evolved: false, leveledUp: true };
});

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
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
  getStreakService: jest.fn(() => ({ recordSession: mockRecordSession })),
}));

jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn(() => ({ grantReward: mockGrantReward })),
}));

jest.mock('../../../features/companion/service', () => ({
  getCompanionService: jest.fn(() => ({ completeSession: mockCompleteSession })),
}));

jest.mock('../analytics', () => ({
  trackSessionCompleted: jest.fn(),
}));

const baseLedger: CompletionLedger = {
  companionReactionId: null,
  completedAt: 2000000,
  completedDurationSeconds: 1500,
  createdAt: 2000000,
  dailyMissionResult: { missionId: null, progressDelta: 0, status: 'unchanged' },
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

const baseSummary: SessionSummary = {
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

describe('applyCompletionSubsystems', () => {
  beforeEach(() => {
    mockOrder.length = 0;
    jest.clearAllMocks();
    setFeatureAccessMap({
      companion_detail: {
        isUnlocked: true,
        isVisible: true,
        lockedDescription: '',
        recommendedUnlockMoment: '',
        unlockReason: 'test',
        releaseState: 'core',
      },
      challenges: {
        isUnlocked: true,
        isVisible: true,
        lockedDescription: '',
        recommendedUnlockMoment: '',
        unlockReason: 'test',
        releaseState: 'core',
      },
    } as FeatureAccessMap);
  });

  it('updates core systems in completion order and enriches the ledger', async () => {
    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(mockOrder).toEqual(['focus-identity', 'streak', 'progression', 'rewards', 'companion']);
    expect(result.degradedSystems).toEqual([]);
    expect(result.ledger.streakResult.newDays).toBe(5);
    expect(result.ledger.rewardIds).toEqual([`session-currency:${baseLedger.sessionId}`]);
    expect(result.ledger.companionReactionId).toBe('companion-session-complete');
    expect(result.ledger.dailyMissionResult.status).toBe('progressed');
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(expect.objectContaining({ message: 'vex_session_completed' }));
  });

  it('keeps the ledger when rewards fail and marks the story degraded', async () => {
    mockGrantReward.mockImplementationOnce(async (): Promise<void> => {
      mockOrder.push('rewards');
      throw new Error('reward unavailable');
    });

    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(result.ledger.ledgerId).toBe(baseLedger.ledgerId);
    expect(result.degradedSystems).toContain('rewards');
    expect(result.ledger.degradedSystems).toContain('rewards');
    expect(mockCaptureException).toHaveBeenCalled();
    expect(mockOrder).toContain('companion');
  });

  it('captures Focus Score failure and still awards downstream systems', async () => {
    const { updateFocusScoreFromSessionCompletion } = jest.requireMock(
      '../../../features/focus-identity/update-focus-score.helper'
    );
    (updateFocusScoreFromSessionCompletion as jest.Mock).mockImplementationOnce(async (): Promise<void> => {
      mockOrder.push('focus-identity');
      throw new Error('focus unavailable');
    });

    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(result.degradedSystems).toContain('focus-identity');
    expect(mockOrder).toEqual(['focus-identity', 'streak', 'progression', 'rewards', 'companion']);
    expect(result.ledger.rewardIds).toEqual([`session-currency:${baseLedger.sessionId}`]);
  });

  it('skips feature-dependent subsystems when feature is locked', async () => {
    setFeatureAccessMap({
      companion_detail: {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: 'locked',
        recommendedUnlockMoment: '',
        unlockReason: '',
        releaseState: 'progressive',
      },
      challenges: {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: 'locked',
        recommendedUnlockMoment: '',
        unlockReason: '',
        releaseState: 'progressive',
      },
    } as FeatureAccessMap);

    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(result.degradedSystems).toEqual([]);
    expect(mockOrder).toEqual(['focus-identity', 'streak', 'progression', 'rewards']);
    expect(result.ledger.companionReactionId).toBeNull();
    expect(result.ledger.dailyMissionResult.status).toBe('unchanged');
    expect(mockCompleteSession).not.toHaveBeenCalled();
  });
});
