/**
 * XP ownership proof tests.
 *
 * Verifies:
 * 1. Completed session calls ProgressionService.addXP exactly once.
 * 2. Completed session calls RewardService.grantReward for receipt only.
 * 3. RewardService failure does not block core completion.
 * 4. Reward receipt ID is recorded in ledger.
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import type { CompletionLedger } from '../../schemas';
import type { SessionSummary } from '../../../session/types';
import { SessionMode } from '../../../session/modes';

const mockAddXP = jest.fn(async (): Promise<void> => {});
const mockGrantReward = jest.fn(async (): Promise<void> => {});
const mockCompleteSession = jest.fn((): { evolved: boolean; leveledUp: boolean } => ({ evolved: false, leveledUp: false }));
const mockRecordSession = jest.fn(async (): Promise<{ currentStreak: number }> => ({ currentStreak: 5 }));
const mockCaptureException = jest.fn();
const mockAddBreadcrumb = jest.fn();

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: (...args: unknown[]) => mockAddBreadcrumb(...args),
  captureException: (...args: unknown[]) => mockCaptureException(...args),
}));

jest.mock('../../../progression/ProgressionService', () => ({
  getProgressionService: jest.fn(() => ({ addXP: mockAddXP })),
}));

jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn(() => ({ grantReward: mockGrantReward })),
}));

jest.mock('../../companion/service', () => ({
  getCompanionService: jest.fn(() => ({ completeSession: mockCompleteSession })),
}));

jest.mock('../../focus-identity/update-focus-score.helper', () => ({
  updateFocusScoreFromSessionCompletion: jest.fn(async (): Promise<void> => {}),
}));

jest.mock('../../../streaks/StreakService', () => ({
  getStreakService: jest.fn(() => ({ recordSession: mockRecordSession })),
}));

jest.mock('../completion-analytics', () => ({
  trackCompletionAnalytics: jest.fn(),
  trackSessionCompleted: jest.fn(),
}));

jest.mock('../../liveops-config/feature-access-store', () => ({
  setFeatureAccessMap: jest.fn(),
  getAvailabilityFor: jest.fn(() => ({ canSubscribeToEvents: true })),
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
  grade: 'B',
  gradeScore: 75,
  idempotencyKey: '550e8400-e29b-41d4-a716-4466554400:completed',
  interruptionCount: 1,
  ledgerId: '550e8400-e29b-41d4-a716-446655440001',
  mode: SessionMode.FLOW,
  offlineSyncStatus: 'synced',
  pauseCount: 0,
  qualityScore: 75,
  rewardIds: [],
  sessionId: '550e8400-e29b-41d4-a716-446655440002',
  startedAt: 500000,
  streakResult: { action: 'extended', newDays: 3, previousDays: 2 },
  strictMode: false,
  targetDurationSeconds: 1500,
  timezone: 'UTC',
  userId: '550e8400-e29b-41d4-a716-4466554400ab',
  xpDelta: 80,
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
  finalScore: 80,
  focusPurityScore: 75,
  focusQuality: 75,
  gemsEarned: 0,
  interruptions: 1,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1500,
  sessionId: '550e8400-e29b-41d4-a716-446655440002',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakBonus: 10,
  streakDays: 3,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 10,
  userId: '550e8400-e29b-41d4-a716-4466554400ab',
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 80,
};

describe('XP ownership — ProgressionService owns XP, RewardService is receipt-only', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls ProgressionService.addXP exactly once per completion', async () => {
    const { applyCompletionSubsystems } = require('../completion-subsystems');
    await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(mockAddXP).toHaveBeenCalledTimes(1);
  });

  it('calls RewardService.grantReward for receipt only', async () => {
    const { applyCompletionSubsystems } = require('../completion-subsystems');
    await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(mockGrantReward).toHaveBeenCalledWith(
      'XP',
      'SESSION_COMPLETE',
      expect.objectContaining({ baseAmount: expect.any(Number) }),
      expect.objectContaining({ sessionId: '550e8400-e29b-41d4-a716-446655440002' }),
    );
  });

  it('RewardService failure does not prevent progression XP', async () => {
    mockGrantReward.mockImplementationOnce(async (): Promise<void> => {
      throw new Error('reward unavailable');
    });

    const { applyCompletionSubsystems } = require('../completion-subsystems');
    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(mockAddXP).toHaveBeenCalledTimes(1);
    expect(result.degradedSystems).toContain('rewards');
  });

  it('reward receipt ID is recorded in ledger', async () => {
    const { applyCompletionSubsystems } = require('../completion-subsystems');
    const result = await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(result.ledger.rewardIds).toContain('session-xp:550e8400-e29b-41d4-a716-446655440002');
  });

  it('ProgressionService is the canonical XP mutation owner', async () => {
    const { applyCompletionSubsystems } = require('../completion-subsystems');
    await applyCompletionSubsystems({ ledger: baseLedger, summary: baseSummary });

    expect(mockAddXP).toHaveBeenCalledWith(
      expect.any(Number),
      'SESSION_COMPLETE',
      expect.objectContaining({ sessionId: '550e8400-e29b-41d4-a716-446655440002' }),
    );

    expect(mockGrantReward).toHaveBeenCalled();
  });
});
