import { resolvePremiumStrategy } from '../premium-strategy';

describe('resolvePremiumStrategy', () => {
  it('keeps the basic execution loop free', () => {
    const strategy = resolvePremiumStrategy({ billingConfigured: true, completedSessions: 7 });

    expect(strategy.freeFeatures).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Start and complete'),
        expect.stringContaining('streak and progress'),
        expect.stringContaining('Coach Presence'),
        expect.stringContaining('companion'),
      ]),
    );
  });

  it('hides premium when billing is not configured', () => {
    const strategy = resolvePremiumStrategy({ billingConfigured: false, completedSessions: 10 });

    expect(strategy.triggerMoment).toBe('hidden_billing_unavailable');
    expect(strategy.canShowPaywall).toBe(false);
    expect(strategy.noFakeBillingChecklist).toContain('Do not render purchasable plans without RevenueCat packages.');
  });

  it('uses premium copy about deeper personalization', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 7,
      highIntentAction: 'weekly_intelligence',
    });

    expect(strategy.canShowPaywall).toBe(true);
    expect(strategy.paywallHeadline).toContain('execution system');
    expect(strategy.paywallBody).toContain('Deep Coach Memory');
    expect(strategy.paywallBody).not.toMatch(/upgrade now|unlock now/i);
  });

  it('does not show premium before 5 sessions', () => {
    const strategy = resolvePremiumStrategy({ billingConfigured: true, completedSessions: 2 });
    expect(strategy.triggerMoment).toBe('none');
    expect(strategy.canShowPaywall).toBe(false);
  });

  it('shows premium after 5 sessions', () => {
    const strategy = resolvePremiumStrategy({ billingConfigured: true, completedSessions: 5 });
    expect(strategy.triggerMoment).toBe('after_value');
    expect(strategy.canShowPaywall).toBe(true);
  });

  it('triggers on high-intent action regardless of session count', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 1,
      highIntentAction: 'advanced_study',
    });
    expect(strategy.triggerMoment).toBe('advanced_study');
    expect(strategy.canShowPaywall).toBe(true);
  });

  it('does not paywall basic sessions', () => {
    const strategy = resolvePremiumStrategy({ billingConfigured: true, completedSessions: 10 });
    expect(strategy.freeFeatures).toEqual(expect.arrayContaining([
      expect.stringContaining('Start and complete'),
    ]));
  });

  it('has free vs pro matrix', () => {
    const strategy = resolvePremiumStrategy({ billingConfigured: true, completedSessions: 10 });
    expect(strategy.freeVsProMatrix).toBeDefined();
    expect(strategy.freeVsProMatrix.length).toBeGreaterThanOrEqual(5);
    strategy.freeVsProMatrix.forEach((row) => {
      expect(row.free).toBeTruthy();
      expect(row.pro).toBeTruthy();
    });
  });
});
