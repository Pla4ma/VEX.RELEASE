import {
  calculatePriceTrustScore,
  getActiveTrustSignals,
  getPriceExplanation,
  getRefundEligibility,
  getRemainingDays,
  isPurchaseValid,
  isSuspiciousPurchase,
  logPurchaseAttempt,
  PurchaseReceiptSchema,
  restorePurchases,
  TRUST_SIGNALS,
  verifyPurchaseHash,
  verifyPurchaseReceipt,
} from '../purchase-trust';

describe('Purchase Trust Utilities', () => {
  describe('TRUST_SIGNALS', () => {
    it('has required trust signals', () => {
      const signalIds = TRUST_SIGNALS.map((s) => s.id);

      expect(signalIds).toContain('secure_payment');
      expect(signalIds).toContain('cancel_anytime');
      expect(signalIds).toContain('money_back_guarantee');
    });

    it('each signal has required fields', () => {
      TRUST_SIGNALS.forEach((signal) => {
        expect(signal.icon).toBeTruthy();
        expect(signal.title).toBeTruthy();
        expect(signal.description).toBeTruthy();
        expect(signal.priority).toBeGreaterThan(0);
      });
    });
  });

  describe('PurchaseReceiptSchema', () => {
    it('validates valid receipt', () => {
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

    it('rejects invalid tier', () => {
      expect(() =>
        PurchaseReceiptSchema.parse({
          transactionId: 'txn-123',
          productId: 'com.vex.free',
          tier: 'free',
          purchaseDate: Date.now(),
          isTrial: false,
          platform: 'ios',
          receiptData: 'data',
        })
      ).toThrow();
    });

    it('accepts receipt without expiry', () => {
      const receipt = {
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        isTrial: false,
        platform: 'android',
        receiptData: 'data',
      };

      expect(PurchaseReceiptSchema.parse(receipt)).toBeDefined();
    });
  });

  describe('verifyPurchaseReceipt', () => {
    it('verifies receipt successfully', async () => {
      const receipt = {
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus' as const,
        purchaseDate: Date.now(),
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        isTrial: false,
        platform: 'ios' as const,
        receiptData: 'base64-data',
      };

      const verification = await verifyPurchaseReceipt(receipt);

      expect(verification.verified).toBe(true);
      expect(verification.transactionId).toBe('txn-123');
      expect(verification.tier).toBe('plus');
    });
  });

  describe('restorePurchases', () => {
    it('returns empty array', async () => {
      const purchases = await restorePurchases('user-1');

      expect(purchases).toEqual([]);
    });
  });

  describe('isPurchaseValid', () => {
    it('returns true for non-expiring purchase', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        isTrial: false,
        platform: 'ios' as const,
      };

      expect(isPurchaseValid(purchase)).toBe(true);
    });

    it('returns true for valid subscription', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        isTrial: false,
        platform: 'ios' as const,
      };

      expect(isPurchaseValid(purchase)).toBe(true);
    });

    it('returns false for expired subscription', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
        expiryDate: Date.now() - 1,
        isTrial: false,
        platform: 'ios' as const,
      };

      expect(isPurchaseValid(purchase)).toBe(false);
    });
  });

  describe('getRemainingDays', () => {
    it('returns Infinity for non-expiring', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        isTrial: false,
        platform: 'ios' as const,
      };

      expect(getRemainingDays(purchase)).toBe(Infinity);
    });

    it('returns correct remaining days', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        expiryDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
        isTrial: false,
        platform: 'ios' as const,
      };

      expect(getRemainingDays(purchase)).toBe(15);
    });
  });

  describe('getActiveTrustSignals', () => {
    it('returns default signals without trial', () => {
      const signals = getActiveTrustSignals(false);

      expect(signals.length).toBe(3);
    });

    it('includes review signal with trial', () => {
      const signals = getActiveTrustSignals(true);

      expect(signals.length).toBe(4);
      expect(signals.map((s) => s.id)).toContain('verified_reviews');
    });

    it('respects limit parameter', () => {
      const signals = getActiveTrustSignals(false, 2);

      expect(signals.length).toBe(2);
    });
  });

  describe('calculatePriceTrustScore', () => {
    it('returns base score for no discounts', () => {
      const score = calculatePriceTrustScore(9.99, 9.99, false, false);

      expect(score).toBe(50);
    });

    it('increases with discount', () => {
      const score = calculatePriceTrustScore(9.99, 7.99, false, false);

      expect(score).toBe(65);
    });

    it('increases with trial', () => {
      const score = calculatePriceTrustScore(9.99, 9.99, true, false);

      expect(score).toBe(70);
    });

    it('increases with guarantee', () => {
      const score = calculatePriceTrustScore(9.99, 9.99, false, true);

      expect(score).toBe(65);
    });

    it('caps at 100', () => {
      const score = calculatePriceTrustScore(19.99, 9.99, true, true);

      expect(score).toBe(100);
    });
  });

  describe('getPriceExplanation', () => {
    it('includes trial message', () => {
      const explanation = getPriceExplanation('plus', 4.99, 'month', true);

      expect(explanation).toContain('Start free');
      expect(explanation).toContain('4.99/month');
    });

    it('includes daily cost', () => {
      const explanation = getPriceExplanation('plus', 4.99, 'month', false);

      expect(explanation).toContain('$0.17/day');
      expect(explanation).toContain('coffee');
    });
  });

  describe('verifyPurchaseHash', () => {
    it('generates hash string', () => {
      const hash = verifyPurchaseHash('txn-123', 'prod-1', Date.now(), 'secret');

      expect(hash).toContain('hash-');
      expect(hash).toContain('txn-123');
    });
  });

  describe('isSuspiciousPurchase', () => {
    it('returns true for excessive refunds', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        isTrial: false,
        platform: 'ios' as const,
      };

      expect(isSuspiciousPurchase(purchase, { purchases: 2, refunds: 4 })).toBe(true);
    });

    it('returns true for rapid purchases', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        isTrial: false,
        platform: 'ios' as const,
      };

      expect(isSuspiciousPurchase(purchase, { purchases: 6, refunds: 0 })).toBe(true);
    });

    it('returns false for normal user', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        isTrial: false,
        platform: 'ios' as const,
      };

      expect(isSuspiciousPurchase(purchase, { purchases: 2, refunds: 0 })).toBe(false);
    });
  });

  describe('logPurchaseAttempt', () => {
    it('logs success without error', async () => {
      await expect(
        logPurchaseAttempt('user-1', 'plus', true)
      ).resolves.not.toThrow();
    });

    it('logs failure with error', async () => {
      await expect(
        logPurchaseAttempt('user-1', 'pro', false, 'Payment declined')
      ).resolves.not.toThrow();
    });
  });

  describe('getRefundEligibility', () => {
    it('returns eligible within 7 days', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        isTrial: false,
        platform: 'ios' as const,
      };

      const eligibility = getRefundEligibility(purchase, 3);

      expect(eligibility.eligible).toBe(true);
      expect(eligibility.daysRemaining).toBe(4);
      expect(eligibility.reason).toContain('7-day');
    });

    it('returns not eligible after 7 days', () => {
      const purchase = {
        verified: true,
        transactionId: 'txn-123',
        productId: 'com.vex.plus',
        tier: 'plus',
        purchaseDate: Date.now(),
        isTrial: false,
        platform: 'ios' as const,
      };

      const eligibility = getRefundEligibility(purchase, 10);

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.daysRemaining).toBe(0);
      expect(eligibility.reason).toContain('expired');
    });
  });
});
