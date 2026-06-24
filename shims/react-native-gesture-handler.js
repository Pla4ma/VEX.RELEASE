'use strict';

import * as React from 'react';
import {
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

function passthrough(component) {
  return component;
}

export const GestureHandlerRootView = View;
export const GestureDetector = ({ children }) =>
  React.createElement(React.Fragment, null, children);
export const GestureHandlerGestureEvent = {};
export const Directions = {};
export const State = {};
export const Gesture = {
  Tap: () => Gesture,
  Pan: () => Gesture,
  LongPress: () => Gesture,
  Native: () => Gesture,
  Race: () => Gesture,
  Simultaneous: () => Gesture,
  Exclusive: () => Gesture,
  onStart: () => Gesture,
  onUpdate: () => Gesture,
  onEnd: () => Gesture,
  enabled: () => Gesture,
};

export {
  Pressable,
  ScrollView,
  Switch,
  TextInput,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
};

export const FlatList = View;
export const gestureHandlerRootHOC = passthrough;
export const createNativeWrapper = passthrough;
export const PanGestureHandler = View;
export const TapGestureHandler = View;
export const LongPressGestureHandler = View;
export const NativeViewGestureHandler = View;
export const FlingGestureHandler = View;
export const PinchGestureHandler = View;
export const RotationGestureHandler = View;
