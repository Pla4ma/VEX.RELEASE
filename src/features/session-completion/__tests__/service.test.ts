import {
  buildSessionCompletionHero,
  buildSessionCompletionReturnPlan,
  parseSessionCompletionParams,
} from '../service';

describe('session-completion service', () => {
  it('parses valid completion params without warnings', () => {
    const result = parseSessionCompletionParams({
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      summary: {
        actualDuration: 1500,
        baseScore: 100,
        bonuses: [],
        coinsEarned: 50,
        completionPercentage: 100,
        createdAt: Date.now(),
        damageTaken: 0,
        effectiveDuration: 1500,
        finalScore: 120,
        focusPurityScore: 95,
        focusQuality: 95,
        gemsEarned: 0,
        interruptions: 0,
        pausedDuration: 0,
        pauses: 0,
        penaltiesApplied: [],
        plannedDuration: 1500,
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'COMPLETED',
        streakBonus: 10,
        streakDays: 4,
        streakIncreased: true,
        streakMaintained: true,
        timeBonus: 10,
        userId: 'user-1',
        userLevel: 2,
        vsAverage: 0,
        vsBest: 0,
        xpEarned: 120,
      },
    });

    expect(result.params?.sessionId).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
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
