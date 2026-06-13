import { describe, expect, it } from '@jest/globals';

import {
  PurchaseEvents,
  type PurchaseEvent,
  createPaywallProperties,
  createPurchaseProperties,
} from '../purchase-events';

describe('PurchaseEvents', () => {
  it('contains all expected event names', () => {
    expect(PurchaseEvents.PAYWALL_VIEWED).toBe('paywall_viewed');
    expect(PurchaseEvents.PURCHASE_STARTED).toBe('purchase_started');
    expect(PurchaseEvents.PURCHASE_COMPLETED).toBe('purchase_completed');
    expect(PurchaseEvents.PURCHASE_FAILED).toBe('purchase_failed');
    expect(PurchaseEvents.PURCHASE_CANCELLED).toBe('purchase_cancelled');
    expect(PurchaseEvents.PURCHASE_RESTORED).toBe('purchase_restored');
    expect(PurchaseEvents.RESTORE_COMPLETED).toBe('restore_completed');
    expect(PurchaseEvents.RESTORE_FAILED).toBe('restore_failed');
    expect(PurchaseEvents.ENTITLEMENT_ACTIVATED).toBe('entitlement_activated');
    expect(PurchaseEvents.ENTITLEMENT_EXPIRED).toBe('entitlement_expired');
    expect(PurchaseEvents.PACKAGE_SELECTED).toBe('package_selected');
    expect(PurchaseEvents.PREMIUM_FEATURE_LOCKED).toBe('premium_feature_locked');
    expect(PurchaseEvents.REVENUECAT_ERROR).toBe('revenuecat_error');
  });

  it('has unique event values', () => {
    const values = Object.values(PurchaseEvents);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });
});

describe('createPaywallProperties', () => {
  it('creates properties from offering and packages', () => {
    const result = createPaywallProperties('off-1', 'home', [
      { identifier: 'monthly', hasTrial: true },
      { identifier: 'annual', hasTrial: false },
    ]);
    expect(result.offering_id).toBe('off-1');
    expect(result.paywall_source).toBe('home');
    expect(result.number_of_packages).toBe(2);
    expect(result.has_free_trial).toBe(true);
  });

  it('returns false for has_free_trial when no packages have trial', () => {
    const result = createPaywallProperties('off-1', 'modal', [
      { identifier: 'monthly', hasTrial: false },
    ]);
    expect(result.has_free_trial).toBe(false);
  });

  it('handles empty packages array', () => {
    const result = createPaywallProperties('off-1', 'test', []);
    expect(result.number_of_packages).toBe(0);
    expect(result.has_free_trial).toBe(false);
  });
});

describe('createPurchaseProperties', () => {
  it('creates purchase properties, user_id is empty string, timestamp populated', () => {
    const before = Date.now();
    const result = createPurchaseProperties({
      packageId: 'pkg-1',
      offeringId: 'off-1',
      productId: 'prod-1',
      price: 9.99,
      currency: 'USD',
      isRestore: false,
      success: true,
    });
    expect(result.package_id).toBe('pkg-1');
    expect(result.offering_id).toBe('off-1');
    expect(result.product_id).toBe('prod-1');
    expect(result.price).toBe(9.99);
    expect(result.currency).toBe('USD');
    expect(result.is_restore).toBe(false);
    expect(result.success).toBe(true);
    expect(result.user_id).toBe('');
    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('detects intro offer when introPrice < price', () => {
    const result = createPurchaseProperties({
      packageId: 'pkg-1', offeringId: 'off-1', productId: 'prod-1',
      price: 9.99, currency: 'USD', isRestore: false, introPrice: 0.99, success: true,
    });
    expect(result.has_intro_offer).toBe(true);
    expect(result.intro_price).toBe(0.99);
  });

  it('no intro offer when introPrice >= price', () => {
    const result = createPurchaseProperties({
      packageId: 'pkg-1', offeringId: 'off-1', productId: 'prod-1',
      price: 9.99, currency: 'USD', isRestore: false, introPrice: 9.99, success: true,
    });
    expect(result.has_intro_offer).toBe(false);
  });

  it('includes error details when provided', () => {
    const result = createPurchaseProperties({
      packageId: 'pkg-1', offeringId: 'off-1', productId: 'prod-1',
      price: 9.99, currency: 'USD', isRestore: true, success: false,
      errorCode: 'E001', errorMessage: 'Payment failed',
    });
    expect(result.is_restore).toBe(true);
    expect(result.success).toBe(false);
    expect(result.error_code).toBe('E001');
    expect(result.error_message).toBe('Payment failed');
  });
});
