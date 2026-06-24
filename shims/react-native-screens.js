'use strict';

import * as React from 'react';
import { View } from 'react-native';

const passthrough = ({ children, ...props }) =>
  React.createElement(View, props, children);

export const Screen = passthrough;
export const ScreenContainer = passthrough;
export const ScreenStack = passthrough;
export const ScreenStackHeaderConfig = passthrough;
export const ScreenStackHeaderSubview = passthrough;
export const FullWindowOverlay = passthrough;
export const SearchBar = passthrough;
export const NativeScreen = passthrough;
export const NativeScreenContainer = passthrough;
export const enableScreens = () => {};
export const enableFreeze = () => {};
export const screensEnabled = () => false;
export const shouldUseActivityState = true;
export const useTransitionProgress = () => ({
  progress: { value: 1 },
  closing: { value: 0 },
  goingForward: { value: 0 },
});
export default {
  Screen,
  ScreenContainer,
  ScreenStack,
  enableScreens,
  enableFreeze,
};
