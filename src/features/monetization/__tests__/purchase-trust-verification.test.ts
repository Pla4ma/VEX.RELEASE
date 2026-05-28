import {
  getRefundEligibility,
  logPurchaseAttempt,
  PurchaseReceiptSchema,
  PurchaseTrustError,
  restorePurchases,
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

function createVerifiedPurchase(
  overrides: Partial<PurchaseVerification> = {},
): PurchaseVerification {
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

describe("Purchase Trust — verification & refund", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      await expect(restorePurchases("user-1")).rejects.toThrow(
        PurchaseTrustError,
      );
    });
  });

  describe("logPurchaseAttempt", () => {
    it("logs success and failure without throwing", async () => {
      await expect(
        logPurchaseAttempt("user-1", "plus", true),
      ).resolves.not.toThrow();
      await expect(
        logPurchaseAttempt("user-1", "plus", false, "Payment declined"),
      ).resolves.not.toThrow();
    });
  });

  describe("getRefundEligibility", () => {
    it("requires a verified purchase", () => {
      expect(getRefundEligibility(createVerifiedPurchase(), 3).eligible).toBe(
        true,
      );
      expect(
        getRefundEligibility(createVerifiedPurchase({ verified: false }), 3)
          .eligible,
      ).toBe(false);
      expect(getRefundEligibility(createVerifiedPurchase(), 10).eligible).toBe(
        false,
      );
    });
  });
});
