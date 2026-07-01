import { Platform } from 'react-native';

/**
 * Lazy-load glass availability checks.
 * Static import fires requireNativeModule at module eval time before
 * the runtime bridge is ready, crashing with:
 *   ERROR  [runtime not ready]: TypeError: undefined is not a function
 * Using require() inside the function defers the native access until
 * the app is fully initialized.
 */

let _isCallstackSupported: (() => boolean) | null = null;
let _isGlassEffectAPIAvailable: (() => boolean) | null = null;
let _isLiquidGlassAvailable: (() => boolean) | null = null;

function loadCallstackAvailability(): void {
  if (_isCallstackSupported) return;
  // @callstack/liquid-glass requires iOS 26+. Skip the require entirely on
  // older versions — the native TurboModule (NativeLiquidGlassModule) is not
  // registered, and require() throws an Invariant Violation that bypasses
  // our try/catch on some Hermes/Metro combinations.
  if (Platform.OS !== 'ios') {
    _isCallstackSupported = () => false;
    return;
  }
  const majorVersion =
    typeof Platform.Version === 'number'
      ? Platform.Version
      : parseInt(String(Platform.Version), 10);
  if (majorVersion < 26) {
    _isCallstackSupported = () => false;
    return;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@callstack/liquid-glass');
    _isCallstackSupported = mod.isLiquidGlassSupported;
  } catch {
    _isCallstackSupported = () => false;
  }
}

function loadGlassEffectAvailability(): void {
  if (_isGlassEffectAPIAvailable && _isLiquidGlassAvailable) return;
  // Same guard as loadCallstackAvailability — expo-glass-effect also
  // requires iOS 26+ native modules that won't exist on older runtimes.
  if (Platform.OS !== 'ios') {
    _isGlassEffectAPIAvailable = () => false;
    _isLiquidGlassAvailable = () => false;
    return;
  }
  const majorVersion =
    typeof Platform.Version === 'number'
      ? Platform.Version
      : parseInt(String(Platform.Version), 10);
  if (majorVersion < 26) {
    _isGlassEffectAPIAvailable = () => false;
    _isLiquidGlassAvailable = () => false;
    return;
  }
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
 * Returns whether @callstack/liquid-glass can be used (preferred).
 * Falls back to expo-glass-effect, then to false.
 */
export function canUseCallstackGlass(): boolean {
  if (Platform.OS !== 'ios') return false;
  try {
    loadCallstackAvailability();
    return _isCallstackSupported?.() ?? false;
  } catch {
    return false;
  }
}

/**
 * Returns whether any native iOS glass effect can be used.
 * Checks @callstack/liquid-glass first, then expo-glass-effect.
 */
export function canUseNativeGlass(): boolean {
  if (Platform.OS !== 'ios') return false;
  if (canUseCallstackGlass()) return true;
  try {
    loadGlassEffectAvailability();
    return (_isGlassEffectAPIAvailable?.() ?? false) &&
           (_isLiquidGlassAvailable?.() ?? false);
  } catch {
    return false;
  }
}

/**
 * Human-readable label for the current glass runtime path.
 * Useful for analytics, debugging, and test reporting.
 */
export function getGlassRuntimeLabel(): string {
  if (Platform.OS !== 'ios') return 'fallback-non-ios';
  if (canUseCallstackGlass()) return 'callstack-liquid-glass';
  return canUseNativeGlass() ? 'expo-glass-effect' : 'fallback-ios';
}
