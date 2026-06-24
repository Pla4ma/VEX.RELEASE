/**
 * expo-blur shim for environments where the native module is unavailable
 * (e.g. Expo Go, remote debugging).
 *
 * The real package's NativeBlurModule.js calls requireNativeViewManager('ExpoBlur')
 * at the MODULE LEVEL (top-level const), which fires before the React Native runtime
 * bridge is ready on some setups, causing:
 *   ERROR  [runtime not ready]: TypeError: undefined is not a function
 *
 * This shim provides no-op View-based fallbacks for BlurView and BlurTargetView.
 */

'use strict';

import * as React from 'react';
import { View } from 'react-native';

export function BlurView(props) {
  const { children, ...rest } = props ?? {};
  return React.createElement(View, rest, children);
}

export const BlurTargetView = View;
