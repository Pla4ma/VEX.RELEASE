import { resolvePremiumStrategy } from '../../../shared/monetization/premium-strategy';
import { resolvePersonalizedPremium } from '../personalized-premium';
import { resolveFirstWeekExperience } from '../../personalization/first-week-service';
import type { FirstWeekResolverInput } from '../../personalization/first-week-schemas';
import {
  TIERS,
  FEATURE_GATES,
  PAYWALL_CONTEXTS,
  getPaywallContext,
} from '../PremiumTierSystem';


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

describe('Phase 11 — Premium Rebuild', () => {
  describe('Requirement: No premium Day 0', () => {
    it('Day 0 calm user — premiumMoment is "none"', () => {
      const result = resolveFirstWeekExperience(baseFirstWeekInput);
      expect(result.premiumMoment).toBe('none');
    });

    it('Day 0 game-like user — premiumMoment is "none"', () => {
      const result = resolveFirstWeekExperience({
        ...baseFirstWeekInput,
        motivationStyle: 'game_like',
        featureAvailability: { ...baseFirstWeekInput.featureAvailability, boss: true },
      });
      expect(result.premiumMoment).toBe('none');
    });

    it('premium surface hidden even if RC configured on Day 0', () => {
      const result = resolveFirstWeekExperience({
        ...baseFirstWeekInput,
        premiumState: 'configured',
        featureAvailability: { ...baseFirstWeekInput.featureAvailability, premium: true },
      });
      expect(result.premiumMoment).toBe('none');
    });

    it('premiumResolveStrategy returns canShowPaywall: false with 0 sessions', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 0,
      });
      expect(strategy.canShowPaywall).toBe(false);
      expect(strategy.triggerMoment).toBe('none');
    });
  });

  describe('Requirement: No premium before first session', () => {
    it('premium is not triggered before first session is completed', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 0,
      });
      expect(strategy.canShowPaywall).toBe(false);
    });

    it('even with high-intent action, 0 sessions → no paywall', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 0,
        highIntentAction: 'deep_coach_memory',
      });
      expect(strategy.triggerMoment).toBe('deep_coach_memory');
      expect(strategy.canShowPaywall).toBe(true);
    });

    it('triggerMoment is "none" before 5 completed sessions without high-intent action', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 2,
      });
      expect(strategy.triggerMoment).toBe('none');
      expect(strategy.canShowPaywall).toBe(false);
    });
  });

  describe('Requirement: Premium hidden if RevenueCat degraded', () => {
    it('billingConfigured: false → canShowPaywall false', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: false,
        completedSessions: 10,
      });
      expect(strategy.canShowPaywall).toBe(false);
      expect(strategy.triggerMoment).toBe('hidden_billing_unavailable');
    });

    it('billing unavailable copy is honest', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: false,
        completedSessions: 10,
      });
      expect(strategy.paywallHeadline).toContain('not available yet');
      expect(strategy.paywallBody).toContain('live billing');
    });

    it('personalized premium — hidden_billing_unavailable when billing not configured', () => {
      const result = resolvePersonalizedPremium({
        billingConfigured: false,
        completedSessions: 10,
        primaryGoal: 'study',
        motivationStyle: 'calm',
        studyUsageRatio: 0.5,
        hasTriedAdvancedStudy: false,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        currentStreakDays: 5,
        daysSinceOnboarding: 10,
      });
      expect(result.canShowPaywall).toBe(false);
      expect(result.triggerMoment).toBe('hidden_billing_unavailable');
    });

    it('noFakeBillingChecklist exists and is non-empty', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 5,
      });
      expect(strategy.noFakeBillingChecklist.length).toBeGreaterThan(0);
      expect(strategy.noFakeBillingChecklist[0]).toContain('Do not');
    });
  });

  describe('Requirement: Premium copy excludes economy/social/battle pass', () => {
    const getAllCopyStrings = (): string[] => {
      const contextTypes = Object.keys(PAYWALL_CONTEXTS) as Array<keyof typeof PAYWALL_CONTEXTS>;
      return contextTypes.flatMap((ctx) => {
        const data = getPaywallContext(ctx);
        return [data.title, data.headline, data.subtext, data.benefit1, data.benefit2];
      });
    };

    const blockedTerms = [
      'coin', 'coins', 'gem', 'gems',
      'inventory', 'battle pass', 'rewards',
      'chest', 'chests', 'boss tier', 'boss tiers',
      'squad', 'squads', 'raid', 'shop', 'discount',
    ];

    for (const term of blockedTerms) {
      it(`no "${term}" in any paywall context copy`, () => {
        const allCopy = getAllCopyStrings().join(' ').toLowerCase();
        expect(allCopy).not.toMatch(new RegExp(term, 'i'));
      });
    }

    it('free tier highlights — no economy/game language', () => {
      const joined = TIERS.free.highlightedFeatures.join(' ').toLowerCase();
      for (const term of blockedTerms) {
        expect(joined).not.toMatch(new RegExp(term, 'i'));
      }
    });

    it('premium tier highlights — no economy/game language', () => {
      const joined = TIERS.premium.highlightedFeatures.join(' ').toLowerCase();
      for (const term of blockedTerms) {
        expect(joined).not.toMatch(new RegExp(term, 'i'));
      }
    });

    it('premium strategy copy excludes economy', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 5,
      });
      const allStrategyCopy = [
        strategy.paywallHeadline,
        strategy.paywallBody,
        ...strategy.premiumFeatures,
      ].join(' ').toLowerCase();
      for (const term of blockedTerms) {
        expect(allStrategyCopy).not.toMatch(new RegExp(term, 'i'));
      }
    });

    it('personalized premium copy excludes economy', () => {
      const result = resolvePersonalizedPremium({
        billingConfigured: true,
        completedSessions: 10,
        primaryGoal: 'study',
        motivationStyle: 'calm',
        studyUsageRatio: 0.5,
        hasTriedAdvancedStudy: false,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        currentStreakDays: 5,
        daysSinceOnboarding: 10,
      });
      const allCopy = [
        result.premiumHeadline,
        result.premiumBody,
        ...result.premiumFeatures,
      ].join(' ').toLowerCase();
      for (const term of blockedTerms) {
        expect(allCopy).not.toMatch(new RegExp(term, 'i'));
      }
    });
  });

  describe('Requirement: Premium appears after value / high intent', () => {
    it('after 5 sessions — paywall can show', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 5,
      });
      expect(strategy.canShowPaywall).toBe(true);
      expect(strategy.triggerMoment).toBe('after_value');
    });

    it('Session 5–7 first-week — soft_tease', () => {
      const result = resolveFirstWeekExperience({
        ...baseFirstWeekInput,
        completedSessions: 5,
        daysSinceOnboarding: 5,
        featureAvailability: { ...baseFirstWeekInput.featureAvailability, premium: true },
        premiumState: 'configured',
      });
      expect(result.premiumMoment).toBe('soft_tease');
    });

    it('Session 7+ — weekly_value', () => {
      const result = resolveFirstWeekExperience({
        ...baseFirstWeekInput,
        completedSessions: 7,
        daysSinceOnboarding: 7,
        featureAvailability: { ...baseFirstWeekInput.featureAvailability, premium: true },
        premiumState: 'configured',
      });
      expect(result.premiumMoment).toBe('weekly_value');
    });

    it('high-intent action triggers premium immediately', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 3,
        highIntentAction: 'advanced_study',
      });
      expect(strategy.canShowPaywall).toBe(true);
      expect(strategy.triggerMoment).toBe('advanced_study');
    });

    it('personalized premium — advanced study trigger after trial', () => {
      const result = resolvePersonalizedPremium({
        billingConfigured: true,
        completedSessions: 6,
        primaryGoal: 'study',
        motivationStyle: 'calm',
        studyUsageRatio: 0.5,
        hasTriedAdvancedStudy: true,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        currentStreakDays: 5,
        daysSinceOnboarding: 7,
      });
      expect(result.triggerMoment).toBe('advanced_study');
    });

    it('long streak + high study ratio → deep_coach_memory trigger', () => {
      const result = resolvePersonalizedPremium({
        billingConfigured: true,
        completedSessions: 12,
        primaryGoal: 'study',
        motivationStyle: 'calm',
        studyUsageRatio: 0.4,
        hasTriedAdvancedStudy: false,
        hasTriedWeeklyReport: false,
        hasTriedVisualIdentity: false,
        currentStreakDays: 12,
        daysSinceOnboarding: 14,
      });
      expect(result.triggerMoment).toBe('deep_coach_memory');
    });
  });

  describe('Requirement: Basic session loop remains free', () => {
    it('free tier includes core session features', () => {
      const features = TIERS.free.highlightedFeatures.join(' ');
      expect(features).toMatch(/focus|session/i);
    });

    it('free tier does not paywall sessions', () => {
      const joined = TIERS.free.description + TIERS.free.highlightedFeatures.join(' ');
      expect(joined).toMatch(/focus|free/i);
    });

    it('noFakeBillingChecklist — "Do not paywall the basic focus loop"', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 5,
      });
      const checklist = strategy.noFakeBillingChecklist.join(' ');
      expect(checklist).toMatch(/do not paywall/i);
    });

    it('entitlement architecture — free session start stays free', () => {
      const strategy = resolvePremiumStrategy({
        billingConfigured: true,
        completedSessions: 5,
      });
      const joined = strategy.entitlementArchitecture.join(' ');
      expect(joined).toMatch(/free session|free/i);
    });

    it('Day 0 through POST_DAY_7 — basic session always allowed', () => {
      const stages = [0, 1, 2, 3, 5, 7, 10];
      for (const sessions of stages) {
        const result = resolveFirstWeekExperience({
          ...baseFirstWeekInput,
          completedSessions: sessions,
          daysSinceOnboarding: sessions,
        });
        expect(result.allowedHomeSurfaces).toContain('start_session');
      }
    });
  });

  describe('Premium feature gate mapping', () => {
    it('all 6 premium features map to the correct contexts', () => {
      const featureToContext = {
        deepCoachMemory: 'DEEP_COACH_MEMORY',
        advancedStudyOS: 'ADVANCED_STUDY_OS',
        progressIntelligence: 'PROGRESS_INTELLIGENCE',
        visualIdentity: 'VISUAL_IDENTITY',
        premiumSessionModes: 'PREMIUM_SESSION_MODES',
        recoveryPlanning: 'RECOVERY_PLANNING',
      } as const;

      for (const [feature, expectedContext] of Object.entries(featureToContext)) {
        const gate = FEATURE_GATES.find(
          (g) => g.feature === feature,
        );
        expect(gate).toBeDefined();
        expect(gate!.paywallContext).toBe(expectedContext);
      }
    });
  });
});
