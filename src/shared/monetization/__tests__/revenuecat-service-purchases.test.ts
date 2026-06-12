jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    syncPurchases: jest.fn(),
  },
}));

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

import Purchases from 'react-native-purchases';
import {
  purchasePackage,
  restorePurchases,
  syncPurchases,
} from '../revenuecat-service-purchases';

describe('revenuecat-service-purchases', () => {
  const createDeps = (overrides: Record<string, any> = {}) => ({
    isReady: jest.fn().mockReturnValue(true),
    debugMode: false,
    reportError: jest.fn(),
    ...overrides,
  });

  const mockPackage = {
    identifier: 'pkg-monthly',
    product: { identifier: 'prod-monthly' },
  } as any;

  const mockCustomerInfo = { originalAppUserId: 'user-1' } as any;

  describe('purchasePackage', () => {
    it('returns error when not ready', async () => {
      const deps = createDeps({ isReady: () => false });
      const result = await purchasePackage(deps, mockPackage);
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('CONFIGURATION_ERROR');
    });

    it('returns success on successful purchase', async () => {
      (Purchases.purchasePackage as jest.Mock).mockResolvedValueOnce({ customerInfo: mockCustomerInfo });
      const deps = createDeps();
      const result = await purchasePackage(deps, mockPackage);
      expect(result.success).toBe(true);
      expect(result.customerInfo).toBe(mockCustomerInfo);
    });

    it('returns cancelled error when user cancels', async () => {
      const cancelError = { code: 'PURCHASE_CANCELLED_ERROR', message: 'cancelled' };
      (Purchases.purchasePackage as jest.Mock).mockRejectedValueOnce(cancelError);
      const deps = createDeps();
      const result = await purchasePackage(deps, mockPackage);
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('PURCHASE_CANCELLED');
    });

    it('returns error on purchase failure', async () => {
      (Purchases.purchasePackage as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const deps = createDeps();
      const result = await purchasePackage(deps, mockPackage);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('restorePurchases', () => {
    it('returns error when not ready', async () => {
      const deps = createDeps({ isReady: () => false });
      const result = await restorePurchases(deps);
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('CONFIGURATION_ERROR');
    });

    it('returns success on successful restore', async () => {
      (Purchases.restorePurchases as jest.Mock).mockResolvedValueOnce(mockCustomerInfo);
      const deps = createDeps();
      const result = await restorePurchases(deps);
      expect(result.success).toBe(true);
    });

    it('returns error on restore failure', async () => {
      (Purchases.restorePurchases as jest.Mock).mockRejectedValueOnce(new Error('Failed'));
      const deps = createDeps();
      const result = await restorePurchases(deps);
      expect(result.success).toBe(false);
      expect(deps.reportError).toHaveBeenCalled();
    });
  });

  describe('syncPurchases', () => {
    it('returns false when not ready', async () => {
      const deps = createDeps({ isReady: () => false });
      const result = await syncPurchases(deps);
      expect(result).toBe(false);
    });

    it('returns true on successful sync', async () => {
      (Purchases.syncPurchases as jest.Mock).mockResolvedValueOnce(undefined);
      const deps = createDeps();
      const result = await syncPurchases(deps);
      expect(result).toBe(true);
    });

    it('returns false on sync error', async () => {
      (Purchases.syncPurchases as jest.Mock).mockRejectedValueOnce(new Error('fail'));
      const deps = createDeps();
      const result = await syncPurchases(deps);
      expect(result).toBe(false);
      expect(deps.reportError).toHaveBeenCalled();
    });
  });
});
