import {
  resolvePremiumStrategy,
  resolvePremiumTiming,
} from './premium-durable-helpers';

describe('no Day 0 paywall', () => {
  it('hides premium at session 0 even with billing and high intent', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 0,
      highIntentAction: 'deep_coach_memory',
    });
    expect(strategy.canShowPaywall).toBe(false);
    expect(strategy.triggerMoment).toBe('none');
  });

  it('hides premium at sessions 1-4 even with highIntentAction', () => {
    for (const sessions of [1, 2, 3, 4]) {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: sessions,
        highIntentAction: 'advanced_study',
      });
      expect(strategy.canShowPaywall).toBe(false);
      expect(strategy.triggerMoment).toBe('none');
    }
  });
});

describe('premium hidden if RevenueCat unhealthy', () => {
  it('blocks at sessions 0-4 with unhealthy RC', () => {
    const result = resolvePremiumTiming({
      completedSessions: 0,
      revenueCatHealthy: false,
      billingConfigured: true,
    });
    expect(result.tier).toBe('blocked_unhealthy');
    expect(result.canShowPaywall).toBe(false);
    expect(result.canTeaseEntries).toBe(false);
    expect(result.canRenderPremiumCTA).toBe(false);
    expect(result.canShowCompletionMoment).toBe(false);
  });

  it('blocks at session 50 with unhealthy RC', () => {
    const result = resolvePremiumTiming({
      completedSessions: 50,
      revenueCatHealthy: false,
      billingConfigured: true,
    });
    expect(result.tier).toBe('blocked_unhealthy');
    expect(result.canShowPaywall).toBe(false);
  });

  it('blocks when billing not configured at all', () => {
    const result = resolvePremiumTiming({
      completedSessions: 50,
      revenueCatHealthy: true,
      billingConfigured: false,
    });
    expect(result.tier).toBe('blocked_unhealthy');
  });

  it('premium strategy hides without billing config', () => {
    const strategy = resolvePremiumStrategy({
      billingConfigured: false,
      completedSessions: 100,
    });
    expect(strategy.canShowPaywall).toBe(false);
    expect(strategy.triggerMoment).toBe('hidden_billing_unavailable');
  });
});
