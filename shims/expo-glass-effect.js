/**
 * expo-glass-effect shim for environments where the native module is unavailable
 * (e.g. Expo Go, remote debugging, non-iOS).
 *
 * The real package's GlassView.ios.js calls requireNativeViewManager('ExpoGlassEffect')
 * at the MODULE LEVEL (top-level const), which fires before the React Native runtime
 * bridge is ready, causing:
 *   ERROR  [runtime not ready]: TypeError: undefined is not a function
 *
 * This shim provides no-op View-based fallbacks for all exported components and
 * functions, matching the same pattern used for @sentry/react-native, react-native-mmkv, etc.
 */

'use strict';

import * as React from 'react';
import { View } from 'react-native';

export function GlassView(props) {
  const { children, ...rest } = props ?? {};
  return React.createElement(View, rest, children);
}

export function GlassContainer(props) {
  const { children, ...rest } = props ?? {};
  return React.createElement(View, rest, children);
}

export function isLiquidGlassAvailable(): boolean {
  return false;
}

export function isGlassEffectAPIAvailable(): boolean {
  return false;
}
