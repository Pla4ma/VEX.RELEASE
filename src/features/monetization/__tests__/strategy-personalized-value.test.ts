import {
  blockedEconomyTerms,
  resolvePremiumStrategy,
  resolvePersonalizedPremium,
} from './helpers';

describe('premium strategy integration', () => {
  it('hidden strategy when billing not configured', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: false,
      completedSessions: 0,
    });
    expect(strategy.canShowPaywall).toBe(false);
    expect(strategy.triggerMoment).toBe('hidden_billing_unavailable');
  });

  it('hidden at session 0 even with billing', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 0,
    });
    expect(strategy.canShowPaywall).toBe(false);
  });

  it('can show after value proof (40 sessions)', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 40,
    });
    expect(strategy.canShowPaywall).toBe(true);
    expect(strategy.triggerMoment).toBe('after_value');
  });

  it('premium features exclude economy', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 40,
    });
    const copy = [
      strategy.paywallHeadline,
      strategy.paywallBody,
      ...strategy.premiumFeatures,
    ]
      .join(' ')
      .toLowerCase();
    for (const term of blockedEconomyTerms) {
      const positiveUse = new RegExp(
        `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`,
        'i',
      );
      expect(copy).not.toMatch(positiveUse);
    }
  });

  it('free features confirm core loop stays free', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 40,
    });
    const freeCopy = strategy.freeFeatures.join(' ').toLowerCase();
    expect(freeCopy).toContain('focus');
    expect(freeCopy).toContain('session');
    expect(freeCopy).toContain('rescue');
  });
});

describe('personalized premium', () => {
  it('copy excludes economy language across all lanes', () => {
    const lanes = [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ] as const;
    for (const lane of lanes) {
      const result = resolvePersonalizedPremium({
        billingConfigured: true,
        completedSessions: 10,
        lane,
        primaryGoal: 'focus',
        motivationStyle: 'calm',
        studyUsageRatio: 0.5,
        hasTriedAdvancedStudy: false,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        currentStreakDays: 5,
        daysSinceOnboarding: 10,
      });
      const copy = [
        result.premiumHeadline,
        result.premiumBody,
        ...result.premiumFeatures,
      ]
        .join(' ')
        .toLowerCase();
      for (const term of blockedEconomyTerms) {
        const positiveUse = new RegExp(
          `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`,
          'i',
        );
        expect(copy).not.toMatch(positiveUse);
      }
    }
  });

  it('game_like lane copy explicitly disclaims no-currency', () => {
    const result = resolvePersonalizedPremium({
      billingConfigured: true,
      completedSessions: 10,
      lane: 'game_like',
      primaryGoal: 'focus',
      motivationStyle: 'game_like',
      studyUsageRatio: 0.3,
      hasTriedAdvancedStudy: false,
      hasTriedWeeklyReport: false,
      hasTriedVisualIdentity: false,
      currentStreakDays: 5,
      daysSinceOnboarding: 10,
    });
    expect(result.premiumBody.toLowerCase()).toMatch(
      /(?:no|not|without|never).{0,10}(?:coin|gem|currency|shop)/i,
    );
  });

  it('does not paywall basic focus loop', () => {
    const result = resolvePersonalizedPremium({
      billingConfigured: true,
      completedSessions: 0,
      primaryGoal: 'focus',
      motivationStyle: 'calm',
      studyUsageRatio: 0,
      hasTriedAdvancedStudy: false,
      hasTriedWeeklyReport: false,
      hasTriedVisualIdentity: false,
      currentStreakDays: 0,
      daysSinceOnboarding: 0,
    });
    expect(result.triggerMoment).toBe('none');
    expect(result.canShowPaywall).toBe(false);
  });
});
