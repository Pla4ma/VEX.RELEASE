'use strict';

import * as React from 'react';
import { Animated as RNAnimated, Easing as RNEasing } from 'react-native';

const identity = (value) => value;
const noop = () => {};

function createSharedValue(initialValue) {
  return { value: initialValue };
}

function runCallback(callback, value) {
  if (typeof callback === 'function') {
    callback(true, value);
  }
}

export const Easing = {
  ...RNEasing,
  bezier: (...args) => RNEasing.bezier(...args),
  in: (easing) => RNEasing.in(easing),
  inOut: (easing) => RNEasing.inOut(easing),
  out: (easing) => RNEasing.out(easing),
};

export const Extrapolation = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

export const ReduceMotion = {
  Always: 'always',
  Never: 'never',
  System: 'system',
};

export const useSharedValue = createSharedValue;
export const useDerivedValue = (factory) => createSharedValue(factory());
export const useAnimatedStyle = (factory) => factory();
export const useAnimatedProps = (factory) => factory();
export const useAnimatedRef = () => React.useRef(null);
export const useAnimatedReaction = noop;
export const useAnimatedScrollHandler = (handler) => handler;
export const useFrameCallback = noop;
export const useReducedMotion = () => false;

export const withTiming = (toValue, _config, callback) => {
  runCallback(callback, toValue);
  return toValue;
};
export const withSpring = (toValue, _config, callback) => {
  runCallback(callback, toValue);
  return toValue;
};
export const withDecay = (_config, callback) => {
  runCallback(callback, 0);
  return 0;
};
export const withDelay = (_delayMs, animation) => animation;
export const withRepeat = (animation) => animation;
export const withSequence = (...animations) => animations[animations.length - 1];
export const cancelAnimation = noop;
export const runOnJS = (fn) => fn;
export const runOnUI = (fn) => fn;
export const measure = () => null;
export const scrollTo = noop;

export function interpolate(value, inputRange, outputRange) {
  if (!inputRange.length || !outputRange.length) {
    return value;
  }
  const start = inputRange[0];
  const end = inputRange[inputRange.length - 1];
  const outStart = outputRange[0];
  const outEnd = outputRange[outputRange.length - 1];
  if (typeof value !== 'number' || end === start) {
    return outStart;
  }
  const progress = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return outStart + (outEnd - outStart) * progress;
}

export const interpolateColor = (_value, _inputRange, outputRange) =>
  outputRange[0];

export const createAnimatedComponent = (component) => component;

function makeTransition() {
  const transition = {
    delay: () => transition,
    duration: () => transition,
    easing: () => transition,
    springify: () => transition,
  };
  return transition;
}

export const FadeIn = makeTransition();
export const FadeInDown = makeTransition();
export const FadeInLeft = makeTransition();
export const FadeInRight = makeTransition();
export const FadeInUp = makeTransition();
export const FadeOut = makeTransition();
export const FadeOutDown = makeTransition();
export const FadeOutLeft = makeTransition();
export const FadeOutRight = makeTransition();
export const FadeOutUp = makeTransition();
export const SlideInDown = makeTransition();
export const SlideInLeft = makeTransition();
export const SlideInRight = makeTransition();
export const SlideInUp = makeTransition();
export const SlideOutDown = makeTransition();
export const SlideOutLeft = makeTransition();
export const SlideOutRight = makeTransition();
export const SlideOutUp = makeTransition();
export const ZoomIn = makeTransition();
export const ZoomOut = makeTransition();
export const Layout = makeTransition();
export const LinearTransition = makeTransition();

const Animated = {
  ...RNAnimated,
  createAnimatedComponent,
  View: RNAnimated.View,
  Text: RNAnimated.Text,
  Image: RNAnimated.Image,
  ScrollView: RNAnimated.ScrollView,
  FlatList: RNAnimated.FlatList,
};

export default Animated;
