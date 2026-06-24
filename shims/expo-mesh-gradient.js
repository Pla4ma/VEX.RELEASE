/**
 * expo-mesh-gradient shim for environments where the native module is
 * unavailable (e.g. Expo Go, remote debugging).
 *
 * The real package calls requireNativeViewManager at module evaluation
 * time, which crashes before the RN bridge is ready with:
 *   ERROR  [runtime not ready]: TypeError: undefined is not a function
 */

'use strict';

import * as React from 'react';
import { View } from 'react-native';

export function MeshGradientView(props) {
  const { children, ...rest } = props ?? {};
  return React.createElement(View, rest, children);
}
