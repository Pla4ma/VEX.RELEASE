import { resolvePremiumTiming, EARLY_HIDDEN_THRESHOLD } from './helpers';

describe('premium timing gates', () => {
  it('returns hidden_early for sessions 0-4 (no Day 0 paywall)', () => {
    for (let i = 0; i < EARLY_HIDDEN_THRESHOLD; i++) {
      const result = resolvePremiumTiming({
        completedSessions: i,
        revenueCatHealthy: true,
        billingConfigured: true,
      });
      expect(result.tier).toBe('hidden_early');
      expect(result.canShowPaywall).toBe(false);
      expect(result.canTeaseEntries).toBe(false);
      expect(result.canRenderPremiumCTA).toBe(false);
      expect(result.canShowCompletionMoment).toBe(false);
    }
  });

  it('returns blocked_unhealthy when RevenueCat is unhealthy', () => {
    const result = resolvePremiumTiming({
      completedSessions: 40,
      revenueCatHealthy: false,
      billingConfigured: true,
    });
    expect(result.tier).toBe('blocked_unhealthy');
    expect(result.canShowPaywall).toBe(false);
    expect(result.canTeaseEntries).toBe(false);
    expect(result.canRenderPremiumCTA).toBe(false);
    expect(result.canShowCompletionMoment).toBe(false);
    expect(result.reason).toContain('billing');
  });

  it('returns blocked_unhealthy when billing not configured', () => {
    const result = resolvePremiumTiming({
      completedSessions: 40,
      revenueCatHealthy: true,
      billingConfigured: false,
    });
    expect(result.tier).toBe('blocked_unhealthy');
    expect(result.canShowPaywall).toBe(false);
  });

  it('returns soft_tease for sessions 5-39 (no paywall, tease only)', () => {
    for (const sessions of [5, 10, 20, 30, 39]) {
      const result = resolvePremiumTiming({
        completedSessions: sessions,
        revenueCatHealthy: true,
        billingConfigured: true,
      });
      expect(result.tier).toBe('soft_tease');
      expect(result.canShowPaywall).toBe(false);
      expect(result.canTeaseEntries).toBe(true);
      expect(result.canRenderPremiumCTA).toBe(false);
    }
  });

  it('returns eligible for 40+ sessions with healthy billing', () => {
    const result = resolvePremiumTiming({
      completedSessions: 40,
      revenueCatHealthy: true,
      billingConfigured: true,
    });
    expect(result.tier).toBe('eligible');
    expect(result.canShowPaywall).toBe(true);
    expect(result.canRenderPremiumCTA).toBe(true);
    expect(result.canShowCompletionMoment).toBe(true);
  });

  it('keeps all premium hidden for 50 sessions if RevenueCat unhealthy', () => {
    const result = resolvePremiumTiming({
      completedSessions: 50,
      revenueCatHealthy: false,
      billingConfigured: true,
    });
    expect(result.tier).toBe('blocked_unhealthy');
    expect(result.canShowPaywall).toBe(false);
  });
});
