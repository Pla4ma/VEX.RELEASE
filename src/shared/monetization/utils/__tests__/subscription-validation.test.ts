import { validateSubscription } from '../subscription-validation';
import type { Subscription } from '../subscription-validation';

describe('subscription-validation', () => {
  const baseSubscription: Subscription = {
    userId: 'user-1',
    subscriptionId: 'sub-1',
    productId: 'prod-monthly',
    status: 'active',
    startedAt: Date.now() - 86400000,
    expiresAt: Date.now() + 86400000 * 30,
    autoRenew: true,
    platform: 'ios',
  };

  const emptyHistory = { previousSubscriptions: [], totalRefunds: 0 };

  describe('validateSubscription', () => {
    it('validates a correct subscription', () => {
      const result = validateSubscription(baseSubscription, emptyHistory);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fraudRisk).toBe('NONE');
    });

    it('detects overlapping active subscriptions', () => {
      const history = {
        previousSubscriptions: [
          { ...baseSubscription, subscriptionId: 'sub-other', status: 'active' as const },
        ],
        totalRefunds: 0,
      };
      const result = validateSubscription(baseSubscription, history);
      expect(result.errors.some(e => e.code === 'OVERLAPPING_SUBSCRIPTION')).toBe(true);
    });

    it('does not flag non-overlapping subscriptions', () => {
      const history = {
        previousSubscriptions: [
          { ...baseSubscription, subscriptionId: 'sub-other', status: 'expired' as const },
        ],
        totalRefunds: 0,
      };
      const result = validateSubscription(baseSubscription, history);
      expect(result.errors.some(e => e.code === 'OVERLAPPING_SUBSCRIPTION')).toBe(false);
    });

    it('flags high refund history', () => {
      const history = { previousSubscriptions: [], totalRefunds: 5 };
      const result = validateSubscription(baseSubscription, history);
      expect(result.errors.some(e => e.code === 'HIGH_REFUND_HISTORY')).toBe(true);
      expect(result.fraudRisk).toBe('LOW');
    });

    it('does not flag low refund count', () => {
      const history = { previousSubscriptions: [], totalRefunds: 2 };
      const result = validateSubscription(baseSubscription, history);
      expect(result.errors.some(e => e.code === 'HIGH_REFUND_HISTORY')).toBe(false);
    });

    it('detects expiry before start date', () => {
      const invalid = { ...baseSubscription, expiresAt: baseSubscription.startedAt - 1000 };
      const result = validateSubscription(invalid, emptyHistory);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_DATES')).toBe(true);
      expect(result.fraudRisk).toBe('HIGH');
    });

    it('detects platform inconsistency', () => {
      const history = {
        previousSubscriptions: [
          { ...baseSubscription, subscriptionId: 'sub-old', platform: 'android' as const },
          { ...baseSubscription, subscriptionId: 'sub-old2', platform: 'stripe' as const },
        ],
        totalRefunds: 0,
      };
      const iosSub = { ...baseSubscription, platform: 'ios' as const };
      const result = validateSubscription(iosSub, history);
      expect(result.errors.some(e => e.code === 'PLATFORM_INCONSISTENCY')).toBe(true);
    });

    it('does not flag platform match', () => {
      const history = {
        previousSubscriptions: [
          { ...baseSubscription, subscriptionId: 'sub-old', platform: 'ios' as const },
        ],
        totalRefunds: 0,
      };
      const result = validateSubscription(baseSubscription, history);
      expect(result.errors.some(e => e.code === 'PLATFORM_INCONSISTENCY')).toBe(false);
    });

    it('handles empty previous subscriptions for platform check', () => {
      const result = validateSubscription(baseSubscription, emptyHistory);
      expect(result.errors.some(e => e.code === 'PLATFORM_INCONSISTENCY')).toBe(false);
    });
  });
});
