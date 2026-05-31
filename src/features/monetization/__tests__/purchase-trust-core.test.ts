import {
  calculatePriceTrustScore,
  getActiveTrustSignals,
  getPriceExplanation,
  getRemainingDays,
  isPurchaseValid,
  isSuspiciousPurchase,
  PurchaseReceiptSchema,
  TRUST_SIGNALS,
  verifyPurchaseHash,
  type PurchaseVerification,
} from '../purchase-trust';

function createVerifiedPurchase(
  overrides: Partial<PurchaseVerification> = {},
): PurchaseVerification {
  return {
    verified: true,
    transactionId: 'txn-123',
    productId: 'com.vex.plus',
    tier: 'plus',
    purchaseDate: Date.now(),
    isTrial: false,
    platform: 'ios',
    ...overrides,
  };
}

describe('Purchase Trust — core utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TRUST_SIGNALS', () => {
    it('has required trust signals', () => {
      const signalIds = TRUST_SIGNALS.map((signal) => signal.id);
      expect(signalIds).toContain('secure_payment');
      expect(signalIds).toContain('cancel_anytime');
      expect(signalIds).toContain('money_back_guarantee');
    });
  });

  describe('PurchaseReceiptSchema', () => {
    it('validates paid receipt metadata', () => {
      const validReceipt = {
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        isTrial: false,
        platform: 'ios',
        receiptData: 'base64-receipt-data',
      };

      expect(PurchaseReceiptSchema.parse(validReceipt)).toEqual(validReceipt);
    });

    it('rejects free-tier receipt verification', () => {
      expect(() =>
        PurchaseReceiptSchema.parse({
          transactionId: 'txn-123',
          productId: 'com.vex.free',
          tier: 'basic',
          purchaseDate: Date.now(),
          isTrial: false,
          platform: 'ios',
          receiptData: 'data',
        }),
      ).toThrow();
    });
  });

  describe('purchase status helpers', () => {
    it('rejects unverified purchases', () => {
      expect(isPurchaseValid(createVerifiedPurchase({ verified: false }))).toBe(
        false,
      );
      expect(
        isSuspiciousPurchase(createVerifiedPurchase({ verified: false }), {
          purchases: 1,
          refunds: 0,
        }),
      ).toBe(true);
    });

    it('accepts verified non-expiring and active subscriptions', () => {
      expect(isPurchaseValid(createVerifiedPurchase())).toBe(true);
      expect(
        isPurchaseValid(
          createVerifiedPurchase({
            expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          }),
        ),
      ).toBe(true);
    });

    it('rejects expired subscriptions', () => {
      expect(
        isPurchaseValid(createVerifiedPurchase({ expiryDate: Date.now() - 1 })),
      ).toBe(false);
    });

    it('calculates remaining days', () => {
      const purchase = createVerifiedPurchase({
        expiryDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
      });
      expect(getRemainingDays(purchase)).toBe(15);
      expect(getRemainingDays(createVerifiedPurchase())).toBe(Infinity);
    });
  });

  describe('trust copy and scoring', () => {
    it('returns active trust signals', () => {
      expect(getActiveTrustSignals(false)).toHaveLength(3);
      expect(
        getActiveTrustSignals(true, 5).map((signal) => signal.id),
      ).toContain('verified_reviews');
    });

    it('scores pricing trust inputs', () => {
      expect(calculatePriceTrustScore(9.99, 9.99, false, false)).toBe(50);
      expect(calculatePriceTrustScore(19.99, 9.99, true, true)).toBe(100);
    });

    it('explains price without fake proof claims', () => {
      expect(getPriceExplanation('plus', 4.99, 'month', true)).toContain(
        'Start free',
      );
      expect(getPriceExplanation('plus', 4.99, 'month', false)).toContain(
        '$0.17/day',
      );
    });
  });

  describe('unsupported client hash verification', () => {
    it('throws instead of creating fake hashes', () => {
      expect(() => verifyPurchaseHash()).toThrow();
    });
  });
});
