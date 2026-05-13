/**
 * Animated Counter Component
 * Premium number display with smooth counting animations
 *
 * Features:
 * - Smooth counting animation between values
 * - Currency formatting with symbols
 * - Compact notation for large numbers
 * - Duration-based animation speed
 * - Custom prefix/suffix
 * - Color transitions on value change
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, TextStyle, ViewStyle } from 'react-native';
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

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Utility Functions
// ============================================================================

function formatNumber(
  value: number,
  variant: CounterVariant,
  decimals: number,
  compactThreshold: number,
  locale: string
): string {
  'worklet';

  if (variant === 'compact' || (variant === 'currency' && Math.abs(value) >= compactThreshold)) {
    return Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  if (variant === 'percentage') {
    return `${value.toFixed(decimals)}%`;
  }

  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    coins: '🪙',
    gems: '💎',
    xp: '⭐',
    usd: '$',
    eur: '€',
    gbp: '£',
  };
  return symbols[currency] || currency;
}

function getSizeConfig(size: CounterSize): {
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  trendSize: number;
} {
  const configs: Record<CounterSize, { fontSize: number; fontWeight: TextStyle['fontWeight']; trendSize: number }> = {
    xs: { fontSize: 12, fontWeight: '500', trendSize: 8 },
    sm: { fontSize: 14, fontWeight: '600', trendSize: 10 },
    md: { fontSize: 18, fontWeight: '700', trendSize: 12 },
    lg: { fontSize: 24, fontWeight: '700', trendSize: 14 },
    xl: { fontSize: 32, fontWeight: '800', trendSize: 16 },
    hero: { fontSize: 48, fontWeight: '900', trendSize: 20 },
  };
  return configs[size];
}

// ============================================================================
// Trend Indicator Component
// ============================================================================

const TrendIndicator: React.FC<{
  direction: 'up' | 'down' | 'neutral';
  size: number;
  color?: string;
}> = ({ direction, size, color }) => {
  const { theme } = useTheme();

  const trendColor = color || (direction === 'up'
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

// ============================================================================
// Main Component
// ============================================================================
// ============================================================================
// Count Up/Count Down Hooks
// ============================================================================
// ============================================================================
// Styles
// ============================================================================

const styles = createSheet({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counter: {
    fontVariant: ['tabular-nums'], // Monospaced numbers for smoother animation
  },
  trendIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendArrow: {
    lineHeight: undefined, // Let font size determine line height
  },
});

export default AnimatedCounter;

export * from "./AnimatedCounter.types";
export * from "./AnimatedCounter.part1";
export * from "./AnimatedCounter.part2";
