import {
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

describe('PremiumTierSystem — User Subscription Management', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
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
