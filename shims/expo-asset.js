/**
 * expo-asset shim for Expo Go / remote-debug
 *
 * The real expo-asset calls requireNativeModule('ExpoAsset') at module
 * evaluation time (ExpoAsset.js top-level). This fires before the
 * native bridge is ready, crashing with:
 *   ERROR [runtime not ready]: TypeError: undefined is not a function
 *
 * This shim provides stub implementations so the app can load without
 * crashing. Asset downloading won't work in Expo Go, but the app will
 * render with bundled assets.
 */

// Stub asset module
const AssetModule = {
  downloadAsync: async (url, _md5Hash, _type) => {
    console.warn('[expo-asset shim] downloadAsync called - returning original URL');
    return url;
  },
};

export async function downloadAsync(url, md5Hash, type) {
  return AssetModule.downloadAsync(url, md5Hash, type);
}

// Asset class stub
export class Asset {
  static byHash = {};
  static byUri = {};

  name = '';
  type = '';
  hash = null;
  uri = '';
  width = 0;
  height = 0;
  scale = 1;

  static loadAsync(_moduleId) {
    return Promise.resolve(new Asset());
  }

  static fromModule(_moduleId) {
    return new Asset();
  }

  async downloadAsync() {
    return this;
  }
}

// AssetHooks stub
export function useAssets(_moduleIds) {
  return [undefined, null];
}
