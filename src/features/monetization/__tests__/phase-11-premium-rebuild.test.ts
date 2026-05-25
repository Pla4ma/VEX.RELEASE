import { resolvePremiumStrategy } from '../../../shared/monetization/premium-strategy';
import { resolvePersonalizedPremium } from '../personalized-premium';
import { resolveFirstWeekExperience } from '../../personalization/first-week-service';
import type { FirstWeekResolverInput } from '../../personalization/first-week-schemas';
import { TIERS } from '../PremiumTierSystem';

const baseFirstWeekInput: FirstWeekResolverInput = {
  behaviorStats: { bossEngagement: 'none', studyUsageRatio: 0 },
  completedSessions: 0,
  daysSinceLastSession: null,
  daysSinceOnboarding: 0,
  featureAvailability: { boss: false, premium: false, social: false, study: true },
  motivationStyle: 'calm',
  premiumState: 'unavailable',
  primaryGoal: 'work',
};

function personalized(overrides = {}) {
  return resolvePersonalizedPremium({
    billingConfigured: true,
    completedSessions: 40,
    primaryGoal: 'study',
    motivationStyle: 'calm',
    studyUsageRatio: 0.5,
    hasTriedAdvancedStudy: false,
    hasTriedWeeklyReport: false,
    hasTriedVisualIdentity: false,
    currentStreakDays: 5,
    daysSinceOnboarding: 10,
    ...overrides,
  });
}

describe('Phase 11 premium rebuild gates', () => {
  it('keeps premium hidden on Day 0, even when billing is configured', () => {
    expect(resolveFirstWeekExperience(baseFirstWeekInput).premiumMoment).toBe('none');
    expect(resolveFirstWeekExperience({
      ...baseFirstWeekInput,
      motivationStyle: 'game_like',
      featureAvailability: { ...baseFirstWeekInput.featureAvailability, boss: true },
    }).premiumMoment).toBe('none');
    expect(resolveFirstWeekExperience({
      ...baseFirstWeekInput,
      premiumState: 'configured',
      featureAvailability: { ...baseFirstWeekInput.featureAvailability, premium: true },
    }).premiumMoment).toBe('none');
    expect(resolvePremiumStrategy({ billingConfigured: true, completedSessions: 0 })).toMatchObject({
      canShowPaywall: false,
      triggerMoment: 'none',
    });
  });

  it('does not show premium before first session or before proven value', () => {
    expect(resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 0,
      highIntentAction: 'deep_coach_memory',
    })).toMatchObject({ canShowPaywall: false, triggerMoment: 'none' });
    expect(resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 25,
    })).toMatchObject({ canShowPaywall: false, triggerMoment: 'none' });
  });

  it('hides premium when RevenueCat is degraded', () => {
    const strategy = resolvePremiumStrategy({ billingConfigured: false, completedSessions: 40 });
    expect(strategy.canShowPaywall).toBe(false);
    expect(strategy.triggerMoment).toBe('hidden_billing_unavailable');
    expect(strategy.paywallHeadline).toContain('not available yet');
    expect(strategy.paywallBody).toContain('live billing');

    expect(personalized({ billingConfigured: false })).toMatchObject({
      canShowPaywall: false,
      triggerMoment: 'hidden_billing_unavailable',
    });
  });

  it('shows premium only after value or post-session high intent', () => {
    expect(resolvePremiumStrategy({ billingConfigured: true, completedSessions: 40 })).toMatchObject({
      canShowPaywall: true,
      triggerMoment: 'after_value',
    });
    expect(resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 3,
      highIntentAction: 'advanced_study',
    })).toMatchObject({ canShowPaywall: true, triggerMoment: 'advanced_study' });
    expect(personalized({
      completedSessions: 6,
      hasTriedAdvancedStudy: true,
      daysSinceOnboarding: 7,
    }).triggerMoment).toBe('advanced_study');
  });

  it('keeps basic session loop free through the first week', () => {
    expect(TIERS.free.highlightedFeatures.join(' ')).toMatch(/focus|session/i);
    expect(resolvePremiumStrategy({
      billingConfigured: true,
      completedSessions: 5,
    }).noFakeBillingChecklist.join(' ')).toMatch(/do not paywall/i);

    for (const sessions of [0, 1, 2, 3, 5, 7, 10]) {
      const result = resolveFirstWeekExperience({
        ...baseFirstWeekInput,
        completedSessions: sessions,
        daysSinceOnboarding: sessions,
      });
      expect(result.allowedHomeSurfaces).toContain('start_session');
    }
  });
});
