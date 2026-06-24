import { View } from 'react-native';

/**
 * Shared lazy-load helpers for native Expo glass modules.
 *
 * Static imports from expo-blur, expo-glass-effect, and expo-linear-gradient
 * trigger requireNativeViewManager / requireNativeView at module eval time,
 * before the React Native bridge is ready, causing:
 *   ERROR  [runtime not ready]: TypeError: undefined is not a function
 *
 * These helpers use require() inside a try-catch so native module access is
 * deferred until the first component render — after the bridge is initialized.
 * Each module is cached in a module-level variable so the require only fires once.
 */

// Dynamic require boundary – package exports validated at runtime
let _BlurView: React.ComponentType<Record<string, unknown>> | null = null;

export function getBlurView(): React.ComponentType<Record<string, unknown>> {
  if (_BlurView) return _BlurView;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _BlurView = (
      require('expo-blur') as { BlurView: React.ComponentType<Record<string, unknown>> }
    ).BlurView;
  } catch {
    // Fall back to plain View — safe, all extra props are silently ignored
    _BlurView = View as unknown as React.ComponentType<Record<string, unknown>>;
  }
  return _BlurView;
}

// Dynamic require boundary – package exports validated at runtime
let _GlassView: React.ComponentType<Record<string, unknown>> | null = null;

export function getGlassView(): React.ComponentType<Record<string, unknown>> {
  if (_GlassView) return _GlassView;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _GlassView = (
      require('expo-glass-effect') as { GlassView: React.ComponentType<Record<string, unknown>> }
    ).GlassView;
  } catch {
    _GlassView = View as unknown as React.ComponentType<Record<string, unknown>>;
  }
  return _GlassView;
}

// Dynamic require boundary – package exports validated at runtime
let _GlassContainer: React.ComponentType<Record<string, unknown>> | null = null;

export function getGlassContainer(): React.ComponentType<Record<string, unknown>> {
  if (_GlassContainer) return _GlassContainer;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _GlassContainer = (
      require('expo-glass-effect') as { GlassContainer: React.ComponentType<Record<string, unknown>> }
    ).GlassContainer;
  } catch {
    _GlassContainer = View as unknown as React.ComponentType<Record<string, unknown>>;
  }
  return _GlassContainer;
}

// Dynamic require boundary – package exports validated at runtime
let _LinearGradient: React.ComponentType<Record<string, unknown>> | null = null;

export function getLinearGradient(): React.ComponentType<Record<string, unknown>> {
  if (_LinearGradient) return _LinearGradient;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _LinearGradient = (
      require('expo-linear-gradient') as { LinearGradient: React.ComponentType<Record<string, unknown>> }
    ).LinearGradient;
  } catch {
    _LinearGradient = View as unknown as React.ComponentType<Record<string, unknown>>;
  }
  return _LinearGradient;
}
