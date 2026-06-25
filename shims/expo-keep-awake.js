/**
 * expo-keep-awake shim for Expo Go / remote-debug
 *
 * The real expo-keep-awake calls requireNativeModule('ExpoKeepAwake') at module
 * evaluation time (ExpoKeepAwake.ts top-level). This fires before the
 * native bridge is ready, crashing with:
 *   ERROR [runtime not ready]: TypeError: undefined is not a function
 *
 * This shim provides stub implementations so the app can load without crashing.
 * Keep-awake functionality won't work in Expo Go, but the app will render.
 */

export const ExpoKeepAwakeTag = 'ExpoKeepAwakeDefaultTag';

export async function isAvailableAsync() {
  return false;
}

export function useKeepAwake(_tag, _options) {
  // No-op in Expo Go
}

export function activateKeepAwake(_tag = ExpoKeepAwakeTag) {
  console.warn('[expo-keep-awake shim] activateKeepAwake is a no-op in Expo Go');
  return Promise.resolve();
}

export async function activateKeepAwakeAsync(_tag = ExpoKeepAwakeTag) {
  // No-op in Expo Go
}

export async function deactivateKeepAwake(_tag = ExpoKeepAwakeTag) {
  // No-op in Expo Go
}

export function addListener(_tagOrListener, _listener) {
  return { remove: () => {} };
}
