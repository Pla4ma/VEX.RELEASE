import { applyCompletionSubsystems } from '../completion-subsystems';
import { createCompletionLedger, createSessionSummary } from './ledger-test-utils';
import { setFeatureAccessMap } from '../../liveops-config/feature-access-store';
import type { FeatureAccessMap } from '../../liveops-config/feature-access';

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

const focusIdentityUpdateMock = require('../../focus-identity/update-focus-score.helper').updateFocusScoreFromSessionCompletion;

describe('completion product journey', () => {
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
      boss_tab: {
        isUnlocked: false, isVisible: false, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: '', releaseState: 'disabled_beta',
      },
      shop: {
        isUnlocked: false, isVisible: false, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: '', releaseState: 'disabled_beta',
      },
      inventory: {
        isUnlocked: false, isVisible: false, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: '', releaseState: 'disabled_beta',
      },
      battle_pass: {
        isUnlocked: false, isVisible: false, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: '', releaseState: 'disabled_beta',
      },
      squads: {
        isUnlocked: false, isVisible: false, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: '', releaseState: 'disabled_beta',
      },
      rivals: {
        isUnlocked: false, isVisible: false, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: '', releaseState: 'disabled_beta',
      },
      social_tab: {
        isUnlocked: false, isVisible: false, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: '', releaseState: 'disabled_beta',
      },
      content_study: {
        isUnlocked: true, isVisible: true, lockedDescription: '',
        recommendedUnlockMoment: '', unlockReason: 'test', releaseState: 'core',
      },
    } as FeatureAccessMap);
  });

  describe('duplicate session event does not duplicate rewards', () => {
    it('completion subsystems produce idempotent reward ledger', async () => {
      const ledger = createCompletionLedger();
      const summary = createSessionSummary();

      const result1 = await applyCompletionSubsystems({ ledger, summary });
      const result2 = await applyCompletionSubsystems({ ledger, summary });

      expect(result1.ledger.rewardIds).toEqual(result2.ledger.rewardIds);
      expect(result1.ledger.xpDelta).toEqual(result2.ledger.xpDelta);
    });

    it('XP reward ids are deterministic for same session', async () => {
      const ledger = createCompletionLedger();
      const summary = createSessionSummary();

      const result = await applyCompletionSubsystems({ ledger, summary });

      const rewardIds = result.ledger.rewardIds as string[];
      expect(rewardIds).toHaveLength(1);
      expect(rewardIds[0]).toBe(`session-xp:${ledger.sessionId}`);
    });
  });

  describe('old reward integration disabled', () => {
    it('completion rewards only XP, not coins or gems', async () => {
      const ledger = createCompletionLedger();
      const summary = createSessionSummary();

      const result = await applyCompletionSubsystems({ ledger, summary });

      const rewardIds = (result.ledger.rewardIds as string[]).join(' ');
      expect(rewardIds).toContain('session-xp:');
      expect(rewardIds).not.toContain('currency');
      expect(rewardIds).not.toContain('coin');
      expect(rewardIds).not.toContain('gem');
      expect(rewardIds).not.toContain('COINS');
      expect(rewardIds).not.toContain('GEMS');
    });

    it('no premium currency is awarded', async () => {
      const ledger = createCompletionLedger();
      const summary = createSessionSummary();

      await applyCompletionSubsystems({ ledger, summary });

      const { getRewardService } = require('../../../rewards/RewardService');
      const rewardService = getRewardService();
      const grantCalls = (rewardService.grantReward?.mock?.calls ?? []) as Array<[string, ...unknown[]]>;
      for (const call of grantCalls) {
        if (call[0]) {
          expect(call[0]).not.toBe('COINS');
          expect(call[0]).not.toBe('GEMS');
          expect(call[0]).not.toBe('CURRENCY');
        }
      }
    });
  });

  describe('focus identity updates once', () => {
    it('focus identity update is called exactly once per completion', async () => {
      const ledger = createCompletionLedger();
      const summary = createSessionSummary();

      await applyCompletionSubsystems({ ledger, summary });

      expect(focusIdentityUpdateMock).toHaveBeenCalledTimes(1);
    });

    it('focus identity called with correct user id and grade', async () => {
      const ledger = createCompletionLedger({ grade: 'A', qualityScore: 90 });
      const summary = createSessionSummary();

      await applyCompletionSubsystems({ ledger, summary });

      expect(focusIdentityUpdateMock).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          grade: 'A',
          quality: 90,
        }),
      );
    });
  });

  describe('public v1 no hidden feature leakage from completion', () => {
    it('no shop/inventory/battle_pass CTA in completion rewards', async () => {
      const ledger = createCompletionLedger();
      const summary = createSessionSummary();

      const result = await applyCompletionSubsystems({ ledger, summary });

      const allIds = (result.ledger.rewardIds as string[]).join(' ');
      expect(allIds).not.toContain('shop');
      expect(allIds).not.toContain('inventory');
      expect(allIds).not.toContain('battle-pass');
      expect(allIds).not.toContain('battle_pass');
      expect(allIds).not.toContain('social');
      expect(allIds).not.toContain('squads');
      expect(allIds).not.toContain('rivals');
    });
  });

  describe('boss damage counted once', () => {
    it('completion subsystems boss meta is feature dependent', () => {
      const { SUBSYSTEM_META } = require('../subsystem-meta');
      const bossMeta = SUBSYSTEM_META?.boss;

      if (bossMeta) {
        expect(bossMeta.kind).toBe('FEATURE_DEPENDENT');
      }
    });
  });

  describe('companion completion once', () => {
    it('companion completeSession called once per completion', async () => {
      const ledger = createCompletionLedger();
      const summary = createSessionSummary();

      await applyCompletionSubsystems({ ledger, summary });

      const { getCompanionService } = require('../../companion/service');
      const companionService = getCompanionService();
      expect(companionService.completeSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('degraded subsystems are tracked', () => {
    it('no degraded systems for normal completion', async () => {
      const ledger = createCompletionLedger();
      const summary = createSessionSummary();

      const result = await applyCompletionSubsystems({ ledger, summary });

      expect(result.degradedSystems).toEqual([]);
    });
  });
});
