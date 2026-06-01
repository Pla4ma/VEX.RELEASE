import { buildPostSessionStoryViewModel } from '../story-view-model-service';
import { CompletionLedgerSchema } from '../schemas';
import { ValidateSessionSummarySchema } from '../../../session/validation/schemas';

describe('headline reward view model', () => {
  it('returns a headline reward with the post-session story view model', () => {
    const ledger = CompletionLedgerSchema.parse({
      ledgerId: '550e8400-e29b-41d4-a716-446655440101',
      idempotencyKey: 'key-101',
      userId: 'user-1',
      sessionId: '550e8400-e29b-41d4-a716-446655440102',
      completedAt: Date.now(),
      offlineSyncStatus: 'synced',
      timezone: 'UTC',
      grade: 'A',
      gradeScore: 95,
      focusScoreDelta: 10,
      xpDelta: 120,
      streakResult: { action: 'extended', newDays: 5, previousDays: 4 },
      rewardIds: ['reward-1'],
      companionReactionId: null,
      dailyMissionResult: {
        missionId: null,
        progressDelta: 0,
        status: 'unchanged',
      },
      degradedSystems: [],
      effectiveFocusedSeconds: 1800,
      qualityScore: 90,
      mode: 'FLOW',
      targetDurationSeconds: 1800,
      completedDurationSeconds: 1800,
      pauseCount: 0,
      interruptionCount: 0,
      strictMode: false,
      startedAt: Date.now() - 1800000,
      createdAt: Date.now() - 1800000,
    });
    const summary = ValidateSessionSummarySchema.parse({
      sessionId: '550e8400-e29b-41d4-a716-446655440102',
      userId: 'user-1',
      status: 'COMPLETED',
      sessionMode: 'FLOW',
      plannedDuration: 1800,
      actualDuration: 1800,
      effectiveDuration: 1800,
      pausedDuration: 0,
      pausedTime: 0,
      completionPercentage: 100,
      focusQuality: 95,
      focusPurityScore: 95,
      interruptions: 0,
      pauses: 0,
      baseScore: 100,
      modeBonus: 0,
      streakBonus: 0,
      timeBonus: 0,
      finalScore: 95,
      xpEarned: 120,
      coinsEarned: 20,
      gemsEarned: 1,
      streakMaintained: true,
      streakIncreased: true,
      streakDays: 5,
      userLevel: 1,
      damageTaken: 0,
      penaltiesApplied: [],
      vsAverage: 0,
      vsBest: 0,
      createdAt: Date.now() - 1800000,
    });

    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: [],
      ledger,
      summary,
    });

    expect(viewModel.headline.type).toBe('xp_earned');
    expect(viewModel.headline.value).toBe('+120 XP');
  });

  it('surfaces a personal best as the headline reward', () => {
    const ledger = CompletionLedgerSchema.parse({
      ledgerId: '550e8400-e29b-41d4-a716-446655440201',
      idempotencyKey: 'key-201',
      userId: 'user-1',
      sessionId: '550e8400-e29b-41d4-a716-446655440202',
      completedAt: Date.now(),
      offlineSyncStatus: 'synced',
      timezone: 'UTC',
      grade: 'A',
      gradeScore: 91,
      focusScoreDelta: 8,
      xpDelta: 120,
      streakResult: { action: 'maintained', newDays: 5, previousDays: 5 },
      rewardIds: [],
      companionReactionId: null,
      dailyMissionResult: {
        missionId: null,
        progressDelta: 0,
        status: 'unchanged',
      },
      degradedSystems: [],
      effectiveFocusedSeconds: 900,
      qualityScore: 91,
      mode: 'SPRINT',
      targetDurationSeconds: 900,
      completedDurationSeconds: 900,
      pauseCount: 0,
      interruptionCount: 0,
      strictMode: false,
      startedAt: Date.now() - 900000,
      createdAt: Date.now() - 900000,
    });
    const summary = ValidateSessionSummarySchema.parse({
      sessionId: '550e8400-e29b-41d4-a716-446655440202',
      userId: 'user-1',
      status: 'COMPLETED',
      sessionMode: 'SPRINT',
      plannedDuration: 900,
      actualDuration: 900,
      effectiveDuration: 900,
      pausedDuration: 0,
      pausedTime: 0,
      completionPercentage: 100,
      focusQuality: 91,
      focusPurityScore: 91,
      interruptions: 0,
      pauses: 0,
      baseScore: 100,
      modeBonus: 0,
      streakBonus: 0,
      timeBonus: 0,
      finalScore: 91,
      xpEarned: 120,
      coinsEarned: 20,
      gemsEarned: 1,
      streakMaintained: true,
      streakIncreased: false,
      streakDays: 5,
      userLevel: 1,
      damageTaken: 0,
      penaltiesApplied: [],
      vsAverage: 0,
      vsBest: 0,
      createdAt: Date.now() - 900000,
    });

    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: [],
      ledger,
      personalBest: {
        achievedAt: '2026-05-14T12:00:00.000Z',
        durationBucket: '15',
        isPersonalBest: true,
        previousBest: 82,
        purityScore: 91,
        sessionMode: 'SPRINT',
      },
      summary,
    });

    expect(viewModel.headline.type).toBe('personal_best');
    expect(viewModel.headline.title).toBe(
      'Personal best. 91 purity in Sprint.',
    );
    expect(viewModel.personalBestProof).toEqual({
      achievedAt: '2026-05-14T12:00:00.000Z',
      durationBucket: '15',
      mode: 'SPRINT',
      newValue: 91,
      oldValue: 82,
    });
  });
});
