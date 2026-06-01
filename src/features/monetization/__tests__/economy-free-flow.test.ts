import {
  resolvePremiumStrategy,
  resolvePremiumTiming,
  resolvePersonalizedPremium,
  getPaywallTiming,
  VALUE_PROPOSITION,
  FREE_BOUNDARY_COPY,
  PREMIUM_BOUNDARY_COPY,
  FEATURE_HIGHLIGHT_MAP,
  blockedEconomyTerms,
} from './premium-durable-helpers';

describe('no old economy premium copy', () => {
  const allCopy = [
    VALUE_PROPOSITION,
    FREE_BOUNDARY_COPY,
    PREMIUM_BOUNDARY_COPY,
    ...Object.values(FEATURE_HIGHLIGHT_MAP).flatMap((f) => [
      f.title,
      f.benefit,
    ]),
  ]
    .join(' ')
    .toLowerCase();

  it.each(blockedEconomyTerms)(
    'excludes "%s" from all paywall copy',
    (term) => {
      const positiveUse = new RegExp(
        `(?<!(no|not|without|never|0)[\\s\\S]{0,30})${term}`,
        'i',
      );
      expect(allCopy).not.toMatch(positiveUse);
    },
  );

  it('explicitly disclaims no currency, no gimmicks', () => {
    expect(allCopy).toContain('no currency');
    expect(allCopy).toContain('no gimmicks');
  });

  it('VALUE_PROPOSITION disclaims game economy', () => {
    expect(VALUE_PROPOSITION.toLowerCase()).toContain('smarter over time');
    expect(VALUE_PROPOSITION.toLowerCase()).not.toMatch(/coin|gem|shop|currency/i);
  });

  it('personalized premium excludes economy for all lanes', () => {
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
});

describe('free first session flow remains free', () => {
  it('free features include core session loop', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 0,
    });
    const freeCopy = strategy.freeFeatures.join(' ').toLowerCase();
    expect(freeCopy).toContain('start and complete');
    expect(freeCopy).toContain('session');
  });

  it('noFakeBillingChecklist forbids paywalling basic focus loop', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 0,
    });
    expect(strategy.noFakeBillingChecklist.join(' ').toLowerCase()).toMatch(
      /do not paywall/i,
    );
  });

  it('resolvePremiumTiming hides everything at session 0', () => {
    const result = resolvePremiumTiming({
      completedSessions: 0,
      revenueCatHealthy: true,
      billingConfigured: true,
    });
    expect(result.tier).toBe('hidden_early');
    expect(result.canShowPaywall).toBe(false);
    expect(result.canRenderPremiumCTA).toBe(false);
  });
});

describe('premium action routes safely', () => {
  it('getPaywallTiming uses 40-session value proof not session-7', () => {
    const timing40 = getPaywallTiming(40, 10, 90);
    expect(timing40.shouldShow).toBe(true);
    expect(timing40.trigger).toBe('post_session');

    const timing7 = getPaywallTiming(7, 10, 70);
    expect(timing7.shouldShow).toBe(false);
  });

  it('premium strategy respects dismissals', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 40,
      paywallDismissals: 2,
    });
    expect(strategy.triggerMoment).toBe('none');
    expect(strategy.canShowPaywall).toBe(false);
  });

  it('personalized premium hides on Day 0', () => {
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
    expect(result.canShowPaywall).toBe(false);
    expect(result.triggerMoment).toBe('none');
  });
});
