import {
  PaywallVerification,
} from '../PaywallVerification';
import {
  RevenueCatService,
  revenueCatService,
} from '../../shared/monetization/revenuecat-service';

jest.mock('../../shared/monetization/revenuecat-service', () => ({
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

describe('PaywallVerification', () => {
  let verification: PaywallVerification;

  beforeEach(() => {
    verification = PaywallVerification.getInstance();
    jest.clearAllMocks();
  });

  describe('Purchase Flow Verification', () => {
    it('should verify successful purchase flow', async () => {
      const mockPurchaseResult = {
        success: true,
        transactionId: 'test-transaction-123',
        productIdentifier: 'premium-monthly',
        receipt: {
          transactionId: 'test-transaction-123',
          originalTransactionIdentifier: 'test-transaction-123',
          productId: 'premium-monthly',
          productIdentifier: 'premium-monthly',
          purchaseDate: '2024-01-01T00:00:00.000Z',
          acknowledged: true,
          acknowledgedDate: '2024-01-01T00:00:00.000Z',
        },
        purchaseToken: 'test-purchase-token',
        purchaseDate: '2024-01-01',
      };
      mockRevenueCatService.purchasePackage.mockResolvedValue(
        mockPurchaseResult,
      );
      const result = await verification.verifyPurchaseFlow();
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect missing transaction ID', async () => {
      const mockPurchaseResult = {
        success: true,
        productIdentifier: 'premium-monthly',
        receipt: {
          originalTransactionIdentifier: 'test-transaction-123',
          productId: 'premium-monthly',
          productIdentifier: 'premium-monthly',
          purchaseDate: '2024-01-01T00:00:00.000Z',
          acknowledged: true,
          acknowledgedDate: '2024-01-01T00:00:00.000Z',
        },
        purchaseToken: 'test-purchase-token',
        purchaseDate: '2024-01-01',
      };
      mockRevenueCatService.purchasePackage.mockResolvedValue(
        mockPurchaseResult,
      );
      const result = await verification.verifyPurchaseFlow();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: 'missing-transaction-id',
          category: 'purchase-flow',
          severity: 'critical',
          message: 'Purchase result missing transaction ID',
        }),
      );
    });

    it('should detect missing receipt', async () => {
      const mockPurchaseResult = {
        success: true,
        transactionId: 'test-transaction-123',
        productIdentifier: 'premium-monthly',
        purchaseToken: 'test-purchase-token',
        purchaseDate: '2024-01-01',
      };
      mockRevenueCatService.purchasePackage.mockResolvedValue(
        mockPurchaseResult,
      );
      const result = await verification.verifyPurchaseFlow();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: 'missing-receipt',
          category: 'receipt',
          severity: 'critical',
          message: 'Purchase result missing receipt',
        }),
      );
    });

    it('should handle purchase flow verification errors', async () => {
      mockRevenueCatService.purchasePackage.mockRejectedValue(
        new Error('Purchase failed'),
      );
      const result = await verification.verifyPurchaseFlow();
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          id: 'purchase-flow-failed',
          category: 'purchase-flow',
          severity: 'critical',
        }),
      );
    });
  });
});
