import { resolvePersonalizedPremium } from '../personalized-premium';
import type { PremiumPersonalizationInput } from '../personalized-premium';

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

describe('resolvePersonalizedPremium', () => {
  it('no premium on Day 0', () => {
    const result = resolvePersonalizedPremium(
      makeInput({ completedSessions: 0 }),
    );
    expect(result.triggerMoment).toBe('none');
    expect(result.canShowPaywall).toBe(false);
  });

  it('no premium before 40 sessions', () => {
    const result = resolvePersonalizedPremium(
      makeInput({ completedSessions: 25 }),
    );
    expect(result.triggerMoment).toBe('none');
    expect(result.canShowPaywall).toBe(false);
  });

  it('premium hidden if RevenueCat degraded', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        billingConfigured: false,
        completedSessions: 10,
      }),
    );
    expect(result.triggerMoment).toBe('hidden_billing_unavailable');
    expect(result.canShowPaywall).toBe(false);
    expect(result.noFakeBillingChecklist).toContain(
      'Do not render purchasable plans without RevenueCat packages.',
    );
  });

  it('premium appears after value (40+ sessions)', () => {
    const result = resolvePersonalizedPremium(
      makeInput({ completedSessions: 40 }),
    );
    expect(result.triggerMoment).toBe('session_value');
    expect(result.canShowPaywall).toBe(true);
  });

  it('basic loop remains free', () => {
    const result = resolvePersonalizedPremium(
      makeInput({ completedSessions: 10 }),
    );
    expect(result.freeFeatures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Start and complete'),
        expect.stringContaining('rhythm and progress'),
        expect.stringContaining('Coach Presence'),
        expect.stringContaining('lane personalization'),
      ]),
    );
    expect(result.freeFeatures).not.toEqual(
      expect.arrayContaining([expect.stringContaining('Deep Coach Memory')]),
    );
  });

  it('no fake premium copy', () => {
    const result = resolvePersonalizedPremium(
      makeInput({ completedSessions: 10 }),
    );
    expect(result.premiumHeadline).not.toMatch(
      /unlock now|upgrade now|limited time|cheap/i,
    );
    expect(result.premiumBody).not.toMatch(/unlock now|upgrade now|cheap/i);
    expect(result.noFakeBillingChecklist).toHaveLength(5);
  });

  it('premium features list is comprehensive', () => {
    const result = resolvePersonalizedPremium(
      makeInput({ completedSessions: 10 }),
    );
    expect(result.premiumFeatures).toHaveLength(5);
    expect(result.premiumFeatures[0]).toContain('Deep Coach Memory');
    expect(result.premiumFeatures[1]).toContain('Study');
    expect(result.premiumFeatures[2]).toContain(
      'Personal Progress Intelligence',
    );
    expect(result.premiumFeatures[3]).toContain('Memory Console');
    expect(result.premiumFeatures[4]).toContain('Calendar Intelligence');
  });

  it('free vs pro matrix includes all 5 rows', () => {
    const result = resolvePersonalizedPremium(
      makeInput({ completedSessions: 10 }),
    );
    expect(result.freeVsProMatrix).toHaveLength(5);
    result.freeVsProMatrix.forEach((row) => {
      expect(row.free).toBeTruthy();
      expect(row.pro).toBeTruthy();
      expect(row.pro.length).toBeGreaterThan(row.free.length);
    });
  });

  it('high intent triggers premium regardless of session count', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 7,
        hasTriedAdvancedStudy: true,
      }),
    );
    expect(result.triggerMoment).toBe('advanced_study');
    expect(result.canShowPaywall).toBe(true);
    expect(result.premiumHeadline).toContain('study system');
  });

  it('blocks high intent paywall on Day 0 and after repeated dismissal', () => {
    const day0 = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 0,
        daysSinceOnboarding: 0,
        hasTriedAdvancedStudy: true,
      }),
    );
    expect(day0.canShowPaywall).toBe(false);

    const dismissed = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 10,
        hasTriedWeeklyReport: true,
        paywallDismissals: 2,
      }),
    );
    expect(dismissed.triggerMoment).toBe('none');
  });
});
