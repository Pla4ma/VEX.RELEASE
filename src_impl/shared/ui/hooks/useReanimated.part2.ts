import { useEffect, useCallback } from "react";
import { useSharedValue, useAnimatedStyle, withTiming, withSpring, withRepeat, withSequence, Easing, runOnJS, SharedValue } from "react-native-reanimated";
import React from "react";


export function useCountUp(targetValue: number, duration = 1000) {
  const animatedValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    animatedValue.value = withTiming(targetValue, {
      duration,
      easing: Easing.out(Easing.ease),
    }, (finished) => {
      if (finished) {
        runOnJS(setDisplayValue)(targetValue);
      }
    });
  }, [animatedValue, targetValue, duration]);

  return displayValue;
}