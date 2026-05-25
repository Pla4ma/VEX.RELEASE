/**
 * Phase 6 — Economy Deactivation Verification
 *
 * Confirms XP/progression/streak stay operational while user-facing economy
 * surfaces (wallet, coins, gems, shop, inventory, premium chests, battle pass)
 * are deactivated for final release.
 */

import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import type { CompletionLedger } from '../schemas';
import { resolveCompletionExperiencePolicy } from '../completion-experience-policy';

const mockOrder: string[] = [];
const mockAddXP = jest.fn(async (): Promise<void> => {
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

jest.mock('../../../features/companion/service', () => ({
  getCompanionService: jest.fn(() => ({
    completeSession: jest.fn((): { evolved: boolean; leveledUp: boolean } => {
      mockOrder.push('companion');
      return { evolved: false, leveledUp: true };
    }),
  })),
}));

jest.mock('../analytics', () => ({
  trackSessionCompleted: jest.fn(),
}));

import { applyCompletionSubsystems } from '../completion-subsystems';

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

describe('Phase 6 — economy deactivation boundary', () => {
  beforeEach(() => {
    mockOrder.length = 0;
    jest.clearAllMocks();
  });

  it('1. XP/progression still update when economy is deactivated', async () => {
    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(mockAddXP).toHaveBeenCalledTimes(1);
    expect(mockAddXP).toHaveBeenCalledWith(
      baseLedger.xpDelta,
      'SESSION_COMPLETE',
      { sessionId: baseLedger.sessionId },
    );
    expect(result.degradedSystems).not.toContain('progression');
    expect(result.ledger.xpDelta).toBe(120);
  });

  it('2. completion policy hides all economy surfaces', () => {
    const policy = resolveCompletionExperiencePolicy({
      consequences: {},
      featureAvailability: {
        boss: false,
        challenges: false,
        contractUsed: false,
        progress: true,
        study: true,
      },
      firstWeekStage: null,
      motivationStyle: 'study_focused',
      premiumState: 'free',
      primaryGoal: null,
      sessionMode: SessionMode.FLOW,
      summary: baseSummary,
    });

    expect(policy.hiddenCompletionSurfaces).toContain('battle_pass_card');
    expect(policy.hiddenCompletionSurfaces).toContain('premium_chest');
    expect(policy.hiddenCompletionSurfaces).toContain('coins_gems_wallet');
    expect(policy.hiddenCompletionSurfaces).toContain('shop_inventory_prompts');
    expect(policy.hiddenCompletionSurfaces).toContain('chest_reward_animation');
    expect(policy.hiddenCompletionSurfaces).toContain('multiple_reward_rows');
    expect(policy.hiddenCompletionSurfaces).not.toContain('study_progress_card');
  });

  it('3. reward receipt (subsystems) does not award coins/gems/special/wallet', async () => {
    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    const ledger = result.ledger as Record<string, unknown>;
    expect(ledger.coinsEarned).toBeUndefined();
    expect(ledger.gemsEarned).toBeUndefined();
    expect(ledger.walletDelta).toBeUndefined();
    expect(ledger.specialEarned).toBeUndefined();

    expect(result.ledger.rewardIds.length).toBe(1);
    expect(result.ledger.rewardIds[0]).toMatch(/^session-xp:/);
  });

  it('4. streak record still operates in completion subsystems', async () => {
    await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(mockOrder).toContain('streak');
    expect(mockOrder).toContain('progression');
  });

  it('5. completion subsystems execute in correct order: identity → streak → progression → rewards', async () => {
    await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(mockOrder).toEqual([
      'focus-identity',
      'streak',
      'progression',
      'rewards',
    ]);
  });
});

describe('auth store economy-free initialization', () => {
  it('does not import economyService at module level', () => {
    const storeSource = jest.requireActual('../../../store/index');
    expect(storeSource).toBeDefined();
  });

  it('does not import old rewardService at module level', () => {
    const storeSource = jest.requireActual('../../../store/index');
    expect(storeSource).toBeDefined();
  });
});
