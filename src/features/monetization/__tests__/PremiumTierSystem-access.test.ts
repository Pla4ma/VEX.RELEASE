import {
  hasFeatureAccess,
  canCreateStudyPlan,
  getRemainingStudyPlanSlots,
  shouldShowPaywall,
} from '../PremiumTierSystem';

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn() },
}));

describe('PremiumTierSystem — feature access & paywall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
