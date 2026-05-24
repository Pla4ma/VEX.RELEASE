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
  if (name === 'ImageLoader') {
    return {
      getConstants: () => ({
        cacheSize: 100,
        maxContentLengthMultiplier: 1.5,
        forceCache: false,
      }),
      getSize: () => Promise.resolve({ width: 100, height: 100 }),
      getSizeWithHeaders: () => Promise.resolve({ width: 100, height: 100 }),
      prefetchImage: () => Promise.resolve(true),
      prefetchImageWithMetadata: () => Promise.resolve(true),
      queryCache: () => Promise.resolve({}),
      abortRequest: () => {},
    };
  }
  if (name === 'ImageEditingManager') {
    return {
      cropImage: () => Promise.resolve({ uri: 'test://cropped.png', width: 100, height: 100 }),
    };
  }
  if (name === 'BlobModule') {
    return {
      addNetworkingHandler: () => {},
      removeNetworkingHandler: () => {},
      sendOverSocket: () => {},
      createFromParts: () => ({ blobId: 'test-blob', offset: 0, size: 0 }),
      release: () => {},
      getConstants: () => ({ BLOB_URI_SCHEME: 'blob', BLOB_URI_HOST: null }),
    };
  }
  if (name === 'Networking') {
    return {
      sendRequest: () => {},
      abortRequest: () => {},
      getConstants: () => ({}),
    };
  }
  if (name === 'WebSocketModule') {
    return {
      connect: () => {},
      send: () => {},
      sendBinary: () => {},
      ping: () => {},
      close: () => {},
      getConstants: () => ({}),
    };
  }
  if (name === 'FileReaderModule') {
    return {
      readAsDataURL: () => Promise.resolve('data:'),
      readAsText: () => Promise.resolve(''),
    };
  }
  return null;
};
