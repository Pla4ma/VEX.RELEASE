import { describe, expect, it } from '@jest/globals';

import {
  createEntitlementProperties,
  createOfferingProperties,
  createRestoreProperties,
} from '../purchase-events';

describe('createEntitlementProperties', () => {
  it('creates minimal entitlement properties', () => {
    const result = createEntitlementProperties('ent-premium', true, 'purchase');
    expect(result.entitlement_id).toBe('ent-premium');
    expect(result.is_active).toBe(true);
    expect(result.source).toBe('purchase');
    expect(result.will_renew).toBeUndefined();
    expect(result.expiration_date).toBeUndefined();
  });

  it('creates entitlement with details', () => {
    const result = createEntitlementProperties('ent-vip', false, 'expiration', {
      willRenew: false, expirationDate: '2026-01-01', productId: 'prod-annual',
    });
    expect(result.is_active).toBe(false);
    expect(result.source).toBe('expiration');
    expect(result.will_renew).toBe(false);
    expect(result.expiration_date).toBe('2026-01-01');
    expect(result.product_id).toBe('prod-annual');
  });

  it('handles all source types', () => {
    const sources = ['purchase', 'restore', 'initial', 'expiration'] as const;
    for (const source of sources) {
      const result = createEntitlementProperties('ent-1', true, source);
      expect(result.source).toBe(source);
    }
  });
});

describe('createOfferingProperties', () => {
  it('creates offering properties from packages', () => {
    const result = createOfferingProperties('off-1', [
      { packageType: 'MONTHLY' },
      { packageType: 'ANNUAL' },
    ]);
    expect(result.offering_id).toBe('off-1');
    expect(result.package_count).toBe(2);
    expect(result.has_subscription).toBe(true);
    expect(result.has_lifetime).toBe(false);
  });

  it('detects lifetime package', () => {
    const result = createOfferingProperties('off-1', [
      { packageType: 'LIFETIME' },
    ]);
    expect(result.has_lifetime).toBe(true);
    expect(result.has_subscription).toBe(false);
  });

  it('deduplicates package types', () => {
    const result = createOfferingProperties('off-1', [
      { packageType: 'MONTHLY' },
      { packageType: 'MONTHLY' },
      { packageType: 'ANNUAL' },
    ]);
    expect(result.available_package_types).toEqual(['MONTHLY', 'ANNUAL']);
  });

  it('includes error code when provided', () => {
    const result = createOfferingProperties('off-1', [], { code: 'E404' });
    expect(result.error_code).toBe('E404');
    expect(result.package_count).toBe(0);
  });

  it('handles all subscription package types', () => {
    const subTypes = ['ANNUAL', 'SIX_MONTH', 'THREE_MONTH', 'TWO_MONTH', 'MONTHLY', 'WEEKLY'];
    const result = createOfferingProperties('off-1', subTypes.map(t => ({ packageType: t })));
    expect(result.has_subscription).toBe(true);
  });
});

describe('createRestoreProperties', () => {
  it('creates restore properties with entitlements', () => {
    const result = createRestoreProperties(['ent-1', 'ent-2'], true);
    expect(result.found_entitlements).toBe(true);
    expect(result.entitlement_count).toBe(2);
    expect(result.success).toBe(true);
  });

  it('handles empty entitlements', () => {
    const result = createRestoreProperties([], false);
    expect(result.found_entitlements).toBe(false);
    expect(result.entitlement_count).toBe(0);
    expect(result.success).toBe(false);
  });

  it('includes error details when provided', () => {
    const result = createRestoreProperties([], false, { code: 'E500', message: 'Server error' });
    expect(result.error_code).toBe('E500');
    expect(result.error_message).toBe('Server error');
  });
});
