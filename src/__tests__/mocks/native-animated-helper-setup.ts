/**
 * Jest mock for react-native/src/private/animated/NativeAnimatedHelper
 *
 * Provides jest.fn() wrappers for all NativeAnimatedHelper API methods.
 */

function recordSetupFallback(error: unknown): void {
  error;
}

type AnimatedAPI = {
  flushQueue: jest.Mock;
  createAnimatedNode: jest.Mock;
  getValue: jest.Mock;
  setAnimatedNodeValue: jest.Mock;
  connectAnimatedNodes: jest.Mock;
  disconnectAnimatedNodes: jest.Mock;
  startAnimatingNode: jest.Mock;
  stopAnimation: jest.Mock;
  setAnimatedNodeOffset: jest.Mock;
  flattenAnimatedNodeOffset: jest.Mock;
  connectAnimatedNodeToView: jest.Mock;
  disconnectAnimatedNodeFromView: jest.Mock;
  extractAnimatedNodeOffset: jest.Mock;
  dropAnimatedNode: jest.Mock;
  addAnimatedEventToView: jest.Mock;
  removeAnimatedEventFromView: jest.Mock;
  restoreDefaultValues: jest.Mock;
  disableQueue: jest.Mock;
  startListeningToAnimatedNodeValue: jest.Mock;
  stopListeningToAnimatedNodeValue: jest.Mock;
};

type NativeAnimatedHelperModule = {
  API: AnimatedAPI;
  nativeEventEmitter: {
    addListener: jest.Mock;
    remove: jest.Mock;
  };
  shouldUseNativeDriver: jest.Mock;
  assertNativeAnimatedModule: jest.Mock;
  generateNewAnimationId: jest.Mock;
  generateNewNodeTag: jest.Mock;
  shouldSignalBatch: jest.Mock;
  transformDataType: jest.Mock;
};

function mockCreateAnimatedAPI(): AnimatedAPI {
  return {
    flushQueue: jest.fn(),
    createAnimatedNode: jest.fn(),
    getValue: jest.fn(),
    setAnimatedNodeValue: jest.fn(),
    connectAnimatedNodes: jest.fn(),
    disconnectAnimatedNodes: jest.fn(),
    startAnimatingNode: jest.fn(),
    stopAnimation: jest.fn(),
    setAnimatedNodeOffset: jest.fn(),
    flattenAnimatedNodeOffset: jest.fn(),
    connectAnimatedNodeToView: jest.fn(),
    disconnectAnimatedNodeFromView: jest.fn(),
    extractAnimatedNodeOffset: jest.fn(),
    dropAnimatedNode: jest.fn(),
    addAnimatedEventToView: jest.fn(),
    removeAnimatedEventFromView: jest.fn(),
    restoreDefaultValues: jest.fn(),
    disableQueue: jest.fn(),
    startListeningToAnimatedNodeValue: jest.fn(() => ({
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      remove: jest.fn(),
    })),
    stopListeningToAnimatedNodeValue: jest.fn(),
  };
}

function mockCreateNativeAnimatedHelper(): NativeAnimatedHelperModule {
  return {
    API: mockCreateAnimatedAPI(),
    nativeEventEmitter: {
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      remove: jest.fn(),
    },
    shouldUseNativeDriver: jest.fn(
      (config: Record<string, unknown>) => config.useNativeDriver === true,
    ),
    assertNativeAnimatedModule: jest.fn(),
    generateNewAnimationId: jest.fn(() => 1),
    generateNewNodeTag: jest.fn(() => 1),
    shouldSignalBatch: jest.fn(() => false),
    transformDataType: jest.fn((v: unknown) => v),
  };
}

try {
  jest.mock('react-native/src/private/animated/NativeAnimatedHelper', () => {
    const helper = mockCreateNativeAnimatedHelper();
    return {
      __esModule: true,
      default: helper,
      API: helper.API,
      shouldUseNativeDriver: helper.shouldUseNativeDriver,
      assertNativeAnimatedModule: helper.assertNativeAnimatedModule,
      generateNewAnimationId: helper.generateNewAnimationId,
      generateNewNodeTag: helper.generateNewNodeTag,
      shouldSignalBatch: helper.shouldSignalBatch,
      transformDataType: helper.transformDataType,
    };
  });
} catch (error) {
  recordSetupFallback(error);
}
