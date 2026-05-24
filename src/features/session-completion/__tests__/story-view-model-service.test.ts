import { describe, expect, it } from '@jest/globals';

import { ValidateSessionSummarySchema } from '../../../session/validation/schemas';
import { CompletionLedgerSchema } from '../schemas';
import {
  buildPostSessionStoryViewModel,
  PostSessionStoryViewModelSchema,
} from '../story-view-model-service';

const summary = ValidateSessionSummarySchema.parse({
  actualDuration: 1800,
  baseScore: 100,
  coinsEarned: 50,
  completionPercentage: 100,
  createdAt: Date.now() - 1800000,
  damageTaken: 0,
  effectiveDuration: 1800,
  finalScore: 95,
  focusPurityScore: 95,
  focusQuality: 95,
  gemsEarned: 1,
  interruptions: 0,
  pauses: 0,
  pausedDuration: 0,
  penaltiesApplied: [],
  plannedDuration: 1800,
  sessionId: '550e8400-e29b-41d4-a716-446655440001',
  sessionMode: 'DEEP_WORK',
  status: 'COMPLETED',
  streakDays: 5,
  streakBonus: 0,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 0,
  userId: '550e8400-e29b-41d4-a716-446655440002',
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 100,
});

function buildLedger(overrides?: Partial<ReturnType<typeof CompletionLedgerSchema.parse>>) {
  return CompletionLedgerSchema.parse({
    completedAt: Date.now(),
    completedDurationSeconds: 1800,
    companionReactionId: 'companion-happy',
    createdAt: Date.now() - 1800000,
    dailyMissionResult: { missionId: 'daily-focus', progressDelta: 1, status: 'progressed' },
    degradedSystems: [],
    effectiveFocusedSeconds: 1800,
    focusScoreDelta: 10,
    grade: 'A',
    gradeScore: 95,
    idempotencyKey: 'key-123',
    interruptionCount: 0,
    ledgerId: '550e8400-e29b-41d4-a716-446655440000',
    mode: 'DEEP_WORK',
    offlineSyncStatus: 'synced',
    pauseCount: 0,
    qualityScore: 90,
    rewardIds: ['reward-1'],
    sessionId: summary.sessionId,
    startedAt: Date.now() - 1800000,
    streakResult: { action: 'extended', newDays: 5, previousDays: 4 },
    strictMode: true,
    targetDurationSeconds: 1800,
    timezone: 'UTC',
    userId: '550e8400-e29b-41d4-a716-446655440002',
    xpDelta: 100,
    ...overrides,
  });
}

describe('buildPostSessionStoryViewModel', () => {
  it('builds full story beats with recommendation routing', () => {
    const viewModel = buildPostSessionStoryViewModel({
      companionMemory: {
        body: 'You stayed clean through the final stretch.',
        createdAt: new Date().toISOString(),
        grade: 'A',
        id: '550e8400-e29b-41d4-a716-446655440099',
        purityScore: 95,
        sessionDate: '2026-05-20',
        sessionId: summary.sessionId,
        streakDay: 5,
        title: 'You stayed clean through the final stretch.',
        type: 'personal_best_broken',
        userId: '550e8400-e29b-41d4-a716-446655440002',
      },
      companionPromise: {
        createdAt: new Date().toISOString(),
        fulfilledAt: null,
        id: '550e8400-e29b-41d4-a716-446655440098',
        missedAt: null,
        sourceSessionId: summary.sessionId,
        status: 'pending',
        targetDate: '2026-05-21',
        targetDurationMinutes: 15,
        targetMode: 'FOCUS',
        userId: '550e8400-e29b-41d4-a716-446655440002',
      },
      degradedWarnings: [],
      ledger: buildLedger(),
      personalBest: { isPersonalBest: true, previousBest: 90, purityScore: 95, sessionMode: 'DEEP_WORK' },
      summary,
    });

    expect(PostSessionStoryViewModelSchema.safeParse(viewModel).success).toBe(true);
    expect(viewModel.beats).toHaveLength(6);
    expect(viewModel.beats.map((beat) => beat.kind)).toEqual([
      'result',
      'grade',
      'meaning',
      'companion',
      'personal_best',
      'tomorrow',
    ]);
    expect(viewModel.nextActionCta.route).toBe('SessionSetup');
    expect(viewModel.nextActionCta.routeParams?.suggestedDurationSeconds).toBeGreaterThanOrEqual(60);
    expect(viewModel.beats[3]?.body).toBe('You stayed clean through the final stretch.');
    expect(viewModel.beats[4]?.body).toBe('DEEP_WORK focus block moved from 90 to 95 purity.');
    expect(viewModel.beats[4]?.metric).toEqual({ label: 'Purity record', value: '90 -> 95' });
  });

  it('handles partial data without generic placeholders', () => {
    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: ['rewards'],
      ledger: buildLedger({ degradedSystems: ['rewards'], interruptionCount: 2, offlineSyncStatus: 'pending_sync', pauseCount: 1 }),
      summary: { ...summary, completionPercentage: 80, interruptions: 2, pauses: 1 },
    });

    expect(PostSessionStoryViewModelSchema.safeParse(viewModel).success).toBe(true);
    expect(viewModel.pendingSync).toBe(true);
    expect(viewModel.beats).toHaveLength(5);
    expect(viewModel.beats[3]?.body).toContain('memory layer stayed quiet');
    expect(viewModel.beats[4]?.title).toBe('Tomorrow already has a shape.');
  });

  it('handles missing optional data with a safe home fallback', () => {
    const degradedSummary = { ...summary, completionPercentage: 50, focusPurityScore: 60, focusQuality: 60, streakMaintained: false };
    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: [],
      ledger: buildLedger({ focusScoreDelta: -4, grade: 'C', gradeScore: 63, streakResult: { action: 'broken', newDays: 0, previousDays: 1 } }),
      summary: degradedSummary,
    });

    expect(PostSessionStoryViewModelSchema.safeParse(viewModel).success).toBe(true);
    expect(viewModel.beats[2]?.body).toContain('still held the thread');
    expect(viewModel.nextActionCta.label).toBe('Start next focus');
  });

  it('uses reflected focus contract state in the story meaning and headline', () => {
    const viewModel = buildPostSessionStoryViewModel({
      degradedWarnings: [],
      focusContract: {
        createdAt: new Date().toISOString(),
        id: '550e8400-e29b-41d4-a716-446655440077',
        completionStatus: 'done',
        reflectionAt: new Date().toISOString(),
        sessionId: summary.sessionId,
        taskDescription: 'Draft the launch memo',
        userId: '550e8400-e29b-41d4-a716-446655440002',
      },
      ledger: buildLedger(),
      summary,
    });

    expect(viewModel.beats[2]?.body).toContain('Draft the launch memo');
    expect(viewModel.headline.type).toBe('contract_done');
  });
});
