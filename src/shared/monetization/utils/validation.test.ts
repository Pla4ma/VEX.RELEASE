/**
 * Monetization Validation Tests
 *
 * @phase 6 - Deepening: Validation tests
 */

import {
  validatePurchase,
  verifyReceiptSignature,
  parseReceipt,
  MonetizationValidation,
  type Purchase,
} from "./validation";

describe("Monetization Validation", () => {
  describe("validatePurchase", () => {
    it("should validate a normal purchase", () => {
      const purchase: Purchase = {
        productId: "premium.monthly",
        userId: "user-1",
        transactionId: "txn-123",
        receipt: "receipt-data",
        platform: "ios",
        price: 9.99,
        currency: "USD",
        purchasedAt: Date.now(),
      };

      const result = validatePurchase(purchase, {
        recentPurchases: [],
        totalSpent: 0,
        firstPurchaseAt: null,
      });

      expect(result.valid).toBe(true);
    });

    it("should detect duplicate transaction", () => {
      const purchase: Purchase = {
        productId: "premium.monthly",
        userId: "user-1",
        transactionId: "txn-123",
        receipt: "receipt-data",
        platform: "ios",
        price: 9.99,
        currency: "USD",
        purchasedAt: Date.now(),
      };

      const result = validatePurchase(purchase, {
        recentPurchases: [purchase],
        totalSpent: 9.99,
        firstPurchaseAt: Date.now(),
      });

      expect(result.valid).toBe(false);
    });

    it("should detect excessive amount", () => {
      const purchase: Purchase = {
        productId: "premium.yearly",
        userId: "user-1",
        transactionId: "txn-456",
        receipt: "receipt-data",
        platform: "ios",
        price: 1000,
        currency: "USD",
        purchasedAt: Date.now(),
      };

      const result = validatePurchase(purchase, {
        recentPurchases: [],
        totalSpent: 0,
        firstPurchaseAt: null,
      });

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should detect rate limiting", () => {
      const now = Date.now();
      const recentPurchases = Array(12)
        .fill(null)
        .map(
          (_, i): Purchase => ({
            productId: "gems.small",
            userId: "user-1",
            transactionId: `txn-${i}`,
            receipt: "receipt-data",
            platform: "ios",
            price: 0.99,
            currency: "USD",
            purchasedAt: now - i * 1000,
          }),
        );

      const result = validatePurchase(
        {
          productId: "gems.small",
          userId: "user-1",
          transactionId: "txn-new",
          receipt: "receipt-data",
          platform: "ios",
          price: 0.99,
          currency: "USD",
          purchasedAt: now,
        },
        {
          recentPurchases,
          totalSpent: 11.88,
          firstPurchaseAt: now - 3600000,
        },
      );

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("verifyReceiptSignature", () => {
    it("should validate iOS receipt format", () => {
      expect(verifyReceiptSignature("a".repeat(200), "ios")).toBe(true);
      expect(verifyReceiptSignature("invalid!", "ios")).toBe(false);
    });

    it("should validate Android receipt format", () => {
      const validAndroid = JSON.stringify({
        orderId: "123",
        purchaseToken: "abc",
      });
      expect(verifyReceiptSignature(validAndroid, "android")).toBe(true);
      expect(verifyReceiptSignature("invalid", "android")).toBe(false);
    });

    it("should validate Stripe receipt format", () => {
      expect(
        verifyReceiptSignature("pi_123456789012345678901234", "stripe"),
      ).toBe(true);
      expect(verifyReceiptSignature("invalid", "stripe")).toBe(false);
    });
  });

  describe("parseReceipt", () => {
    it("should parse Android receipt", () => {
      const data = { orderId: "123", purchaseToken: "abc" };
      expect(parseReceipt(JSON.stringify(data), "android")).toEqual(data);
    });

    it("should return null for invalid JSON", () => {
      expect(parseReceipt("invalid", "android")).toBeNull();
    });
  });

  describe("MonetizationValidation export", () => {
    it("should export all validation functions", () => {
      expect(MonetizationValidation.validatePurchase).toBeDefined();
      expect(MonetizationValidation.validateSubscription).toBeDefined();
      expect(MonetizationValidation.verifyReceiptSignature).toBeDefined();
      expect(MonetizationValidation.parseReceipt).toBeDefined();
      expect(MonetizationValidation.PurchaseSchema).toBeDefined();
    });
  });
});
