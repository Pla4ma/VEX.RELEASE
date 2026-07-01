import { buildSessionSummaryFromCompletionLedger } from '../session-summary-builder';
import { parseSessionCompletionParams } from '../params-parser';
import { createCompletionLedger, SESSION_ID } from './ledger-test-utils';

describe('session completion route recovery', () => {
  it('keeps a recoverable session id when summary params are missing', () => {
    const result = parseSessionCompletionParams({
      sessionId: SESSION_ID,
    });

    expect(result.params).toBeNull();
    expect(result.recoverySessionId).toBe(SESSION_ID);
    expect(result.warningMessage).toContain('rebuild');
  });

  it('rebuilds a truthful degraded summary from the completion ledger', () => {
    const ledger = createCompletionLedger({
      completedDurationSeconds: 900,
      effectiveFocusedSeconds: 840,
      interruptionCount: 1,
      pauseCount: 2,
      qualityScore: 82,
      targetDurationSeconds: 1500,
    });

    const summary = buildSessionSummaryFromCompletionLedger(ledger);

    expect(summary.sessionId).toBe(SESSION_ID);
    expect(summary.completionPercentage).toBe(60);
    expect(summary.effectiveDuration).toBe(840);
    expect(summary.pauses).toBe(2);
    expect(summary.interruptions).toBe(1);
    expect(summary.finalScore).toBe(ledger.gradeScore);
  });
});
