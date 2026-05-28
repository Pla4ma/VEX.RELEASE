import {
  PaywallVerification,
} from "../PaywallVerification";
import {
  RevenueCatService,
  revenueCatService,
} from "../../shared/monetization/revenuecat-service";

jest.mock("../../shared/monetization/revenuecat-service", () => ({
  revenueCatService: {
    initialize: jest.fn(),
    getStatus: jest.fn(),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    getCustomerInfo: jest.fn(),
    getAnalyticsEvents: jest.fn(),
  },
}));

const mockRevenueCatService =
  revenueCatService as jest.Mocked<RevenueCatService>;

describe("PaywallVerification", () => {
  let verification: PaywallVerification;

  beforeEach(() => {
    verification = PaywallVerification.getInstance();
    jest.clearAllMocks();
  });

  describe("Subscription Management Verification", () => {
    it("should verify valid subscription management", async () => {
      const mockOfferings = {
        success: true,
        offerings: {
          current: [
            {
              identifier: "premium-monthly",
              displayName: "Premium Monthly",
              description: "Monthly premium subscription",
              price: 9.99,
              currencyCode: "USD",
              type: "subscription",
              subscriptionDuration: 30,
              pricingPhases: [
                {
                  price: 9.99,
                  billingPeriod: "P1M",
                  recurrenceMode: "FINITE_RECURRING",
                },
              ],
            },
          ],
        },
      };
      mockRevenueCatService.getOfferings.mockResolvedValue(mockOfferings);
      const result = await verification.verifySubscriptionManagement();
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should detect subscription duration too short", async () => {
      const mockOfferings = {
        success: true,
        offerings: {
          current: [
            {
              identifier: "premium-weekly",
              displayName: "Premium Weekly",
              description: "Weekly premium subscription",
              price: 2.99,
              currencyCode: "USD",
              type: "subscription",
              subscriptionDuration: 7,
              pricingPhases: [
                {
                  price: 2.99,
                  billingPeriod: "P1W",
                  recurrenceMode: "FINITE_RECURRING",
                },
              ],
            },
          ],
        },
      };
      mockRevenueCatService.getOfferings.mockResolvedValue(mockOfferings);
      const result = await verification.verifySubscriptionManagement();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: "subscription-duration-too-short",
          category: "subscription",
          severity: "major",
          message: "Subscription duration too short: 7 days",
        }),
      );
    });

    it("should detect invalid subscription type", async () => {
      const mockOfferings = {
        success: true,
        offerings: {
          current: [
            {
              identifier: "premium-custom",
              displayName: "Premium Custom",
              description: "Custom premium subscription",
              price: 14.99,
              currencyCode: "USD",
              type: "custom",
              subscriptionDuration: 30,
            },
          ],
        },
      };
      mockRevenueCatService.getOfferings.mockResolvedValue(mockOfferings);
      const result = await verification.verifySubscriptionManagement();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: "invalid-subscription-type",
          category: "subscription",
          severity: "critical",
          message: "Invalid subscription type: custom",
        }),
      );
    });

    it("should handle subscription management verification errors", async () => {
      mockRevenueCatService.getOfferings.mockRejectedValue(
        new Error("Network error"),
      );
      const result = await verification.verifySubscriptionManagement();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: "subscription-management-failed",
          category: "subscription",
          severity: "critical",
        }),
      );
    });
  });
});
