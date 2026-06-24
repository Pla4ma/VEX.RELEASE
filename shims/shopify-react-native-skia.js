'use strict';

import * as React from 'react';
import { View } from 'react-native';

function SkiaView(props) {
  const { children, ...rest } = props ?? {};
  return React.createElement(View, rest, children);
}

const noop = () => ({});

export const Blur = SkiaView;
export const BlurMask = SkiaView;
export const Canvas = SkiaView;
export const Circle = SkiaView;
export const Group = SkiaView;
export const Path = SkiaView;
export const RadialGradient = SkiaView;
export const RoundedRect = SkiaView;
export const Skia = {
  Path: { Make: noop, MakeFromSVGString: noop },
};
export const vec = (x, y) => ({ x, y });
