'use strict';

import * as React from 'react';
import { View } from 'react-native';

export const Alignment = {};
export const Fit = {};

export function RiveView(props) {
  const { children, ...rest } = props ?? {};
  return React.createElement(View, rest, children);
}

export function useRiveFile() {
  return { riveFile: null, status: 'idle' };
}
