import { Platform } from 'react-native';

/**
 * Lazy-load expo-glass-effect's availability checks.
 * Static import fires requireNativeModule at module eval time before
 * the runtime bridge is ready, crashing with:
 *   ERROR  [runtime not ready]: TypeError: undefined is not a function
 * Using require() inside the function defers the native access until
 * the app is fully initialized.
 */

let _isGlassEffectAPIAvailable: (() => boolean) | null = null;
let _isLiquidGlassAvailable: (() => boolean) | null = null;

function loadGlassEffectAvailability(): void {
  if (_isGlassEffectAPIAvailable && _isLiquidGlassAvailable) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-glass-effect');
    _isGlassEffectAPIAvailable = mod.isGlassEffectAPIAvailable;
    _isLiquidGlassAvailable = mod.isLiquidGlassAvailable;
  } catch {
    _isGlassEffectAPIAvailable = () => false;
    _isLiquidGlassAvailable = () => false;
  }
}

/**
 * Returns whether the native iOS glass effect (expo-glass-effect) can be used.
 * Falls back to `false` on non-iOS or when the native module signals unavailability.
 */
export function canUseNativeGlass(): boolean {
  if (Platform.OS !== 'ios') return false;

  try {
    loadGlassEffectAvailability();
    return (_isGlassEffectAPIAvailable?.() ?? false) &&
           (_isLiquidGlassAvailable?.() ?? false);
  } catch {
    // Native module not present or throws — fall back safely.
    return false;
  }
}

/**
 * Human-readable label for the current glass runtime path.
 * Useful for analytics, debugging, and test reporting.
 */
export function getGlassRuntimeLabel(): string {
  if (Platform.OS !== 'ios') return 'fallback-non-ios';
  return canUseNativeGlass() ? 'native-ios-glass' : 'fallback-ios';
}
