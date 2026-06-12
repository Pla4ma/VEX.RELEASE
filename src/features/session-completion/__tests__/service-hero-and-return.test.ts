import { buildSessionCompletionHero, buildSessionCompletionReturnPlan } from '../service';

describe('buildSessionCompletionHero', () => {
  it('returns Clean finish for zero interruptions', () => {
    const hero = buildSessionCompletionHero({ focusedDurationLabel: '20:00 focused', interruptions: 0, streakIncreased: false });
    expect(hero.title).toBe('Clean finish.');
    expect(hero.eyebrow).toBe('Session complete');
    expect(hero.body).toBe('20:00 focused');
  });

  it('returns Work locked in for interruptions', () => {
    const hero = buildSessionCompletionHero({ focusedDurationLabel: '18:00 focused', interruptions: 3, streakIncreased: false });
    expect(hero.title).toBe('Work locked in.');
  });

  it('shows streak protected eyebrow when streak increased', () => {
    const hero = buildSessionCompletionHero({ focusedDurationLabel: '25:00 focused', interruptions: 1, streakIncreased: true });
    expect(hero.eyebrow).toBe('Streak protected');
  });
});

describe('buildSessionCompletionReturnPlan', () => {
  it('shows celebration tone for high completion', () => {
    const plan = buildSessionCompletionReturnPlan({ completionPercentage: 90, hasStudyFollowUp: false, streakDays: 5, streakIncreased: true });
    expect(plan.highlightTone).toBe('celebration');
    expect(plan.highlightMessage).toBe('You protected momentum today.');
    expect(plan.homeCtaLabel).toBe('See tomorrow plan');
  });

  it('shows info tone for low completion', () => {
    const plan = buildSessionCompletionReturnPlan({ completionPercentage: 50, hasStudyFollowUp: false, streakDays: 0, streakIncreased: false });
    expect(plan.highlightTone).toBe('info');
    expect(plan.highlightMessage).toBe('VEX saved this as a progress signal.');
  });

  it('shows study follow-up CTA when available', () => {
    const plan = buildSessionCompletionReturnPlan({ completionPercentage: 50, hasStudyFollowUp: true, streakDays: 0, streakIncreased: false });
    expect(plan.homeCtaLabel).toBe('See tomorrow plan');
    expect(plan.returnReasonBody).toContain('study step');
  });

  it('shows Back home when no follow-up and no streak', () => {
    const plan = buildSessionCompletionReturnPlan({ completionPercentage: 70, hasStudyFollowUp: false, streakDays: 0, streakIncreased: false });
    expect(plan.homeCtaLabel).toBe('Back home');
  });

  it('displays streak days in title', () => {
    const plan = buildSessionCompletionReturnPlan({ completionPercentage: 85, hasStudyFollowUp: false, streakDays: 7, streakIncreased: true });
    expect(plan.highlightTitle).toBe('7-day streak protected');
  });

  it('shows correct returnReasonTitle', () => {
    const withStreak = buildSessionCompletionReturnPlan({ completionPercentage: 85, hasStudyFollowUp: false, streakDays: 3, streakIncreased: true });
    expect(withStreak.returnReasonTitle).toBe('Tomorrow is queued');
    const noStreak = buildSessionCompletionReturnPlan({ completionPercentage: 85, hasStudyFollowUp: false, streakDays: 0, streakIncreased: false });
    expect(noStreak.returnReasonTitle).toBe('Next useful action');
  });
});
