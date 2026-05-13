/**
 * Reanimated 3 Hooks
 * Reusable animation logic using react-native-reanimated
 */

import { useEffect, useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';

interface AnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'shimmer' | 'pulse' | 'bounce';
  duration?: number;
  delay?: number;
  infinite?: boolean;
  toValue?: number;
   fromValue?: number;
}

interface AnimationResult {
  animatedValue: SharedValue<number>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

import React from 'react';

export * from "./useReanimated.types";
export * from "./useReanimated.part1";
export * from "./useReanimated.part2";
