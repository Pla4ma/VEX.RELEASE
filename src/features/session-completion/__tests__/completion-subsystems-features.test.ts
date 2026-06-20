/* ── mock order tracking (available to mock factories via closure) ── */
const mockOrder: string[] = [];
const mockCaptureException = jest.fn();
const mockAddBreadcrumb = jest.fn();
const mockRecordSession = jest.fn(
  async (): Promise<{ currentStreak: number }> => {
    mockOrder.push('streak');
    return { currentStreak: 5 };
  },
);
const mockAddXP = jest.fn(async (): Promise<void> => {
  mockOrder.push('progression');
});
const mockGrantReward = jest.fn(async (): Promise<void> => {
  mockOrder.push('rewards');
});
const mockCompleteSession = jest.fn(
  (): { evolved: boolean; leveledUp: boolean } => {
    mockOrder.push('companion');
    return { evolved: false, leveledUp: true };
  },
);

/* ── top-level jest.mock calls (hoisted by Babel) ── */

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

jest.mock('../../focus-identity/update-focus-score.helper', () => ({
  updateFocusScoreFromSessionCompletion: jest.fn(
    async (): Promise<void> => {
      mockOrder.push('focus-identity');
    },
  ),
}));

jest.mock('../../../streaks/StreakService', () => ({
  getStreakService: jest.fn(() => ({ recordSession: mockRecordSession })),
}));

jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest.fn(() => ({ addXP: mockAddXP })),
}));

jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn(() => ({ grantReward: mockGrantReward })),
}));

jest.mock('../../companion/service', () => ({
  getCompanionService: jest.fn(() => ({
    completeSession: mockCompleteSession,
  })),
}));

jest.mock('../completion-analytics', () => ({
  trackCompletionAnalytics: jest.fn(),
}));

/* ── now safe to import the module under test ── */

import { applyCompletionSubsystems } from '../completion-subsystems';
import { setFeatureAccessMap } from '../../liveops-config/feature-access-store';
import type { FeatureAccessMap } from '../../liveops-config/feature-access';
import {
  baseLedger,
  baseSummary,
  defaultFeatureAccess,
} from './completion-subsystems.helpers';

describe('applyCompletionSubsystems', () => {
  beforeEach(() => {
    mockOrder.length = 0;
    jest.clearAllMocks();
    setFeatureAccessMap(defaultFeatureAccess);
  });

  it('skips feature-dependent subsystems when feature is locked', async () => {
    setFeatureAccessMap({
      companion_detail: {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: 'locked',
        recommendedUnlockMoment: '',
        unlockReason: '',
        releaseState: 'final_release_progressive',
      },
      challenges: {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: 'locked',
        recommendedUnlockMoment: '',
        unlockReason: '',
        releaseState: 'final_release_progressive',
      },
    } as FeatureAccessMap);

    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(result.degradedSystems).toEqual([]);
    expect(mockOrder).toEqual([
      'focus-identity',
      'streak',
      'progression',
      'rewards',
      'companion',
    ]);
    expect(result.ledger.companionReactionId).toBe('companion-session-complete');
    expect(result.ledger.dailyMissionResult.status).toBe('progressed');
    expect(mockCompleteSession).toHaveBeenCalled();
  });
});
