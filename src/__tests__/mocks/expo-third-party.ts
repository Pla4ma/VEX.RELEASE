/**
 * Jest mocks for third-party and Expo modules
 *
 * Covers: RevenueCat (purchases), expo-secure-store, expo-linear-gradient,
 * expo-document-picker, @react-native-async-storage/async-storage,
 * and @react-native-community/netinfo.
 */

function recordSetupFallback(error: unknown): void {
  void error;
}

jest.mock('react-native-purchases', () => {
  return {
    __esModule: true,
    default: {
      configure: jest.fn(),
      setLogLevel: jest.fn(),
      addCustomerInfoUpdateListener: jest.fn(),
      getCustomerInfo: jest.fn(() =>
        Promise.resolve({ entitlements: { active: {} } }),
      ),
      getOfferings: jest.fn(() => Promise.resolve({ current: null })),
      purchasePackage: jest.fn(() =>
        Promise.resolve({ customerInfo: { entitlements: { active: {} } } }),
      ),
      restorePurchases: jest.fn(() =>
        Promise.resolve({ entitlements: { active: {} } }),
      ),
      logIn: jest.fn(() => Promise.resolve({ customerInfo: {} })),
      logOut: jest.fn(() => Promise.resolve()),
    },
    LOG_LEVEL: { DEBUG: 0, ERROR: 1 },
    PURCHASES_ERROR_CODE: {
      PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
    },
  };
});

try {
  jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    setItemAsync: jest.fn(() => Promise.resolve()),
    deleteItemAsync: jest.fn(() => Promise.resolve()),
  }));
  jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
  }));
  jest.mock('expo-document-picker', () => ({
    getDocumentAsync: jest.fn(() =>
      Promise.resolve({ canceled: true, assets: [] }),
    ),
    DocumentPicker: { types: jest.fn(() => 'application/pdf') },
    isCanceled: jest.fn(() => false),
  }));
  jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    mergeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
    multiMerge: jest.fn(() => Promise.resolve()),
  }));
  jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(() =>
      Promise.resolve({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
      }),
    ),
    useNetInfo: jest.fn(() => ({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    })),
  }));
} catch (error) {
  recordSetupFallback(error);
}
