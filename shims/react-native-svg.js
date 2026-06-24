'use strict';

import * as React from 'react';
import { Text as RNText, View } from 'react-native';

function makeView(name) {
  const Component = (props) => {
    const { children, ...rest } = props ?? {};
    return React.createElement(View, rest, children);
  };
  Component.displayName = name;
  return Component;
}

const Svg = makeView('Svg');
const Text = (props) => {
  const { children, ...rest } = props ?? {};
  return React.createElement(RNText, rest, children);
};

export default Svg;
export { Svg, Text };
export const Circle = makeView('Circle');
export const ClipPath = makeView('ClipPath');
export const Defs = makeView('Defs');
export const Ellipse = makeView('Ellipse');
export const G = makeView('G');
export const Line = makeView('Line');
export const LinearGradient = makeView('LinearGradient');
export const Mask = makeView('Mask');
export const Path = makeView('Path');
export const Polygon = makeView('Polygon');
export const Polyline = makeView('Polyline');
export const RadialGradient = makeView('RadialGradient');
export const Rect = makeView('Rect');
export const Stop = makeView('Stop');
export const TSpan = makeView('TSpan');
export const Use = makeView('Use');
