import {
  isPurchaseValid,
  getRemainingDays,
  getActiveTrustSignals,
  calculatePriceTrustScore,
  getPriceExplanation,
  verifyPurchaseHash,
  isSuspiciousPurchase,
  getRefundEligibility,
  PurchaseTrustError,
} from '../purchase-trust';

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn() },
}));

describe('monetization feature — comprehensive tests', () => {
  describe('purchase-trust', () => {
    const verifiedPurchase = {
      verified: true,
      transactionId: 'txn-001',
      productId: 'premium_monthly',
      tier: 'premium' as const,
      purchaseDate: Date.now() - 86400000,
      expiryDate: Date.now() + 30 * 86400000,
      isTrial: false,
      platform: 'ios' as const,
    };
    const expiredPurchase = {
      ...verifiedPurchase,
      expiryDate: Date.now() - 86400000,
    };
    const unverifiedPurchase = {
      ...verifiedPurchase,
      verified: false,
    };

    it('isPurchaseValid returns true for verified non-expired', () => {
      expect(isPurchaseValid(verifiedPurchase)).toBe(true);
    });
    it('isPurchaseValid returns false for expired', () => {
      expect(isPurchaseValid(expiredPurchase)).toBe(false);
    });
    it('isPurchaseValid returns false for unverified', () => {
      expect(isPurchaseValid(unverifiedPurchase)).toBe(false);
    });
    it('getRemainingDays returns positive for future expiry', () => {
      const days = getRemainingDays(verifiedPurchase);
      expect(days).toBeGreaterThan(0);
    });
    it('getRemainingDays returns Infinity for no expiry', () => {
      expect(getRemainingDays({ ...verifiedPurchase, expiryDate: undefined })).toBe(Infinity);
    });
    it('getActiveTrustSignals returns sorted signals', () => {
      const signals = getActiveTrustSignals(false, 3);
      expect(signals.length).toBeLessThanOrEqual(3);
      expect(signals[0]!.priority).toBeLessThanOrEqual(signals[signals.length - 1]!.priority);
    });
    it('getActiveTrustSignals includes verified_reviews when trial', () => {
      const signals = getActiveTrustSignals(true, 10);
      expect(signals.some((s) => s.id === 'verified_reviews')).toBe(true);
    });
    it('calculatePriceTrustScore base is 50', () => {
      const score = calculatePriceTrustScore(9.99, 9.99, false, false);
      expect(score).toBe(50);
    });
    it('calculatePriceTrustScore adds for discount, trial, guarantee', () => {
      const score = calculatePriceTrustScore(12.99, 9.99, true, true);
      expect(score).toBe(100);
    });
    it('getPriceExplanation includes trial info when hasTrial', () => {
      const msg = getPriceExplanation('Premium', 9.99, 'month', true);
      expect(msg).toContain('free');
    });
    it('getPriceExplanation shows daily cost without trial', () => {
      const msg = getPriceExplanation('Premium', 9.99, 'month', false);
      expect(msg).toContain('/day');
    });
    it('verifyPurchaseHash throws PurchaseTrustError', () => {
      expect(() => verifyPurchaseHash()).toThrow(PurchaseTrustError);
    });
    it('isSuspiciousPurchase returns true for unverified', () => {
      expect(isSuspiciousPurchase(unverifiedPurchase, { purchases: 0, refunds: 0 })).toBe(true);
    });
    it('isSuspiciousPurchase returns true for many refunds', () => {
      expect(isSuspiciousPurchase(verifiedPurchase, { purchases: 0, refunds: 4 })).toBe(true);
    });
    it('getRefundEligibility returns eligible within 7 days', () => {
      const result = getRefundEligibility(verifiedPurchase, 3);
      expect(result.eligible).toBe(true);
      expect(result.daysRemaining).toBe(4);
    });
    it('getRefundEligibility returns not eligible after 7 days', () => {
      const result = getRefundEligibility(verifiedPurchase, 10);
      expect(result.eligible).toBe(false);
    });
  });
});
