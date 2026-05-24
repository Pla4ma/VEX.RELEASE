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
  PurchaseTrustError,
  restorePurchases,
  TRUST_SIGNALS,
  verifyPurchaseHash,
  verifyPurchaseReceipt,
  type PurchaseVerification,
} from "../purchase-trust";
import {
  initializeRevenueCat,
  restorePurchases as restoreRevenueCatPurchases,
} from "../../../shared/monetization/revenuecat-service";

jest.mock("../../../shared/monetization/revenuecat-service", () => ({
  initializeRevenueCat: jest.fn(),
  restorePurchases: jest.fn(),
}));

const mockInitializeRevenueCat = jest.mocked(initializeRevenueCat);
const mockRestoreRevenueCatPurchases = jest.mocked(restoreRevenueCatPurchases);

function createVerifiedPurchase(overrides: Partial<PurchaseVerification> = {}): PurchaseVerification {
  return {
    verified: true,
    transactionId: "txn-123",
    productId: "com.vex.plus",
    tier: "plus",
    purchaseDate: Date.now(),
    isTrial: false,
    platform: "ios",
    ...overrides,
  };
}

describe("Purchase Trust Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("TRUST_SIGNALS", () => {
    it("has required trust signals", () => {
      const signalIds = TRUST_SIGNALS.map((signal) => signal.id);
      expect(signalIds).toContain("secure_payment");
      expect(signalIds).toContain("cancel_anytime");
      expect(signalIds).toContain("money_back_guarantee");
    });
  });

  describe("PurchaseReceiptSchema", () => {
    it("validates paid receipt metadata", () => {
      const validReceipt = {
        transactionId: "txn-123",
        productId: "com.vex.plus",
        tier: "plus",
        purchaseDate: Date.now(),
        expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        isTrial: false,
        platform: "ios",
        receiptData: "base64-receipt-data",
      };

      expect(PurchaseReceiptSchema.parse(validReceipt)).toEqual(validReceipt);
    });

    it("rejects free-tier receipt verification", () => {
      expect(() =>
        PurchaseReceiptSchema.parse({
          transactionId: "txn-123",
          productId: "com.vex.free",
          tier: "basic",
          purchaseDate: Date.now(),
          isTrial: false,
          platform: "ios",
          receiptData: "data",
        }),
      ).toThrow();
    });
  });

  describe("verifyPurchaseReceipt", () => {
    it("does not verify raw client receipts", async () => {
      const receipt = PurchaseReceiptSchema.parse({
        transactionId: "txn-123",
        productId: "com.vex.plus",
        tier: "plus",
        purchaseDate: Date.now(),
        isTrial: false,
        platform: "ios",
        receiptData: "base64-data",
      });

      const verification = await verifyPurchaseReceipt(receipt);

      expect(verification.verified).toBe(false);
      expect(verification.errorReason).toContain("RevenueCat");
    });
  });

  describe("restorePurchases", () => {
    it("throws when RevenueCat is unavailable", async () => {
      mockInitializeRevenueCat.mockResolvedValue({ status: "missing_keys" });

      await expect(restorePurchases("user-1")).rejects.toThrow(PurchaseTrustError);
    });
  });

  describe("purchase status helpers", () => {
    it("rejects unverified purchases", () => {
      expect(isPurchaseValid(createVerifiedPurchase({ verified: false }))).toBe(false);
      expect(isSuspiciousPurchase(createVerifiedPurchase({ verified: false }), { purchases: 1, refunds: 0 }))
        .toBe(true);
    });

    it("accepts verified non-expiring and active subscriptions", () => {
      expect(isPurchaseValid(createVerifiedPurchase())).toBe(true);
      expect(
        isPurchaseValid(createVerifiedPurchase({ expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000 })),
      ).toBe(true);
    });

    it("rejects expired subscriptions", () => {
      expect(isPurchaseValid(createVerifiedPurchase({ expiryDate: Date.now() - 1 }))).toBe(false);
    });

    it("calculates remaining days", () => {
      const purchase = createVerifiedPurchase({ expiryDate: Date.now() + 15 * 24 * 60 * 60 * 1000 });
      expect(getRemainingDays(purchase)).toBe(15);
      expect(getRemainingDays(createVerifiedPurchase())).toBe(Infinity);
    });
  });

  describe("trust copy and scoring", () => {
    it("returns active trust signals", () => {
      expect(getActiveTrustSignals(false)).toHaveLength(3);
      expect(getActiveTrustSignals(true, 5).map((signal) => signal.id)).toContain("verified_reviews");
    });

    it("scores pricing trust inputs", () => {
      expect(calculatePriceTrustScore(9.99, 9.99, false, false)).toBe(50);
      expect(calculatePriceTrustScore(19.99, 9.99, true, true)).toBe(100);
    });

    it("explains price without fake proof claims", () => {
      expect(getPriceExplanation("plus", 4.99, "month", true)).toContain("Start free");
      expect(getPriceExplanation("plus", 4.99, "month", false)).toContain("$0.17/day");
    });
  });

  describe("unsupported client hash verification", () => {
    it("throws instead of creating fake hashes", () => {
      expect(() => verifyPurchaseHash()).toThrow(PurchaseTrustError);
    });
  });

  describe("logPurchaseAttempt", () => {
    it("logs success and failure without throwing", async () => {
      await expect(logPurchaseAttempt("user-1", "plus", true)).resolves.not.toThrow();
      await expect(logPurchaseAttempt("user-1", "plus", false, "Payment declined")).resolves.not.toThrow();
    });
  });

  describe("getRefundEligibility", () => {
    it("requires a verified purchase", () => {
      expect(getRefundEligibility(createVerifiedPurchase(), 3).eligible).toBe(true);
      expect(getRefundEligibility(createVerifiedPurchase({ verified: false }), 3).eligible).toBe(false);
      expect(getRefundEligibility(createVerifiedPurchase(), 10).eligible).toBe(false);
    });
  });
});
