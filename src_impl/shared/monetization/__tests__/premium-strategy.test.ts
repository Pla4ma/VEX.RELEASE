import { resolvePremiumStrategy } from '../premium-strategy';

describe('resolvePremiumStrategy', () => {
  it('keeps the basic execution loop free', () => {
    const strategy = resolvePremiumStrategy({ billingConfigured: true, completedSessions: 7 });

    expect(strategy.freeFeatures).toEqual(
      expect.arrayContaining([
        'start_sessions',
        'complete_sessions',
        'basic_streak_progress',
        'basic_coach_presence',
        'basic_companion_visual',
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
    expect(strategy.paywallBody).toContain('coach memory');
    expect(strategy.paywallBody).not.toMatch(/upgrade now|unlock now/i);
  });
});
