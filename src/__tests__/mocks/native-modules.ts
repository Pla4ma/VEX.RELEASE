const nativeModules = {
  NativeUnimoduleProxy: {
    viewManagersMetadata: {},
    modulesConstants: {
      mockDefinition: {
        ExponentConstants: {},
      },
    },
  },
  Linking: {},
  UIManager: {},
  KeyboardObserver: {
    addListener: () => {},
    removeListeners: () => {},
  },
  DeviceEventManager: {
    registerBackButtonListener: () => {},
    unregisterBackButtonListener: () => {},
    invokeDefaultBackPressHandler: () => {},
  },
};

export default nativeModules;
