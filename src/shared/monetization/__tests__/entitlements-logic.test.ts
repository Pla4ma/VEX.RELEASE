import {
  isPremiumEntitlementIdentifier,
  getEntitlementAccessState,
  hasPremiumEntitlement,
  KNOWN_PREMIUM_ENTITLEMENT_IDS,
} from '../entitlements';
import type { EntitlementInfo } from '../revenuecat-types';

describe('entitlements', () => {
  describe('KNOWN_PREMIUM_ENTITLEMENT_IDS', () => {
    it('contains expected premium identifiers', () => {
      expect(KNOWN_PREMIUM_ENTITLEMENT_IDS).toContain('premium');
      expect(KNOWN_PREMIUM_ENTITLEMENT_IDS).toContain('vex_premium');
      expect(KNOWN_PREMIUM_ENTITLEMENT_IDS).toContain('vip');
      expect(KNOWN_PREMIUM_ENTITLEMENT_IDS).toContain('pro');
    });
  });

  describe('isPremiumEntitlementIdentifier', () => {
    it('matches known premium identifiers', () => {
      expect(isPremiumEntitlementIdentifier('premium')).toBe(true);
      expect(isPremiumEntitlementIdentifier('vex_premium')).toBe(true);
      expect(isPremiumEntitlementIdentifier('vip')).toBe(true);
      expect(isPremiumEntitlementIdentifier('pro')).toBe(true);
    });

    it('matches identifiers with premium_ prefix', () => {
      expect(isPremiumEntitlementIdentifier('premium_monthly')).toBe(true);
      expect(isPremiumEntitlementIdentifier('premium_annual')).toBe(true);
    });

    it('matches identifiers with _premium suffix', () => {
      expect(isPremiumEntitlementIdentifier('monthly_premium')).toBe(true);
    });

    it('matches vex_premium prefix', () => {
      expect(isPremiumEntitlementIdentifier('vex_premium_plus')).toBe(true);
    });

    it('matches vip_ prefix', () => {
      expect(isPremiumEntitlementIdentifier('vip_member')).toBe(true);
    });

    it('is case insensitive', () => {
      expect(isPremiumEntitlementIdentifier('PREMIUM')).toBe(true);
      expect(isPremiumEntitlementIdentifier('Premium')).toBe(true);
    });

    it('handles whitespace and dashes', () => {
      expect(isPremiumEntitlementIdentifier('premium-monthly')).toBe(true);
      expect(isPremiumEntitlementIdentifier('premium monthly')).toBe(true);
    });

    it('returns false for non-premium identifiers', () => {
      expect(isPremiumEntitlementIdentifier('basic')).toBe(false);
      expect(isPremiumEntitlementIdentifier('free')).toBe(false);
      expect(isPremiumEntitlementIdentifier('trial')).toBe(false);
    });
  });

  describe('getEntitlementAccessState', () => {
    const makeEntitlement = (identifier: string, isActive: boolean, billingIssue?: string): EntitlementInfo => ({
      identifier,
      isActive,
      willRenew: false,
      latestPurchaseDate: '2026-01-01',
      originalPurchaseDate: '2025-01-01',
      expirationDate: '2027-01-01',
      store: 'app_store',
      productIdentifier: 'prod-1',
      isSandbox: false,
      unsubscribeDetectedAt: null,
      billingIssueDetectedAt: billingIssue ?? null,
    });

    it('returns not premium when no entitlements', () => {
      const result = getEntitlementAccessState([]);
      expect(result.isPremium).toBe(false);
      expect(result.hasActiveEntitlements).toBe(false);
    });

    it('returns not premium when no active entitlements', () => {
      const result = getEntitlementAccessState([makeEntitlement('premium', false)]);
      expect(result.isPremium).toBe(false);
      expect(result.hasActiveEntitlements).toBe(false);
    });

    it('returns premium when active premium entitlement exists', () => {
      const result = getEntitlementAccessState([makeEntitlement('premium', true)]);
      expect(result.isPremium).toBe(true);
      expect(result.premiumEntitlementIds).toContain('premium');
    });

    it('separates premium and unknown entitlements', () => {
      const result = getEntitlementAccessState([
        makeEntitlement('premium', true),
        makeEntitlement('some_other', true),
      ]);
      expect(result.premiumEntitlementIds).toContain('premium');
      expect(result.unknownActiveEntitlementIds).toContain('some_other');
    });

    it('detects billing issues', () => {
      const result = getEntitlementAccessState([
        makeEntitlement('premium', true, '2026-06-01'),
      ]);
      expect(result.hasBillingIssue).toBe(true);
    });

    it('no billing issues when none detected', () => {
      const result = getEntitlementAccessState([makeEntitlement('premium', true)]);
      expect(result.hasBillingIssue).toBe(false);
    });
  });

  describe('hasPremiumEntitlement', () => {
    const makeEnt = (id: string, active: boolean): EntitlementInfo => ({
      identifier: id, isActive: active, willRenew: false,
      latestPurchaseDate: '2026-01-01', originalPurchaseDate: '2025-01-01',
      expirationDate: '2027-01-01', store: 'app_store', productIdentifier: 'prod-1',
      isSandbox: false, unsubscribeDetectedAt: null, billingIssueDetectedAt: null,
    });

    it('returns true when premium is active', () => {
      expect(hasPremiumEntitlement([makeEnt('premium', true)])).toBe(true);
    });

    it('returns false when premium is inactive', () => {
      expect(hasPremiumEntitlement([makeEnt('premium', false)])).toBe(false);
    });

    it('returns false for empty entitlements', () => {
      expect(hasPremiumEntitlement([])).toBe(false);
    });
  });
});
