import React, { useEffect, useRef, useState } from "react";
import { View, TextStyle, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS, interpolateColor, Easing } from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { createSheet } from "@/shared/ui/create-sheet";


export function useCounterAnimation(
  target: number,
  options: {
    duration?: number;
    delay?: number;
    onComplete?: () => void;
  } = {}
): number {
  const { duration = 800, delay = 0, onComplete } = options;
  const [value, setValue] = useState(0);
  const targetRef = useRef(target);

  useEffect(() => {
    targetRef.current = target;

    const startTimeout = setTimeout(() => {
      const startTime = Date.now();
      const startValue = value;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (targetRef.current - startValue) * easeProgress);

        setValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onComplete?.();
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [target, duration, delay, onComplete, value]);

  return value;
}