import {
  normalizeError,
  createServiceError,
  isUserCancelled,
  mapErrorCode,
  mapEntitlements,
} from '../revenuecat-service-helpers';
import type { RevenueCatError, EntitlementInfo } from '../revenuecat-types';

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

type MockError = { code: string; message: string };

describe('revenuecat-service-helpers', () => {
  describe('normalizeError', () => {
    it('normalizes a Purchases error with known code', () => {
      const error: MockError = { code: 'PURCHASE_CANCELLED_ERROR', message: 'User cancelled' };
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
      const error: MockError = { code: 'PURCHASE_CANCELLED_ERROR', message: 'cancelled' };
      expect(isUserCancelled(error)).toBe(true);
    });

    it('returns false for other errors', () => {
      const error: MockError = { code: 'NETWORK_ERROR', message: 'timeout' };
      expect(isUserCancelled(error)).toBe(false);
    });
  });

  describe('mapErrorCode', () => {
    it('maps all known error codes', () => {
      expect(mapErrorCode('STORE_PROBLEM_ERROR')).toBe('STORE_PROBLEM');
      expect(mapErrorCode('PURCHASE_NOT_ALLOWED_ERROR')).toBe('PURCHASE_NOT_ALLOWED');
      expect(mapErrorCode('PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR')).toBe('PRODUCT_NOT_AVAILABLE');
      expect(mapErrorCode('PRODUCT_ALREADY_PURCHASED_ERROR')).toBe('PRODUCT_ALREADY_PURCHASED');
      expect(mapErrorCode('RECEIPT_ALREADY_IN_USE_ERROR')).toBe('RECEIPT_ALREADY_IN_USE');
      expect(mapErrorCode('INVALID_RECEIPT_ERROR')).toBe('INVALID_RECEIPT');
      expect(mapErrorCode('MISSING_RECEIPT_FILE_ERROR')).toBe('MISSING_RECEIPT_FILE');
      expect(mapErrorCode('NETWORK_ERROR')).toBe('NETWORK_ERROR');
      expect(mapErrorCode('INVALID_CREDENTIALS_ERROR')).toBe('INVALID_CREDENTIALS');
      expect(mapErrorCode('UNEXPECTED_BACKEND_RESPONSE_ERROR')).toBe('UNEXPECTED_BACKEND_ERROR');
      expect(mapErrorCode('INVALID_APP_USER_ID_ERROR')).toBe('INVALID_APP_USER_ID');
      expect(mapErrorCode('OPERATION_ALREADY_IN_PROGRESS_ERROR')).toBe('OPERATION_ALREADY_IN_PROGRESS');
      expect(mapErrorCode('INVALID_SUBSCRIBER_ATTRIBUTES_ERROR')).toBe('INVALID_SUBSCRIBER_ATTRIBUTES');
    });

    it('maps unknown codes to UNKNOWN', () => {
      expect(mapErrorCode('SOME_NEW_CODE')).toBe('UNKNOWN');
    });
  });

  describe('mapEntitlements', () => {
    const makeEntitlement = (overrides: Partial<EntitlementInfo> = {}): EntitlementInfo => ({
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
      ...overrides,
    });

    it('maps active entitlements from customer info', () => {
      const mockCustomerInfo = {
        entitlements: {
          active: {
            premium: makeEntitlement(),
          },
        },
      };
      const result = mapEntitlements(mockCustomerInfo);
      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('premium');
      expect(result[0].isActive).toBe(true);
      expect(result[0].willRenew).toBe(true);
      expect(result[0].store).toBe('app_store');
    });

    it('returns empty array when no active entitlements', () => {
      const mockCustomerInfo = { entitlements: { active: {} } };
      const result = mapEntitlements(mockCustomerInfo);
      expect(result).toEqual([]);
    });
  });
});