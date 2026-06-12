import { SessionMode } from '../../../session/modes';
import { buildPostSessionStoryViewModel, parseSessionCompletionParams, buildSessionSummaryFromCompletionLedger } from '../service';

jest.mock('../../../session/types', () => ({
  SessionSummarySchema: { parse: (v: unknown) => v },
}));

function makeLedger(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ledgerId: 'ledger-1', sessionId: 'session-1', userId: 'user-1',
    grade: 'B', gradeScore: 750, xpDelta: 50, completedDurationSeconds: 1200,
    targetDurationSeconds: 1500, effectiveFocusedSeconds: 1100, qualityScore: 85,
    interruptionCount: 2, pauseCount: 1, degradedSystems: [],
    mode: SessionMode.FLOW, streakResult: { newDays: 3, previousDays: 2 },
    createdAt: 1700000000000, completedAt: 1700001500000, ...overrides,
  };
}

describe('buildPostSessionStoryViewModel', () => {
  it('builds view model from ledger and summary', () => {
    const vm = buildPostSessionStoryViewModel({ ledger: makeLedger(), summary: { sessionId: 'session-1' } });
    expect(vm.grade).toBe('B');
    expect(vm.ledgerId).toBe('ledger-1');
    expect(vm.xpDelta).toBe(50);
    expect(vm.degradedWarnings).toEqual([]);
  });

  it('uses degradedSystems as fallback warnings', () => {
    const vm = buildPostSessionStoryViewModel({ degradedSystems: ['offline_sync'], ledger: makeLedger({ degradedSystems: ['offline_sync'] }), summary: {} });
    expect(vm.degradedWarnings).toEqual(['offline_sync']);
  });
});

describe('parseSessionCompletionParams', () => {
  it('parses valid navigation params', () => {
    const result = parseSessionCompletionParams({ sessionId: 'sess-1', completedAt: 1700001500000 });
    expect(result.params).not.toBeNull();
    expect(result.recoverySessionId).toBeNull();
    expect(result.warningMessage).toBeNull();
  });

  it('parses recovery params', () => {
    const result = parseSessionCompletionParams({ sessionId: 'sess-1', recovery: true });
    expect(result.params).toBeNull();
    expect(result.recoverySessionId).toBe('sess-1');
    expect(result.warningMessage).toContain('rebuild');
  });

  it('returns fallback for null params', () => {
    const result = parseSessionCompletionParams(null);
    expect(result.params).toBeNull();
    expect(result.warningMessage).toContain('unavailable');
  });

  it('returns fallback for unknown shape', () => {
    const result = parseSessionCompletionParams({ unknown: true });
    expect(result.params).toBeNull();
    expect(result.recoverySessionId).toBeNull();
  });
});

describe('buildSessionSummaryFromCompletionLedger', () => {
  it('builds summary from ledger', () => {
    const summary = buildSessionSummaryFromCompletionLedger(makeLedger());
    expect(summary.sessionId).toBe('session-1');
    expect(summary.status).toBe('COMPLETED');
    expect(summary.xpEarned).toBe(50);
    expect(summary.streakDays).toBe(3);
    expect(summary.streakIncreased).toBe(true);
    expect(summary.streakMaintained).toBe(true);
  });

  it('calculates completion percentage', () => {
    const summary = buildSessionSummaryFromCompletionLedger(makeLedger({ completedDurationSeconds: 750, targetDurationSeconds: 1500 }));
    expect(summary.completionPercentage).toBe(50);
  });

  it('handles zero target duration', () => {
    const summary = buildSessionSummaryFromCompletionLedger(makeLedger({ targetDurationSeconds: 0 }));
    expect(summary.completionPercentage).toBe(0);
  });

  it('handles UNKNOWN mode fallback', () => {
    const summary = buildSessionSummaryFromCompletionLedger(makeLedger({ mode: 'UNKNOWN' }));
    expect(summary.sessionMode).toBe(SessionMode.FLOW);
  });
});
