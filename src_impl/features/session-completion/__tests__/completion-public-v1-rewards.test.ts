import { applyCompletionSubsystems } from '../completion-subsystems';
import type { CompletionLedger } from '../schemas';
import type { SessionSummary } from '../../../session/types';
import { SessionMode } from '../../../session/modes';
import { setFeatureAccessMap } from '../../liveops-config/feature-access-store';
import type { FeatureAccessMap } from '../../liveops-config/feature-access';

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../features/focus-identity/update-focus-score.helper', () => ({
  updateFocusScoreFromSessionCompletion: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest.fn().mockReturnValue({ addXP: jest.fn().mockResolvedValue(undefined) }),
}));

jest.mock('../../../streaks/StreakService', () => ({
  getStreakService: jest.fn().mockReturnValue({ recordSession: jest.fn().mockResolvedValue({ currentStreak: 5 }) }),
}));

jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn().mockReturnValue({ grantReward: jest.fn().mockResolvedValue(undefined), setUserId: jest.fn() }),
}));

jest.mock('../../../features/companion/service', () => ({
  getCompanionService: jest.fn().mockReturnValue({ completeSession: jest.fn().mockReturnValue({ evolved: false }) }),
}));

jest.mock('../completion-analytics', () => ({
  trackCompletionAnalytics: jest.fn(),
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

describe('Public V1 completion rewards — no economy leakage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setFeatureAccessMap({
      companion_detail: {
        isUnlocked: true, isVisible: true, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: 'test', releaseState: 'core',
      },
      challenges: {
        isUnlocked: true, isVisible: true, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: 'test', releaseState: 'core',
      },
    } as FeatureAccessMap);
  });

  it('public v1 completion awards XP (not coins or gems)', async () => {
    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(result.ledger.rewardIds.every((id) => id.startsWith('session-xp:'))).toBe(true);
    expect(result.ledger.rewardIds.join(' ')).not.toContain('currency');
    expect(result.ledger.rewardIds.join(' ')).not.toContain('coin');
    expect(result.ledger.rewardIds.join(' ')).not.toContain('gem');
  });

  it('no premium currency is awarded', async () => {
    const { getRewardService } = require('../../../rewards/RewardService');
    await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    const rewardService = getRewardService();
    const grantCalls = rewardService.grantReward?.mock?.calls ?? [];
    for (const call of grantCalls) {
      expect(call[0]).not.toBe('COINS');
      expect(call[0]).not.toBe('GEMS');
      expect(call[0]).not.toBe('CURRENCY');
      if (call[0]) {
        expect(call[0]).toBe('XP');
      }
    }
  });

  it('reward ledger remains idempotent', async () => {
    const result1 = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });
    const result2 = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(result1.ledger.rewardIds).toEqual(result2.ledger.rewardIds);
    expect(result1.ledger.xpDelta).toEqual(result2.ledger.xpDelta);
  });

  it('no shop/inventory/battle pass CTA appears from completion', async () => {
    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    const allIds = result.ledger.rewardIds.join(' ');
    expect(allIds).not.toContain('shop');
    expect(allIds).not.toContain('inventory');
    expect(allIds).not.toContain('battle-pass');
    expect(allIds).not.toContain('battle_pass');
  });
});
