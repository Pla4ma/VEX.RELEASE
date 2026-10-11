import Purchases from 'react-native-purchases';

jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    addCustomerInfoUpdateListener: jest.fn(),
  },
  LOG_LEVEL: { DEBUG: 'DEBUG', ERROR: 'ERROR' },
  PURCHASES_ERROR_CODE: { NETWORK_ERROR: 'NETWORK_ERROR' },
}));

const originalEnvironment = { ...process.env };

async function initializeOn(
  platform: 'ios' | 'android',
  iosKey: string,
  androidKey: string,
): Promise<string | undefined> {
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = iosKey;
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY = androidKey;
  let status: string | undefined;
  await jest.isolateModulesAsync(async (): Promise<void> => {
    const native = jest.requireMock<typeof import('react-native')>('react-native');
    jest.replaceProperty(native.Platform, 'OS', platform);
    const { revenueCatService } = jest.requireActual<typeof import('../revenuecat-service')>(
      '../revenuecat-service',
    );
    status = (await revenueCatService.initialize()).status;
  });
  return status;
}

afterEach(() => {
  process.env = { ...originalEnvironment };
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

it('initializes iOS billing while Android is not configured', async (): Promise<void> => {
  expect(await initializeOn('ios', 'appl_valid_ios_key', 'your_android_key')).toBe('ready');
  expect(Purchases.configure).toHaveBeenCalledWith({ apiKey: 'appl_valid_ios_key' });
});

it('initializes Android billing while iOS is not configured', async (): Promise<void> => {
  expect(await initializeOn('android', '', 'goog_valid_android_key')).toBe('ready');
  expect(Purchases.configure).toHaveBeenCalledWith({ apiKey: 'goog_valid_android_key' });
});

it('degrades safely when the current platform has no real key', async (): Promise<void> => {
  expect(await initializeOn('android', 'appl_valid_ios_key', 'your_android_key')).toBe('missing_keys');
  expect(Purchases.configure).not.toHaveBeenCalled();
});
