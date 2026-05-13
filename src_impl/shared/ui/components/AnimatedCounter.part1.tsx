import React, { useEffect, useRef, useState } from "react";
import { View, TextStyle, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS, interpolateColor, Easing } from "react-native-reanimated";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";
import { createSheet } from "@/shared/ui/create-sheet";


export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  previousValue,
  variant = 'default',
  currency,
  prefix,
  suffix,
  decimals = 0,
  size = 'md',
  color,
  increaseColor,
  decreaseColor,
  style,
  textStyle,
  duration = 800,
  useSpring = false,
  springConfig = { damping: 15, stiffness: 150 },
  animateOnMount = true,
  showTrendIndicator = false,
  compactThreshold = 1000000,
  locale = 'en-US',
}) => {
  const { theme } = useTheme();
  const [displayValue, setDisplayValue] = useState(value);
  const previousRef = useRef(previousValue ?? value);

  const animatedValue = useSharedValue(animateOnMount ? 0 : value);
  const colorProgress = useSharedValue(0);

  const effectiveColor = color || theme.colors.text.primary;
  const effectiveIncreaseColor = increaseColor || theme.colors.success.DEFAULT;
  const effectiveDecreaseColor = decreaseColor || theme.colors.error.DEFAULT;

  // Determine trend
  const trend = value > previousRef.current ? 'up' :
                value < previousRef.current ? 'down' : 'neutral';

  // Animate value change
  useEffect(() => {
    const from = previousRef.current;
    const to = value;

    // Set initial value for animation
    animatedValue.value = from;
    previousRef.current = value;

    // Trigger color flash
    if (trend !== 'neutral') {
      colorProgress.value = 0;
      colorProgress.value = withTiming(1, { duration: 300 }, () => {
        colorProgress.value = withTiming(0, { duration: 500 });
      });
    }

    // Animate to new value
    if (useSpring) {
      animatedValue.value = withSpring(to, springConfig, (finished) => {
        if (finished) {
          runOnJS(setDisplayValue)(to);
        }
      });
    } else {
      animatedValue.value = withTiming(to, {
        duration,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished) {
          runOnJS(setDisplayValue)(to);
        }
      });
    }

    // Update display value during animation
    const updateInterval = setInterval(() => {
      // This will be handled by the animated text component
    }, 16);

    return () => clearInterval(updateInterval);
  }, [value, duration, useSpring, springConfig, animatedValue, colorProgress, trend]);

  // Animated color based on trend
  const animatedTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      colorProgress.value,
      [0, 0.5, 1],
      [
        effectiveColor,
        trend === 'up' ? effectiveIncreaseColor : trend === 'down' ? effectiveDecreaseColor : effectiveColor,
        effectiveColor,
      ]
    ),
  }));

  const sizeConfig = getSizeConfig(size);
  const currencySymbol = currency ? getCurrencySymbol(currency) : null;

  // Build display string
  const getDisplayString = () => {
    const parts: string[] = [];

    if (prefix) {parts.push(prefix);}
    if (currencySymbol) {parts.push(currencySymbol);}

    const formatted = formatNumber(displayValue, variant, decimals, compactThreshold, locale);
    parts.push(formatted);

    if (suffix) {parts.push(suffix);}

    return parts.join('');
  };

  return (
    <View style={[styles.container, style]}>
      {showTrendIndicator && trend !== 'neutral' && (
        <TrendIndicator
          direction={trend}
          size={sizeConfig.trendSize}
          color={trend === 'up' ? effectiveIncreaseColor : effectiveDecreaseColor}
        />
      )}

      <Animated.Text
        style={[
          styles.counter,
          {
            fontSize: sizeConfig.fontSize,
            fontWeight: sizeConfig.fontWeight,
          },
          animatedTextStyle,
          textStyle,
        ]}
      >
        {getDisplayString()}
      </Animated.Text>
    </View>
  );
};

export function useCountUp(
  end: number,
  duration: number = 1000,
  start: number = 0
): number {
  const [value, setValue] = useState(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;

      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return value;
}