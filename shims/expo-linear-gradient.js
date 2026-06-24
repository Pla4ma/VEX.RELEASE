/**
 * expo-linear-gradient shim for environments where the native module is unavailable
 * or not ready yet (e.g. Expo Go, remote debugging).
 *
 * The real package creates its native view at module evaluation time via
 * requireNativeViewManager('ExpoLinearGradient'), which can run before the React
 * Native runtime bridge is ready and crash startup with:
 *   ERROR  [runtime not ready]: TypeError: undefined is not a function
 *
 * This fallback preserves layout/children and drops gradient rendering in dev.
 */

'use strict';

import * as React from 'react';
import { View } from 'react-native';

export function LinearGradient(props) {
  const { children, colors, locations, start, end, ...rest } = props ?? {};
  void colors;
  void locations;
  void start;
  void end;

  return React.createElement(View, rest, children);
}
