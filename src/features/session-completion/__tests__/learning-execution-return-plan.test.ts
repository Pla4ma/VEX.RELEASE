import { buildSessionCompletionReturnPlan } from '../hero-return-plan';

describe('learning execution completion return plan', () => {
  it('uses plan wording instead of school-only copy for tied follow-ups', () => {
    const plan = buildSessionCompletionReturnPlan({
      completionPercentage: 100,
      hasStudyFollowUp: true,
      streakDays: 0,
      streakIncreased: false,
    });

    const joined = [
      plan.highlightMessage,
      plan.highlightTitle,
      plan.homeCtaLabel,
      plan.returnReasonBody,
      plan.returnReasonTitle,
    ].join(' ');

    expect(joined).toContain('plan');
    expect(joined.toLowerCase()).not.toMatch(/study|quiz|homework/);
  });
});
