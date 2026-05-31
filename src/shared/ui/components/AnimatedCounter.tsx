import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { createSheet } from '@/shared/ui/create-sheet';
import {
  type CounterSize,
  type CounterVariant,
  type AnimatedCounterProps,
  formatNumber,
  getCurrencySymbol,
  getSizeConfig,
} from './AnimatedCounter.helpers';

export type { CounterSize, CounterVariant, AnimatedCounterProps };

const TrendIndicator: React.FC<{
  direction: 'up' | 'down' | 'neutral';
  size: number;
  color?: string;
}> = ({ direction, size, color }) => {
  const { theme } = useTheme();
  const trendColor =
    color ||
    (direction === 'up'
      ? theme.colors.success.DEFAULT
      : direction === 'down'
        ? theme.colors.error.DEFAULT
        : theme.colors.text.tertiary);
  return (
    <View style={[styles.trendIndicator, { width: size, height: size }]}>
      <Text style={[styles.trendArrow, { color: trendColor, fontSize: size }]}>
        {direction === 'up' ? '▲' : direction === 'down' ? '▼' : '—'}
      </Text>
    </View>
  );
};

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
  const trend =
    value > previousRef.current
      ? 'up'
      : value < previousRef.current
        ? 'down'
        : 'neutral';
  useEffect(() => {
    const from = previousRef.current;
    const to = value;
    animatedValue.value = from;
    previousRef.current = value;
    if (trend !== 'neutral') {
      colorProgress.value = 0;
      colorProgress.value = withTiming(1, { duration: 300 }, () => {
        colorProgress.value = withTiming(0, { duration: 500 });
      });
    }
    if (useSpring) {
      animatedValue.value = withSpring(to, springConfig, (finished) => {
        if (finished) {
          runOnJS(setDisplayValue)(to);
        }
      });
    } else {
      animatedValue.value = withTiming(
        to,
        { duration, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) {
            runOnJS(setDisplayValue)(to);
          }
        },
      );
    }
    const updateInterval = setInterval(() => {}, 16);
    return () => clearInterval(updateInterval);
  }, [
    value,
    duration,
    useSpring,
    springConfig,
    animatedValue,
    colorProgress,
    trend,
  ]);
  const animatedTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      colorProgress.value,
      [0, 0.5, 1],
      [
        effectiveColor,
        trend === 'up'
          ? effectiveIncreaseColor
          : trend === 'down'
            ? effectiveDecreaseColor
            : effectiveColor,
        effectiveColor,
      ],
    ),
  }));
  const sizeConfig = getSizeConfig(size);
  const currencySymbol = currency ? getCurrencySymbol(currency) : null;
  const getDisplayString = () => {
    const parts: string[] = [];
    if (prefix) {parts.push(prefix);}
    if (currencySymbol) {parts.push(currencySymbol);}
    parts.push(
      formatNumber(displayValue, variant, decimals, compactThreshold, locale),
    );
    if (suffix) {parts.push(suffix);}
    return parts.join('');
  };
  return (
    <View style={[styles.container, style]}>
      {showTrendIndicator && trend !== 'neutral' && (
        <TrendIndicator
          direction={trend}
          size={sizeConfig.trendSize}
          color={
            trend === 'up' ? effectiveIncreaseColor : effectiveDecreaseColor
          }
        />
      )}
      <Animated.Text
        style={[
          styles.counter,
          { fontSize: sizeConfig.fontSize, fontWeight: sizeConfig.fontWeight },
          animatedTextStyle,
          textStyle,
        ]}
      >
        {getDisplayString()}
      </Animated.Text>
    </View>
  );
};

const styles = createSheet({
  container: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  counter: { fontVariant: ['tabular-nums'] },
  trendIndicator: { justifyContent: 'center', alignItems: 'center' },
  trendArrow: { lineHeight: undefined },
});

export default AnimatedCounter;

export { useCountUp, useCounterAnimation } from './AnimatedCounter.hooks';
