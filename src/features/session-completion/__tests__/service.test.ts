import {
  buildSessionSummaryFromCompletionLedger,
  buildSessionCompletionHero,
  buildSessionCompletionReturnPlan,
  parseSessionCompletionParams,
} from '../service';
import {
  createCompletionLedger,
  createSessionSummary,
  SESSION_ID,
} from './ledger-test-utils';

describe('session-completion service', () => {
  it('parses valid completion params without warnings', () => {
    const result = parseSessionCompletionParams({
      sessionId: SESSION_ID,
      summary: createSessionSummary(),
    });

    expect(result.params?.sessionId).toBe(SESSION_ID);
    expect(result.warningMessage).toBeNull();
  });

  it('falls back safely for invalid completion params', () => {
    const result = parseSessionCompletionParams({
      sessionId: 'not-a-uuid',
      summary: {},
    });

    expect(result.params).toBeNull();
    expect(result.recoverySessionId).toBeNull();
    expect(result.warningMessage).toContain('safe exit');
  });

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

  it('builds a cleaner hero for interruption-free sessions', () => {
    const hero = buildSessionCompletionHero({
      focusedDurationLabel: '25m',
      interruptions: 0,
      streakIncreased: true,
    });

    expect(hero.title).toContain('Clean finish');
    expect(hero.body).toBe('25m');
  });

  it('turns streak protection into a tomorrow return plan', () => {
    const plan = buildSessionCompletionReturnPlan({
      completionPercentage: 100,
      hasStudyFollowUp: true,
      streakDays: 7,
      streakIncreased: true,
    });

    expect(plan.nextSessionLabel).toBe('Bank another block');
    expect(plan.homeCtaLabel).toBe('See tomorrow plan');
    expect(plan.highlightTitle).toContain('7-day streak');
    expect(plan.returnReasonTitle).toContain('Tomorrow');
  });

  it('gives completed sessions a next useful action without fake urgency', () => {
    const plan = buildSessionCompletionReturnPlan({
      completionPercentage: 100,
      hasStudyFollowUp: false,
      streakDays: 0,
      streakIncreased: false,
    });

    expect(plan.highlightTitle).toBe('Session banked cleanly');
    expect(plan.nextSessionLabel).toBe('Bank another block');
    expect(plan.returnReasonBody).toContain('progress signal');
  });

});
