'use strict';

import * as React from 'react';
import { StatusBar as RNStatusBar } from 'react-native';

export function StatusBar(props) {
  return React.createElement(RNStatusBar, props);
}

export function setStatusBarStyle() {}
export function setStatusBarHidden() {}
export function setStatusBarTranslucent() {}
export function setStatusBarBackgroundColor() {}
export function setStatusBarNetworkActivityIndicatorVisible() {}

export const StatusBarStyle = { Default: 'default', Light: 'light', Dark: 'dark' };
