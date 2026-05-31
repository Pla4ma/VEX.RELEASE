import { applyCompletionSubsystems } from '../completion-subsystems';
import { setFeatureAccessMap } from '../../liveops-config/feature-access-store';
import type { FeatureAccessMap } from '../../liveops-config/feature-access';
import { baseLedger, baseSummary } from './completion-test-fixtures';

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../features/focus-identity/update-focus-score.helper', () => ({
  updateFocusScoreFromSessionCompletion: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest
    .fn()
    .mockReturnValue({ addXP: jest.fn().mockResolvedValue(undefined) }),
}));

jest.mock('../../../streaks/StreakService', () => ({
  getStreakService: jest
    .fn()
    .mockReturnValue({
      recordSession: jest.fn().mockResolvedValue({ currentStreak: 5 }),
    }),
}));

jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest
    .fn()
    .mockReturnValue({
      grantReward: jest.fn().mockResolvedValue(undefined),
      setUserId: jest.fn(),
    }),
}));

jest.mock('../../../features/companion/service', () => ({
  getCompanionService: jest
    .fn()
    .mockReturnValue({
      completeSession: jest.fn().mockReturnValue({ evolved: false }),
    }),
}));

jest.mock('../completion-analytics', () => ({
  trackCompletionAnalytics: jest.fn(),
}));



describe('Standard completion rewards - no economy leakage', () => {
  beforeEach(() => {
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
  });

  it('standard completion awards XP (not coins or gems)', async () => {
    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(
      result.ledger.rewardIds.every((id) => id.startsWith('session-xp:')),
    ).toBe(true);
    expect(result.ledger.rewardIds.join(' ')).not.toContain('currency');
    expect(result.ledger.rewardIds.join(' ')).not.toContain('coin');
    expect(result.ledger.rewardIds.join(' ')).not.toContain('gem');
  });

  it('no premium currency is awarded', async () => {
    const { getRewardService } = require('../../../rewards/RewardService');
    await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

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
    const result1 = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });
    const result2 = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(result1.ledger.rewardIds).toEqual(result2.ledger.rewardIds);
    expect(result1.ledger.xpDelta).toEqual(result2.ledger.xpDelta);
  });

  it('no shop/inventory/battle pass CTA appears from completion', async () => {
    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    const allIds = result.ledger.rewardIds.join(' ');
    expect(allIds).not.toContain('shop');
    expect(allIds).not.toContain('inventory');
    expect(allIds).not.toContain('battle-pass');
    expect(allIds).not.toContain('battle_pass');
  });
});
