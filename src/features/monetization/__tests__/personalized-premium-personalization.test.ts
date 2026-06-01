import { resolvePersonalizedPremium } from '../personalized-premium';
import type {
  PremiumPersonalizationInput,
  SessionEvidence,
} from '../personalized-premium';

function makeInput(
  overrides: Partial<PremiumPersonalizationInput> = {},
): PremiumPersonalizationInput {
  return {
    billingConfigured: true,
    completedSessions: 0,
    primaryGoal: 'focus',
    motivationStyle: 'calm',
    studyUsageRatio: 0,
    hasTriedAdvancedStudy: false,
    hasTriedWeeklyReport: false,
    hasTriedVisualIdentity: false,
    currentStreakDays: 0,
    daysSinceOnboarding: 2,
    ...overrides,
  };
}

function makeEvidence(
  overrides: Partial<SessionEvidence> = {},
): SessionEvidence {
  return {
    completedSessions: 12,
    focusHours: 8,
    consistencyRate: 0.75,
    ...overrides,
  };
}

describe('resolvePersonalizedPremium - personalization', () => {
  it('uses lane-specific premium value copy', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 12,
        lane: 'minimal_normal',
        hasTriedWeeklyReport: true,
      }),
    );
    expect(result.premiumHeadline).toContain('quiet');
    expect(result.premiumBody).toContain('calendar intelligence');
  });

  it('weekly intelligence intent triggers premium', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 7,
        hasTriedWeeklyReport: true,
      }),
    );
    expect(result.triggerMoment).toBe('weekly_intelligence');
  });

  it('custom identity intent triggers premium', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 7,
        hasTriedVisualIdentity: true,
      }),
    );
    expect(result.triggerMoment).toBe('custom_identity');
  });

  it('personalized headline for calm users', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 10,
        motivationStyle: 'calm',
      }),
    );
    expect(result.premiumHeadline).toContain('learn');
    expect(result.premiumBody).toContain('quietly');
  });

  it('personalized headline for study users', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 10,
        primaryGoal: 'study',
        motivationStyle: 'study_focused',
        hasTriedAdvancedStudy: true,
      }),
    );
    expect(result.premiumHeadline).toContain('study');
  });

  it('personalized headline for intense users', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 10,
        motivationStyle: 'intense',
      }),
    );
    expect(result.premiumHeadline).toContain('momentum');
  });

  it('deep coach memory trigger for strong streaks with study', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 45,
        currentStreakDays: 12,
        studyUsageRatio: 0.4,
        primaryGoal: 'learning',
      }),
    );
    expect(result.triggerMoment).toBe('deep_coach_memory');
  });

  it('deep work plan personalized trigger for heavy study users', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 45,
        studyUsageRatio: 0.6,
      }),
    );
    expect(result.triggerMoment).toBe('deep_work_plan_personalized');
  });
});
