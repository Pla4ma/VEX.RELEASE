import {
  buildSessionCompletionHero,
  buildSessionCompletionReturnPlan,
  parseSessionCompletionParams,
} from '../service';
import { createSessionSummary, SESSION_ID } from './ledger-test-utils';

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
    expect(result.warningMessage).toContain('safe exit');
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
