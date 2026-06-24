'use strict';

import * as React from 'react';
import { Switch as RNSwitch, Text, View } from 'react-native';

const passthrough = ({ children, ...props }) =>
  React.createElement(View, props, children);

export const Button = passthrough;
export const ColorPicker = passthrough;
export const ContextMenu = passthrough;
export const DateTimePicker = passthrough;
export const Gauge = passthrough;
export const Host = passthrough;
export const Picker = passthrough;
export const Section = passthrough;
export const Slider = passthrough;
export const Switch = RNSwitch;
export const TextField = passthrough;
export const VStack = passthrough;
export const HStack = passthrough;
export const Spacer = passthrough;
export { Text as Label };
export function useFormState(initialValue) {
  return React.useState(initialValue);
}
