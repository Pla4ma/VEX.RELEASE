/**
 * react-native-purchases shim for environments where the native SDK is unavailable
 * (e.g. Expo Go). All calls are no-ops that return safe error objects.
 * RevenueCat requires a custom dev client or production build to function.
 */

'use strict';

const UNAVAILABLE_ERROR = {
  message: 'RevenueCat is not available in Expo Go. Use a custom dev client.',
  code: 'CONFIGURATION_ERROR',
};

const PURCHASES_ERROR_CODE = {
  UNKNOWN_ERROR: 0,
  PURCHASE_CANCELLED_ERROR: 1,
  STORE_PROBLEM_ERROR: 2,
  PURCHASE_NOT_ALLOWED_ERROR: 3,
  PURCHASE_INVALID_ERROR: 4,
  PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR: 5,
  PRODUCT_ALREADY_PURCHASED_ERROR: 6,
  RECEIPT_ALREADY_IN_USE_ERROR: 7,
  INVALID_RECEIPT_ERROR: 8,
  MISSING_RECEIPT_FILE_ERROR: 9,
  NETWORK_ERROR: 10,
  INVALID_CREDENTIALS_ERROR: 11,
  UNEXPECTED_BACKEND_RESPONSE_ERROR: 12,
  INVALID_APP_USER_ID_ERROR: 13,
  OPERATION_ALREADY_IN_PROGRESS_ERROR: 14,
  INVALID_SUBSCRIBER_ATTRIBUTES_ERROR: 15,
  CONFIGURATION_ERROR: 16,
  UNSUPPORTED_ERROR: 17,
  EMPTY_SUBSCRIBER_ATTRIBUTES_ERROR: 18,
  CUSTOMER_INFO_ERROR: 19,
  SIGNING_ERROR: 20,
  INVALID_PARTNER_CODE_ERROR: 21,
};

const LOG_LEVEL = {
  VERBOSE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  SILENT: 5,
};

const emptyCustomerInfo = {
  entitlements: { active: {}, all: {} },
  activeSubscriptions: [],
  allPurchasedProductIdentifiers: [],
  latestExpirationDate: null,
  firstSeen: new Date().toISOString(),
  originalAppUserId: '',
  requestDate: new Date().toISOString(),
  allExpirationDates: {},
  allPurchaseDates: {},
  originalApplicationVersion: null,
  originalPurchaseDate: null,
  managementURL: null,
  nonSubscriptionTransactions: [],
};

const Purchases = {
  configure: () => {},
  setLogLevel: () => {},
  addCustomerInfoUpdateListener: () => {},
  removeCustomerInfoUpdateListener: () => {},
  getCustomerInfo: async () => emptyCustomerInfo,
  getOfferings: async () => ({ all: {}, current: null }),
  purchasePackage: async () => {
    throw Object.assign(new Error(UNAVAILABLE_ERROR.message), UNAVAILABLE_ERROR);
  },
  restorePurchases: async () => emptyCustomerInfo,
  logIn: async () => ({ customerInfo: emptyCustomerInfo, created: false }),
  logOut: async () => emptyCustomerInfo,
  syncPurchases: async () => {},
  setAttributes: async () => {},
  collectDeviceIdentifiers: async () => {},
  setEmail: async () => {},
  setPhoneNumber: async () => {},
  setDisplayName: async () => {},
  isAnonymous: async () => true,
  getCurrentOfferingForPlacement: async () => null,
  checkTrialOrIntroDiscountEligibility: async () => ({}),
};

export default Purchases;
export { Purchases, LOG_LEVEL, PURCHASES_ERROR_CODE };
