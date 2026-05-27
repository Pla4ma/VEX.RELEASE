import { applyCompletionSubsystems } from '../completion-subsystems';
import { createCompletionLedger, createSessionSummary } from './ledger-test-utils';
import { setFeatureAccessMap } from '../../liveops-config/feature-access-store';
import type { FeatureAccessMap } from '../../liveops-config/feature-access';

export { applyCompletionSubsystems, createCompletionLedger, createSessionSummary, setFeatureAccessMap };
export type { FeatureAccessMap };

export const defaultFeatureAccess: FeatureAccessMap = {
  companion_detail: {
    isUnlocked: true, isVisible: true, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: 'test', releaseState: 'final_release_core',
  },
  challenges: {
    isUnlocked: true, isVisible: true, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: 'test', releaseState: 'final_release_core',
  },
  boss_tab: {
    isUnlocked: false, isVisible: false, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: '', releaseState: 'final_release_deactivated',
  },
  shop: {
    isUnlocked: false, isVisible: false, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: '', releaseState: 'final_release_deactivated',
  },
  inventory: {
    isUnlocked: false, isVisible: false, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: '', releaseState: 'final_release_deactivated',
  },
  battle_pass: {
    isUnlocked: false, isVisible: false, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: '', releaseState: 'final_release_deactivated',
  },
  squads: {
    isUnlocked: false, isVisible: false, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: '', releaseState: 'final_release_deactivated',
  },
  rivals: {
    isUnlocked: false, isVisible: false, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: '', releaseState: 'final_release_deactivated',
  },
  social_tab: {
    isUnlocked: false, isVisible: false, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: '', releaseState: 'final_release_deactivated',
  },
  content_study: {
    isUnlocked: true, isVisible: true, lockedDescription: '',
    recommendedUnlockMoment: '', unlockReason: 'test', releaseState: 'final_release_core',
  },
} as FeatureAccessMap;

export function setupMocks(): void {
  jest.mock('@sentry/react-native', () => ({
    addBreadcrumb: jest.fn(),
    captureException: jest.fn(),
  }));
  jest.mock('../../focus-identity/update-focus-score.helper', () => ({
    updateFocusScoreFromSessionCompletion: jest.fn().mockResolvedValue(undefined),
  }));
  jest.mock('../../../progression/ProgressionService', () => ({
    getProgressionService: jest.fn().mockReturnValue({
      addXP: jest.fn().mockResolvedValue(undefined),
    }),
  }));
  jest.mock('../../../streaks/StreakService', () => ({
    getStreakService: jest.fn().mockReturnValue({
      recordSession: jest.fn().mockResolvedValue({ currentStreak: 5 }),
    }),
  }));
  jest.mock('../../../rewards/RewardService', () => ({
    getRewardService: jest.fn().mockReturnValue({
      grantReward: jest.fn().mockResolvedValue(undefined),
      setUserId: jest.fn(),
    }),
  }));
  jest.mock('../../companion/service', () => ({
    getCompanionService: jest.fn().mockReturnValue({
      completeSession: jest.fn().mockReturnValue({ evolved: false }),
    }),
  }));
  jest.mock('../completion-analytics', () => ({
    trackCompletionAnalytics: jest.fn(),
  }));
}

setupMocks();
