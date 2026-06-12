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
    const r = parseSessionCompletionParams({ sessionId: 's-1', completedAt: 100 });
    expect(r.params).not.toBeNull();
    expect(r.recoverySessionId).toBeNull();
  });
  it('parses recovery params', () => {
    const r = parseSessionCompletionParams({ sessionId: 's-1', recovery: true });
    expect(r.params).toBeNull();
    expect(r.recoverySessionId).toBe('s-1');
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
    expect(s.sessionId).toBe('session-1');
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
