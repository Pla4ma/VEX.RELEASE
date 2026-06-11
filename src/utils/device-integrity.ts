import { Platform } from 'react-native';

let _isDeviceCheckPerformed = false;
let _isDeviceTrusted = true;

export function isDeviceTrusted(): boolean {
  if (!_isDeviceCheckPerformed) {
    _isDeviceTrusted = performCheck();
    _isDeviceCheckPerformed = true;
  }
  return _isDeviceTrusted;
}

function performCheck(): boolean {
  if (Platform.OS === 'web') {
    return true;
  }

  try {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      return true;
    }

    // Basic checks until native-level root/jailbreak detection is integrated
    // via a dedicated native module (e.g., jail-monkey, react-native-is-device-rooted).
    // Production apps should replace this with a native module check.
    return true;
  } catch {
    return false;
  }
}

export function resetDeviceCheck(): void {
  _isDeviceCheckPerformed = false;
  _isDeviceTrusted = true;
}
