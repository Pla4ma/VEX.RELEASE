import {
  validatePurchase,
  PurchaseSchema,
  VALIDATION_RULES,
  type ValidationResult,
  type ValidationError,
} from '../purchase-validation';

jest.mock('../../../utils/debug', () => ({
  createDebugger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));

jest.mock('../../../events', () => ({
  eventBus: { publish: jest.fn() },
}));

describe('purchase-validation', () => {
  const validPurchase = {
    productId: 'prod-monthly',
    userId: 'user-1',
    transactionId: 'tx-1',
    receipt: 'receipt-data',
    platform: 'ios' as const,
    price: 9.99,
    currency: 'USD',
    purchasedAt: Date.now() - 1000,
  };

  const emptyHistory = {
    recentPurchases: [] as typeof validPurchase[],
    totalSpent: 0,
    firstPurchaseAt: null as number | null,
  };

  describe('VALIDATION_RULES', () => {
    it('has expected threshold values', () => {
      expect(VALIDATION_RULES.RECEIPT_EXPIRY_HOURS).toBe(24);
      expect(VALIDATION_RULES.MAX_PURCHASES_PER_HOUR).toBe(10);
      expect(VALIDATION_RULES.MAX_PURCHASE_AMOUNT_USD).toBe(500);
      expect(VALIDATION_RULES.SUSPICIOUS_AMOUNT_THRESHOLD).toBe(200);
    });
  });

  describe('PurchaseSchema', () => {
    it('validates a correct purchase', () => {
      const result = PurchaseSchema.safeParse(validPurchase);
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const result = PurchaseSchema.safeParse({ productId: 'test' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid platform', () => {
      const result = PurchaseSchema.safeParse({ ...validPurchase, platform: 'web' });
      expect(result.success).toBe(false);
    });

    it('rejects negative price', () => {
      const result = PurchaseSchema.safeParse({ ...validPurchase, price: -1 });
      expect(result.success).toBe(false);
    });

    it('rejects currency not 3 chars', () => {
      const result = PurchaseSchema.safeParse({ ...validPurchase, currency: 'US' });
      expect(result.success).toBe(false);
    });

    it('accepts all valid platforms', () => {
      for (const platform of ['ios', 'android', 'stripe'] as const) {
        const result = PurchaseSchema.safeParse({ ...validPurchase, transactionId: `tx-${platform}`, platform });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('validatePurchase', () => {
    it('validates a correct purchase', () => {
      const result = validatePurchase(validPurchase, emptyHistory);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fraudRisk).toBe('NONE');
    });

    it('parses and returns data on success', () => {
      const result = validatePurchase(validPurchase, emptyHistory);
      expect(result.data).toBeDefined();
      expect(result.data?.productId).toBe('prod-monthly');
    });

    it('rejects invalid structure', () => {
      const invalidPurchase = { ...validPurchase, price: -5 };
      const result = validatePurchase(invalidPurchase, emptyHistory);
      expect(result.valid).toBe(false);
      expect(result.fraudRisk).toBe('HIGH');
    });

    it('detects duplicate transaction', () => {
      const history = {
        recentPurchases: [{ ...validPurchase }],
        totalSpent: 0,
        firstPurchaseAt: null,
      };
      const result = validatePurchase(validPurchase, history);
      expect(result.errors.some(e => e.code === 'DUPLICATE_TRANSACTION')).toBe(true);
    });

    it('detects expired receipt', () => {
      const oldPurchase = { ...validPurchase, purchasedAt: Date.now() - 25 * 60 * 60 * 1000 };
      const result = validatePurchase(oldPurchase, emptyHistory);
      expect(result.errors.some(e => e.code === 'RECEIPT_EXPIRED')).toBe(true);
    });

    it('detects rate limit exceeded', () => {
      const recent = Array.from({ length: 10 }, (_, i) => ({
        ...validPurchase,
        transactionId: `tx-old-${i}`,
        purchasedAt: Date.now() - 1000,
      }));
      const history = { recentPurchases: recent, totalSpent: 0, firstPurchaseAt: null };
      const newPurchase = { ...validPurchase, transactionId: 'tx-new' };
      const result = validatePurchase(newPurchase, history);
      expect(result.errors.some(e => e.code === 'RATE_LIMIT_EXCEEDED')).toBe(true);
    });

    it('detects amount too high', () => {
      const expensivePurchase = { ...validPurchase, price: 600 };
      const result = validatePurchase(expensivePurchase, emptyHistory);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'AMOUNT_TOO_HIGH')).toBe(true);
    });

    it('sets MEDIUM fraud risk for suspicious amount', () => {
      const suspiciousPurchase = { ...validPurchase, price: 250 };
      const result = validatePurchase(suspiciousPurchase, emptyHistory);
      expect(result.fraudRisk).toBe('MEDIUM');
      expect(result.valid).toBe(true);
    });

    it('detects rapid purchases', () => {
      const history = {
        recentPurchases: [{ ...validPurchase, purchasedAt: Date.now() - 5000 }],
        totalSpent: 0,
        firstPurchaseAt: Date.now() - 86400000 * 30,
      };
      const rapidPurchase = { ...validPurchase, transactionId: 'tx-rapid' };
      const result = validatePurchase(rapidPurchase, history);
      expect(result.errors.some(e => e.code === 'VELOCITY_ANOMALY')).toBe(true);
    });

    it('detects large first-day purchase', () => {
      const bigPurchase = { ...validPurchase, price: 99 };
      const history = { recentPurchases: [validPurchase], totalSpent: 0, firstPurchaseAt: Date.now() - 3600000 };
      const result = validatePurchase(bigPurchase, history);
      expect(result.errors.some(e => e.code === 'FIRST_DAY_LARGE_PURCHASE')).toBe(true);
    });

    it('does not flag normal first-day purchase', () => {
      const smallPurchase = { ...validPurchase, price: 10 };
      const history = { recentPurchases: [], totalSpent: 0, firstPurchaseAt: Date.now() - 3600000 };
      const result = validatePurchase(smallPurchase, history);
      expect(result.errors.some(e => e.code === 'FIRST_DAY_LARGE_PURCHASE')).toBe(false);
    });
  });
});
