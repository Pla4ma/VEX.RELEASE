global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [],
};

global.__turboModuleProxy = (name) => {
  if (name === 'SourceCode') {
    return { getConstants: () => ({ scriptURL: 'http://localhost/index.bundle' }) };
  }
  if (name === 'PlatformConstants') {
    return {
      getConstants: () => ({
        forceTouchAvailable: false,
        interfaceIdiom: 'phone',
        isTesting: true,
        osVersion: '17.0',
        reactNativeVersion: { major: 0, minor: 85, patch: 3, prerelease: null },
        systemName: 'iOS',
      }),
    };
  }
  if (name === 'DeviceInfo') {
    return {
      getConstants: () => ({
        Dimensions: {
          windowPhysicalPixels: { width: 390, height: 844, scale: 3, fontScale: 1 },
          screenPhysicalPixels: { width: 390, height: 844, scale: 3, fontScale: 1 },
        },
      }),
    };
  }
  if (name === 'RNCNetInfo') {
    return {
      getCurrentState: () => Promise.resolve({ type: 'wifi', isConnected: true, isInternetReachable: true }),
      addListener: () => {},
      removeListeners: () => {},
    };
  }
  if (name === 'DeviceEventManager') {
    return {
      invokeDefaultBackPressHandler: () => {},
      registerBackButtonListener: () => {},
      unregisterBackButtonListener: () => {},
      registerFocusListener: () => {},
      unregisterFocusListener: () => {},
    };
  }
  if (name === 'KeyboardObserver') {
    return {
      addListener: () => {},
      removeListeners: () => {},
    };
  }
  return null;
};
