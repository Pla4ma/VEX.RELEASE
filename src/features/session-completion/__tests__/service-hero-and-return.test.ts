import { buildSessionCompletionHero, buildSessionCompletionReturnPlan } from '../service';

describe('buildSessionCompletionHero', () => {
  it('returns Clean finish for zero interruptions', () => {
    const h = buildSessionCompletionHero({ focusedDurationLabel: '20:00', interruptions: 0, streakIncreased: false });
    expect(h.title).toBe('Clean finish.');
    expect(h.body).toBe('20:00');
  });
  it('returns Work locked in for interruptions', () => {
    expect(buildSessionCompletionHero({ focusedDurationLabel: '18:00', interruptions: 3, streakIncreased: false }).title).toBe('Work locked in.');
  });
  it('shows streak protected', () => {
    expect(buildSessionCompletionHero({ focusedDurationLabel: '25:00', interruptions: 1, streakIncreased: true }).eyebrow).toBe('Streak protected');
  });
});

describe('buildSessionCompletionReturnPlan', () => {
  it('shows celebration for high completion', () => {
    const p = buildSessionCompletionReturnPlan({ completionPercentage: 90, hasStudyFollowUp: false, streakDays: 5, streakIncreased: true });
    expect(p.highlightTone).toBe('celebration');
    expect(p.homeCtaLabel).toBe('See tomorrow plan');
  });
  it('shows info for low completion', () => {
    const p = buildSessionCompletionReturnPlan({ completionPercentage: 50, hasStudyFollowUp: false, streakDays: 0, streakIncreased: false });
    expect(p.highlightTone).toBe('info');
  });
  it('shows follow-up CTA when study available', () => {
    expect(buildSessionCompletionReturnPlan({ completionPercentage: 50, hasStudyFollowUp: true, streakDays: 0, streakIncreased: false }).homeCtaLabel).toBe('See tomorrow plan');
  });
  it('shows Bank home when no follow-up', () => {
    expect(buildSessionCompletionReturnPlan({ completionPercentage: 70, hasStudyFollowUp: false, streakDays: 0, streakIncreased: false }).homeCtaLabel).toBe('Back home');
  });
  it('displays streak title', () => {
    expect(buildSessionCompletionReturnPlan({ completionPercentage: 85, hasStudyFollowUp: false, streakDays: 7, streakIncreased: true }).highlightTitle).toBe('7-day streak protected');
  });
});
