import { describe, it, expect } from 'vitest';
import { buildPostSessionStoryViewModel, PostSessionStoryViewModelSchema } from '../story-view-model-service';
import { CompletionLedgerSchema } from '../schemas';
import { ValidateSessionSummarySchema } from '../../../session/validation/schemas';

describe('buildPostSessionStoryViewModel', () => {
  it('should correctly build a view model for a successful session', () => {
    const mockLedger = CompletionLedgerSchema.parse({
      ledgerId: '550e8400-e29b-41d4-a716-446655440000',
      idempotencyKey: 'key-123',
      userId: 'user-1',
      sessionId: '550e8400-e29b-41d4-a716-446655440001',
      completedAt: Date.now(),
      offlineSyncStatus: 'synced',
      timezone: 'UTC',
      grade: 'A',
      gradeScore: 95,
      focusScoreDelta: 10,
      xpDelta: 100,
      streakResult: {
        action: 'extended',
        newDays: 5,
        previousDays: 4,
      },
      rewardIds: ['reward-1'],
      companionReactionId: 'companion-happy',
      dailyMissionResult: {
        missionId: 'daily-focus-session',
        progressDelta: 1,
        status: 'progressed',
      },
      degradedSystems: [],
      effectiveFocusedSeconds: 1800,
      qualityScore: 90,
      mode: 'DEEP_WORK',
      targetDurationSeconds: 3600,
      completedDurationSeconds: 3600,
      pauseCount: 0,
      interruptionCount: 0,
      strictMode: true,
      startedAt: Date.now() - 3600000,
      createdAt: Date.now() - 3600000,
    });

    const mockSummary = ValidateSessionSummarySchema.parse({
      sessionId: '550e8400-e29b-41d4-a716-446655440001',
      userId: 'user-1',
      status: 'COMPLETED',
      plannedDuration: 3600,
      actualDuration: 3600,
      effectiveDuration: 3600,
      pausedDuration: 0,
      completionPercentage: 100,
      focusQuality: 95,
      focusPurityScore: 95,
      interruptions: 0,
      pauses: 0,
      baseScore: 100,
      timeBonus: 0,
      streakBonus: 0,
      finalScore: 95,
      xpEarned: 100,
      coinsEarned: 50,
      gemsEarned: 1,
      streakMaintained: true,
      streakIncreased: true,
      streakDays: 5,
      userLevel: 1,
      damageTaken: 0,
      penaltiesApplied: [],
      vsAverage: 0,
      vsBest: 0,
      createdAt: Date.now() - 3600000,
    });

    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: [],
      ledger: mockLedger,
      summary: mockSummary,
    });

    expect(PostSessionStoryViewModelSchema.safeParse(viewModel).success).toBe(true);
    expect(viewModel.sessionId).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(viewModel.gradeCard.grade).toBe('A');
    expect(viewModel.focusScoreDeltaCard.delta).toBe(10);
    expect(viewModel.xpProgress.xpDelta).toBe(100);
    expect(viewModel.streakState.newDays).toBe(5);
    expect(viewModel.companionReaction.reactionId).toBe('companion-happy');
    expect(viewModel.dailyMission.status).toBe('progressed');
    expect(viewModel.degradedWarnings).toEqual([]);
    expect(viewModel.pendingSync).toBe(false);
    expect(viewModel.nextActionCta.label).toBe('Continue on home');
  });

  it('should correctly build a view model for a session with degraded systems', () => {
    const mockLedger = CompletionLedgerSchema.parse({
      ledgerId: '550e8400-e29b-41d4-a716-446655440002',
      idempotencyKey: 'key-124',
      userId: 'user-1',
      sessionId: '550e8400-e29b-41d4-a716-446655440003',
      completedAt: Date.now(),
      offlineSyncStatus: 'synced',
      timezone: 'UTC',
      grade: 'B',
      gradeScore: 80,
      focusScoreDelta: 5,
      xpDelta: 50,
      streakResult: {
        action: 'maintained',
        newDays: 3,
        previousDays: 3,
      },
      rewardIds: [],
      companionReactionId: null,
      dailyMissionResult: {
        missionId: 'daily-focus-session',
        progressDelta: 0,
        status: 'unchanged',
      },
      degradedSystems: ['rewards', 'analytics'],
      effectiveFocusedSeconds: 1200,
      qualityScore: 70,
      mode: 'LIGHT_FOCUS',
      targetDurationSeconds: 1800,
      completedDurationSeconds: 1200,
      pauseCount: 1,
      interruptionCount: 1,
      strictMode: false,
      startedAt: Date.now() - 1800000,
      createdAt: Date.now() - 1800000,
    });

    const mockSummary = ValidateSessionSummarySchema.parse({
      sessionId: '550e8400-e29b-41d4-a716-446655440003',
      userId: 'user-1',
      status: 'COMPLETED',
      plannedDuration: 1800,
      actualDuration: 1200,
      effectiveDuration: 1200,
      pausedDuration: 60,
      completionPercentage: 66,
      focusQuality: 70,
      focusPurityScore: 70,
      interruptions: 1,
      pauses: 1,
      baseScore: 80,
      timeBonus: 0,
      streakBonus: 0,
      finalScore: 80,
      xpEarned: 50,
      coinsEarned: 25,
      gemsEarned: 0,
      streakMaintained: true,
      streakIncreased: false,
      streakDays: 3,
      userLevel: 1,
      damageTaken: 0,
      penaltiesApplied: [],
      vsAverage: 0,
      vsBest: 0,
      createdAt: Date.now() - 1800000,
    });

    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: ['rewards', 'analytics'],
      ledger: mockLedger,
      summary: mockSummary,
    });

    expect(PostSessionStoryViewModelSchema.safeParse(viewModel).success).toBe(true);
    expect(viewModel.degradedWarnings).toEqual(['rewards', 'analytics']);
    expect(viewModel.nextActionCta.label).toBe('Return home safely');
  });

  it('should handle pending sync state', () => {
    const mockLedger = CompletionLedgerSchema.parse({
      ledgerId: '550e8400-e29b-41d4-a716-446655440004',
      idempotencyKey: 'key-125',
      userId: 'user-1',
      sessionId: '550e8400-e29b-41d4-a716-446655440005',
      completedAt: Date.now(),
      offlineSyncStatus: 'pending_sync',
      timezone: 'UTC',
      grade: 'C',
      gradeScore: 60,
      focusScoreDelta: -5,
      xpDelta: 20,
      streakResult: {
        action: 'broken',
        newDays: 0,
        previousDays: 1,
      },
      rewardIds: [],
      companionReactionId: null,
      dailyMissionResult: {
        missionId: 'daily-focus-session',
        progressDelta: 0,
        status: 'unchanged',
      },
      degradedSystems: [],
      effectiveFocusedSeconds: 600,
      qualityScore: 50,
      mode: 'STUDY',
      targetDurationSeconds: 600,
      completedDurationSeconds: 600,
      pauseCount: 2,
      interruptionCount: 2,
      strictMode: false,
      startedAt: Date.now() - 600000,
      createdAt: Date.now() - 600000,
    });

    const mockSummary = ValidateSessionSummarySchema.parse({
      sessionId: '550e8400-e29b-41d4-a716-446655440005',
      userId: 'user-1',
      status: 'COMPLETED',
      plannedDuration: 600,
      actualDuration: 600,
      effectiveDuration: 600,
      pausedDuration: 30,
      completionPercentage: 100,
      focusQuality: 50,
      focusPurityScore: 50,
      interruptions: 2,
      pauses: 2,
      baseScore: 60,
      timeBonus: 0,
      streakBonus: 0,
      finalScore: 60,
      xpEarned: 20,
      coinsEarned: 10,
      gemsEarned: 0,
      streakMaintained: false,
      streakIncreased: false,
      streakDays: 0,
      userLevel: 1,
      damageTaken: 0,
      penaltiesApplied: [],
      vsAverage: 0,
      vsBest: 0,
      createdAt: Date.now() - 600000,
    });

    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: [],
      ledger: mockLedger,
      summary: mockSummary,
    });

    expect(PostSessionStoryViewModelSchema.safeParse(viewModel).success).toBe(true);
    expect(viewModel.pendingSync).toBe(true);
  });
});
