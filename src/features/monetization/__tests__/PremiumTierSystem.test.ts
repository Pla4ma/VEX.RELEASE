import {
  TIERS,
  FEATURE_GATES,
  hasFeatureAccess,
  canCreateStudyPlan,
  getRemainingStudyPlanSlots,
  getFeatureGate,
  shouldShowPaywall,
  getPaywallContext,
  setUserSubscription,
  getUserSubscription,
  getUserTier,
  isPremium,
  isInTrial,
  getTrialDaysRemaining,
  type SubscriptionTier,
} from '../PremiumTierSystem';

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));

describe('PremiumTierSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TIERS', () => {
    it('has correct tier names', () => {
      expect(TIERS.free.name).toBe('Free');
      expect(TIERS.free.id).toBe('free');
      expect(TIERS.premium.name).toBe('Premium');
      expect(TIERS.premium.id).toBe('premium');
    });

    it('free tier does not include premium features', () => {
      expect(TIERS.free.features.deepCoachMemory).toBe(false);
      expect(TIERS.free.features.advancedStudyOS).toBe(false);
      expect(TIERS.free.features.progressIntelligence).toBe(false);
      expect(TIERS.free.features.visualIdentity).toBe(false);
      expect(TIERS.free.features.premiumSessionModes).toBe(false);
      expect(TIERS.free.features.recoveryPlanning).toBe(false);
    });

    it('free tier has no price', () => {
      expect(TIERS.free.monthlyPrice).toBeNull();
      expect(TIERS.free.yearlyPrice).toBeNull();
    });

    it('free tier highlights exclude game economy', () => {
      const joined = TIERS.free.highlightedFeatures.join(' ');
      expect(joined).not.toMatch(/coin|gem|inventory|battle pass|chest|shop/i);
    });

    it('premium tier includes all features', () => {
      expect(TIERS.premium.features.deepCoachMemory).toBe(true);
      expect(TIERS.premium.features.advancedStudyOS).toBe(true);
      expect(TIERS.premium.features.progressIntelligence).toBe(true);
      expect(TIERS.premium.features.visualIdentity).toBe(true);
      expect(TIERS.premium.features.premiumSessionModes).toBe(true);
      expect(TIERS.premium.features.recoveryPlanning).toBe(true);
    });

    it('premium tier has correct pricing', () => {
      expect(TIERS.premium.monthlyPrice).toBe(9.99);
      expect(TIERS.premium.yearlyPrice).toBe(59.99);
    });

    it('premium tier has 7-day trial', () => {
      expect(TIERS.premium.trialDays).toBe(7);
    });

    it('premium tier description excludes game economy', () => {
      const joined = TIERS.premium.description + TIERS.premium.highlightedFeatures.join(' ');
      expect(joined).not.toMatch(/coin|gem|battle pass|chest|shop|squads|boss tiers/i);
    });
  });

  describe('FEATURE_GATES', () => {
    it('has feature gate for each premium feature', () => {
      const features = FEATURE_GATES.map((g) => g.feature);
      expect(features).toContain('deepCoachMemory');
      expect(features).toContain('advancedStudyOS');
      expect(features).toContain('progressIntelligence');
      expect(features).toContain('visualIdentity');
      expect(features).toContain('premiumSessionModes');
      expect(features).toContain('recoveryPlanning');
    });

    it('has correct paywall contexts', () => {
      const coachGate = FEATURE_GATES.find((g) => g.feature === 'deepCoachMemory');
      expect(coachGate?.paywallContext).toBe('DEEP_COACH_MEMORY');
      const studyGate = FEATURE_GATES.find((g) => g.feature === 'advancedStudyOS');
      expect(studyGate?.paywallContext).toBe('ADVANCED_STUDY_OS');
    });

    it('has plan limit gate', () => {
      const planGate = FEATURE_GATES.find((g) => g.feature === 'maxActiveStudyPlans');
      expect(planGate?.paywallContext).toBe('STUDY_PLAN_LIMIT');
    });

    it('has no game economy paywall contexts', () => {
      const contexts = FEATURE_GATES.map((g) => g.paywallContext);
      expect(contexts).not.toContain('BOSS_BOUNTY');
      expect(contexts).not.toContain('STREAK_INSURANCE');
      expect(contexts).not.toContain('SQUAD_LIMIT');
      expect(contexts).not.toContain('EXCLUSIVE_COSMETIC');
    });
  });

  describe('PAYWALL_CONTEXTS', () => {
    it('has context for each premium feature type', () => {
      const ctx = getPaywallContext('DEEP_COACH_MEMORY');
      expect(ctx.title).toContain('Coach');
      expect(ctx.headline).toBeTruthy();
    });

    it('all context copy excludes economy language', () => {
      const allContexts = ['DEEP_COACH_MEMORY', 'ADVANCED_STUDY_OS',
        'PROGRESS_INTELLIGENCE', 'VISUAL_IDENTITY',
        'PREMIUM_SESSION_MODES', 'RECOVERY_PLANNING', 'STUDY_PLAN_LIMIT'] as const;
      for (const ctx of allContexts) {
        const data = getPaywallContext(ctx);
        const joined = [data.headline, data.subtext, data.benefit1, data.benefit2].join(' ');
        expect(joined).not.toMatch(/coin|gem|inventory|battle pass|chest|squad|raid|shop/i);
      }
    });
  });

  describe('hasFeatureAccess', () => {
    it('grants free tier access to free features', () => {
      expect(hasFeatureAccess('free', 'advancedStudyAI')).toBe(false);
      expect(hasFeatureAccess('free', 'premiumSupport')).toBe(false);
    });

    it('denies free tier access to premium features', () => {
      expect(hasFeatureAccess('free', 'deepCoachMemory')).toBe(false);
      expect(hasFeatureAccess('free', 'advancedStudyOS')).toBe(false);
    });

    it('grants premium tier access to all features', () => {
      expect(hasFeatureAccess('premium', 'deepCoachMemory')).toBe(true);
      expect(hasFeatureAccess('premium', 'advancedStudyOS')).toBe(true);
      expect(hasFeatureAccess('premium', 'progressIntelligence')).toBe(true);
    });
  });

  describe('canCreateStudyPlan', () => {
    it('allows free user with 0 plans', () => {
      expect(canCreateStudyPlan('free', 0)).toBe(true);
    });

    it('denies free user with 1 plan (at limit)', () => {
      expect(canCreateStudyPlan('free', 1)).toBe(false);
    });

    it('allows premium user regardless of count', () => {
      expect(canCreateStudyPlan('premium', 0)).toBe(true);
      expect(canCreateStudyPlan('premium', 5)).toBe(true);
      expect(canCreateStudyPlan('premium', 100)).toBe(true);
    });
  });

  describe('getRemainingStudyPlanSlots', () => {
    it('returns 1 for free user with 0 plans', () => {
      expect(getRemainingStudyPlanSlots('free', 0)).toBe(1);
    });

    it('returns 0 for free user with 1 plan', () => {
      expect(getRemainingStudyPlanSlots('free', 1)).toBe(0);
    });

    it('returns Infinity for premium user', () => {
      expect(getRemainingStudyPlanSlots('premium', 5)).toBe(Infinity);
    });
  });

  describe('shouldShowPaywall', () => {
    it('does not show paywall for free user on free-accessible feature', () => {
      const result = shouldShowPaywall('free', 'deepCoachMemory');
      expect(result.show).toBe(true);
      expect(result.context).toBe('DEEP_COACH_MEMORY');
    });

    it('does not show paywall for premium user on any feature', () => {
      const result = shouldShowPaywall('premium', 'deepCoachMemory');
      expect(result.show).toBe(false);
      expect(result.context).toBeNull();
    });
  });

  describe('User Subscription Management', () => {
    const userId = 'test-user-123';

    beforeEach(() => {
      setUserSubscription({
        userId,
        tier: 'free',
        startedAt: Date.now(),
        expiresAt: null,
        isTrial: false,
        trialEndsAt: null,
        autoRenew: false,
        platform: 'ios',
      });
    });

    describe('setUserSubscription', () => {
      it('stores subscription', () => {
        const subscription = {
          userId,
          tier: 'premium' as SubscriptionTier,
          startedAt: Date.now(),
          expiresAt: null,
          isTrial: false,
          trialEndsAt: null,
          autoRenew: true,
          platform: 'ios' as const,
        };
        setUserSubscription(subscription);
        const retrieved = getUserSubscription(userId);
        expect(retrieved?.tier).toBe('premium');
      });

      it('publishes event on new subscription', () => {
        const { eventBus } = require('../../../events');
        setUserSubscription({
          userId,
          tier: 'premium',
          startedAt: Date.now(),
          expiresAt: null,
          isTrial: false,
          trialEndsAt: null,
          autoRenew: true,
          platform: 'ios',
        });
        expect(eventBus.publish).toHaveBeenCalledWith(
          'subscription:changed',
          expect.any(Object),
        );
      });
    });

    describe('getUserSubscription', () => {
      it('returns null for unknown user', () => {
        const subscription = getUserSubscription('unknown-user');
        expect(subscription).toBeNull();
      });
    });

    describe('getUserTier', () => {
      it('defaults to free for unknown user', () => {
        const tier = getUserTier('unknown-user');
        expect(tier).toBe('free');
      });
    });

    describe('isPremium', () => {
      it('returns false for free user', () => {
        expect(isPremium(userId)).toBe(false);
      });

      it('returns true for premium user', () => {
        setUserSubscription({
          userId,
          tier: 'premium',
          startedAt: Date.now(),
          expiresAt: null,
          isTrial: false,
          trialEndsAt: null,
          autoRenew: true,
          platform: 'ios',
        });
        expect(isPremium(userId)).toBe(true);
      });
    });

    describe('isInTrial', () => {
      it('returns false for non-trial user', () => {
        expect(isInTrial(userId)).toBe(false);
      });

      it('returns true for trial user', () => {
        setUserSubscription({
          userId,
          tier: 'premium',
          startedAt: Date.now(),
          expiresAt: null,
          isTrial: true,
          trialEndsAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          autoRenew: true,
          platform: 'ios',
        });
        expect(isInTrial(userId)).toBe(true);
      });

      it('returns false for expired trial', () => {
        setUserSubscription({
          userId,
          tier: 'premium',
          startedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
          expiresAt: null,
          isTrial: true,
          trialEndsAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
          autoRenew: true,
          platform: 'ios',
        });
        expect(isInTrial(userId)).toBe(false);
      });
    });

    describe('getTrialDaysRemaining', () => {
      it('returns 0 for non-trial user', () => {
        expect(getTrialDaysRemaining(userId)).toBe(0);
      });

      it('returns correct days for trial user', () => {
        const trialEndsAt =
          Date.now() + 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000;
        setUserSubscription({
          userId,
          tier: 'premium',
          startedAt: Date.now(),
          expiresAt: null,
          isTrial: true,
          trialEndsAt,
          autoRenew: true,
          platform: 'ios',
        });
        expect(getTrialDaysRemaining(userId)).toBe(3);
      });
    });
  });
});
