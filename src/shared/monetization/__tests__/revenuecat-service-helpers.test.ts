import {
  normalizeError,
  createServiceError,
  isUserCancelled,
  mapErrorCode,
  mapEntitlements,
} from '../revenuecat-service-helpers';
import type { RevenueCatError } from '../revenuecat-types';

jest.mock('react-native-purchases', () => ({
  PURCHASES_ERROR_CODE: {
    PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
    STORE_PROBLEM_ERROR: 'STORE_PROBLEM_ERROR',
    PURCHASE_NOT_ALLOWED_ERROR: 'PURCHASE_NOT_ALLOWED_ERROR',
    PURCHASE_INVALID_ERROR: 'PURCHASE_INVALID_ERROR',
    PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR: 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR',
    PRODUCT_ALREADY_PURCHASED_ERROR: 'PRODUCT_ALREADY_PURCHASED_ERROR',
    RECEIPT_ALREADY_IN_USE_ERROR: 'RECEIPT_ALREADY_IN_USE_ERROR',
    INVALID_RECEIPT_ERROR: 'INVALID_RECEIPT_ERROR',
    MISSING_RECEIPT_FILE_ERROR: 'MISSING_RECEIPT_FILE_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    INVALID_CREDENTIALS_ERROR: 'INVALID_CREDENTIALS_ERROR',
    UNEXPECTED_BACKEND_RESPONSE_ERROR: 'UNEXPECTED_BACKEND_RESPONSE_ERROR',
    INVALID_APP_USER_ID_ERROR: 'INVALID_APP_USER_ID_ERROR',
    OPERATION_ALREADY_IN_PROGRESS_ERROR: 'OPERATION_ALREADY_IN_PROGRESS_ERROR',
    INVALID_SUBSCRIBER_ATTRIBUTES_ERROR: 'INVALID_SUBSCRIBER_ATTRIBUTES_ERROR',
  },
}));

describe('revenuecat-service-helpers', () => {
  describe('normalizeError', () => {
    it('normalizes a Purchases error with known code', () => {
      const error = { code: 'PURCHASE_CANCELLED_ERROR', message: 'User cancelled' };
      const result = normalizeError(error);
      expect(result).toBeInstanceOf(Error);
      expect(result.name).toBe('RevenueCatError');
      expect(result.code).toBe('PURCHASE_CANCELLED');
      expect(result.message).toBe('User cancelled');
    });

    it('normalizes unknown error to UNKNOWN code', () => {
      const result = normalizeError(new Error('something broke'));
      expect(result.code).toBe('UNKNOWN');
      expect(result.name).toBe('RevenueCatError');
    });

    it('handles string errors', () => {
      const result = normalizeError('plain string');
      expect(result.code).toBe('UNKNOWN');
      expect(result.message).toBe('plain string');
    });

    it('preserves underlying error', () => {
      const original = new Error('original');
      const result = normalizeError(original);
      expect(result.underlyingError).toBe(original);
    });
  });

  describe('createServiceError', () => {
    it('creates error with code and message', () => {
      const result = createServiceError('EMPTY_OFFERINGS', 'No offerings found');
      expect(result.code).toBe('EMPTY_OFFERINGS');
      expect(result.message).toBe('No offerings found');
      expect(result.name).toBe('RevenueCatError');
    });

    it('includes underlying error', () => {
      const result = createServiceError('NETWORK_ERROR', 'timeout');
      expect(result.underlyingError).toBeInstanceOf(Error);
    });
  });

  describe('isUserCancelled', () => {
    it('returns true for cancelled error', () => {
      const error = { code: 'PURCHASE_CANCELLED_ERROR', message: 'cancelled' };
      expect(isUserCancelled(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error = { code: 'NETWORK_ERROR', message: 'timeout' };
      expect(isUserCancelled(error)).toBe(false);
    });
  });

  describe('mapErrorCode', () => {
    it('maps all known error codes', () => {
      expect(mapErrorCode('STORE_PROBLEM_ERROR' as any)).toBe('STORE_PROBLEM');
      expect(mapErrorCode('PURCHASE_NOT_ALLOWED_ERROR' as any)).toBe('PURCHASE_NOT_ALLOWED');
      expect(mapErrorCode('PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR' as any)).toBe('PRODUCT_NOT_AVAILABLE');
      expect(mapErrorCode('PRODUCT_ALREADY_PURCHASED_ERROR' as any)).toBe('PRODUCT_ALREADY_PURCHASED');
      expect(mapErrorCode('RECEIPT_ALREADY_IN_USE_ERROR' as any)).toBe('RECEIPT_ALREADY_IN_USE');
      expect(mapErrorCode('INVALID_RECEIPT_ERROR' as any)).toBe('INVALID_RECEIPT');
      expect(mapErrorCode('MISSING_RECEIPT_FILE_ERROR' as any)).toBe('MISSING_RECEIPT_FILE');
      expect(mapErrorCode('NETWORK_ERROR' as any)).toBe('NETWORK_ERROR');
      expect(mapErrorCode('INVALID_CREDENTIALS_ERROR' as any)).toBe('INVALID_CREDENTIALS');
      expect(mapErrorCode('UNEXPECTED_BACKEND_RESPONSE_ERROR' as any)).toBe('UNEXPECTED_BACKEND_ERROR');
      expect(mapErrorCode('INVALID_APP_USER_ID_ERROR' as any)).toBe('INVALID_APP_USER_ID');
      expect(mapErrorCode('OPERATION_ALREADY_IN_PROGRESS_ERROR' as any)).toBe('OPERATION_ALREADY_IN_PROGRESS');
      expect(mapErrorCode('INVALID_SUBSCRIBER_ATTRIBUTES_ERROR' as any)).toBe('INVALID_SUBSCRIBER_ATTRIBUTES');
    });

    it('maps unknown codes to UNKNOWN', () => {
      expect(mapErrorCode('SOME_NEW_CODE' as any)).toBe('UNKNOWN');
    });
  });

  describe('mapEntitlements', () => {
    it('maps active entitlements from customer info', () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {
            premium: {
              identifier: 'premium',
              isActive: true,
              willRenew: true,
              periodType: 'normal',
              latestPurchaseDate: '2026-01-01',
              originalPurchaseDate: '2025-01-01',
              expirationDate: '2027-01-01',
              store: 'app_store',
              productIdentifier: 'prod-annual',
              isSandbox: false,
              unsubscribeDetectedAt: null,
              billingIssueDetectedAt: null,
            },
          },
        },
      } as any;
      const result = mapEntitlements(mockCustomerInfo);
      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('premium');
      expect(result[0].isActive).toBe(true);
      expect(result[0].willRenew).toBe(true);
      expect(result[0].store).toBe('app_store');
    });

    it('returns empty array when no active entitlements', () => {
      const mockCustomerInfo = { entitlements: { active: {} } } as any;
      const result = mapEntitlements(mockCustomerInfo);
      expect(result).toEqual([]);
    });
  });
});
