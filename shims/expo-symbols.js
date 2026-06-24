/**
 * expo-symbols shim for environments where the native module is unavailable
 * (e.g. Expo Go, remote debugging).
 *
 * The real package calls requireNativeViewManager('ExpoSymbolView') at
 * module evaluation time, which crashes before the RN bridge is ready with:
 *   ERROR  [runtime not ready]: TypeError: undefined is not a function
 */

'use strict';

import * as React from 'react';
import { View } from 'react-native';

export function SymbolView(props) {
  const { children, ...rest } = props ?? {};
  return React.createElement(View, rest, children);
}

export function SymbolImage(props) {
  const { children, ...rest } = props ?? {};
  return React.createElement(View, rest, children);
}

export const SFSymbol = {
  HEART_FILL: 'heart.fill',
  STAR_FILL: 'star.fill',
  CHECKMARK: 'checkmark',
};

export function isSymbolImageAvailable() {
  return false;
}
