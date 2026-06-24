/**
 * expo-image shim for dev environments where the ExpoImage native view is not
 * available or runtime bridge is not ready.
 */

'use strict';

import * as React from 'react';
import { Image as ReactNativeImage } from 'react-native';

export function Image(props) {
  return React.createElement(ReactNativeImage, props);
}

Image.prefetch = function prefetch(): Promise<boolean> {
  return Promise.resolve(false);
};

Image.clearCache = function clearCache(): Promise<boolean> {
  return Promise.resolve(false);
};

Image.getCachePathAsync = function getCachePathAsync(): Promise<null> {
  return Promise.resolve(null);
};

export default Image;
