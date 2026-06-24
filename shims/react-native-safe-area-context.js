'use strict';

import * as React from 'react';
import { View } from 'react-native';

const insets = { top: 0, right: 0, bottom: 0, left: 0 };
const frame = { x: 0, y: 0, width: 0, height: 0 };

export const SafeAreaInsetsContext = React.createContext(insets);
export const SafeAreaFrameContext = React.createContext(frame);
export const initialWindowMetrics = { frame, insets };
export const SafeAreaProvider = ({ children }) =>
  React.createElement(React.Fragment, null, children);
export const SafeAreaView = ({ children, ...props }) =>
  React.createElement(View, props, children);
export const useSafeAreaInsets = () => insets;
export const useSafeAreaFrame = () => frame;
export const withSafeAreaInsets = (Component) => (props) =>
  React.createElement(Component, { ...props, insets });
export default SafeAreaProvider;
