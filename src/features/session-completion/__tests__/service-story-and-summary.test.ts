import { SessionMode } from '../../../session/modes';
import { buildPostSessionStoryViewModel } from '../post-session-story-view-model';
import { parseSessionCompletionParams } from '../params-parser';
import { buildSessionSummaryFromCompletionLedger } from '../session-summary-builder';

jest.mock('../../../session/types', () => ({
  SessionSummarySchema: { parse: (v: unknown) => v },
}));

const UUID_1 = '00000000-0000-0000-0000-000000000001';
const UUID_2 = '00000000-0000-0000-0000-000000000002';

/** Minimal valid SessionSummary for navigation-param tests */
const MINIMAL_SUMMARY = {
  sessionId: UUID_2,
  userId: 'user-1',
  status: 'COMPLETED',
  sessionMode: SessionMode.FLOW,
  plannedDuration: 1500,
  actualDuration: 1200,
  effectiveDuration: 1100,
  pausedDuration: 0,
  completionPercentage: 80,
  focusQuality: 85,
  interruptions: 2,
  pauses: 1,
  pausedTime: 0,
  streakMaintained: true,
  modeBonus: 0,
  baseScore: 75,
  timeBonus: 0,
  finalScore: 75,
  createdAt: 1700000000000,
  streakIncreased: true,
  streakDays: 3,
  xpEarned: 50,
  coinsEarned: 0,
  gemsEarned: 0,
  damageTaken: 0,
  vsAverage: 0,
  vsBest: 0,
};

function makeLedger(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ledgerId: UUID_1,
    idempotencyKey: 'idemp-1',
    sessionId: UUID_2,
    userId: 'user-1',
    grade: 'B',
    gradeScore: 75,
    xpDelta: 50,
    completedDurationSeconds: 1200,
    targetDurationSeconds: 1500,
    effectiveFocusedSeconds: 1100,
    qualityScore: 85,
    interruptionCount: 2,
    pauseCount: 1,
    strictMode: false,
    startedAt: 1700000000000,
    completedAt: 1700001500000,
    timezone: 'UTC',
    focusScoreDelta: 10,
    streakResult: { action: 'extended', newDays: 3, previousDays: 2 },
    companionReactionId: null,
    rewardIds: [],
    dailyMissionResult: { missionId: null, progressDelta: 0, status: 'unchanged' },
    offlineSyncStatus: 'synced',
    mode: SessionMode.FLOW,
    degradedSystems: [],
    createdAt: 1700000000000,
    ...overrides,
  };
}

describe('buildPostSessionStoryViewModel', () => {
  it('builds view model', () => {
    const vm = buildPostSessionStoryViewModel({ ledger: makeLedger(), summary: { sessionId: 'session-1' } });
    expect(vm.grade).toBe('B');
    expect(vm.xpDelta).toBe(50);
    expect(vm.degradedWarnings).toEqual([]);
  });
  it('uses degradedSystems fallback', () => {
    const vm = buildPostSessionStoryViewModel({ degradedSystems: ['offline'], ledger: makeLedger(), summary: {} });
    expect(vm.degradedWarnings).toEqual(['offline']);
  });
});

describe('parseSessionCompletionParams', () => {
  it('parses valid navigation params', () => {
    const r = parseSessionCompletionParams({ sessionId: UUID_2, summary: MINIMAL_SUMMARY });
    expect(r.params).not.toBeNull();
    expect(r.recoverySessionId).toBeNull();
  });
  it('parses recovery params', () => {
    const r = parseSessionCompletionParams({ sessionId: UUID_2, recovery: true });
    expect(r.params).toBeNull();
    expect(r.recoverySessionId).toBe(UUID_2);
  });
  it('returns fallback for null', () => {
    const r = parseSessionCompletionParams(null);
    expect(r.params).toBeNull();
    expect(r.warningMessage).toContain('unavailable');
  });
  it('returns fallback for unknown shape', () => {
    expect(parseSessionCompletionParams({ unknown: true }).params).toBeNull();
  });
});

describe('buildSessionSummaryFromCompletionLedger', () => {
  it('builds summary', () => {
    const s = buildSessionSummaryFromCompletionLedger(makeLedger());
    expect(s.sessionId).toBe(UUID_2);
    expect(s.status).toBe('COMPLETED');
    expect(s.xpEarned).toBe(50);
    expect(s.streakIncreased).toBe(true);
  });
  it('calculates completion percentage', () => {
    const s = buildSessionSummaryFromCompletionLedger(makeLedger({ completedDurationSeconds: 750, targetDurationSeconds: 1500 }));
    expect(s.completionPercentage).toBe(50);
  });
  it('handles zero target', () => {
    expect(buildSessionSummaryFromCompletionLedger(makeLedger({ targetDurationSeconds: 0 })).completionPercentage).toBe(0);
  });
  it('handles UNKNOWN mode', () => {
    expect(buildSessionSummaryFromCompletionLedger(makeLedger({ mode: 'UNKNOWN' })).sessionMode).toBe(SessionMode.FLOW);
  });
});
