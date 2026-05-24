const API: Record<string, (...args: unknown[]) => unknown> = {
  flushQueue: () => {},
  createAnimatedNode: () => {},
  getValue: () => 0,
  setAnimatedNodeValue: () => {},
  connectAnimatedNodes: () => {},
  disconnectAnimatedNodes: () => {},
  startAnimatingNode: () => {},
  stopAnimation: () => {},
  setAnimatedNodeOffset: () => {},
  flattenAnimatedNodeOffset: () => {},
  connectAnimatedNodeToView: () => {},
  disconnectAnimatedNodeFromView: () => {},
  extractAnimatedNodeOffset: () => {},
  dropAnimatedNode: () => {},
  addAnimatedEventToView: () => {},
  removeAnimatedEventFromView: () => {},
  restoreDefaultValues: () => {},
  disableQueue: () => {},
  startListeningToAnimatedNodeValue: () => ({ addListener: () => ({ remove: () => {} }), remove: () => {} }),
  stopListeningToAnimatedNodeValue: () => {},
};

function shouldUseNativeDriver(config: Record<string, unknown>): boolean {
  return config.useNativeDriver === true;
}

function transformDataType(value: number | string): number | string {
  return value;
}

function generateNewAnimationId(): number {
  return 1;
}

function generateNewNodeTag(): number {
  return 1;
}

function assertNativeAnimatedModule(): void {}

function shouldSignalBatch(): boolean {
  return false;
}

const NativeAnimatedHelper = {
  API,
  assertNativeAnimatedModule,
  generateNewAnimationId,
  generateNewNodeTag,
  shouldSignalBatch,
  shouldUseNativeDriver,
  transformDataType,
};

export { API, shouldUseNativeDriver, shouldSignalBatch, assertNativeAnimatedModule, transformDataType, generateNewAnimationId, generateNewNodeTag };
export default NativeAnimatedHelper;

